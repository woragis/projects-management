import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const sessionId = cookies.get('session');
		
		if (!sessionId) {
			return json({ error: 'Não autenticado' }, { status: 401 });
		}

		// Verificar se é admin
		const admin = await usuarioRepository.findById(sessionId);
		if (!admin) {
			return json({ error: 'Usuário não encontrado' }, { status: 401 });
		}

		if (admin.role !== 'super_admin' && admin.role !== 'admin') {
			return json({ error: 'Apenas administradores podem ver solicitações' }, { status: 403 });
		}

		const solicitacoes = await usuarioRepository.findSolicitacoesProfessor();

		return json({ data: solicitacoes });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
