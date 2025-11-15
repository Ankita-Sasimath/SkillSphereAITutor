# Environment Setup Script
# This script helps you set up your .env file

Write-Host "=== SkillSphere AI Tutor - Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Setting up your .env file..." -ForegroundColor Green
Write-Host ""

# Get DATABASE_URL
Write-Host "📊 DATABASE_URL is required for the application to work." -ForegroundColor Yellow
Write-Host ""
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "  1. Use Neon (Free PostgreSQL) - Recommended" -ForegroundColor White
Write-Host "     - Go to https://neon.tech and sign up" -ForegroundColor Gray
Write-Host "     - Create a new project" -ForegroundColor Gray
Write-Host "     - Copy the connection string" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Use local PostgreSQL" -ForegroundColor White
Write-Host "     - Format: postgresql://user:password@localhost:5432/database" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Skip for now (will show error but you can add later)" -ForegroundColor White
Write-Host ""

$dbUrl = Read-Host "Enter your DATABASE_URL (or press Enter to skip)"
if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    $dbUrl = "postgresql://user:password@localhost:5432/skillsphere"
    Write-Host "⚠️  Using placeholder. Please update .env file with your actual DATABASE_URL" -ForegroundColor Yellow
}

# Get GEMINI_API_KEY (or OPENAI_API_KEY for backward compatibility)
Write-Host ""
Write-Host "🤖 GEMINI_API_KEY is required for AI features (using Google Gemini)." -ForegroundColor Yellow
Write-Host "   - Get your key from: https://aistudio.google.com/app/apikey" -ForegroundColor Gray
Write-Host "   - Or use OPENAI_API_KEY if you prefer OpenAI" -ForegroundColor Gray
Write-Host ""

$geminiKey = Read-Host "Enter your GEMINI_API_KEY (or press Enter to skip)"
if ([string]::IsNullOrWhiteSpace($geminiKey)) {
    $geminiKey = ""
    Write-Host "⚠️  No Gemini API key provided. You can add GEMINI_API_KEY to .env file later" -ForegroundColor Yellow
}

# Get PORT
Write-Host ""
$port = Read-Host "Enter PORT (default: 5000)"
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "5000"
}

# Create .env file
$envContent = @"
# Database Configuration
DATABASE_URL=$dbUrl

# Gemini API Key (for Google Gemini AI)
GEMINI_API_KEY=$geminiKey

# Server Port
PORT=$port
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 File location: $(Resolve-Path .env)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review and update the .env file if needed" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host ""

