using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Traxonet.Controllers
{
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _env;

        public HomeController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [Authorize]
        public IActionResult Index()
        {
            return View();
        }

        // The public landing page, shown BEFORE login and also reachable from the dashboard "Home" button.
        [AllowAnonymous]
        public IActionResult Welcome()
        {
            return View();
        }

        // "Open Dashboard" button — enters the monitoring system (requires login).
        [Authorize]
        public IActionResult GoToDashboard()
        {
            return RedirectToAction("Index", "Dashboard");
        }

        // "Download Client" button — serves the Traxonet Client installer (setup.exe).
        [AllowAnonymous]
        public IActionResult DownloadClient()
        {
            var filePath = Path.Combine(_env.WebRootPath, "downloads", "TraxonetClientSetup.exe");

            if (!System.IO.File.Exists(filePath))
            {
                TempData["Message"] = "The client application is not available for download yet.";
                return RedirectToAction("Welcome");
            }

            return PhysicalFile(filePath, "application/octet-stream", "TraxonetClientSetup.exe");
        }
    }
}
