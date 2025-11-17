import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Detectar se estamos no Vercel
const isVercel = process.env.VERCEL === '1';

// Para Vercel, usar /tmp (único diretório gravável)
// Para desenvolvimento local, usar static/uploads
const getUploadsDir = () => {
	if (isVercel) {
		return path.join('/tmp', 'uploads');
	}
	return path.join(process.cwd(), 'static', 'uploads');
};

// Garantir que o diretório de uploads existe
async function ensureUploadsDir() {
	const uploadsDir = getUploadsDir();
	if (!existsSync(uploadsDir)) {
		await mkdir(uploadsDir, { recursive: true });
	}
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		await ensureUploadsDir();

		const formData = await request.formData();
		const file = formData.get('file') as File;
		const type = formData.get('type') as string || 'general'; // 'usuario', 'item', 'general'

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
		
		const uploadsDir = getUploadsDir();
		const filePath = path.join(uploadsDir, fileName);

		// Salvar arquivo
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		await writeFile(filePath, buffer);

		// Para Vercel, converter para base64 e retornar como data URL
		// Para desenvolvimento local, retornar URL do arquivo
		let fileUrl: string;
		if (isVercel) {
			// No Vercel, arquivos em /tmp não são acessíveis via HTTP
			// Converter para base64 data URL
			const base64 = buffer.toString('base64');
			const mimeType = file.type || 'image/jpeg';
			fileUrl = `data:${mimeType};base64,${base64}`;
		} else {
			// Em desenvolvimento local, usar URL relativa
			fileUrl = `/uploads/${fileName}`;
		}

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
