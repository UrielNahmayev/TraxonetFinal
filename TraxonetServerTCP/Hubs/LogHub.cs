using Microsoft.AspNetCore.SignalR;
using TraxonetServer_TCP.Services;

namespace TraxonetServer_TCP.Hubs
{
    public class LogHub : Hub
    {
        private readonly LogService _logService;

        public LogHub(LogService logService)
        {
            _logService = logService;
        }

        public override async Task OnConnectedAsync()
        {
            // Send recent logs to the newly connected client
            var recentLogs = _logService.GetRecentLogs();
            foreach (var log in recentLogs)
            {
                await Clients.Caller.SendAsync("ReceiveLog", new
                {
                    timestamp = log.Timestamp.ToString("HH:mm:ss"),
                    message = log.Message,
                    level = log.Level
                });
            }
            await base.OnConnectedAsync();
        }
    }
}
