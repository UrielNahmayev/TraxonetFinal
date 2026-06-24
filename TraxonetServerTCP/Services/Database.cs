using MySql.Data.MySqlClient;
using System.Net;
using System.Net.Mail;
using TraxonetServer_TCP.Models;
using Microsoft.Extensions.Configuration;

namespace TraxonetServer_TCP.Services
{
    public class Database
    {
        private readonly string _connectionString;
        private readonly LogService _log;
        public const string ADMIN_EMAIL = "traxonetisrael@gmail.com";

        private const string SMTP_HOST = "smtp.gmail.com";
        private const int SMTP_PORT = 587;
        private const string SMTP_USER = "traxonetisrael@gmail.com";
        private const string SMTP_PASS = "owto enkl qolf qcwh";
        private const string FROM_EMAIL = "traxonetisrael@gmail.com";

        private const int ALERT_COOLDOWN_MINUTES = 5;
        private static Dictionary<string, DateTime> lastAlertTime = new();

        private readonly DbCryptoHelper _crypto;

        public Database(string connectionString, LogService logService, IConfiguration config)
        {
            _connectionString = connectionString;
            _log = logService;
            _crypto = new DbCryptoHelper(config);
        }

        private MySqlConnection GetConnection()
        {
            var conn = new MySqlConnection(_connectionString);
            conn.Open();
            return conn;
        }

        public void EnsureSchema()
        {
            try
            {
                using var conn = GetConnection();

                // 0. Increase column length for AES expansion
                try {
                    new MySqlCommand("ALTER TABLE computers MODIFY machine_name VARCHAR(512), MODIFY cpu VARCHAR(512), MODIFY gpu VARCHAR(512), MODIFY ip_address VARCHAR(255), MODIFY mac_address VARCHAR(255), MODIFY motherboard VARCHAR(512), MODIFY gpu_driver VARCHAR(512)", conn).ExecuteNonQuery();
                } catch { }

                // 1. Check/Add send_interval_seconds to thresholds
                var checkCol = new MySqlCommand(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'thresholds' AND COLUMN_NAME = 'send_interval_seconds'",
                    conn);
                var exists = Convert.ToInt32(checkCol.ExecuteScalar());

                if (exists == 0)
                {
                    new MySqlCommand("ALTER TABLE thresholds ADD COLUMN send_interval_seconds INT DEFAULT 10", conn).ExecuteNonQuery();
                    _log.Info("Migrated: Added send_interval_seconds to thresholds table.");
                }

                // 2. Check/Add owner_user_id to computers
                checkCol = new MySqlCommand(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'computers' AND COLUMN_NAME = 'owner_user_id'",
                    conn);
                exists = Convert.ToInt32(checkCol.ExecuteScalar());

                if (exists == 0)
                {
                    new MySqlCommand("ALTER TABLE computers ADD COLUMN owner_user_id INT NULL", conn).ExecuteNonQuery();
                    _log.Info("Migrated: Added owner_user_id to computers table.");
                }

                // 3. Check/Add server_address to thresholds
                checkCol = new MySqlCommand(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'thresholds' AND COLUMN_NAME = 'server_address'",
                    conn);
                exists = Convert.ToInt32(checkCol.ExecuteScalar());

                if (exists == 0)
                {
                    new MySqlCommand("ALTER TABLE thresholds ADD COLUMN server_address VARCHAR(255) DEFAULT '127.0.0.1'", conn).ExecuteNonQuery();
                    _log.Info("Migrated: Added server_address to thresholds table.");
                }

                // 4. Check/Add unlock_requested to computers (web "Reset PC Lock" flag)
                checkCol = new MySqlCommand(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'computers' AND COLUMN_NAME = 'unlock_requested'",
                    conn);
                exists = Convert.ToInt32(checkCol.ExecuteScalar());

                if (exists == 0)
                {
                    new MySqlCommand("ALTER TABLE computers ADD COLUMN unlock_requested TINYINT(1) NOT NULL DEFAULT 0", conn).ExecuteNonQuery();
                    _log.Info("Migrated: Added unlock_requested to computers table.");
                }
            }
            catch (Exception ex)
            {
                _log.Warn($"Schema migration warning: {ex.Message}");
            }
        }

        /// <summary>
        /// Returns true if an unlock was requested for this client (via the web "Reset PC Lock" button),
        /// and atomically clears the flag so it is consumed only once.
        /// </summary>
        public bool ConsumeUnlockRequest(string clientId, int newOwnerId)
        {
            if (string.IsNullOrEmpty(clientId)) return false;
            try
            {
                using var conn = GetConnection();
                // Consume the flag AND transfer ownership to the user taking over the PC.
                using var cmd = new MySqlCommand(
                    "UPDATE computers SET unlock_requested = 0, owner_user_id = @owner WHERE client_id = @cid AND unlock_requested = 1", conn);
                cmd.Parameters.AddWithValue("@owner", newOwnerId);
                cmd.Parameters.AddWithValue("@cid", clientId);
                return cmd.ExecuteNonQuery() > 0;
            }
            catch (Exception ex)
            {
                _log.Warn($"ConsumeUnlockRequest error: {ex.Message}");
                return false;
            }
        }

        // =============================================
        // TCP Server Handler Methods (ported from old TCPServer)
        // =============================================

        public void InsertComputer(HardwareData data)
        {
            string query = @"
            INSERT INTO computers (
                client_id, machine_name, motherboard, cpu, gpu, cpu_cores, logical_processors,
                cpu_temp, cpu_usage, gpu_driver, total_ram, free_ram, ram_usage,
                ip_address, mac_address, time_sent, owner_user_id
            ) VALUES (
                @clientId, @machineName, @motherboard, @cpu, @gpu, @cpuCores, @logicalProcessors,
                @cpuTemp, @cpuUsage, @gpuDriver, @totalRam, @freeRam, @ramUsage,
                @ip, @mac, NOW(), @ownerUserId
            )
            ON DUPLICATE KEY UPDATE
                machine_name = VALUES(machine_name),
                motherboard = VALUES(motherboard),
                cpu = VALUES(cpu),
                gpu = VALUES(gpu),
                cpu_cores = VALUES(cpu_cores),
                logical_processors = VALUES(logical_processors),
                cpu_temp = VALUES(cpu_temp),
                cpu_usage = VALUES(cpu_usage),
                gpu_driver = VALUES(gpu_driver),
                total_ram = VALUES(total_ram),
                free_ram = VALUES(free_ram),
                ram_usage = VALUES(ram_usage),
                ip_address = VALUES(ip_address),
                mac_address = VALUES(mac_address),
                time_sent = VALUES(time_sent),
                owner_user_id = COALESCE(owner_user_id, VALUES(owner_user_id));";

            using var conn = GetConnection();
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@clientId", data.ClientId);
            cmd.Parameters.AddWithValue("@machineName", _crypto.Encrypt(data.MachineName));
            cmd.Parameters.AddWithValue("@motherboard", _crypto.Encrypt(data.Motherboard));
            cmd.Parameters.AddWithValue("@cpu", _crypto.Encrypt(data.Cpu));
            cmd.Parameters.AddWithValue("@gpu", _crypto.Encrypt(data.Gpu));
            cmd.Parameters.AddWithValue("@cpuCores", data.CpuCores);
            cmd.Parameters.AddWithValue("@logicalProcessors", data.LogicalProcessors);
            cmd.Parameters.AddWithValue("@cpuTemp", data.CpuTemp);
            cmd.Parameters.AddWithValue("@cpuUsage", data.CpuUsage);
            cmd.Parameters.AddWithValue("@gpuDriver", _crypto.Encrypt(data.GpuDriver));
            cmd.Parameters.AddWithValue("@totalRam", data.TotalRam);
            cmd.Parameters.AddWithValue("@freeRam", data.FreeRam);
            cmd.Parameters.AddWithValue("@ramUsage", data.RamUsage);
            cmd.Parameters.AddWithValue("@ip", _crypto.Encrypt(data.Ip));
            cmd.Parameters.AddWithValue("@mac", _crypto.Encrypt(data.Mac));
            cmd.Parameters.AddWithValue("@ownerUserId", data.OwnerUserId.HasValue ? (object)data.OwnerUserId.Value : DBNull.Value);
            cmd.ExecuteNonQuery();
        }

        public void InsertDrives(string clientId, List<DriveData> drives)
        {
            using var conn = GetConnection();
            foreach (var drive in drives)
            {
                string query = @"
                INSERT INTO drives (client_id, drive_name, total_size, free_space)
                VALUES (@clientId, @driveName, @totalSize, @freeSpace)
                ON DUPLICATE KEY UPDATE
                    total_size = VALUES(total_size),
                    free_space = VALUES(free_space);";

                using var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@clientId", clientId);
                cmd.Parameters.AddWithValue("@driveName", drive.DriveName);
                cmd.Parameters.AddWithValue("@totalSize", drive.TotalSize);
                cmd.Parameters.AddWithValue("@freeSpace", drive.FreeSpace);
                cmd.ExecuteNonQuery();
            }
        }

        public void InsertAuthorizedEmails(string clientId, List<string> emails)
        {
            if (emails == null) return;

            using var conn = GetConnection();
            string deleteQuery = "DELETE FROM emails WHERE client_id = @clientId";
            using (var cmd = new MySqlCommand(deleteQuery, conn))
            {
                cmd.Parameters.AddWithValue("@clientId", clientId);
                cmd.ExecuteNonQuery();
            }

            if (emails.Count == 0) return;

            foreach (var email in emails)
            {
                string query = @"
                INSERT INTO emails (client_id, email)
                VALUES (@clientId, @email)
                ON DUPLICATE KEY UPDATE email = VALUES(email);";

                using var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@clientId", clientId);
                cmd.Parameters.AddWithValue("@email", email);
                cmd.ExecuteNonQuery();
            }
        }

        public void InsertAlertEmails(string clientId, List<string> alertEmails)
        {
            if (alertEmails == null) return;

            using var conn = GetConnection();
            string deleteQuery = "DELETE FROM alert_emails WHERE client_id = @clientId";
            using (var cmd = new MySqlCommand(deleteQuery, conn))
            {
                cmd.Parameters.AddWithValue("@clientId", clientId);
                cmd.ExecuteNonQuery();
            }

            if (alertEmails.Count == 0) return;

            foreach (var email in alertEmails)
            {
                string query = @"
                INSERT INTO alert_emails (client_id, email)
                VALUES (@clientId, @email)
                ON DUPLICATE KEY UPDATE email = VALUES(email);";

                using var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@clientId", clientId);
                cmd.Parameters.AddWithValue("@email", email);
                cmd.ExecuteNonQuery();
            }
        }

        public void InsertThresholds(string clientId, ThresholdData thresholds)
        {
            if (thresholds == null) return;

            string query = @"
            INSERT INTO thresholds (client_id, max_cpu_temp, max_cpu_usage, max_ram_usage, min_free_space)
            VALUES (@clientId, @cpuTemp, @cpuUsage, @ramUsage, @minFreeSpace)
            ON DUPLICATE KEY UPDATE
                max_cpu_temp = VALUES(max_cpu_temp),
                max_cpu_usage = VALUES(max_cpu_usage),
                max_ram_usage = VALUES(max_ram_usage),
                min_free_space = VALUES(min_free_space);";

            using var conn = GetConnection();
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@clientId", clientId);
            cmd.Parameters.AddWithValue("@cpuTemp", thresholds.MaxCpuTemp ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@cpuUsage", thresholds.MaxCpuUsage ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ramUsage", thresholds.MaxRamUsage ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@minFreeSpace", thresholds.MinFreeSpace ?? (object)DBNull.Value);
            cmd.ExecuteNonQuery();
        }

        public void CheckThresholdsAndNotify(HardwareData data)
        {
            ThresholdData thresholds = data.Thresholds;

            if (thresholds == null)
            {
                using var conn = GetConnection();
                string query = "SELECT max_cpu_temp, max_cpu_usage, max_ram_usage, min_free_space FROM thresholds WHERE client_id = @clientId";
                using var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@clientId", data.ClientId);

                using var reader = cmd.ExecuteReader();
                if (!reader.Read()) return;

                thresholds = new ThresholdData
                {
                    MaxCpuTemp = reader["max_cpu_temp"] != DBNull.Value ? Convert.ToSingle(reader["max_cpu_temp"]) : null,
                    MaxCpuUsage = reader["max_cpu_usage"] != DBNull.Value ? Convert.ToSingle(reader["max_cpu_usage"]) : null,
                    MaxRamUsage = reader["max_ram_usage"] != DBNull.Value ? Convert.ToSingle(reader["max_ram_usage"]) : null,
                    MinFreeSpace = reader["min_free_space"] != DBNull.Value ? Convert.ToInt64(reader["min_free_space"]) : null
                };
                reader.Close();
            }

            var alerts = new List<string>();

            if (thresholds.MaxCpuTemp.HasValue && data.CpuTemp > thresholds.MaxCpuTemp.Value)
                alerts.Add($"CPU Temp: {data.CpuTemp}C > {thresholds.MaxCpuTemp}C");

            if (thresholds.MaxCpuUsage.HasValue && data.CpuUsage > thresholds.MaxCpuUsage.Value)
                alerts.Add($"CPU Usage: {data.CpuUsage}% > {thresholds.MaxCpuUsage}%");

            if (thresholds.MaxRamUsage.HasValue && data.RamUsage > thresholds.MaxRamUsage.Value)
                alerts.Add($"RAM Usage: {data.RamUsage}% > {thresholds.MaxRamUsage}%");

            long totalFreeSpace = data.Drives?.Sum(d => d.FreeSpace) ?? 0;
            if (thresholds.MinFreeSpace.HasValue && totalFreeSpace < thresholds.MinFreeSpace.Value)
            {
                double freeGB = totalFreeSpace / (1024.0 * 1024 * 1024);
                double thresholdGB = thresholds.MinFreeSpace.Value / (1024.0 * 1024 * 1024);
                alerts.Add($"Disk: {freeGB:F1}GB < {thresholdGB:F1}GB");
            }

            if (alerts.Count == 0) return;

            SendEmailAlerts(data, alerts);
        }

        private void SendEmailAlerts(HardwareData data, List<string> alerts)
        {
            if (lastAlertTime.ContainsKey(data.ClientId))
            {
                var timeSinceLastAlert = DateTime.Now - lastAlertTime[data.ClientId];
                if (timeSinceLastAlert.TotalMinutes < ALERT_COOLDOWN_MINUTES)
                {
                    _log.Info($"Alert cooldown active ({ALERT_COOLDOWN_MINUTES - (int)timeSinceLastAlert.TotalMinutes} min remaining)");
                    return;
                }
            }

            List<string> alertEmails = data.AlertEmails ?? new List<string>();

            if (alertEmails.Count == 0)
            {
                using var conn = GetConnection();
                string query = "SELECT email FROM alert_emails WHERE client_id = @clientId";
                using var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@clientId", data.ClientId);

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                    alertEmails.Add(reader.GetString("email"));
                reader.Close();
            }

            if (alertEmails.Count == 0) return;

            lastAlertTime[data.ClientId] = DateTime.Now;

            // Notice: data.MachineName is in plaintext here in memory, so it's safe to use for email subject
            string subject = $"TRAXONET: {data.MachineName}";
            string body = string.Join(" | ", alerts);

            foreach (var email in alertEmails)
            {
                SendEmail(email, subject, body);
            }
        }

        private void SendEmail(string to, string subject, string body)
        {
            try
            {
                using var smtp = new SmtpClient(SMTP_HOST)
                {
                    Port = SMTP_PORT,
                    EnableSsl = true,
                    Credentials = new NetworkCredential(SMTP_USER, SMTP_PASS)
                };

                var msg = new MailMessage(FROM_EMAIL, to, subject, body);
                smtp.Send(msg);
                _log.Success($"Alert sent to: {to}");
            }
            catch (Exception ex)
            {
                _log.Error($"Email error to {to}: {ex.Message}");
            }
        }

        public (int Id, string FullName, string Email)? LoginUser(string email, string password)
        {
            using var conn = GetConnection();
            string query = "SELECT Id, FullName, Email, PasswordHash, PasswordSalt FROM users WHERE email = @email";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@email", email);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return null;

            int id = reader.GetInt32("Id");
            string fullName = reader.GetString("FullName");
            string userEmail = reader.GetString("Email");
            byte[] hash = (byte[])reader["PasswordHash"];
            byte[] salt = (byte[])reader["PasswordSalt"];
            reader.Close();

            if (!PasswordHasher.VerifyPassword(password, hash, salt))
                return null;

            return (id, fullName, userEmail);
        }

        public (bool Success, string Message, int? Id)? RegisterUser(string fullName, string email, string password)
        {
            using var conn = GetConnection();
            string checkQuery = "SELECT COUNT(*) FROM users WHERE Email = @email";
            using (var checkCmd = new MySqlCommand(checkQuery, conn))
            {
                checkCmd.Parameters.AddWithValue("@email", email);
                var count = Convert.ToInt32(checkCmd.ExecuteScalar());
                if (count > 0)
                    return (false, "Email already exists.", null);
            }

            PasswordHasher.CreatePasswordHash(password, out var hash, out var salt);

            string insertQuery = "INSERT INTO users (FullName, Email, PasswordHash, PasswordSalt, CreatedAt) VALUES (@fullName, @email, @hash, @salt, NOW())";
            using var cmd = new MySqlCommand(insertQuery, conn);
            cmd.Parameters.AddWithValue("@fullName", fullName);
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@hash", hash);
            cmd.Parameters.AddWithValue("@salt", salt);
            cmd.ExecuteNonQuery();

            int newId = (int)cmd.LastInsertedId;
            return (true, "Registration successful!", newId);
        }

        public List<string> GetAuthorizedEmails(string clientId)
        {
            var emails = new List<string>();
            using var conn = GetConnection();
            string query = "SELECT email FROM emails WHERE client_id = @clientId";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@clientId", clientId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
                emails.Add(reader.GetString("email"));
            reader.Close();

            return emails;
        }

        public bool AddAuthorizedEmail(string clientId, string email)
        {
            using var conn = GetConnection();
            string checkQuery = "SELECT COUNT(*) FROM emails WHERE client_id = @clientId AND email = @email";
            using (var checkCmd = new MySqlCommand(checkQuery, conn))
            {
                checkCmd.Parameters.AddWithValue("@clientId", clientId);
                checkCmd.Parameters.AddWithValue("@email", email);
                if (Convert.ToInt32(checkCmd.ExecuteScalar()) > 0)
                    return true;
            }

            string query = "INSERT INTO emails (client_id, email) VALUES (@clientId, @email)";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@clientId", clientId);
            cmd.Parameters.AddWithValue("@email", email.Trim().ToLower());
            cmd.ExecuteNonQuery();
            return true;
        }

        public bool RemoveAuthorizedEmail(string clientId, string email)
        {
            if (email.Trim().ToLower() == ADMIN_EMAIL)
                return false;

            using var conn = GetConnection();
            string query = "DELETE FROM emails WHERE client_id = @clientId AND email = @email";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@clientId", clientId);
            cmd.Parameters.AddWithValue("@email", email);
            return cmd.ExecuteNonQuery() > 0;
        }

        public (int Interval, string ServerAddress) GetSettings(string clientId)
        {
            using var conn = GetConnection();
            string query = "SELECT send_interval_seconds, server_address FROM thresholds WHERE client_id = @clientId";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@clientId", clientId);
            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                int interval = reader["send_interval_seconds"] != DBNull.Value ? Convert.ToInt32(reader["send_interval_seconds"]) : 10;
                string serverAddress = reader["server_address"] != DBNull.Value ? reader.GetString("server_address") : "127.0.0.1";
                reader.Close();
                return (interval, serverAddress);
            }
            reader.Close();
            return (10, "");
        }

        public void ProcessHardwareData(HardwareData data)
        {
            InsertComputer(data);

            if (data.Drives != null && data.Drives.Count > 0)
                InsertDrives(data.ClientId, data.Drives);

            try { AddAuthorizedEmail(data.ClientId, ADMIN_EMAIL); } catch { }

            if (!string.IsNullOrWhiteSpace(data.OwnerEmail))
            {
                try { AddAuthorizedEmail(data.ClientId, data.OwnerEmail); } catch { }
            }

            CheckThresholdsAndNotify(data);
        }

        // =============================================
        // Admin Panel Methods (new)
        // =============================================

        public List<Dictionary<string, object>> GetAllUsers()
        {
            var users = new List<Dictionary<string, object>>();
            using var conn = GetConnection();
            string query = "SELECT Id, FullName, Email, CreatedAt FROM users ORDER BY Id";
            using var cmd = new MySqlCommand(query, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                users.Add(new Dictionary<string, object>
                {
                    ["id"] = reader.GetInt32("Id"),
                    ["fullName"] = reader.GetString("FullName"),
                    ["email"] = reader.GetString("Email"),
                    ["createdAt"] = reader.GetDateTime("CreatedAt").ToString("yyyy-MM-dd HH:mm")
                });
            }
            return users;
        }

        public List<Dictionary<string, object>> GetAllComputers()
        {
            var computers = new List<Dictionary<string, object>>();
            using var conn = GetConnection();
            string query = "SELECT client_id, machine_name, cpu, gpu, ip_address, mac_address, cpu_temp, cpu_usage, ram_usage, time_sent, owner_user_id FROM computers";
            using var cmd = new MySqlCommand(query, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                computers.Add(new Dictionary<string, object>
                {
                    ["clientId"] = reader.GetString("client_id"),
                    ["machineName"] = _crypto.Decrypt(reader.GetString("machine_name")),
                    ["cpu"] = "*",
                    ["gpu"] = "*",
                    ["ipAddress"] = "*",
                    ["macAddress"] = "*",
                    ["cpuTemp"] = "*",
                    ["cpuUsage"] = "*",
                    ["ramUsage"] = "*",
                    ["timeSent"] = "*",
                    ["ownerUserId"] = "*"
                });
            }
            return computers.OrderBy(c => c["machineName"].ToString()).ToList();
        }

        public List<Dictionary<string, object>> GetAllEmails()
        {
            var emails = new List<Dictionary<string, object>>();
            using var conn = GetConnection();
            string query = @"SELECT e.client_id, e.email, c.machine_name 
                             FROM emails e 
                             LEFT JOIN computers c ON e.client_id = c.client_id 
                             ORDER BY e.client_id, e.email";
            using var cmd = new MySqlCommand(query, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                emails.Add(new Dictionary<string, object>
                {
                    ["clientId"] = reader.GetString("client_id"),
                    ["email"] = reader.GetString("email"),
                    ["machineName"] = _crypto.Decrypt(reader["machine_name"]?.ToString() ?? "Unknown")
                });
            }
            return emails;
        }

        public List<Dictionary<string, object>> GetAllDrives()
        {
            var drives = new List<Dictionary<string, object>>();
            using var conn = GetConnection();
            string query = @"SELECT d.client_id, d.drive_name, d.total_size, d.free_space, c.machine_name 
                             FROM drives d 
                             LEFT JOIN computers c ON d.client_id = c.client_id 
                             ORDER BY d.client_id, d.drive_name";
            using var cmd = new MySqlCommand(query, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                drives.Add(new Dictionary<string, object>
                {
                    ["clientId"] = reader.GetString("client_id"),
                    ["driveName"] = "*",
                    ["totalSize"] = "*",
                    ["freeSpace"] = "*",
                    ["machineName"] = _crypto.Decrypt(reader["machine_name"]?.ToString() ?? "Unknown")
                });
            }
            return drives;
        }

        public List<Dictionary<string, object>> GetAllThresholds()
        {
            var thresholds = new List<Dictionary<string, object>>();
            using var conn = GetConnection();
            string query = @"SELECT t.client_id, t.max_cpu_temp, t.max_cpu_usage, t.max_ram_usage, t.min_free_space, 
                             t.send_interval_seconds, t.server_address, c.machine_name
                             FROM thresholds t 
                             LEFT JOIN computers c ON t.client_id = c.client_id 
                             ORDER BY t.client_id";
            using var cmd = new MySqlCommand(query, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                thresholds.Add(new Dictionary<string, object>
                {
                    ["clientId"] = reader.GetString("client_id"),
                    ["machineName"] = _crypto.Decrypt(reader["machine_name"]?.ToString() ?? "Unknown"),
                    ["maxCpuTemp"] = "*",
                    ["maxCpuUsage"] = "*",
                    ["maxRamUsage"] = "*",
                    ["minFreeSpace"] = "*",
                    ["sendInterval"] = "*",
                    ["serverAddress"] = "*"
                });
            }
            return thresholds;
        }

        public bool DeleteUser(int userId)
        {
            using var conn = GetConnection();
            string query = "DELETE FROM users WHERE Id = @id";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@id", userId);
            return cmd.ExecuteNonQuery() > 0;
        }

        public bool ResetPassword(int userId, string newPassword)
        {
            PasswordHasher.CreatePasswordHash(newPassword, out var hash, out var salt);

            using var conn = GetConnection();
            string query = "UPDATE users SET PasswordHash = @hash, PasswordSalt = @salt WHERE Id = @id";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@hash", hash);
            cmd.Parameters.AddWithValue("@salt", salt);
            cmd.Parameters.AddWithValue("@id", userId);
            return cmd.ExecuteNonQuery() > 0;
        }

        public bool DeleteComputer(string clientId)
        {
            using var conn = GetConnection();
            // Delete related records first
            new MySqlCommand($"DELETE FROM emails WHERE client_id = @cid", conn) { Parameters = { new("@cid", clientId) } }.ExecuteNonQuery();
            new MySqlCommand($"DELETE FROM alert_emails WHERE client_id = @cid", conn) { Parameters = { new("@cid", clientId) } }.ExecuteNonQuery();
            new MySqlCommand($"DELETE FROM drives WHERE client_id = @cid", conn) { Parameters = { new("@cid", clientId) } }.ExecuteNonQuery();
            new MySqlCommand($"DELETE FROM thresholds WHERE client_id = @cid", conn) { Parameters = { new("@cid", clientId) } }.ExecuteNonQuery();

            string query = "DELETE FROM computers WHERE client_id = @clientId";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@clientId", clientId);
            return cmd.ExecuteNonQuery() > 0;
        }
    }
}
