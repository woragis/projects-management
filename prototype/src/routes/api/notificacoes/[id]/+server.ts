import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificacaoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const notificacao = await notificacaoRepository.findById(params.id);
		if (!notificacao) {
			return json({ error: 'Notificação não encontrada' }, { status: 404 });
		}
		return json({ data: notificacao });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const notificacao = await notificacaoRepository.update(params.id, body);
		if (!notificacao) {
			return json({ error: 'Notificação não encontrada' }, { status: 404 });
		}
		return json({ data: notificacao });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
