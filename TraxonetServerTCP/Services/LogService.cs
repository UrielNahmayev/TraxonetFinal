using System.Collections.Concurrent;

namespace TraxonetServer_TCP.Services
{
    public class LogEntry
    {
        public DateTime Timestamp { get; set; }
        public string Message { get; set; } = "";
        public string Level { get; set; } = "INFO";
    }

    public class LogService
    {
        private readonly ConcurrentQueue<LogEntry> _logs = new();
        private const int MAX_LOGS = 500;

        private readonly string _logDir;
        private readonly object _fileLock = new();
        private string _currentFile = "";

        public event Action<LogEntry>? OnNewLog;

        public LogService()
        {
            _logDir = Path.Combine(AppContext.BaseDirectory, "logs");
            Directory.CreateDirectory(_logDir);
        }

        public void Log(string message, string level = "INFO")
        {
            var entry = new LogEntry
            {
                Timestamp = DateTime.Now,
                Message = message,
                Level = level
            };

            _logs.Enqueue(entry);

            while (_logs.Count > MAX_LOGS)
                _logs.TryDequeue(out _);

            WriteToFile(entry);

            OnNewLog?.Invoke(entry);
        }

        private void WriteToFile(LogEntry entry)
        {
            try
            {
                lock (_fileLock)
                {
                    string path = CurrentLogFilePath();
                    if (path != _currentFile)
                    {
                        _currentFile = path;
                        CleanupOldLogs();
                    }
                    string line = $"{entry.Timestamp:yyyy-MM-dd HH:mm:ss} [{entry.Level}] {entry.Message}{Environment.NewLine}";
                    File.AppendAllText(path, line);
                }
            }
            catch { }
        }

        private string CurrentLogFilePath()
        {
            int offset = DateTime.Today.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)DateTime.Today.DayOfWeek - 1;
            DateTime weekStart = DateTime.Today.AddDays(-offset);
            return Path.Combine(_logDir, $"console-{weekStart:yyyy-MM-dd}.log");
        }

        private void CleanupOldLogs()
        {
            try
            {
                foreach (var file in Directory.GetFiles(_logDir, "console-*.log"))
                {
                    if (DateTime.Now - File.GetLastWriteTime(file) >= TimeSpan.FromDays(7))
                        File.Delete(file);
                }
            }
            catch { }
        }

        public void Info(string message) => Log(message, "INFO");
        public void Success(string message) => Log(message, "SUCCESS");
        public void Warn(string message) => Log(message, "WARN");
        public void Error(string message) => Log(message, "ERROR");

        public List<LogEntry> GetRecentLogs(int count = 100)
        {
            return _logs.TakeLast(count).ToList();
        }
    }
}
