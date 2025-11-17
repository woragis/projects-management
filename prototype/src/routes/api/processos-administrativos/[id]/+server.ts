import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processoAdministrativoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const processo = await processoAdministrativoRepository.findById(params.id);
		if (!processo) {
			return json({ error: 'Processo administrativo não encontrado' }, { status: 404 });
		}
		return json({ data: processo });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const processo = await processoAdministrativoRepository.update(params.id, body);
		if (!processo) {
			return json({ error: 'Processo administrativo não encontrado' }, { status: 404 });
		}
		return json({ data: processo });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const processo = await processoAdministrativoRepository.delete(params.id);
		if (!processo) {
			return json({ error: 'Processo administrativo não encontrado' }, { status: 404 });
		}
		return json({ data: processo });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
