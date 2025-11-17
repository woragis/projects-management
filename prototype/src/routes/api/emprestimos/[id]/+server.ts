import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const emprestimo = await emprestimoRepository.findById(params.id);
		if (!emprestimo) {
			return json({ error: 'Empréstimo não encontrado' }, { status: 404 });
		}
		return json({ data: emprestimo });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const emprestimo = await emprestimoRepository.update(params.id, body);
		if (!emprestimo) {
			return json({ error: 'Empréstimo não encontrado' }, { status: 404 });
		}
		return json({ data: emprestimo });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const emprestimo = await emprestimoRepository.delete(params.id);
		if (!emprestimo) {
			return json({ error: 'Empréstimo não encontrado' }, { status: 404 });
		}
		return json({ data: emprestimo });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
