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

        public event Action<LogEntry>? OnNewLog;

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

            OnNewLog?.Invoke(entry);
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
