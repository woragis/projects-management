import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository, itemRepository, usuarioRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const solicitanteId = url.searchParams.get('solicitanteId');
		const itemId = url.searchParams.get('itemId');
		const professorAutorizadorId = url.searchParams.get('professorAutorizadorId');
		const status = url.searchParams.get('status') as any;
		const statusAprovacao = url.searchParams.get('statusAprovacao') as any;
		const dataInicioInicio = url.searchParams.get('dataInicioInicio');
		const dataInicioFim = url.searchParams.get('dataInicioFim');
		const atrasados = url.searchParams.get('atrasados') === 'true';
		const search = url.searchParams.get('search');
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
		const sortBy = url.searchParams.get('sortBy') as any;
		const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

		const emprestimos = await emprestimoRepository.findAll({
			solicitanteId: solicitanteId || undefined,
			itemId: itemId || undefined,
			professorAutorizadorId: professorAutorizadorId || undefined,
			status,
			statusAprovacao: statusAprovacao || undefined,
			dataInicioInicio: dataInicioInicio || undefined,
			dataInicioFim: dataInicioFim || undefined,
			atrasados: atrasados || undefined,
			search: search || undefined,
			limit,
			offset,
			sortBy,
			sortOrder
		});

		const total = await emprestimoRepository.count({
			solicitanteId: solicitanteId || undefined,
			itemId: itemId || undefined,
			professorAutorizadorId: professorAutorizadorId || undefined,
			status,
			statusAprovacao: statusAprovacao || undefined,
			dataInicioInicio: dataInicioInicio || undefined,
			dataInicioFim: dataInicioFim || undefined,
			atrasados: atrasados || undefined,
			search: search || undefined
		});

		return json({ data: emprestimos, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const sessionId = cookies.get('session');
		
		if (!sessionId) {
			return json({ error: 'Não autenticado' }, { status: 401 });
		}

		// Buscar usuário solicitante
		const solicitante = await usuarioRepository.findById(body.solicitanteId);
		if (!solicitante) {
			return json({ error: 'Solicitante não encontrado' }, { status: 404 });
		}

		// Validar limite de 3 itens
		const countAtivos = await emprestimoRepository.countAtivosPorSolicitante(body.solicitanteId);
		if (countAtivos >= 3) {
			return json({ error: 'Limite de 3 itens emprestados atingido' }, { status: 400 });
		}

		// Verificar role do solicitante
		const isProfessor = solicitante.role === 'professor' || solicitante.role === 'admin' || solicitante.role === 'super_admin';
		const isAluno = solicitante.role === 'aluno';

		// Se for professor/admin, aprovação automática
		// Se for aluno, precisa aprovação
		const statusAprovacao = isProfessor ? 'aprovado' : 'pendente';
		const adminAprovadorId = isProfessor ? sessionId : undefined;

		const emprestimo = await emprestimoRepository.create({
			...body,
			statusAprovacao,
			adminAprovadorId: adminAprovadorId
		});
		
		// Se aprovado, marcar item como indisponível imediatamente
		if (statusAprovacao === 'aprovado') {
			await itemRepository.marcarComoIndisponivel(body.itemId);
		}

		return json({ data: emprestimo }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
