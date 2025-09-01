// Yer: JiraProject.Business/ValidationRules/ProjectUpdateDtoValidator.cs
using FluentValidation;
using JiraProject.Business.Dtos;

namespace JiraProject.Business.ValidationRules
{
    public class ProjectUpdateDtoValidator : AbstractValidator<ProjectUpdateDto>
    {
        public ProjectUpdateDtoValidator()
        {
            // Update işlemi için de Create işlemindeki kuralların aynısını uyguluyoruz.
            // İleride kurallar farklılaşırsa, burayı değiştirebiliriz.
            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("Proje adı boş olamaz.")
                .MinimumLength(3).WithMessage("Proje adı en az 3 karakter olmalıdır.")
                .MaximumLength(100).WithMessage("Proje adı en fazla 100 karakter olabilir.");

            RuleFor(p => p.Description)
                .MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir.");
        }
    }
}