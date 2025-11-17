import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository, itemRepository, usuarioRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ params, cookies }) => {
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
			return json({ error: 'Apenas administradores ou professores podem aprovar empréstimos' }, { status: 403 });
		}

		// Buscar empréstimo
		const emprestimo = await emprestimoRepository.findById(params.id);
		if (!emprestimo) {
			return json({ error: 'Empréstimo não encontrado' }, { status: 404 });
		}

		// Verificar se já está aprovado
		if (emprestimo.emprestimo.statusAprovacao === 'aprovado') {
			return json({ error: 'Empréstimo já está aprovado' }, { status: 400 });
		}

		// Verificar se foi rejeitado
		if (emprestimo.emprestimo.statusAprovacao === 'rejeitado') {
			return json({ error: 'Empréstimo foi rejeitado e não pode ser aprovado' }, { status: 400 });
		}

		// Atualizar empréstimo
		const updated = await emprestimoRepository.update(params.id, {
			statusAprovacao: 'aprovado',
			adminAprovadorId: isAdmin ? sessionId : undefined,
			professorAutorizadorId: isProfessor ? sessionId : undefined
		});

		// Marcar item como indisponível
		await itemRepository.marcarComoIndisponivel(emprestimo.emprestimo.itemId);

		return json({ data: updated, message: 'Empréstimo aprovado com sucesso' });
	} catch (error: any) {
		console.error('Error approving emprestimo:', error);
		return json({ error: error.message || 'Erro ao aprovar empréstimo' }, { status: 500 });
	}
};
