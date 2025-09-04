# ---------- Build Stage ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyasını kopyala ve restore et
COPY ["JiraProject.WebAPI/JiraProject.WebAPI.csproj", "JiraProject.WebAPI/"]
RUN dotnet restore "JiraProject.WebAPI/JiraProject.WebAPI.csproj"

# Tüm solution'ı kopyala ve publish et
COPY . .
WORKDIR "/src/JiraProject.WebAPI"
RUN dotnet publish "JiraProject.WebAPI.csproj" -c Release -o /app/publish

# ---------- Runtime Stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render 8080 portunu kullanır
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "JiraProject.WebAPI.dll"]
