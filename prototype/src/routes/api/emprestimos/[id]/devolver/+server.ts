import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository, itemRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const dataDevolucaoReal = body.dataDevolucaoReal || new Date().toISOString();
		
		const emprestimo = await emprestimoRepository.findById(params.id);
		if (!emprestimo) {
			return json({ error: 'Empréstimo não encontrado' }, { status: 404 });
		}

		const emprestimoDevolvido = await emprestimoRepository.devolver(params.id, dataDevolucaoReal);
		
		// Marcar item como disponível novamente
		await itemRepository.marcarComoDisponivel(emprestimo.emprestimo.itemId);

		return json({ data: emprestimoDevolvido });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
