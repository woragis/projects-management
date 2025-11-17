import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';
import { env } from '$env/dynamic/private';

// Get DATABASE_URL or construct it from Railway variables
let dbUrl: string;

if (env.DATABASE_URL) {
	// Use explicit DATABASE_URL if provided
	// Remove any "DATABASE_URL=" prefix that might be present
	let url = String(env.DATABASE_URL).trim();
	if (url.startsWith('DATABASE_URL=')) {
		url = url.replace(/^DATABASE_URL=/, '');
	}
	
	// Log the connection string (without password) for debugging
	console.log('🔍 DATABASE_URL detected (password hidden):', url.replace(/:[^:@]+@/, ':****@'));
	
	// Validate it's a proper PostgreSQL URL
	if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
		console.error('❌ Invalid DATABASE_URL format. Must start with postgresql:// or postgres://');
		console.error('Current value (first 50 chars):', url.substring(0, 50));
		throw new Error('DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://');
	}
	
	dbUrl = url;
} else if (
	env.PGUSER &&
	env.POSTGRES_PASSWORD &&
	(env.RAILWAY_TCP_PROXY_DOMAIN || env.RAILWAY_PRIVATE_DOMAIN) &&
	(env.RAILWAY_TCP_PROXY_PORT || env.PGPORT)
) {
	// Construct from Railway individual variables
	const user = env.PGUSER;
	const password = env.POSTGRES_PASSWORD;
	// Prefer public proxy domain for external connections, fallback to private
	const host = env.RAILWAY_TCP_PROXY_DOMAIN || env.RAILWAY_PRIVATE_DOMAIN || env.PGHOST;
	const port = env.RAILWAY_TCP_PROXY_PORT || env.PGPORT || '5432';
	const database = env.PGDATABASE || env.POSTGRES_DB || 'railway';

	dbUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;
} else {
	throw new Error(
		'DATABASE_URL is not set and cannot be constructed from Railway variables. ' +
			'Please set DATABASE_URL or provide PGUSER, POSTGRES_PASSWORD, RAILWAY_TCP_PROXY_DOMAIN, and RAILWAY_TCP_PROXY_PORT.'
	);
}

// Parse connection string to ensure it's valid
let pool: Pool;
try {
	// Check if this is a Railway connection (requires SSL)
	const isRailway = dbUrl.includes('railway.app') || dbUrl.includes('railway.railway.app') || dbUrl.includes('rlwy.net');
	
	// Parse the connection string to validate it
	try {
		const urlObj = new URL(dbUrl);
		console.log('🔍 Parsed connection details:');
		console.log('  Protocol:', urlObj.protocol);
		console.log('  Hostname:', urlObj.hostname);
		console.log('  Port:', urlObj.port);
		console.log('  Database:', urlObj.pathname.replace('/', ''));
		console.log('  User:', urlObj.username);
		
		if (!urlObj.hostname || urlObj.hostname === 'base' || urlObj.hostname === '') {
			console.error('❌ Invalid hostname in DATABASE_URL:', urlObj.hostname);
			console.error('Full URL (password hidden):', dbUrl.replace(/:[^:@]+@/, ':****@'));
			throw new Error(`Invalid hostname in DATABASE_URL: "${urlObj.hostname}". Check your Vercel environment variables.`);
		}
	} catch (urlError: any) {
		console.error('❌ Failed to parse DATABASE_URL:', urlError.message);
		console.error('DATABASE_URL value (first 100 chars):', dbUrl.substring(0, 100));
		throw new Error(`Invalid DATABASE_URL format: ${urlError.message}`);
	}
	
	pool = new Pool({
		connectionString: dbUrl,
		max: 10, // Maximum number of clients in the pool
		idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
		connectionTimeoutMillis: 20000, // Return an error after 20 seconds if connection cannot be established
		// Railway requires SSL connections
		...(isRailway && {
			ssl: {
				rejectUnauthorized: false // Railway uses self-signed certificates
			}
		}),
		// Better error handling for serverless environments
		allowExitOnIdle: true
	});
} catch (error) {
	throw new Error(`Failed to create database connection pool: ${error instanceof Error ? error.message : String(error)}`);
}

// Handle connection errors
pool.on('error', (err) => {
	console.error('Unexpected error on idle PostgreSQL client', err);
});

// Test connection on startup (only log, don't fail)
pool.connect()
	.then((client) => {
		console.log('✓ Database connection pool initialized successfully');
		console.log('Connection string (password hidden):', dbUrl.replace(/:[^:@]+@/, ':****@'));
		client.release();
	})
	.catch((err) => {
		console.error('✗ Database connection pool initialization failed:');
		console.error('Error code:', err?.code);
		console.error('Error message:', err?.message);
		console.error('Error syscall:', err?.syscall);
		console.error('Error hostname:', err?.hostname);
		console.error('Error port:', err?.port);
		console.error('Full error:', err);
		console.error('Connection string (password hidden):', dbUrl.replace(/:[^:@]+@/, ':****@'));
	});

export const db = drizzle(pool, { schema });
export { schema };
