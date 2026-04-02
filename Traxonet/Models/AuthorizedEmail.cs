using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Traxonet.Models
{
    [Table("emails")]
    [PrimaryKey(nameof(ClientId), nameof(Email))]
    public class AuthorizedEmail
    {
        [Column("client_id")]
        public string ClientId { get; set; }
        
        [Column("email")]
        public string Email { get; set; }
    }
}

