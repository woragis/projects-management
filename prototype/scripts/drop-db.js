import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Tentar ler do .env ou usar caminho padrão
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	try {
		const envContent = readFileSync('.env', 'utf-8');
		const match = envContent.match(/DATABASE_URL=(.+)/);
		if (match) {
			DATABASE_URL = match[1].trim();
		}
	} catch (e) {
		// Se não encontrar .env, usar caminho padrão
		DATABASE_URL = 'file:./local.db';
	}
}

if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

console.log('Connecting to database:', DATABASE_URL);
const client = createClient({ url: DATABASE_URL });

async function dropAllTables() {
	try {
		// Lista de tabelas a serem deletadas (em ordem inversa de dependências)
		const tables = [
			'processo_administrativo',
			'notificacao',
			'emprestimo',
			'professor',
			'item',
			'usuario',
			'cliente'
		];

		for (const table of tables) {
			try {
				await client.execute(`DROP TABLE IF EXISTS ${table}`);
				console.log(`✓ Dropped table: ${table}`);
			} catch (error) {
				console.log(`  Table ${table} doesn't exist or error: ${error.message}`);
			}
		}

		console.log('\n✓ Database cleared successfully!');
	} catch (error) {
		console.error('Error clearing database:', error);
		process.exit(1);
	} finally {
		client.close();
	}
}

dropAllTables();
