# Database Setup Guide

This project uses **PostgreSQL** with Drizzle ORM.

## Local Development

For local development, you can use:

1. **Local PostgreSQL** - Install PostgreSQL locally
2. **Docker** - Run PostgreSQL in a container
3. **Railway** - Use a free Railway PostgreSQL instance for development

### Setting up local PostgreSQL

1. **Install PostgreSQL** on your machine:
   - macOS: `brew install postgresql@15` or download from [postgresql.org](https://www.postgresql.org/download/)
   - Windows: Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Linux: `sudo apt install postgresql postgresql-contrib` (Ubuntu/Debian)

2. **Create a database**:
   ```bash
   createdb unipe_dev
   ```

3. **Set DATABASE_URL** in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/unipe_dev
   ```

4. **Push your schema**:
   ```bash
   npm run db:push
   ```

### Using Docker (Alternative)

1. **Run PostgreSQL container**:
   ```bash
   docker run --name unipe-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=unipe_dev -p 5432:5432 -d postgres:15
   ```

2. **Set DATABASE_URL**:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/unipe_dev
   ```

3. **Push schema**:
   ```bash
   npm run db:push
   ```

## Production (Vercel/Railway)

### Railway Setup (Recommended)

1. **Sign up at [Railway](https://railway.app)**

2. **Create a new project** → Add PostgreSQL database

3. **Get your connection string**:
   - Click on your PostgreSQL service
   - Go to the "Connect" tab
   - Copy the `DATABASE_URL` (PostgreSQL connection string)
   - Format: `postgresql://postgres:PASSWORD@HOST:PORT/railway`

4. **Set environment variable in Vercel**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `DATABASE_URL` with your Railway PostgreSQL connection string
   - Make sure to set it for **Production**, **Preview**, and **Development** environments

5. **Push schema to Railway**:
   ```bash
   # Set environment variable locally
   export DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"
   
   # Or add to .env file
   # DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
   
   # Push schema
   npm run db:push
   ```

6. **Redeploy your Vercel project**

### Other PostgreSQL Providers

You can also use:
- **Vercel Postgres** - Native integration with Vercel
- **Neon** - Serverless PostgreSQL
- **Supabase** - Open source Firebase alternative with PostgreSQL
- **PlanetScale** - MySQL (would require schema changes)

## Database Connection

The project uses `pg` (node-postgres) with `drizzle-orm/node-postgres`.

The connection is configured in `src/lib/server/db/index.ts` and automatically reads from the `DATABASE_URL` environment variable.

## Available Scripts

- `npm run db:push` - Push schema changes to database (creates/updates tables)
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Schema Changes

After modifying schema files in `src/lib/server/db/schemas/`:

1. **Push changes directly** (for development):
   ```bash
   npm run db:push
   ```

2. **Or generate migrations** (for production):
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
