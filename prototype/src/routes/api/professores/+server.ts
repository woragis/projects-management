import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { professorRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const nome = url.searchParams.get('nome');
		const matricula = url.searchParams.get('matricula');
		const departamento = url.searchParams.get('departamento');
		const cargo = url.searchParams.get('cargo');
		const ativo = url.searchParams.get('ativo') === 'true' ? true : url.searchParams.get('ativo') === 'false' ? false : undefined;
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
		const sortBy = url.searchParams.get('sortBy') as any;
		const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

		const professores = await professorRepository.findAll({
			nome: nome || undefined,
			matricula: matricula || undefined,
			departamento: departamento || undefined,
			cargo: cargo || undefined,
			ativo,
			limit,
			offset,
			sortBy,
			sortOrder
		});

		const total = await professorRepository.count({
			nome: nome || undefined,
			matricula: matricula || undefined,
			departamento: departamento || undefined,
			cargo: cargo || undefined,
			ativo
		});

		return json({ data: professores, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const professor = await professorRepository.create(body);
		return json({ data: professor }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
