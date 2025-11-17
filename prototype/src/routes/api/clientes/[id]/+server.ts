import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const usuario = await usuarioRepository.findById(params.id);
		if (!usuario) {
			return json({ error: 'Usuário não encontrado' }, { status: 404 });
		}
		return json({ data: usuario });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const usuario = await usuarioRepository.update(params.id, body);
		if (!usuario) {
			return json({ error: 'Usuário não encontrado' }, { status: 404 });
		}
		return json({ data: usuario });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const usuario = await usuarioRepository.delete(params.id);
		if (!usuario) {
			return json({ error: 'Usuário não encontrado' }, { status: 404 });
		}
		return json({ data: usuario });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
