using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JiraProject.Business.Dtos
{
    public class TeamDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public UserSummaryDto TeamLead { get; set; } = null!; // Sadece ID yerine liderin özet bilgisi
        public List<UserSummaryDto> Members { get; set; }
    }
}
