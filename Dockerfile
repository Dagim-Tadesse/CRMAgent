# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project files
COPY CRMAgent.sln ./
COPY src/CRMAgent.Domain/CRMAgent.Domain.csproj src/CRMAgent.Domain/
COPY src/CRMAgent.Application/CRMAgent.Application.csproj src/CRMAgent.Application/
COPY src/CRMAgent.Infrastructure/CRMAgent.Infrastructure.csproj src/CRMAgent.Infrastructure/
COPY src/CRMAgent.API/CRMAgent.API.csproj src/CRMAgent.API/

# Restore dependencies
RUN dotnet restore

# Copy all source files
COPY src/ src/

# Build and publish
RUN dotnet publish src/CRMAgent.API/CRMAgent.API.csproj -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Disable file watchers to prevent inotify limit exhaustion on Render
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV DOTNET_hostBuilder:reloadConfigOnChange=false
ENV ASPNETCORE_HTTP_PORTS=5087
ENV ASPNETCORE_URLS=http://+:5087
EXPOSE 5087

# Entrypoint
ENTRYPOINT ["dotnet", "CRMAgent.API.dll"]
