import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async () => {
	try {
		const emprestimos = await emprestimoRepository.findAtrasados();
		return json({ data: emprestimos });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
