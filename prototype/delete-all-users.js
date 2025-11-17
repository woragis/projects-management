// Script to delete all users from the database
import pg from 'pg';
const { Pool } = pg;

// Use DATABASE_URL from environment (set it manually or use .env.production)
// For Railway: postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:fYpUiNYTWrWlfwBqlKxMmdVirHzSEcXm@hopper.proxy.rlwy.net:35878/railway';

if (!dbUrl) {
	console.error('❌ DATABASE_URL not found in .env.production');
	process.exit(1);
}

const pool = new Pool({
	connectionString: dbUrl,
	ssl: dbUrl.includes('rlwy.net') ? { rejectUnauthorized: false } : false
});

async function deleteAllUsers() {
	const client = await pool.connect();
	
	try {
		await client.query('BEGIN');
		
		console.log('🗑️  Deleting all users from database...\n');
		
		// First, check how many users exist
		const countResult = await client.query('SELECT COUNT(*) as count FROM usuario');
		const count = parseInt(countResult.rows[0].count);
		
		console.log(`Found ${count} users in database\n`);
		
		if (count === 0) {
			console.log('✓ Database is already empty');
			await client.query('COMMIT');
			client.release();
			await pool.end();
			return;
		}
		
		// List users before deletion
		const usersResult = await client.query('SELECT id, cpf, nome_completo FROM usuario ORDER BY created_at');
		console.log('Users to be deleted:');
		usersResult.rows.forEach((row, index) => {
			console.log(`  ${index + 1}. ${row.nome_completo || 'N/A'} (CPF: ${row.cpf}, ID: ${row.id})`);
		});
		console.log('');
		
		// Delete all users
		const deleteResult = await client.query('DELETE FROM usuario');
		
		await client.query('COMMIT');
		
		console.log(`✓ Deleted ${deleteResult.rowCount} users from database`);
		console.log('✓ Database is now empty');
		
		client.release();
		await pool.end();
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('❌ Error:', error);
		client.release();
		process.exit(1);
	}
}

deleteAllUsers();

