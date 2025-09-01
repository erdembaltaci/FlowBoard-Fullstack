// Yer: JiraProject.Business/ValidationRules/IssueUpdateDtoValidator.cs
using FluentValidation;
using JiraProject.Business.Dtos;

namespace JiraProject.Business.ValidationRules
{
    public class IssueUpdateDtoValidator : AbstractValidator<IssueUpdateDto>
    {
        public IssueUpdateDtoValidator()
        {
            RuleFor(i => i.Title).NotEmpty().WithMessage("Görev başlığı boş olamaz.");
        }
    }
}