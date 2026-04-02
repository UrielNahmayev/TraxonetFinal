using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Traxonet.Data;
using Traxonet.Models;
using Traxonet.Services;

namespace Traxonet.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public IActionResult Login()
        {
            if (TempData["Message"] != null)
            {
                ViewBag.Message = TempData["Message"];
                ViewBag.MessageType = TempData["MessageType"];
            }

            return View();
        }


        [HttpPost]
        public async Task<IActionResult> Register(string fullName, string email, string password, string confirmPassword)
        {
            if (string.IsNullOrWhiteSpace(fullName) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password) ||
                string.IsNullOrWhiteSpace(confirmPassword))
            {
                ViewBag.Message = "Please fill in all fields.";
                ViewBag.MessageType = "error";
                return View("Login");
            }

            if (password != confirmPassword)
            {
                ViewBag.Message = "Passwords do not match.";
                ViewBag.MessageType = "error";
                return View("Login");
            }


            var existingUser = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (existingUser != null)
            {
                ViewBag.Message = "Email already exists.";
                ViewBag.MessageType = "error";
                return View("Login");
            }

            PasswordHasher.CreatePasswordHash(password, out var hash, out var salt);

            var user = new User
            {
                FullName = fullName,
                Email = email,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            TempData["Message"] = "Registration successful! Please login.";
            TempData["MessageType"] = "success";

            return RedirectToAction("Login");
        }


        [HttpPost]
        public async Task<IActionResult> Login(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                ViewBag.Message = "Please enter email and password.";
                ViewBag.MessageType = "error";
                return View();
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                ViewBag.Message = "Email or password is incorrect.";
                ViewBag.MessageType = "error";
                return View();
            }

            bool passwordValid = PasswordHasher.VerifyPassword(password, user.PasswordHash, user.PasswordSalt);
            if (!passwordValid)
            {
                ViewBag.Message = "Email or password is incorrect.";
                ViewBag.MessageType = "error";
                return View();
            }


            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var identity = new ClaimsIdentity(claims, "Cookies");
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync("Cookies", principal);

            return RedirectToAction("Index", "Dashboard");
        }


        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("Cookies");
            return RedirectToAction("Login");
        }
    }
}
