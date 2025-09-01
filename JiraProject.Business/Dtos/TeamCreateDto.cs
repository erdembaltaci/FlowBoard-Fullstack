using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JiraProject.Business.Dtos
{
    public class TeamCreateDto
    {
        public string Name { get; set; } = null!;
        public int TeamLeadId { get; set; } // Bu takımı yönetecek kullanıcının ID'si
    }
}
