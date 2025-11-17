import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;

		const emprestimos = await emprestimoRepository.findAll({
			statusAprovacao: 'pendente',
			limit,
			offset,
			sortBy: 'createdAt',
			sortOrder: 'desc'
		});

		const total = await emprestimoRepository.count({
			statusAprovacao: 'pendente'
		});

		return json({ data: emprestimos, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
