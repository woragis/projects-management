import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clienteRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const nome = url.searchParams.get('nome');
		const cpf = url.searchParams.get('cpf');
		const rg = url.searchParams.get('rg');
		const email = url.searchParams.get('email');
		const telefone = url.searchParams.get('telefone');
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
		const sortBy = url.searchParams.get('sortBy') as any;
		const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

		const clientes = await clienteRepository.findAll({
			nome: nome || undefined,
			cpf: cpf || undefined,
			rg: rg || undefined,
			email: email || undefined,
			telefone: telefone || undefined,
			limit,
			offset,
			sortBy,
			sortOrder
		});

		const total = await clienteRepository.count({
			nome: nome || undefined,
			cpf: cpf || undefined,
			rg: rg || undefined,
			email: email || undefined,
			telefone: telefone || undefined
		});

		return json({ data: clientes, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const cliente = await clienteRepository.create(body);
		return json({ data: cliente }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
