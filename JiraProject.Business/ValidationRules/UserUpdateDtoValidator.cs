// Yer: JiraProject.Business/ValidationRules/UserUpdateDtoValidator.cs
using FluentValidation;
using JiraProject.Business.Dtos;

namespace JiraProject.Business.ValidationRules
{
    public class UserUpdateDtoValidator : AbstractValidator<UserUpdateDto>
    {
        public UserUpdateDtoValidator()
        {
            RuleFor(u => u.Username).NotEmpty().MinimumLength(3);
            RuleFor(u => u.Email)
                .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
                .EmailAddress().WithMessage("Lütfen geçerli bir e-posta adresi girin.");
        }
    }
}