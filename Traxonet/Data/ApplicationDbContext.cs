using Microsoft.EntityFrameworkCore;
using Traxonet.Models;

namespace Traxonet.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IConfiguration _config;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IConfiguration config)
            : base(options)
        {
            _config = config;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Computer> Computers { get; set; }
        public DbSet<AuthorizedEmail> AuthorizedEmails { get; set; }
        public DbSet<Drive> Drives { get; set; }
        public DbSet<Threshold> Thresholds { get; set; }
        public DbSet<AlertEmail> AlertEmails { get; set; }
        public DbSet<ComputerPermission> ComputerPermissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            var converter = new EncryptionConverter(_config);

            modelBuilder.Entity<Computer>()
                .Property(c => c.MachineName)
                .HasConversion(converter);

            modelBuilder.Entity<Computer>()
                .Property(c => c.Cpu)
                .HasConversion(converter);

            modelBuilder.Entity<Computer>()
                .Property(c => c.Gpu)
                .HasConversion(converter);

            modelBuilder.Entity<Computer>()
                .Property(c => c.IpAddress)
                .HasConversion(converter);

            modelBuilder.Entity<Computer>()
                .Property(c => c.MacAddress)
                .HasConversion(converter);
                
            modelBuilder.Entity<Computer>()
                .Property(c => c.Motherboard)
                .HasConversion(converter);

            modelBuilder.Entity<Computer>()
                .Property(c => c.GpuDriver)
                .HasConversion(converter);
        }
    }
}
