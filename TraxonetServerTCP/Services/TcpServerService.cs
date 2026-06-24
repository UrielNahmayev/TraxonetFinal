using System.Net;
using System.Net.Sockets;
using System.Text;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TraxonetServer_TCP.Hubs;
using TraxonetServer_TCP.Models;

namespace TraxonetServer_TCP.Services
{
    public class TcpServerService : BackgroundService
    {
        private readonly Database _db;
        private readonly LogService _log;
        private readonly IHubContext<LogHub> _hubContext;
        private readonly CryptoHelper _crypto;

        public TcpServerService(Database db, LogService logService, IHubContext<LogHub> hubContext)
        {
            _db = db;
            _log = logService;
            _hubContext = hubContext;
            _crypto = new CryptoHelper();

            _log.OnNewLog += async (entry) =>
            {
                try
                {
                    await _hubContext.Clients.All.SendAsync("ReceiveLog", new
                    {
                        timestamp = entry.Timestamp.ToString("HH:mm:ss"),
                        message = entry.Message,
                        level = entry.Level
                    });
                }
                catch { }
            };
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _log.Info("=== TRAXONET Server ===");
            _db.EnsureSchema();

            TcpListener listener = new TcpListener(IPAddress.Any, 5000);
            listener.Start();
            _log.Success("TCP Server running on port 5000...");
            _log.Info("RSA-2048 key pair generated.");
            _log.Info("Encryption: AES-256-CBC + RSA-2048 handshake");
            _log.Info("Waiting for client connections...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    TcpClient client = await listener.AcceptTcpClientAsync(stoppingToken);
                    _ = Task.Run(() => HandleClient(client), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _log.Error($"Listener error: {ex.Message}");
                }
            }

            listener.Stop();
            _log.Warn("TCP Server stopped.");
        }

        private async Task HandleClient(TcpClient client)
        {
            try
            {
                NetworkStream stream = client.GetStream();
                stream.ReadTimeout = 15000;
                stream.WriteTimeout = 15000;

                byte[] rsaPublicKey = _crypto.ExportRsaPublicKey();
                await CryptoHelper.WriteLengthPrefixedAsync(stream, rsaPublicKey);

                byte[] encryptedKeyBundle = await CryptoHelper.ReadLengthPrefixedAsync(stream);
                byte[] keyBundle = _crypto.RsaDecrypt(encryptedKeyBundle);

                if (keyBundle.Length != 48)
                {
                    _log.Error("Invalid key bundle size from client.");
                    client.Close();
                    return;
                }

                byte[] aesKey = new byte[32];
                byte[] aesIV = new byte[16];
                Array.Copy(keyBundle, 0, aesKey, 0, 32);
                Array.Copy(keyBundle, 32, aesIV, 0, 16);

                byte[] encryptedRequest = await CryptoHelper.ReadLengthPrefixedAsync(stream);
                string json = CryptoHelper.AesDecrypt(encryptedRequest, aesKey, aesIV);

                JObject message;
                try
                {
                    message = JObject.Parse(json);
                }
                catch
                {
                    string errorResp = JsonConvert.SerializeObject(new { success = false, error = "Invalid JSON" });
                    byte[] encryptedError = CryptoHelper.AesEncrypt(errorResp, aesKey, aesIV);
                    await CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedError);
                    client.Close();
                    return;
                }

                string type = message["type"]?.ToString() ?? "hardware_data";
                _log.Info($"[Encrypted] Request: {type}");

                string response = HandleMessage(type, message);

                byte[] encryptedResponse = CryptoHelper.AesEncrypt(response, aesKey, aesIV);
                await CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedResponse);

                client.Close();
            }
            catch (Exception ex)
            {
                _log.Error($"Client error: {ex.Message}");
                try { client.Close(); } catch { }
            }
        }

        private string HandleMessage(string type, JObject message)
        {
            try
            {
                switch (type)
                {
                    case "login":
                        return HandleLogin(message);
                    case "register":
                        return HandleRegister(message);
                    case "get_emails":
                        return HandleGetEmails(message);
                    case "add_email":
                        return HandleAddEmail(message);
                    case "remove_email":
                        return HandleRemoveEmail(message);
                    case "get_settings":
                        return HandleGetSettings(message);
                    case "hardware_data":
                    default:
                        return HandleHardwareData(message);
                }
            }
            catch (Exception ex)
            {
                _log.Error($"Handler error [{type}]: {ex.Message}");
                return JsonConvert.SerializeObject(new { success = false, error = ex.Message });
            }
        }

        private string HandleLogin(JObject message)
        {
            string email = message["email"]?.ToString() ?? "";
            string password = message["password"]?.ToString() ?? "";

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return JsonConvert.SerializeObject(new { success = false, error = "Email and password are required." });

            var user = _db.LoginUser(email, password);
            if (user == null)
                return JsonConvert.SerializeObject(new { success = false, error = "Invalid email or password." });

            string clientId = message["clientId"]?.ToString() ?? "";
            bool unlockRequested = _db.ConsumeUnlockRequest(clientId, user.Value.Id);
            if (unlockRequested)
                _log.Info($"Unlock consumed for client {clientId} on login by {user.Value.Email}");

            _log.Success($"Login: {user.Value.Email}");
            return JsonConvert.SerializeObject(new
            {
                success = true,
                id = user.Value.Id,
                fullName = user.Value.FullName,
                email = user.Value.Email,
                unlockRequested
            });
        }

        private string HandleRegister(JObject message)
        {
            string fullName = message["fullName"]?.ToString() ?? "";
            string email = message["email"]?.ToString() ?? "";
            string password = message["password"]?.ToString() ?? "";

            if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return JsonConvert.SerializeObject(new { success = false, error = "All fields are required." });

            var result = _db.RegisterUser(fullName, email, password);
            if (result == null || !result.Value.Success)
                return JsonConvert.SerializeObject(new { success = false, error = result?.Message ?? "Registration failed." });

            _log.Success($"Registered: {email}");
            return JsonConvert.SerializeObject(new
            {
                success = true,
                id = result.Value.Id,
                fullName,
                email
            });
        }

        private string HandleGetEmails(JObject message)
        {
            string clientId = message["clientId"]?.ToString() ?? "";
            var emails = _db.GetAuthorizedEmails(clientId);

            _log.Info($"Get emails for {clientId}: {emails.Count} found");
            return JsonConvert.SerializeObject(new { success = true, emails });
        }

        private string HandleAddEmail(JObject message)
        {
            string clientId = message["clientId"]?.ToString() ?? "";
            string email = message["email"]?.ToString() ?? "";

            _db.AddAuthorizedEmail(clientId, email);
            _log.Info($"Added email {email} for {clientId}");
            return JsonConvert.SerializeObject(new { success = true });
        }

        private string HandleRemoveEmail(JObject message)
        {
            string clientId = message["clientId"]?.ToString() ?? "";
            string email = message["email"]?.ToString() ?? "";

            bool removed = _db.RemoveAuthorizedEmail(clientId, email);
            _log.Info($"Remove email {email} for {clientId}: {(removed ? "OK" : "Not found")}");
            return JsonConvert.SerializeObject(new { success = removed });
        }

        private string HandleGetSettings(JObject message)
        {
            string clientId = message["clientId"]?.ToString() ?? "";
            var settings = _db.GetSettings(clientId);

            return JsonConvert.SerializeObject(new { success = true, sendIntervalSeconds = settings.Interval, serverAddress = settings.ServerAddress });
        }

        private string HandleHardwareData(JObject message)
        {
            HardwareData data = message.ToObject<HardwareData>();
            _db.ProcessHardwareData(data);

            _log.Info($"Data from {data.MachineName} (ID: {data.ClientId})");
            return JsonConvert.SerializeObject(new { success = true });
        }
    }
}
