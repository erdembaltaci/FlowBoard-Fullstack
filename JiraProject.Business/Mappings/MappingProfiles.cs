using AutoMapper;
using JiraProject.Business.Dtos;
using JiraProject.Entities;
using System.Linq;

namespace JiraProject.Business.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // =========================================================================
            // OKUMA YÖNÜ: VERİTABANINDAN EKRANA (Entity -> DTO)
            // =========================================================================

            // --- TEMEL KULLANICI HARİTALAMALARI ---
            // Bu bölüm, tüm kullanıcı dönüşümlerinin temelini oluşturur.

            // 1. User -> UserDto (Kullanıcının tüm detayları için)
            // Not: Eğer UserDto'da Role gibi Enum'dan string'e dönüşüm varsa buraya eklenmeli.
            CreateMap<User, UserDto>()
                 .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
                 .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl));

            // 2. User -> UserSummaryDto (Özet bilgi için -> TeamLead, Member, Assignee vb.)
            // Bu kural, tüm belirsizlikleri ortadan kaldırmak için her alanı açıkça belirtir.
            CreateMap<User, UserSummaryDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.AvatarUrl));

            CreateMap<Issue, DashboardTaskDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.Name));
            // --- UYGULAMA VARLIKLARI HARİTALAMALARI ---

            // 3. Team -> TeamDto
            // Bu kural, TeamLead ve Members listesini doldurmak için yukarıdaki User->UserSummaryDto kuralını kullanır.
            CreateMap<Team, TeamDto>()
                .ForMember(dest => dest.TeamLead, opt => opt.MapFrom(src => src.TeamLead))
                .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.UserTeams.Select(ut => ut.User)));

            // 4. Project -> ProjectDto
            // Bu kural, Team bilgisini doldurmak için yukarıdaki Team->TeamDto kuralını zincirleme olarak kullanır.
            CreateMap<Project, ProjectDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<TeamUpdateDto, Team>();


            // 5. Issue -> IssueDto
            // Bu kural, Assignee ve Reporter bilgilerini doldurmak için User->UserSummaryDto kuralını kullanır.
            // Not: IssueDto içindeki Assignee ve Reporter property'lerinin tipinin UserSummaryDto olduğundan emin olun.
            CreateMap<Issue, IssueDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.Name))
                .ForMember(dest => dest.Assignee, opt => opt.MapFrom(src => src.Assignee))
                .ForMember(dest => dest.Reporter, opt => opt.MapFrom(src => src.Reporter));


            // =========================================================================
            // YAZMA YÖNÜ: EKRANDAN VERİTABANINA (DTO -> Entity)
            // =========================================================================
            CreateMap<IssueCreateDto, Issue>();
            CreateMap<IssueUpdateDto, Issue>();
            CreateMap<ProjectCreateDto, Project>();
            CreateMap<ProjectUpdateDto, Project>();
            CreateMap<TeamCreateDto, Team>();
            CreateMap<UserCreateDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
            CreateMap<UserUpdateDto, User>();
            

        }
    }
}
