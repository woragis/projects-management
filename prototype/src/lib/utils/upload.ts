import api from '../api/client';

export interface UploadResult {
	success: boolean;
	url?: string;
	fileName?: string;
	error?: string;
}

export async function uploadFile(file: File, type: 'usuario' | 'item' | 'general' = 'general'): Promise<UploadResult> {
	try {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		const response = await api.post('/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});

		return response.data;
	} catch (error: any) {
		console.error('Upload error:', error);
		return {
			success: false,
			error: error.response?.data?.error || 'Erro ao fazer upload do arquivo'
		};
	}
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
	// Verificar se é uma imagem
	if (!file.type.startsWith('image/')) {
		return { valid: false, error: 'Apenas arquivos de imagem são permitidos' };
	}

	// Verificar tamanho (max 5MB)
	const maxSize = 5 * 1024 * 1024; // 5MB
	if (file.size > maxSize) {
		return { valid: false, error: 'Imagem muito grande. Tamanho máximo: 5MB' };
	}

	return { valid: true };
}
