using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Traxonet.Models
{
    [Table("alert_emails")]
    [PrimaryKey(nameof(ClientId), nameof(Email))]
    public class AlertEmail
    {
        [Column("client_id")]
        public string ClientId { get; set; }

        [Column("email")]
        public string Email { get; set; }
    }
}
