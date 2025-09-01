using FluentValidation;
using JiraProject.Business.Dtos;

namespace JiraProject.Business.ValidationRules
{
    public class ProjectCreateDtoValidator : AbstractValidator<ProjectCreateDto> // 
    {
        public ProjectCreateDtoValidator()
        {
            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("Proje adı boş olamaz.")
                .MinimumLength(3).WithMessage("Proje adı en az 3 karakter olmalıdır.");
        }
    }
}