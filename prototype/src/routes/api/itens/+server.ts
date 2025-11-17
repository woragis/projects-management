import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { itemRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const nome = url.searchParams.get('nome');
		const categoria = url.searchParams.get('categoria');
		const codigoPatrimonio = url.searchParams.get('codigoPatrimonio');
		const disponivel = url.searchParams.get('disponivel') === 'true' ? true : url.searchParams.get('disponivel') === 'false' ? false : undefined;
		const condicao = url.searchParams.get('condicao') as any;
		const localizacao = url.searchParams.get('localizacao');
		const tag = url.searchParams.get('tag');
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
		const sortBy = url.searchParams.get('sortBy') as any;
		const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

		const itens = await itemRepository.findAll({
			nome: nome || undefined,
			categoria: categoria || undefined,
			codigoPatrimonio: codigoPatrimonio || undefined,
			disponivel,
			condicao,
			localizacao: localizacao || undefined,
			tag: tag || undefined,
			limit,
			offset,
			sortBy,
			sortOrder
		});

		const total = await itemRepository.count({
			nome: nome || undefined,
			categoria: categoria || undefined,
			codigoPatrimonio: codigoPatrimonio || undefined,
			disponivel,
			condicao,
			localizacao: localizacao || undefined,
			tag: tag || undefined
		});

		return json({ data: itens, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const item = await itemRepository.create(body);
		return json({ data: item }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
