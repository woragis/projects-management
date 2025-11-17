import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificacaoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const emprestimoId = url.searchParams.get('emprestimoId');
		const destinatarioId = url.searchParams.get('destinatarioId');
		const tipo = url.searchParams.get('tipo') as any;
		const status = url.searchParams.get('status') as any;
		const pendentes = url.searchParams.get('pendentes') === 'true';
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;

		const notificacoes = await notificacaoRepository.findAll({
			emprestimoId: emprestimoId || undefined,
			destinatarioId: destinatarioId || undefined,
			tipo,
			status,
			pendentes: pendentes || undefined,
			limit,
			offset
		});

		const total = await notificacaoRepository.count({
			emprestimoId: emprestimoId || undefined,
			destinatarioId: destinatarioId || undefined,
			tipo,
			status,
			pendentes: pendentes || undefined
		});

		return json({ data: notificacoes, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const notificacao = await notificacaoRepository.create(body);
		return json({ data: notificacao }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
