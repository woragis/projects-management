import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository, itemRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const solicitanteId = url.searchParams.get('solicitanteId');
		const itemId = url.searchParams.get('itemId');
		const professorAutorizadorId = url.searchParams.get('professorAutorizadorId');
		const status = url.searchParams.get('status') as any;
		const dataInicioInicio = url.searchParams.get('dataInicioInicio');
		const dataInicioFim = url.searchParams.get('dataInicioFim');
		const atrasados = url.searchParams.get('atrasados') === 'true';
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
		const sortBy = url.searchParams.get('sortBy') as any;
		const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

		const emprestimos = await emprestimoRepository.findAll({
			solicitanteId: solicitanteId || undefined,
			itemId: itemId || undefined,
			professorAutorizadorId: professorAutorizadorId || undefined,
			status,
			dataInicioInicio: dataInicioInicio || undefined,
			dataInicioFim: dataInicioFim || undefined,
			atrasados: atrasados || undefined,
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
			dataInicioInicio: dataInicioInicio || undefined,
			dataInicioFim: dataInicioFim || undefined,
			atrasados: atrasados || undefined
		});

		return json({ data: emprestimos, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		
		// Validar limite de 3 itens
		const countAtivos = await emprestimoRepository.countAtivosPorSolicitante(body.solicitanteId);
		if (countAtivos >= 3) {
			return json({ error: 'Limite de 3 itens emprestados atingido' }, { status: 400 });
		}

		const emprestimo = await emprestimoRepository.create(body);
		
		// Marcar item como indisponível
		await itemRepository.marcarComoIndisponivel(body.itemId);

		return json({ data: emprestimo }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
