using System.Net.Sockets;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static Traxonet.Client.Models;

namespace Traxonet.Client
{
    public class ApiClient
    {
        private readonly string _host;
        private readonly int _port;

        public ApiClient(string host, int port = 5000)
        {
            _host = host;
            _port = port;
        }

        private async Task<JObject> SendRequestAsync(object request)
        {
            string json = JsonConvert.SerializeObject(request);
            using var client = new TcpClient();
            await client.ConnectAsync(_host, _port);
            using NetworkStream stream = client.GetStream();

            // === STEP 1: Receive RSA Public Key from server ===
            byte[] rsaPublicKey = await CryptoHelper.ReadLengthPrefixedAsync(stream);

            // === STEP 2: Generate AES key + IV, encrypt with RSA, send ===
            byte[] aesKey = CryptoHelper.GenerateAesKey();
            byte[] aesIV = CryptoHelper.GenerateAesIV();

            // Bundle: AES Key (32 bytes) + AES IV (16 bytes) = 48 bytes
            byte[] keyBundle = new byte[48];
            Buffer.BlockCopy(aesKey, 0, keyBundle, 0, 32);
            Buffer.BlockCopy(aesIV, 0, keyBundle, 32, 16);

            byte[] encryptedKeyBundle = CryptoHelper.RsaEncrypt(keyBundle, rsaPublicKey);
            await CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedKeyBundle);

            // === STEP 3: Encrypt JSON request with AES, send ===
            byte[] encryptedRequest = CryptoHelper.AesEncrypt(json, aesKey, aesIV);
            await CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedRequest);

            // === STEP 4: Receive AES-encrypted response, decrypt ===
            byte[] encryptedResponse = await CryptoHelper.ReadLengthPrefixedAsync(stream);
            string responseJson = CryptoHelper.AesDecrypt(encryptedResponse, aesKey, aesIV);

            return JObject.Parse(responseJson);
        }

        public async Task<UserInfo?> LoginAsync(string email, string password)
        {
            string clientId = ClientIdProvider.GetOrCreateClientId();
            var response = await SendRequestAsync(new { type = "login", email, password, clientId });

            if (response["success"]?.Value<bool>() != true)
                return null;

            return new UserInfo
            {
                Id = response["id"]?.Value<int>() ?? 0,
                FullName = response["fullName"]?.ToString() ?? "",
                Email = response["email"]?.ToString() ?? "",
                UnlockRequested = response["unlockRequested"]?.Value<bool>() ?? false
            };
        }

        public async Task<(bool Success, string Message)> RegisterAsync(string fullName, string email, string password)
        {
            var response = await SendRequestAsync(new { type = "register", fullName, email, password });

            bool success = response["success"]?.Value<bool>() ?? false;
            string message = success
                ? "Registration successful!"
                : (response["error"]?.ToString() ?? "Registration failed.");

            return (success, message);
        }

        public async Task<List<string>> GetAuthorizedEmailsAsync(string clientId)
        {
            var response = await SendRequestAsync(new { type = "get_emails", clientId });

            if (response["success"]?.Value<bool>() != true)
                return new List<string>();

            return response["emails"]?.ToObject<List<string>>() ?? new List<string>();
        }

        public async Task<bool> AddAuthorizedEmailAsync(string clientId, string email)
        {
            var response = await SendRequestAsync(new { type = "add_email", clientId, email });
            return response["success"]?.Value<bool>() ?? false;
        }

        public async Task<bool> RemoveAuthorizedEmailAsync(string clientId, string email)
        {
            var response = await SendRequestAsync(new { type = "remove_email", clientId, email });
            return response["success"]?.Value<bool>() ?? false;
        }

        public async Task<(int Interval, string ServerAddress)> GetSettingsAsync(string clientId)
        {
            try
            {
                var response = await SendRequestAsync(new { type = "get_settings", clientId });
                int interval = response["sendIntervalSeconds"]?.Value<int>() ?? 10;
                string serverAddress = response["serverAddress"]?.ToString() ?? "127.0.0.1";
                return (interval, serverAddress);
            }
            catch
            {
                return (10, "127.0.0.1");
            }
        }

    }

    public class UserInfo
    {
        public int Id { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public bool UnlockRequested { get; set; }
    }
}
