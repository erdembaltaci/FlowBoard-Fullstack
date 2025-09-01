using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JiraProject.Entities
{
    // Bu sınıf, Users ve Teams tabloları arasındaki bağlantıyı kuran ara tablodur.
    public class UserTeam : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int TeamId { get; set; }
        public Team Team { get; set; } = null!;
    }

}