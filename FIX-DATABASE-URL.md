# Fixing Invalid DATABASE_URL Error

## Common Issues and Solutions

### Issue 1: Special Characters in Password

If your database password contains special characters like `@`, `#`, `%`, `&`, etc., they need to be **URL-encoded**.

**Special Character Encoding:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `?` → `%3F`
- `=` → `%3D`
- `/` → `%2F`
- `:` → `%3A`
- ` ` (space) → `%20` or `+`

**Example:**
```
❌ Wrong: postgresql://user:pass@word@host/db
✅ Correct: postgresql://user:pass%40word@host/db
```

### Issue 2: Spaces in URL

Remove any spaces before or after the URL in your `.env` file.

**Example:**
```
❌ Wrong: DATABASE_URL= postgresql://user:pass@host/db
❌ Wrong: DATABASE_URL=postgresql://user:pass@host/db 
✅ Correct: DATABASE_URL=postgresql://user:pass@host/db
```

### Issue 3: Missing Protocol

The URL must start with `postgresql://` or `postgres://`

**Example:**
```
❌ Wrong: user:password@host:5432/database
✅ Correct: postgresql://user:password@host:5432/database
```

### Issue 4: Quotes Around URL

Don't use quotes in the `.env` file (unless the value itself needs quotes).

**Example:**
```
❌ Wrong: DATABASE_URL="postgresql://user:pass@host/db"
✅ Correct: DATABASE_URL=postgresql://user:pass@host/db
```

## Correct Format Examples

### Neon Database
```
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb
```

### Local PostgreSQL
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/skillsphere
```

### With Special Characters in Password
If your password is `my@pass#123`:
```
DATABASE_URL=postgresql://postgres:my%40pass%23123@localhost:5432/skillsphere
```

## Quick Fix Steps

1. **Open your `.env` file** at: `D:\SkillSphereAITutor\SkillSphereAITutor\.env`

2. **Check your DATABASE_URL line** - it should look like:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. **Common fixes:**
   - Remove any spaces
   - Remove quotes if present
   - URL-encode special characters in password
   - Make sure it starts with `postgresql://`

4. **Test the URL format:**
   You can test if your URL is valid by running this in PowerShell:
   ```powershell
   $url = "your_database_url_here"
   try { [System.Uri]::new($url); Write-Host "Valid URL" } catch { Write-Host "Invalid URL: $_" }
   ```

## Getting a Fresh Database URL

If you're still having issues, get a new database URL:

### Option 1: Neon (Recommended)
1. Go to https://neon.tech
2. Sign in to your account
3. Go to your project
4. Click "Connection Details"
5. Copy the connection string
6. Paste it directly into your `.env` file (no modifications needed)

### Option 2: Create New Database
If using local PostgreSQL:
```sql
CREATE DATABASE skillsphere;
```
Then use:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/skillsphere
```

## Still Having Issues?

Run the server again and check the detailed error message. It will now show:
- What part of the URL is invalid
- Your URL (first 50 characters)
- Correct format examples

