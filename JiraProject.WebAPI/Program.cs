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

// Render kendi portunu verir
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://*:{port}");

// --- Routing ---
builder.Services.AddRouting(o => o.LowercaseUrls = true);

// --- CORS ---
builder.Services.AddCors(options =>
{
    // Lokal geliştirme: her şeye izin
    options.AddPolicy("DevCors", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());

    // Prod: Netlify ana domain + TÜM preview subdomain'ler
    options.AddPolicy("FrontendCors", policy =>
        policy
            .SetIsOriginAllowed(origin =>
            {
                // *.netlify.app ve flowboardd.netlify.app
                try
                {
                    var host = new Uri(origin).Host.ToLower();
                    return host == "flowboardd.netlify.app" || host.EndsWith("netlify.app");
                }
                catch { return false; }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            // Bearer token kullanıldığı için genelde cookie yok; gerekirse aç:
            // .AllowCredentials()
            );
});

// --- Database ---
builder.Services.AddDbContext<JiraProjectDbContext>(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        // Local: SQL Server
        var sqlConn = builder.Configuration.GetConnectionString("DefaultConnection");
        options.UseSqlServer(sqlConn);
    }
    else
    {
        // Render: PostgreSQL
        var pgConn = builder.Configuration.GetConnectionString("PostgresConnection");
        options.UseNpgsql(pgConn);
    }
});

// --- AutoMapper ---
var mapperConfig = new MapperConfiguration(cfg => cfg.AddProfile(new MappingProfile()));
builder.Services.AddSingleton(mapperConfig.CreateMapper());

// --- DI ---
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IIssueService, IssueManager>();
builder.Services.AddScoped<IProjectService, ProjectManager>();
builder.Services.AddScoped<IUserService, UserManager>();
builder.Services.AddScoped<ITeamService, TeamManager>();
builder.Services.AddSingleton<FileStorageService>();

// --- Controllers + Validation ---
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    })
    .AddFluentValidation(cfg =>
    {
        cfg.RegisterValidatorsFromAssemblyContaining<UserCreateDtoValidator>();
    });

// --- Auth ---
builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
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
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme{ Reference = new OpenApiReference{ Type = ReferenceType.SecurityScheme, Id = "Bearer"} },
            Array.Empty<string>()
        }
    });
});

// --- SMTP ---
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

// --- Swagger (dev) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Static files ---
app.UseStaticFiles();

app.UseRouting();

// --- CORS: routing'den SONRA, auth'tan ÖNCE ---
// Önce CORS çalışsın ki hata durumlarında bile header eklensin
if (app.Environment.IsDevelopment())
    app.UseCors("DevCors");
else
    app.UseCors("FrontendCors");

// --- Hata middleware'i (CORS'tan sonra!) ---
app.UseMiddleware<ErrorHandlingMiddleware>();

// Render TLS terminasyonu yapıyor; prod’da HTTPS redirect kapalı
if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check
app.MapGet("/", () => "FlowBoard API is running 🚀");

app.Run();
