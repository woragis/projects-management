import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const sessionId = cookies.get('session');

		if (!sessionId) {
			return json({ error: 'Não autenticado' }, { status: 401 });
		}

		const usuario = await usuarioRepository.findById(sessionId);

		if (!usuario) {
			cookies.delete('session', { path: '/' });
			return json({ error: 'Usuário não encontrado' }, { status: 401 });
		}

		// Retornar dados do usuário (sem informações sensíveis)
		const { ...userData } = usuario;
		return json({ data: userData });
	} catch (error: any) {
		return json({ error: error.message || 'Erro ao buscar dados do usuário' }, { status: 500 });
	}
};
