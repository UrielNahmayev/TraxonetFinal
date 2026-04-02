using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Traxonet.Models
{
    [Table("computer_permissions")]
    [Index(nameof(ClientId), nameof(UserId), IsUnique = true)]
    public class ComputerPermission
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("client_id")]
        public string ClientId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("granted_by_user_id")]
        public int GrantedByUserId { get; set; }

        [Column("granted_at")]
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    }
}
