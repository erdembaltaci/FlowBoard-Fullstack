using AutoMapper;
using FluentValidation.AspNetCore;
using JiraProject.Business.Abstract;
using JiraProject.Business.Concrete;
using JiraProject.Business.Dtos;
using JiraProject.Business.Mappings;
using JiraProject.Business.ValidationRules; // FluentValidation için
using JiraProject.DataAccess.Concrete;
using JiraProject.DataAccess.Contexts;
using JiraProject.WebAPI.Middleware; // ErrorHandlingMiddleware için
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
    options.AddPolicy("AllowNetlify", policy =>
    {
        policy.WithOrigins("https://flowboardd.netlify.app") // Netlify domainin tam hali
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- Database ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<JiraProjectDbContext>(options =>
{
    var env = builder.Environment.EnvironmentName; // Development, Production
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    if (env == "Development")
    {
        // Lokalde SQL Server
        options.UseSqlServer(connectionString);
    }
    else
    {
        // Render’da PostgreSQL
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

// --- HTTP Request Pipeline ---
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Statik dosyalar
app.UseStaticFiles();

app.UseRouting();

// CORS (Routing’den sonra, Auth’tan önce)
if (app.Environment.IsDevelopment())
{
    app.UseCors(policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
}
else
{
    app.UseCors("AllowNetlify");
}

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Controller endpointleri
app.MapControllers();

// Basit test endpointi
app.MapGet("/", () => "FlowBoard API is running 🚀");

// Run
app.Run();
