import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository, professorRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
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
			return json({ error: 'Apenas administradores podem aprovar solicitações' }, { status: 403 });
		}

		const body = await request.json();
		const { matricula, departamento, cargo } = body;

		if (!matricula) {
			return json({ error: 'Matrícula é obrigatória' }, { status: 400 });
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

		// Aprovar como professor
		await usuarioRepository.aprovarProfessor(params.id);

		// Criar registro de professor
		await professorRepository.create({
			usuarioId: params.id,
			matricula,
			departamento: departamento || undefined,
			cargo: cargo || undefined,
			ativo: true
		});

		return json({ message: 'Professor aprovado com sucesso' });
	} catch (error: any) {
		console.error('Error approving professor:', error);
		return json({ error: error.message || 'Erro ao aprovar professor' }, { status: 500 });
	}
};
