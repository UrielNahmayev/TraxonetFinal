using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traxonet.Models
{
    [Table("drives")]
    public class Drive
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Column("client_id")]
        public string ClientId { get; set; }
        
        [Column("drive_name")]
        public string DriveName { get; set; }
        
        [Column("total_size")]
        public long TotalSize { get; set; }
        
        [Column("free_space")]
        public long FreeSpace { get; set; }
    }
}
