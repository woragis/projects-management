import { db } from '../index';
import { notificacao, emprestimo, cliente } from '../schemas';
import { eq, and, desc, asc, count, gte, lte } from 'drizzle-orm';

export interface NotificacaoCreateInput {
	emprestimoId: string;
	destinatarioId: string;
	tipo: 'email' | 'whatsapp';
	assunto: string;
	mensagem: string;
	dataAgendamento: string;
}

export interface NotificacaoUpdateInput {
	status?: 'pendente' | 'enviada' | 'falha';
	dataEnvio?: string;
	tentativas?: number;
	erro?: string;
}

export interface NotificacaoFilters {
	emprestimoId?: string;
	destinatarioId?: string;
	tipo?: 'email' | 'whatsapp';
	status?: 'pendente' | 'enviada' | 'falha';
	dataAgendamentoInicio?: string;
	dataAgendamentoFim?: string;
	pendentes?: boolean; // apenas notificações pendentes
	limit?: number;
	offset?: number;
	sortBy?: 'dataAgendamento' | 'dataEnvio' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
}

export class NotificacaoRepository {
	async create(data: NotificacaoCreateInput) {
		const [result] = await db
			.insert(notificacao)
			.values({
				...data,
				status: 'pendente',
				tentativas: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			})
			.returning();
		return result;
	}

	async findById(id: string) {
		const [result] = await db
			.select({
				notificacao: notificacao,
				emprestimo: emprestimo,
				destinatario: cliente
			})
			.from(notificacao)
			.innerJoin(emprestimo, eq(notificacao.emprestimoId, emprestimo.id))
			.innerJoin(cliente, eq(notificacao.destinatarioId, cliente.id))
			.where(eq(notificacao.id, id))
			.limit(1);
		return result;
	}

	async findAll(filters?: NotificacaoFilters) {
		const conditions = [];

		if (filters?.emprestimoId) {
			conditions.push(eq(notificacao.emprestimoId, filters.emprestimoId));
		}

		if (filters?.destinatarioId) {
			conditions.push(eq(notificacao.destinatarioId, filters.destinatarioId));
		}

		if (filters?.tipo) {
			conditions.push(eq(notificacao.tipo, filters.tipo));
		}

		if (filters?.status) {
			conditions.push(eq(notificacao.status, filters.status));
		}

		if (filters?.dataAgendamentoInicio) {
			conditions.push(gte(notificacao.dataAgendamento, filters.dataAgendamentoInicio));
		}

		if (filters?.dataAgendamentoFim) {
			conditions.push(lte(notificacao.dataAgendamento, filters.dataAgendamentoFim));
		}

		if (filters?.pendentes) {
			conditions.push(eq(notificacao.status, 'pendente'));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let query = db
			.select({
				notificacao: notificacao,
				emprestimo: emprestimo,
				destinatario: cliente
			})
			.from(notificacao)
			.innerJoin(emprestimo, eq(notificacao.emprestimoId, emprestimo.id))
			.innerJoin(cliente, eq(notificacao.destinatarioId, cliente.id));

		if (whereClause) {
			query = query.where(whereClause);
		}

		// Sorting
		if (filters?.sortBy) {
			const sortColumn =
				filters.sortBy === 'dataAgendamento'
					? notificacao.dataAgendamento
					: filters.sortBy === 'dataEnvio'
						? notificacao.dataEnvio
						: notificacao.createdAt;

			query = filters.sortOrder === 'desc' 
				? query.orderBy(desc(sortColumn))
				: query.orderBy(asc(sortColumn));
		} else {
			query = query.orderBy(desc(notificacao.createdAt));
		}

		// Pagination
		if (filters?.limit) {
			query = query.limit(filters.limit);
		}

		if (filters?.offset) {
			query = query.offset(filters.offset);
		}

		return query;
	}

	async findPendentes() {
		return db
			.select({
				notificacao: notificacao,
				emprestimo: emprestimo,
				destinatario: cliente
			})
			.from(notificacao)
			.innerJoin(emprestimo, eq(notificacao.emprestimoId, emprestimo.id))
			.innerJoin(cliente, eq(notificacao.destinatarioId, cliente.id))
			.where(eq(notificacao.status, 'pendente'))
			.orderBy(asc(notificacao.dataAgendamento));
	}

	async findPendentesParaEnviar() {
		const agora = new Date().toISOString();
		return db
			.select({
				notificacao: notificacao,
				emprestimo: emprestimo,
				destinatario: cliente
			})
			.from(notificacao)
			.innerJoin(emprestimo, eq(notificacao.emprestimoId, emprestimo.id))
			.innerJoin(cliente, eq(notificacao.destinatarioId, cliente.id))
			.where(
				and(
					eq(notificacao.status, 'pendente'),
					lte(notificacao.dataAgendamento, agora)
				)
			)
			.orderBy(asc(notificacao.dataAgendamento));
	}

	async count(filters?: Omit<NotificacaoFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>) {
		const conditions = [];

		if (filters?.emprestimoId) {
			conditions.push(eq(notificacao.emprestimoId, filters.emprestimoId));
		}

		if (filters?.destinatarioId) {
			conditions.push(eq(notificacao.destinatarioId, filters.destinatarioId));
		}

		if (filters?.tipo) {
			conditions.push(eq(notificacao.tipo, filters.tipo));
		}

		if (filters?.status) {
			conditions.push(eq(notificacao.status, filters.status));
		}

		if (filters?.dataAgendamentoInicio) {
			conditions.push(gte(notificacao.dataAgendamento, filters.dataAgendamentoInicio));
		}

		if (filters?.dataAgendamentoFim) {
			conditions.push(lte(notificacao.dataAgendamento, filters.dataAgendamentoFim));
		}

		if (filters?.pendentes) {
			conditions.push(eq(notificacao.status, 'pendente'));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [result] = await db
			.select({ count: count() })
			.from(notificacao)
			.where(whereClause);

		return result.count;
	}

	async update(id: string, data: NotificacaoUpdateInput) {
		const [result] = await db
			.update(notificacao)
			.set({
				...data,
				updatedAt: new Date().toISOString()
			})
			.where(eq(notificacao.id, id))
			.returning();
		return result;
	}

	async marcarComoEnviada(id: string, erro?: string) {
		return this.update(id, {
			status: erro ? 'falha' : 'enviada',
			dataEnvio: new Date().toISOString(),
			erro: erro,
			tentativas: 1 // Seria incrementado se tivéssemos acesso ao valor atual
		});
	}

	async incrementarTentativa(id: string, erro?: string) {
		const notif = await db
			.select()
			.from(notificacao)
			.where(eq(notificacao.id, id))
			.limit(1);

		if (notif.length === 0) return null;

		return this.update(id, {
			tentativas: (notif[0].tentativas || 0) + 1,
			erro: erro
		});
	}

	async delete(id: string) {
		const [result] = await db
			.delete(notificacao)
			.where(eq(notificacao.id, id))
			.returning();
		return result;
	}

	async exists(id: string) {
		const [result] = await db
			.select({ id: notificacao.id })
			.from(notificacao)
			.where(eq(notificacao.id, id))
			.limit(1);
		return !!result;
	}
}

export const notificacaoRepository = new NotificacaoRepository();
