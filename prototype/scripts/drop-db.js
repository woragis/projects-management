import { Pool } from 'pg';
import { readFileSync } from 'fs';

// Tentar ler do .env ou usar variável de ambiente
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	try {
		const envContent = readFileSync('.env', 'utf-8');
		const match = envContent.match(/DATABASE_URL=(.+)/);
		if (match) {
			DATABASE_URL = match[1].trim();
		}
	} catch (e) {
		// Se não encontrar .env, erro
		console.error('DATABASE_URL is not set and .env file not found');
		process.exit(1);
	}
}

if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

console.log('Connecting to database...');
const pool = new Pool({
	connectionString: DATABASE_URL
});

async function dropAllTables() {
	try {
		// Lista de tabelas a serem deletadas (em ordem inversa de dependências)
		const tables = [
			'processo_administrativo',
			'notificacao',
			'emprestimo',
			'professor',
			'item',
			'usuario'
		];

		for (const table of tables) {
			try {
				await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
				console.log(`✓ Dropped table: ${table}`);
			} catch (error) {
				console.log(`  Table ${table} doesn't exist or error: ${error.message}`);
			}
		}

		// Drop enum types
		try {
			await pool.query('DROP TYPE IF EXISTS user_role CASCADE');
			console.log('✓ Dropped enum: user_role');
		} catch (error) {
			console.log(`  Enum user_role doesn't exist or error: ${error.message}`);
		}

		console.log('\n✓ Database cleared successfully!');
	} catch (error) {
		console.error('Error clearing database:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

dropAllTables();
