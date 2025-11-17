import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emprestimoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const dias = url.searchParams.get('dias') ? parseInt(url.searchParams.get('dias')!) : 1;
		const emprestimos = await emprestimoRepository.findProximosAVencer(dias);
		return json({ data: emprestimos });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
