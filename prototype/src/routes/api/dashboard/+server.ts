import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
	clienteRepository, 
	professorRepository, 
	itemRepository, 
	emprestimoRepository, 
	notificacaoRepository,
	processoAdministrativoRepository 
} from '$lib/server/db/repositories';

export const GET: RequestHandler = async () => {
	try {
		const [
			totalClientes,
			totalProfessores,
			totalItens,
			totalItensDisponiveis,
			totalEmprestimos,
			totalEmprestimosAtivos,
			emprestimosAtrasados,
			notificacoesPendentes,
			processosAbertos
		] = await Promise.all([
			clienteRepository.count().catch(() => 0),
			professorRepository.count({ ativo: true }).catch(() => 0),
			itemRepository.count().catch(() => 0),
			itemRepository.count({ disponivel: true }).catch(() => 0),
			emprestimoRepository.count().catch(() => 0),
			emprestimoRepository.count({ status: 'ativo' }).catch(() => 0),
			emprestimoRepository.findAtrasados().catch(() => []),
			notificacaoRepository.findPendentesParaEnviar().catch(() => []),
			processoAdministrativoRepository.findAbertos().catch(() => [])
		]);

		return json({
			data: {
				totalClientes,
				totalProfessores,
				totalItens,
				totalItensDisponiveis,
				totalItensIndisponiveis: totalItens - totalItensDisponiveis,
				totalEmprestimos,
				totalEmprestimosAtivos,
				totalEmprestimosAtrasados: Array.isArray(emprestimosAtrasados) ? emprestimosAtrasados.length : 0,
				totalNotificacoesPendentes: Array.isArray(notificacoesPendentes) ? notificacoesPendentes.length : 0,
				totalProcessosAbertos: Array.isArray(processosAbertos) ? processosAbertos.length : 0
			}
		});
	} catch (error: any) {
		console.error('Dashboard error:', error);
		return json({ 
			error: error.message,
			data: {
				totalClientes: 0,
				totalProfessores: 0,
				totalItens: 0,
				totalItensDisponiveis: 0,
				totalItensIndisponiveis: 0,
				totalEmprestimos: 0,
				totalEmprestimosAtivos: 0,
				totalEmprestimosAtrasados: 0,
				totalNotificacoesPendentes: 0,
				totalProcessosAbertos: 0
			}
		}, { status: 500 });
	}
};
