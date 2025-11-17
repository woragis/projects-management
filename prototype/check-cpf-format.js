// Script to check CPF format in database
import pg from 'pg';
const { Pool } = pg;

// Use the same DATABASE_URL logic as the app
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/unipe_dev';

const pool = new Pool({
	connectionString: dbUrl,
	ssl: dbUrl.includes('rlwy.net') ? { rejectUnauthorized: false } : false
});

async function checkCpfFormat() {
	try {
		const client = await pool.connect();
		
		console.log('🔍 Checking CPF format in database...\n');
		
		const result = await client.query('SELECT id, cpf, nome_completo FROM usuario ORDER BY created_at');
		
		console.log(`Found ${result.rows.length} users:\n`);
		
		result.rows.forEach((row, index) => {
			const hasFormatting = /[.\-]/.test(row.cpf);
			const normalized = row.cpf.replace(/[.\-]/g, '').trim();
			
			console.log(`${index + 1}. ${row.nome_completo || 'N/A'}`);
			console.log(`   ID: ${row.id}`);
			console.log(`   CPF in DB: "${row.cpf}"`);
			console.log(`   Has formatting: ${hasFormatting ? 'YES ❌' : 'NO ✓'}`);
			console.log(`   Normalized: "${normalized}"`);
			console.log('');
		});
		
		// Check for duplicates after normalization
		const normalizedCpfs = result.rows.map(r => ({
			original: r.cpf,
			normalized: r.cpf.replace(/[.\-]/g, '').trim(),
			id: r.id
		}));
		
		const duplicates = [];
		for (let i = 0; i < normalizedCpfs.length; i++) {
			for (let j = i + 1; j < normalizedCpfs.length; j++) {
				if (normalizedCpfs[i].normalized === normalizedCpfs[j].normalized) {
					duplicates.push({
						cpf: normalizedCpfs[i].normalized,
						id1: normalizedCpfs[i].id,
						cpf1: normalizedCpfs[i].original,
						id2: normalizedCpfs[j].id,
						cpf2: normalizedCpfs[j].original
					});
				}
			}
		}
		
		if (duplicates.length > 0) {
			console.log('⚠️  WARNING: Found duplicate CPFs (after normalization):');
			duplicates.forEach(dup => {
				console.log(`   CPF: ${dup.cpf}`);
				console.log(`   User 1: ${dup.id1} (${dup.cpf1})`);
				console.log(`   User 2: ${dup.id2} (${dup.cpf2})`);
			});
		} else {
			console.log('✓ No duplicate CPFs found');
		}
		
		client.release();
		await pool.end();
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

checkCpfFormat();

