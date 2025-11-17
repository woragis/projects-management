import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// A pasta static está na raiz do projeto
const uploadsDir = path.join(process.cwd(), 'static', 'uploads');

// Garantir que o diretório de uploads existe
async function ensureUploadsDir() {
	if (!existsSync(uploadsDir)) {
		await mkdir(uploadsDir, { recursive: true });
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		await ensureUploadsDir();

		const formData = await request.formData();
		const file = formData.get('file') as File;
		const type = formData.get('type') as string || 'general'; // 'cliente', 'item', 'general'

		if (!file) {
			return json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
		}

		// Validar tipo de arquivo
		if (!file.type.startsWith('image/')) {
			return json({ error: 'Apenas imagens são permitidas' }, { status: 400 });
		}

		// Validar tamanho (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			return json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' }, { status: 400 });
		}

		// Gerar nome único para o arquivo
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const extension = file.name.split('.').pop();
		const fileName = `${type}_${timestamp}_${randomString}.${extension}`;
		const filePath = path.join(uploadsDir, fileName);

		// Salvar arquivo
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		await writeFile(filePath, buffer);

		// Retornar URL do arquivo
		const fileUrl = `/uploads/${fileName}`;

		return json({ 
			success: true,
			url: fileUrl,
			fileName: fileName
		});
	} catch (error: any) {
		console.error('Upload error:', error);
		return json({ error: error.message || 'Erro ao fazer upload do arquivo' }, { status: 500 });
	}
};
