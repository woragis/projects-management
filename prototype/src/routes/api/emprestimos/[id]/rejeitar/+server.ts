import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository, usuarioRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	try {
		const sessionId = cookies.get('session');
		
		if (!sessionId) {
			return json({ error: 'Não autenticado' }, { status: 401 });
		}

		// Verificar se o usuário é admin ou professor
		const admin = await usuarioRepository.findById(sessionId);
		if (!admin) {
			return json({ error: 'Usuário não encontrado' }, { status: 401 });
		}

		const isAdmin = admin.role === 'super_admin' || admin.role === 'admin';
		const isProfessor = admin.role === 'professor';

		if (!isAdmin && !isProfessor) {
			return json({ error: 'Apenas administradores ou professores podem rejeitar empréstimos' }, { status: 403 });
		}

		const body = await request.json();
		const { motivo } = body;

		// Buscar empréstimo
		const emprestimo = await emprestimoRepository.findById(params.id);
		if (!emprestimo) {
			return json({ error: 'Empréstimo não encontrado' }, { status: 404 });
		}

		// Verificar se já está aprovado
		if (emprestimo.emprestimo.statusAprovacao === 'aprovado') {
			return json({ error: 'Empréstimo já está aprovado e não pode ser rejeitado' }, { status: 400 });
		}

		// Atualizar empréstimo
		const updated = await emprestimoRepository.update(params.id, {
			statusAprovacao: 'rejeitado',
			adminAprovadorId: isAdmin ? sessionId : undefined,
			observacoes: motivo ? `Rejeitado: ${motivo}` : emprestimo.emprestimo.observacoes
		});

		return json({ data: updated, message: 'Empréstimo rejeitado com sucesso' });
	} catch (error: any) {
		console.error('Error rejecting emprestimo:', error);
		return json({ error: error.message || 'Erro ao rejeitar empréstimo' }, { status: 500 });
	}
};
