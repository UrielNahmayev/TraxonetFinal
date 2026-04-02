using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;
using Traxonet.Data;
using Traxonet.Models;
using Traxonet.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Traxonet.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly ApplicationDbContext _db;

        public DashboardController(ApplicationDbContext db)
        {
            _db = db;
        }

        public IActionResult Index(string clientId = null)
        {
            var devices = GetAuthorizedDevices();

            var vm = new DashboardViewModel
            {
                Devices = devices,
                SelectedClientId = clientId ?? devices.FirstOrDefault()?.ClientId
            };

            return View(vm);
        }


        [HttpGet]
        public IActionResult GetDevices()
        {
            var devices = GetAuthorizedDevices();
            return Json(devices);
        }

        [HttpGet]
        public async Task<IActionResult> GetDeviceSettings(string clientId)
        {
            var threshold = await _db.Thresholds.FindAsync(clientId);
            var alertEmails = await _db.AlertEmails
                .Where(a => a.ClientId == clientId)
                .Select(a => a.Email)
                .ToListAsync();

            return Json(new
            {
                maxCpuTemp = threshold?.MaxCpuTemp,
                maxCpuUsage = threshold?.MaxCpuUsage,
                maxRamUsage = threshold?.MaxRamUsage,
                minFreeSpace = threshold?.MinFreeSpace.HasValue == true
                    ? threshold.MinFreeSpace.Value / (1024L * 1024 * 1024)
                    : (long?)null,
                sendIntervalSeconds = threshold?.SendIntervalSeconds ?? 10,
                serverAddress = threshold?.ServerAddress ?? "127.0.0.1",
                alertEmails = alertEmails
            });
        }

        [HttpPost]
        public async Task<IActionResult> SaveSettings([FromBody] SaveSettingsRequest request)
        {
            if (string.IsNullOrEmpty(request.ClientId))
                return BadRequest(new { error = "Client ID is required." });

            var threshold = await _db.Thresholds.FindAsync(request.ClientId);
            if (threshold == null)
            {
                threshold = new Threshold { ClientId = request.ClientId };
                _db.Thresholds.Add(threshold);
            }

            threshold.MaxCpuTemp = request.MaxCpuTemp;
            threshold.MaxCpuUsage = request.MaxCpuUsage;
            threshold.MaxRamUsage = request.MaxRamUsage;
            threshold.MinFreeSpace = request.MinFreeSpaceGB.HasValue
                ? request.MinFreeSpaceGB.Value * 1024L * 1024 * 1024
                : null;
            threshold.SendIntervalSeconds = request.SendIntervalSeconds > 0
                ? request.SendIntervalSeconds
                : 10;
            threshold.ServerAddress = !string.IsNullOrWhiteSpace(request.ServerAddress)
                ? request.ServerAddress
                : "127.0.0.1";

            await _db.SaveChangesAsync();
            return Ok(new { message = "Settings saved." });
        }

        [HttpPost]
        public async Task<IActionResult> AddAlertEmail([FromBody] AlertEmailRequest request)
        {
            if (string.IsNullOrEmpty(request.ClientId) || string.IsNullOrEmpty(request.Email))
                return BadRequest(new { error = "Client ID and email are required." });

            var existing = await _db.AlertEmails
                .AnyAsync(a => a.ClientId == request.ClientId && a.Email == request.Email);

            if (existing)
                return Ok(new { message = "Email already exists." });

            _db.AlertEmails.Add(new AlertEmail
            {
                ClientId = request.ClientId,
                Email = request.Email
            });
            await _db.SaveChangesAsync();
            return Ok(new { message = "Alert email added." });
        }

        [HttpPost]
        public async Task<IActionResult> RemoveAlertEmail([FromBody] AlertEmailRequest request)
        {
            var email = await _db.AlertEmails
                .FirstOrDefaultAsync(a => a.ClientId == request.ClientId && a.Email == request.Email);

            if (email == null)
                return NotFound(new { error = "Email not found." });

            if (request.Email.Trim().ToLower() == "traxonetisrael@gmail.com")
                return BadRequest(new { error = "This email cannot be removed." });

            _db.AlertEmails.Remove(email);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Alert email removed." });
        }

        [HttpPost]
        public async Task<IActionResult> RemoveMyAccess(string clientId)
        {
            if (string.IsNullOrEmpty(clientId))
                return RedirectToAction("Index");

            try
            {
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value?.ToLower()?.Trim();
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(userIdStr, out int userId);

                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM emails WHERE client_id = {0} AND LOWER(email) = {1}",
                    clientId, userEmail ?? "");

                await _db.Database.ExecuteSqlRawAsync(
                    "UPDATE computers SET owner_user_id = NULL WHERE client_id = {0} AND owner_user_id = {1}",
                    clientId, userId);

                try
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "DELETE FROM computer_permissions WHERE client_id = {0} AND user_id = {1}",
                        clientId, userId);
                }
                catch { }
            }
            catch { }

            return RedirectToAction("Index");
        }

        private List<DashboardDeviceViewModel> GetAuthorizedDevices()
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value?.ToLower()?.Trim();
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);

            if (string.IsNullOrEmpty(userEmail))
            {
                return new List<DashboardDeviceViewModel>();
            }

            var emailAuthorizedIds = _db.AuthorizedEmails
                .Where(e => e.Email.ToLower() == userEmail)
                .Select(e => e.ClientId)
                .ToList();

            var permissionAuthorizedIds = new List<string>();
            try
            {
                permissionAuthorizedIds = _db.ComputerPermissions
                    .Where(p => p.UserId == userId)
                    .Select(p => p.ClientId)
                    .ToList();
            }
            catch { }

            var ownedIds = new List<string>();
            try
            {
                ownedIds = _db.Computers
                    .Where(c => c.OwnerUserId == userId)
                    .Select(c => c.ClientId)
                    .ToList();
            }
            catch { }

            var authorizedClientIds = emailAuthorizedIds
                .Union(permissionAuthorizedIds)
                .Union(ownedIds)
                .Distinct()
                .ToList();

            bool isAdmin = userEmail == "traxonetisrael@gmail.com";

            var allDrives = isAdmin
                ? _db.Drives.ToList()
                : _db.Drives.Where(d => authorizedClientIds.Contains(d.ClientId)).ToList();

            var computers = (isAdmin
                ? _db.Computers.AsQueryable()
                : _db.Computers.Where(c => authorizedClientIds.Contains(c.ClientId)))
                .Select(c => new DashboardDeviceViewModel
                {
                    ClientId = c.ClientId,
                    Name = c.MachineName,
                    IpAddress = c.IpAddress,
                    MacAddress = c.MacAddress,
                    IsOnline = c.TimeSent > System.DateTime.Now.AddMinutes(-5),
                    LastSeen = c.TimeSent,
                    Cpu = c.Cpu,
                    CpuCores = c.CpuCores,
                    CpuUsage = c.CpuUsage,
                    CpuTemp = c.CpuTemp,
                    Gpu = c.Gpu,
                    GpuDriver = c.GpuDriver,
                    TotalRam = c.TotalRam,
                    FreeRam = c.FreeRam,
                    RamUsage = c.RamUsage,
                    Motherboard = c.Motherboard
                })
                .ToList();


            foreach (var computer in computers)
            {
                computer.Drives = allDrives
                    .Where(d => d.ClientId == computer.ClientId)
                    .Select(d => new DriveViewModel
                    {
                        DriveName = d.DriveName,
                        TotalSize = d.TotalSize,
                        FreeSpace = d.FreeSpace
                    })
                    .ToList();
            }

            return computers;
        }
    }

    public class SaveSettingsRequest
    {
        public string ClientId { get; set; }
        public float? MaxCpuTemp { get; set; }
        public float? MaxCpuUsage { get; set; }
        public float? MaxRamUsage { get; set; }
        public long? MinFreeSpaceGB { get; set; }
        public int SendIntervalSeconds { get; set; } = 10;
        public string ServerAddress { get; set; } = "127.0.0.1";
    }

    public class AlertEmailRequest
    {
        public string ClientId { get; set; }
        public string Email { get; set; }
    }

    public class RemoveAccessRequest
    {
        public string ClientId { get; set; }
    }
}
