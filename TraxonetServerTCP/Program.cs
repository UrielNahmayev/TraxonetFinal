using TraxonetServer_TCP.Hubs;
using TraxonetServer_TCP.Services;

namespace TraxonetServer_TCP
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services
            builder.Services.AddControllersWithViews();
            builder.Services.AddSignalR();

            // Register our services
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? "server=localhost;user=root;password=Uriel@2007;database=traxonet_db;";

            var logService = new LogService();
            var database = new Database(connectionString, logService, builder.Configuration);

            builder.Services.AddSingleton(logService);
            builder.Services.AddSingleton(database);
            builder.Services.AddHostedService<TcpServerService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthorization();

            // Map SignalR hub
            app.MapHub<LogHub>("/logHub");

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}
