# Railway PostgreSQL Setup for Vercel

## ✅ Connection Tested and Working!

The Railway PostgreSQL connection has been tested and is working correctly.

## DATABASE_URL for Vercel

Use this exact connection string in your Vercel environment variables:

```
postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway
```

### Steps to Configure in Vercel:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add the following:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway`
   - **Environment**: Select **Production**, **Preview**, and **Development** (or all)
4. Click **Save**

## Important Notes:

- ✅ **SSL is automatically configured** - The code detects Railway connections and enables SSL
- ✅ **Schema has been pushed** - All tables are created in the Railway database
- ✅ **Connection tested** - The connection string works correctly

## Railway Connection Details:

- **TCP Proxy Domain**: `hopper.proxy.rlwy.net`
- **TCP Proxy Port**: `35878`
- **Database**: `railway`
- **User**: `postgres`
- **Password**: `fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm`

## How It Works:

The database connection code (`src/lib/server/db/index.ts`) automatically:
1. Detects Railway connections (checks for `railway.app` in the URL)
2. Enables SSL with `rejectUnauthorized: false` (Railway uses self-signed certificates)
3. Uses the connection pool for optimal performance

## Testing Locally:

To test the Railway connection locally, you can:

1. Set the `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL=postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway
   ```

2. Run the test script:
   ```bash
   node test-railway-connection.js
   ```

3. Or test with your app:
   ```bash
   npm run dev
   ```

## Troubleshooting:

If you encounter connection issues:

1. **Check the TCP Proxy Port**: Railway's TCP proxy port can change. Check your Railway dashboard for the current port.
2. **Verify SSL**: Railway requires SSL connections (already configured in the code).
3. **Check Firewall**: Make sure your network allows outbound connections to Railway.
