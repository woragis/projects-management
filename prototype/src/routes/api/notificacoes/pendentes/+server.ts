import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificacaoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async () => {
	try {
		const notificacoes = await notificacaoRepository.findPendentesParaEnviar();
		return json({ data: notificacoes });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
