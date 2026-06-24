using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traxonet.Models
{
    [Table("computers")]
    public class Computer
    {
        [Key]
        [Column("client_id")]
        public string ClientId { get; set; }
        
        [Column("machine_name")]
        public string MachineName { get; set; }
        
        [Column("motherboard")]
        public string Motherboard { get; set; }
        
        [Column("cpu")]
        public string Cpu { get; set; }
        
        [Column("gpu")]
        public string Gpu { get; set; }
        
        [Column("cpu_cores")]
        public int CpuCores { get; set; }
        
        [Column("logical_processors")]
        public int LogicalProcessors { get; set; }
        
        [Column("cpu_temp")]
        public float CpuTemp { get; set; }
        
        [Column("cpu_usage")]
        public float CpuUsage { get; set; }
        
        [Column("gpu_driver")]
        public string GpuDriver { get; set; }
        
        [Column("total_ram")]
        public long TotalRam { get; set; }
        
        [Column("free_ram")]
        public long FreeRam { get; set; }
        
        [Column("ram_usage")]
        public float RamUsage { get; set; }
        
        [Column("ip_address")]
        public string IpAddress { get; set; }
        
        [Column("mac_address")]
        public string MacAddress { get; set; }
        
        [Column("time_sent")]
        public DateTime TimeSent { get; set; }

        [Column("owner_user_id")]
        public int? OwnerUserId { get; set; }

        [Column("unlock_requested")]
        public bool UnlockRequested { get; set; }
    }
}
