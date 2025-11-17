import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { itemRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const item = await itemRepository.findById(params.id);
		if (!item) {
			return json({ error: 'Item não encontrado' }, { status: 404 });
		}
		return json({ data: item });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const item = await itemRepository.update(params.id, body);
		if (!item) {
			return json({ error: 'Item não encontrado' }, { status: 404 });
		}
		return json({ data: item });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const item = await itemRepository.delete(params.id);
		if (!item) {
			return json({ error: 'Item não encontrado' }, { status: 404 });
		}
		return json({ data: item });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
