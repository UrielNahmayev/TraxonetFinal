using Microsoft.AspNetCore.Mvc;
using TraxonetServer_TCP.Services;

namespace TraxonetServer_TCP.Controllers
{
    [Route("api")]
    public class ApiController : Controller
    {
        private readonly Database _db;
        private readonly LogService _log;

        public ApiController(Database db, LogService logService)
        {
            _db = db;
            _log = logService;
        }

        // ===== LOGS =====
        [HttpGet("logs")]
        public IActionResult GetLogs([FromQuery] int count = 100)
        {
            var logs = _log.GetRecentLogs(count);
            return Json(logs.Select(l => new
            {
                timestamp = l.Timestamp.ToString("HH:mm:ss"),
                message = l.Message,
                level = l.Level
            }));
        }

        // ===== USERS =====
        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            try
            {
                var users = _db.GetAllUsers();
                return Json(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        public IActionResult DeleteUser(int id)
        {
            try
            {
                var result = _db.DeleteUser(id);
                if (result)
                    _log.Warn($"Admin: Deleted user ID {id}");
                return Json(new { success = result });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("users/reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequest req)
        {
            try
            {
                var result = _db.ResetPassword(req.UserId, req.NewPassword);
                if (result)
                    _log.Warn($"Admin: Reset password for user ID {req.UserId}");
                return Json(new { success = result });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // ===== COMPUTERS =====
        [HttpGet("computers")]
        public IActionResult GetComputers()
        {
            try
            {
                var computers = _db.GetAllComputers();
                return Json(new { success = true, data = computers });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpDelete("computers/{clientId}")]
        public IActionResult DeleteComputer(string clientId)
        {
            try
            {
                var result = _db.DeleteComputer(clientId);
                if (result)
                    _log.Warn($"Admin: Deleted computer {clientId}");
                return Json(new { success = result });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // ===== EMAILS (AUTHORIZED ACCESS) =====
        [HttpGet("emails")]
        public IActionResult GetEmails()
        {
            try
            {
                var emails = _db.GetAllEmails();
                return Json(new { success = true, data = emails });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpDelete("emails")]
        public IActionResult RemoveEmail([FromQuery] string clientId, [FromQuery] string email)
        {
            try
            {
                var result = _db.RemoveAuthorizedEmail(clientId, email);
                if (result)
                    _log.Warn($"Admin: Removed email {email} from {clientId}");
                return Json(new { success = result });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // ===== DRIVES =====
        [HttpGet("drives")]
        public IActionResult GetDrives()
        {
            try
            {
                var drives = _db.GetAllDrives();
                return Json(new { success = true, data = drives });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // ===== THRESHOLDS =====
        [HttpGet("thresholds")]
        public IActionResult GetThresholds()
        {
            try
            {
                var thresholds = _db.GetAllThresholds();
                return Json(new { success = true, data = thresholds });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }
    }

    // Request models
    public class ResetPasswordRequest
    {
        public int UserId { get; set; }
        public string NewPassword { get; set; } = "";
    }
}
