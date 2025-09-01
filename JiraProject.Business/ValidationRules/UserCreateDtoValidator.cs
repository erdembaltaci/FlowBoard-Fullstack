// Yer: JiraProject.Business/ValidationRules/UserCreateDtoValidator.cs
using FluentValidation;
using JiraProject.Business.Dtos;
using System.Text.RegularExpressions;

namespace JiraProject.Business.ValidationRules
{
    public class UserCreateDtoValidator : AbstractValidator<UserCreateDto>
    {
        public UserCreateDtoValidator()
        {
            RuleFor(u => u.Username)
                .NotEmpty().WithMessage("Kullanıcı adı boş olamaz.")
                .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.");

            RuleFor(u => u.Email)
                .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
                // Bu Regex, daha katı bir e-posta formatını zorunlu kılar.
                .Matches(@"^[^0-9][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
                .WithMessage("Lütfen geçerli bir e-posta adresi girin. (Örn: example@domain.com)");

            RuleFor(u => u.Password)
                .NotEmpty().WithMessage("Şifre boş olamaz.")
                .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalıdır.")
                .Matches("[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir.")
                .Matches("[a-z]").WithMessage("Şifre en az bir küçük harf içermelidir.")
                .Matches("[0-9]").WithMessage("Şifre en az bir rakam içermelidir.");
        }
    }
}