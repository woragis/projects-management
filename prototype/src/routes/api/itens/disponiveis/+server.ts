import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { itemRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async () => {
	try {
		const itens = await itemRepository.findDisponiveis();
		return json({ data: itens });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
