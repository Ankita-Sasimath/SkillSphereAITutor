# Setup Instructions

## Required Environment Variables

To run the development server, you need to set the following environment variables:

### 1. DATABASE_URL (Required)
The PostgreSQL database connection string. You can get one from:
- **Neon.tech** (recommended for serverless): https://neon.tech
- **Local PostgreSQL**: `postgresql://user:password@localhost:5432/database_name`

### 2. OPENAI_API_KEY (Required for AI features)
Get your API key from: https://platform.openai.com/api-keys

### 3. PORT (Optional)
Defaults to `5000` if not set.

## Quick Start Options

### Option 1: Create a `.env` file (Recommended)

Create a `.env` file in the project root (`SkillSphereAITutor/.env`) with:

```env
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

Then install a package to load .env files:
```bash
npm install --save-dev dotenv
```

And update `server/index.ts` to load the .env file at the top:
```typescript
import 'dotenv/config';
```

### Option 2: Use PowerShell Script

1. Edit `run-dev.ps1` and add your `DATABASE_URL` and `OPENAI_API_KEY`
2. Run: `.\run-dev.ps1`

### Option 3: Set Environment Variables in PowerShell

```powershell
$env:DATABASE_URL = "postgresql://user:password@host:port/database"
$env:OPENAI_API_KEY = "your_api_key_here"
$env:PORT = "5000"
npm run dev
```

### Option 4: Set Environment Variables in Command Prompt (CMD)

```cmd
set DATABASE_URL=postgresql://user:password@host:port/database
set OPENAI_API_KEY=your_api_key_here
set PORT=5000
npm run dev
```

## Getting a Database URL

### Using Neon (Free Tier Available)
1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project
4. Copy the connection string from the dashboard
5. It will look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname`

### Using Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database: `createdb skillsphere`
3. Use connection string: `postgresql://postgres:password@localhost:5432/skillsphere`

## Running the Server

Once environment variables are set:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or your specified PORT).

