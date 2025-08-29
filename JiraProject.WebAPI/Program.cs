using AutoMapper;
using FluentValidation.AspNetCore;
using JiraProject.Business.Abstract;
using JiraProject.Business.Concrete;
using JiraProject.Business.Dtos;
using JiraProject.Business.Mappings;
using JiraProject.Business.ValidationRules;
using JiraProject.DataAccess.Concrete;
using JiraProject.DataAccess.Contexts;
using JiraProject.WebAPI.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://*:{port}");

// --- Routing lowercase ---
builder.Services.AddRouting(options => options.LowercaseUrls = true);

// --- CORS ---
builder.Services.AddCors(options =>
{
    // Lokal geliştirme için (AllowAll)
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

    // Netlify için production policy
    options.AddPolicy("AllowNetlify", policy =>
    {
        policy.WithOrigins("https://flowboardd.netlify.app") // kendi netlify domainin
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// --- Database ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<JiraProjectDbContext>(options =>
{
    var env = builder.Environment.EnvironmentName;

    if (env == "Development")
    {
        options.UseSqlServer(connectionString);
    }
    else
    {
        var pgConnection = builder.Configuration.GetConnectionString("PostgresConnection");
        options.UseNpgsql(pgConnection);
    }
});

// --- AutoMapper ---
var mapperConfig = new MapperConfiguration(cfg =>
{
    cfg.AddProfile(new MappingProfile());
});
IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);

// --- Dependency Injection ---
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IIssueService, IssueManager>();
builder.Services.AddScoped<IProjectService, ProjectManager>();
builder.Services.AddScoped<IUserService, UserManager>();
builder.Services.AddScoped<ITeamService, TeamManager>();
builder.Services.AddSingleton<FileStorageService>();

// --- Controllers + Validation ---
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
}).AddFluentValidation(config =>
{
    config.RegisterValidatorsFromAssemblyContaining<UserCreateDtoValidator>();
});

// --- Authentication & Authorization ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };
});
builder.Services.AddAuthorization();

// --- Swagger ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FlowBoard API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { /* ... */ });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { /* ... */ });
});

// --- SMTP & Email ---
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

// --- Build ---
var app = builder.Build();

// --- Middleware pipeline ---
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// --- CORS (routing’den sonra, auth’tan önce) ---
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("AllowNetlify");
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => "FlowBoard API is running 🚀");

app.Run();
