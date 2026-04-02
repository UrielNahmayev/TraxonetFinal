using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traxonet.Models
{
    [Table("thresholds")]
    public class Threshold
    {
        [Key]
        [Column("client_id")]
        public string ClientId { get; set; }

        [Column("max_cpu_temp")]
        public float? MaxCpuTemp { get; set; }

        [Column("max_cpu_usage")]
        public float? MaxCpuUsage { get; set; }

        [Column("max_ram_usage")]
        public float? MaxRamUsage { get; set; }

        [Column("min_free_space")]
        public long? MinFreeSpace { get; set; }

        [Column("send_interval_seconds")]
        public int SendIntervalSeconds { get; set; } = 10;

        [Column("server_address")]
        public string ServerAddress { get; set; } = "127.0.0.1";
    }
}
