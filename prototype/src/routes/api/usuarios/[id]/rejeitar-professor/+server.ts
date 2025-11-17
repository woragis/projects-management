import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ params, cookies }) => {
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
			return json({ error: 'Apenas administradores podem rejeitar solicitações' }, { status: 403 });
		}

		// Buscar usuário
		const usuario = await usuarioRepository.findById(params.id);
		if (!usuario) {
			return json({ error: 'Usuário não encontrado' }, { status: 404 });
		}

		// Verificar se tem solicitação
		if (!usuario.solicitacaoProfessor) {
			return json({ error: 'Usuário não tem solicitação pendente' }, { status: 400 });
		}

		// Rejeitar solicitação
		await usuarioRepository.rejeitarSolicitacaoProfessor(params.id);

		return json({ message: 'Solicitação rejeitada com sucesso' });
	} catch (error: any) {
		return json({ error: error.message || 'Erro ao rejeitar solicitação' }, { status: 500 });
	}
};
