import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processoAdministrativoRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const usuarioId = url.searchParams.get('usuarioId') || url.searchParams.get('clienteId'); // Compatibilidade
		const emprestimoId = url.searchParams.get('emprestimoId');
		const tipo = url.searchParams.get('tipo') as any;
		const status = url.searchParams.get('status') as any;
		const dataOcorrenciaInicio = url.searchParams.get('dataOcorrenciaInicio');
		const dataOcorrenciaFim = url.searchParams.get('dataOcorrenciaFim');
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;

		const processos = await processoAdministrativoRepository.findAll({
			usuarioId: usuarioId || undefined,
			emprestimoId: emprestimoId || undefined,
			tipo,
			status,
			dataOcorrenciaInicio: dataOcorrenciaInicio || undefined,
			dataOcorrenciaFim: dataOcorrenciaFim || undefined,
			limit,
			offset
		});

		const total = await processoAdministrativoRepository.count({
			usuarioId: usuarioId || undefined,
			emprestimoId: emprestimoId || undefined,
			tipo,
			status,
			dataOcorrenciaInicio: dataOcorrenciaInicio || undefined,
			dataOcorrenciaFim: dataOcorrenciaFim || undefined
		});

		return json({ data: processos, total });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const processo = await processoAdministrativoRepository.create(body);
		return json({ data: processo }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 400 });
	}
};
