import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clienteRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const cliente = await clienteRepository.findById(params.id);
		if (!cliente) {
			return json({ error: 'Cliente não encontrado' }, { status: 404 });
		}
		return json({ data: cliente });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const cliente = await clienteRepository.update(params.id, body);
		if (!cliente) {
			return json({ error: 'Cliente não encontrado' }, { status: 404 });
		}
		return json({ data: cliente });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const cliente = await clienteRepository.delete(params.id);
		if (!cliente) {
			return json({ error: 'Cliente não encontrado' }, { status: 404 });
		}
		return json({ data: cliente });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
