using FluentValidation;
using JiraProject.Business.Dtos;

namespace JiraProject.Business.ValidationRules
{
    public class IssueCreateDtoValidator : AbstractValidator<IssueCreateDto>
    {
        public IssueCreateDtoValidator()
        {
            RuleFor(i => i.Title).NotEmpty().WithMessage("Görev başlığı boş olamaz.");
            RuleFor(i => i.ProjectId).GreaterThan(0).WithMessage("Geçerli bir proje ID'si girilmelidir.");
        }
    }
}