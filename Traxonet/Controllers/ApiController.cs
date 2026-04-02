using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Traxonet.Data;
using Traxonet.Models;
using Traxonet.Services;

namespace Traxonet.Controllers
{
    [Route("api")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ApiController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Email and password are required." });

            var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return Unauthorized(new { error = "Invalid email or password." });

            if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
                return Unauthorized(new { error = "Invalid email or password." });

            return Ok(new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "All fields are required." });

            var existing = await _db.Users.AnyAsync(u => u.Email == request.Email);
            if (existing)
                return Conflict(new { error = "Email already exists." });

            PasswordHasher.CreatePasswordHash(request.Password, out var hash, out var salt);

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _db.Users
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("emails/{clientId}")]
        public async Task<IActionResult> GetAuthorizedEmails(string clientId)
        {
            var emails = await _db.AuthorizedEmails
                .Where(e => e.ClientId == clientId)
                .Select(e => e.Email)
                .ToListAsync();

            return Ok(emails);
        }

        [HttpPost("emails/{clientId}")]
        public async Task<IActionResult> AddAuthorizedEmail(string clientId, [FromBody] EmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { error = "Email is required." });

            var existing = await _db.AuthorizedEmails
                .AnyAsync(e => e.ClientId == clientId && e.Email == request.Email);

            if (existing)
                return Ok(new { message = "Email already authorized." });

            _db.AuthorizedEmails.Add(new AuthorizedEmail
            {
                ClientId = clientId,
                Email = request.Email.Trim().ToLower()
            });
            await _db.SaveChangesAsync();

            return Ok(new { message = "Email authorized." });
        }

        [HttpDelete("emails/{clientId}")]
        public async Task<IActionResult> RemoveAuthorizedEmail(string clientId, [FromBody] EmailRequest request)
        {
            var entry = await _db.AuthorizedEmails
                .FirstOrDefaultAsync(e => e.ClientId == clientId && e.Email == request.Email);

            if (entry == null)
                return NotFound(new { error = "Email not found." });

            _db.AuthorizedEmails.Remove(entry);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Email removed." });
        }

        [HttpGet("settings/{clientId}")]
        public async Task<IActionResult> GetSettings(string clientId)
        {
            var threshold = await _db.Thresholds.FindAsync(clientId);
            return Ok(new SettingsResponse
            {
                MaxCpuTemp = threshold?.MaxCpuTemp,
                MaxCpuUsage = threshold?.MaxCpuUsage,
                MaxRamUsage = threshold?.MaxRamUsage,
                MinFreeSpace = threshold?.MinFreeSpace,
                SendIntervalSeconds = threshold?.SendIntervalSeconds ?? 10
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UserResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }

    public class EmailRequest
    {
        public string Email { get; set; }
    }

    public class SettingsResponse
    {
        public float? MaxCpuTemp { get; set; }
        public float? MaxCpuUsage { get; set; }
        public float? MaxRamUsage { get; set; }
        public long? MinFreeSpace { get; set; }
        public int SendIntervalSeconds { get; set; }
    }
}
