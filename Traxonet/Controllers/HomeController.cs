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

        [AllowAnonymous]
        public IActionResult Welcome()
        {
            return View();
        }

        [Authorize]
        public IActionResult GoToDashboard()
        {
            return RedirectToAction("Index", "Dashboard");
        }

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
