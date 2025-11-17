import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processoAdministrativoRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const { resultado, valorMulta } = body;
		
		const processo = await processoAdministrativoRepository.resolver(
			params.id,
			resultado,
			valorMulta
		);
		
		if (!processo) {
			return json({ error: 'Processo administrativo não encontrado' }, { status: 404 });
		}
		
		return json({ data: processo });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
