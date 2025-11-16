# Terminal Commands to Run the Project

## Method 1: Using .env File (Easiest - Recommended)

### Step 1: Create .env file
Open your terminal in the project folder and run:

**PowerShell:**
```powershell
cd D:\SkillSphereAITutor\SkillSphereAITutor
New-Item -Path .env -ItemType File -Force
```

**Or manually create a file named `.env` in the `SkillSphereAITutor` folder**

### Step 2: Add content to .env file
Open the `.env` file and add (replace with your actual values):

```env
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

### Step 3: Run the server
```powershell
cd D:\SkillSphereAITutor\SkillSphereAITutor
npm run dev
```

---

## Method 2: Set Environment Variables in Terminal (PowerShell)

```powershell
# Navigate to project folder
cd D:\SkillSphereAITutor\SkillSphereAITutor

# Set environment variables (REPLACE WITH YOUR VALUES)
$env:DATABASE_URL = "postgresql://user:password@host:port/database"
$env:OPENAI_API_KEY = "your_openai_api_key_here"
$env:PORT = "5000"

# Run the server
npm run dev
```

---

## Method 3: Set Environment Variables in Terminal (CMD)

```cmd
REM Navigate to project folder
cd D:\SkillSphereAITutor\SkillSphereAITutor

REM Set environment variables (REPLACE WITH YOUR VALUES)
set DATABASE_URL=postgresql://user:password@host:port/database
set OPENAI_API_KEY=your_openai_api_key_here
set PORT=5000

REM Run the server
npm run dev
```

---

## Getting Your Database URL

### Option A: Use Neon (Free - Recommended)
1. Go to https://neon.tech
2. Sign up (free account)
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname`)

### Option B: Use Local PostgreSQL
If you have PostgreSQL installed locally:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/skillsphere
```

---

## Complete Example (PowerShell)

```powershell
# 1. Navigate to project
cd D:\SkillSphereAITutor\SkillSphereAITutor

# 2. Set your database URL (example from Neon)
$env:DATABASE_URL = "postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb"

# 3. Set your OpenAI API key (get from https://platform.openai.com/api-keys)
$env:OPENAI_API_KEY = "sk-proj-xxxxxxxxxxxxxxxxxxxxx"

# 4. Set port (optional, defaults to 5000)
$env:PORT = "5000"

# 5. Run the development server
npm run dev
```

---

## Troubleshooting

### Error: "DATABASE_URL must be set"
- Make sure you've set the `DATABASE_URL` environment variable
- If using .env file, make sure it's in the `SkillSphereAITutor` folder (same level as `package.json`)

### Error: "Missing credentials" for OpenAI
- Set the `OPENAI_API_KEY` environment variable
- Get your key from: https://platform.openai.com/api-keys

### Error: "Cannot find module"
- Run: `npm install` to install dependencies

### Port already in use
- Change the PORT: `$env:PORT = "3000"` (or any other available port)

