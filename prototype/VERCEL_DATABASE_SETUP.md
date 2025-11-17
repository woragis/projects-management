# Vercel DATABASE_URL Setup - IMPORTANT

## The Error You're Seeing

If you see `ENOTFOUND base` or `getaddrinfo ENOTFOUND base`, it means:
- The DATABASE_URL in Vercel is **MALFORMED** or **EMPTY**
- Vercel is trying to connect to a hostname called "base" which doesn't exist

## How to Fix It

### Step 1: Check Your Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find the `DATABASE_URL` variable
3. **Check the value** - it should be EXACTLY:

```
postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway
```

### Step 2: Common Mistakes to Avoid

❌ **DON'T** include quotes:
```
"postgresql://postgres:..."
```

❌ **DON'T** include `DATABASE_URL=` prefix:
```
DATABASE_URL=postgresql://postgres:...
```

❌ **DON'T** have extra spaces or newlines

✅ **DO** use the exact connection string:
```
postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway
```

### Step 3: Verify Railway Connection Details

1. Go to **Railway** → Your PostgreSQL Service
2. Click **Connect** tab
3. Check the **TCP Proxy** section
4. Verify:
   - Domain: `hopper.proxy.rlwy.net` (or current domain)
   - Port: `35878` (or current port)
   - Database: `railway`
   - User: `postgres`
   - Password: (your password)

### Step 4: Update Vercel Environment Variable

1. **Delete** the old `DATABASE_URL` variable
2. **Add** a new one with the correct value
3. Make sure to set it for **Production**, **Preview**, and **Development**
4. **Redeploy** your application

### Step 5: Check the Logs

After redeploying, check Vercel logs. You should see:
```
🔍 DATABASE_URL detected (password hidden): postgresql://postgres:****@hopper.proxy.rlwy.net:35878/railway
🔍 Parsed connection details:
  Protocol: postgresql:
  Hostname: hopper.proxy.rlwy.net
  Port: 35878
  Database: railway
  User: postgres
```

If you see `Hostname: base` or empty hostname, the DATABASE_URL is still wrong.

## Quick Test

You can test the connection string locally by creating a `.env` file:

```env
DATABASE_URL=postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway
```

Then run:
```bash
npm run dev
```

Check the console logs to see if the connection works.

## Still Having Issues?

If the hostname is still showing as "base", check:
1. Is the DATABASE_URL variable actually set in Vercel?
2. Did you save it correctly (no extra characters)?
3. Did you redeploy after setting it?
4. Check Vercel logs for the actual DATABASE_URL value (password will be hidden)

