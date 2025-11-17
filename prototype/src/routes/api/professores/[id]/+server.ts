import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { professorRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const professor = await professorRepository.findById(params.id);
		if (!professor) {
			return json({ error: 'Professor não encontrado' }, { status: 404 });
		}
		return json({ data: professor });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const professor = await professorRepository.update(params.id, body);
		if (!professor) {
			return json({ error: 'Professor não encontrado' }, { status: 404 });
		}
		return json({ data: professor });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const professor = await professorRepository.delete(params.id);
		if (!professor) {
			return json({ error: 'Professor não encontrado' }, { status: 404 });
		}
		return json({ data: professor });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
