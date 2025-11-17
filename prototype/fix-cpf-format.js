// Script to normalize all CPFs in the database
import pg from 'pg';
const { Pool } = pg;

// Use the same DATABASE_URL logic as the app
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/unipe_dev';

const pool = new Pool({
	connectionString: dbUrl,
	ssl: dbUrl.includes('rlwy.net') ? { rejectUnauthorized: false } : false
});

function normalizeCpf(cpf) {
	return cpf.replace(/[.\-]/g, '').trim();
}

async function fixCpfFormat() {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		console.log('🔧 Normalizing CPFs in database...\n');
		
		// Get all users
		const result = await client.query('SELECT id, cpf FROM usuario');
		
		console.log(`Found ${result.rows.length} users\n`);
		
		let updated = 0;
		
		for (const row of result.rows) {
			const normalized = normalizeCpf(row.cpf);
			
			// Only update if CPF has formatting
			if (normalized !== row.cpf) {
				console.log(`Updating user ${row.id}:`);
				console.log(`  Old: "${row.cpf}"`);
				console.log(`  New: "${normalized}"`);
				
				await client.query(
					'UPDATE usuario SET cpf = $1 WHERE id = $2',
					[normalized, row.id]
				);
				
				updated++;
			}
		}
		
		await client.query('COMMIT');
		
		console.log(`\n✓ Updated ${updated} users`);
		console.log('✓ All CPFs are now normalized');
		
		client.release();
		await pool.end();
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error:', error);
		client.release();
		process.exit(1);
	}
}

fixCpfFormat();

