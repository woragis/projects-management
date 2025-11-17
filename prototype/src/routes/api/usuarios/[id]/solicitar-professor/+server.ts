import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ params, cookies }) => {
	try {
		const sessionId = cookies.get('session');
		
		if (!sessionId) {
			return json({ error: 'Não autenticado' }, { status: 401 });
		}

		// Verificar se o usuário está solicitando para si mesmo
		if (sessionId !== params.id) {
			return json({ error: 'Você só pode solicitar para si mesmo' }, { status: 403 });
		}

		const usuario = await usuarioRepository.findById(params.id);
		if (!usuario) {
			return json({ error: 'Usuário não encontrado' }, { status: 404 });
		}

		// Verificar se já é professor ou admin
		if (usuario.role === 'professor' || usuario.role === 'admin' || usuario.role === 'super_admin') {
			return json({ error: 'Você já é professor ou administrador' }, { status: 400 });
		}

		// Verificar se já tem solicitação pendente
		if (usuario.solicitacaoProfessor) {
			return json({ error: 'Você já tem uma solicitação pendente' }, { status: 400 });
		}

		// Criar solicitação
		await usuarioRepository.solicitarVirarProfessor(params.id);

		return json({ message: 'Solicitação enviada com sucesso' });
	} catch (error: any) {
		return json({ error: error.message || 'Erro ao solicitar' }, { status: 500 });
	}
};
