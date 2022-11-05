using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Models.Requests.User
{
    public class TokenCheckRequest
    {
        [Required]
        [StringLength(200,MinimumLength =36)]
        public string Token { get; set; }
    }
}
