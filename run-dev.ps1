# Development Server Startup Script
# This script sets up environment variables and starts the development server

# Set your database URL here (get from Neon.tech or use local PostgreSQL)
# Example: $env:DATABASE_URL = "postgresql://user:password@host:port/database"
if (-not $env:DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL environment variable is not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set DATABASE_URL before running:" -ForegroundColor Yellow
    Write-Host "  Option 1: Create a .env file in the project root with:" -ForegroundColor Yellow
    Write-Host "    DATABASE_URL=postgresql://user:password@host:port/database" -ForegroundColor Cyan
    Write-Host "    OPENAI_API_KEY=your_api_key_here" -ForegroundColor Cyan
    Write-Host "    PORT=5000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Option 2: Set environment variables in PowerShell:" -ForegroundColor Yellow
    Write-Host "    `$env:DATABASE_URL = 'your_database_url'" -ForegroundColor Cyan
    Write-Host "    `$env:OPENAI_API_KEY = 'your_api_key'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Option 3: Use this script - edit it and add your values above" -ForegroundColor Yellow
    exit 1
}

# Set OpenAI API Key (optional if you want to test without AI features)
# Uncomment and set your key:
# $env:OPENAI_API_KEY = "your_openai_api_key_here"

# Set port (optional, defaults to 5000)
if (-not $env:PORT) {
    $env:PORT = "5000"
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "DATABASE_URL: $($env:DATABASE_URL.Substring(0, [Math]::Min(30, $env:DATABASE_URL.Length)))..." -ForegroundColor Gray
Write-Host "PORT: $env:PORT" -ForegroundColor Gray
Write-Host ""

npm run dev

