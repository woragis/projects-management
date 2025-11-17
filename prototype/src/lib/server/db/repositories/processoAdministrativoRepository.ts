import { db } from '../index';
import { processoAdministrativo, emprestimo, cliente } from '../schemas';
import { eq, and, desc, asc, count, gte, lte } from 'drizzle-orm';

export interface ProcessoAdministrativoCreateInput {
	emprestimoId?: string;
	clienteId: string;
	tipo: 'perda' | 'quebra' | 'mas_condicoes' | 'roubo';
	descricao: string;
	dataOcorrencia: string;
	observacoes?: string;
	arquivos?: string[];
}

export interface ProcessoAdministrativoUpdateInput {
	status?: 'aberto' | 'em_andamento' | 'resolvido' | 'encaminhado_justica';
	resultado?: string;
	valorMulta?: number; // em centavos
	dataResolucao?: string;
	observacoes?: string;
	arquivos?: string[];
}

export interface ProcessoAdministrativoFilters {
	clienteId?: string;
	emprestimoId?: string;
	tipo?: 'perda' | 'quebra' | 'mas_condicoes' | 'roubo';
	status?: 'aberto' | 'em_andamento' | 'resolvido' | 'encaminhado_justica';
	dataOcorrenciaInicio?: string;
	dataOcorrenciaFim?: string;
	limit?: number;
	offset?: number;
	sortBy?: 'dataOcorrencia' | 'dataResolucao' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
}

export class ProcessoAdministrativoRepository {
	async create(data: ProcessoAdministrativoCreateInput) {
		const [result] = await db
			.insert(processoAdministrativo)
			.values({
				...data,
				arquivos: data.arquivos ? JSON.stringify(data.arquivos) : null,
				status: 'aberto',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			})
			.returning();
		return result;
	}

	async findById(id: string) {
		const [result] = await db
			.select({
				processo: processoAdministrativo,
				emprestimo: emprestimo,
				cliente: cliente
			})
			.from(processoAdministrativo)
			.innerJoin(cliente, eq(processoAdministrativo.clienteId, cliente.id))
			.leftJoin(emprestimo, eq(processoAdministrativo.emprestimoId, emprestimo.id))
			.where(eq(processoAdministrativo.id, id))
			.limit(1);
		return result;
	}

	async findByCliente(clienteId: string) {
		return db
			.select({
				processo: processoAdministrativo,
				emprestimo: emprestimo
			})
			.from(processoAdministrativo)
			.leftJoin(emprestimo, eq(processoAdministrativo.emprestimoId, emprestimo.id))
			.where(eq(processoAdministrativo.clienteId, clienteId))
			.orderBy(desc(processoAdministrativo.dataOcorrencia));
	}

	async findAll(filters?: ProcessoAdministrativoFilters) {
		const conditions = [];

		if (filters?.clienteId) {
			conditions.push(eq(processoAdministrativo.clienteId, filters.clienteId));
		}

		if (filters?.emprestimoId) {
			conditions.push(eq(processoAdministrativo.emprestimoId, filters.emprestimoId));
		}

		if (filters?.tipo) {
			conditions.push(eq(processoAdministrativo.tipo, filters.tipo));
		}

		if (filters?.status) {
			conditions.push(eq(processoAdministrativo.status, filters.status));
		}

		if (filters?.dataOcorrenciaInicio) {
			conditions.push(gte(processoAdministrativo.dataOcorrencia, filters.dataOcorrenciaInicio));
		}

		if (filters?.dataOcorrenciaFim) {
			conditions.push(lte(processoAdministrativo.dataOcorrencia, filters.dataOcorrenciaFim));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let query = db
			.select({
				processo: processoAdministrativo,
				emprestimo: emprestimo,
				cliente: cliente
			})
			.from(processoAdministrativo)
			.innerJoin(cliente, eq(processoAdministrativo.clienteId, cliente.id))
			.leftJoin(emprestimo, eq(processoAdministrativo.emprestimoId, emprestimo.id));

		if (whereClause) {
			query = query.where(whereClause);
		}

		// Sorting
		if (filters?.sortBy) {
			const sortColumn =
				filters.sortBy === 'dataOcorrencia'
					? processoAdministrativo.dataOcorrencia
					: filters.sortBy === 'dataResolucao'
						? processoAdministrativo.dataResolucao
						: processoAdministrativo.createdAt;

			query = filters.sortOrder === 'desc' 
				? query.orderBy(desc(sortColumn))
				: query.orderBy(asc(sortColumn));
		} else {
			query = query.orderBy(desc(processoAdministrativo.createdAt));
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

	async findAbertos() {
		return db
			.select({
				processo: processoAdministrativo,
				emprestimo: emprestimo,
				cliente: cliente
			})
			.from(processoAdministrativo)
			.innerJoin(cliente, eq(processoAdministrativo.clienteId, cliente.id))
			.leftJoin(emprestimo, eq(processoAdministrativo.emprestimoId, emprestimo.id))
			.where(eq(processoAdministrativo.status, 'aberto'))
			.orderBy(desc(processoAdministrativo.dataOcorrencia));
	}

	async count(filters?: Omit<ProcessoAdministrativoFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>) {
		const conditions = [];

		if (filters?.clienteId) {
			conditions.push(eq(processoAdministrativo.clienteId, filters.clienteId));
		}

		if (filters?.emprestimoId) {
			conditions.push(eq(processoAdministrativo.emprestimoId, filters.emprestimoId));
		}

		if (filters?.tipo) {
			conditions.push(eq(processoAdministrativo.tipo, filters.tipo));
		}

		if (filters?.status) {
			conditions.push(eq(processoAdministrativo.status, filters.status));
		}

		if (filters?.dataOcorrenciaInicio) {
			conditions.push(gte(processoAdministrativo.dataOcorrencia, filters.dataOcorrenciaInicio));
		}

		if (filters?.dataOcorrenciaFim) {
			conditions.push(lte(processoAdministrativo.dataOcorrencia, filters.dataOcorrenciaFim));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [result] = await db
			.select({ count: count() })
			.from(processoAdministrativo)
			.where(whereClause);

		return result.count;
	}

	async update(id: string, data: ProcessoAdministrativoUpdateInput) {
		const [result] = await db
			.update(processoAdministrativo)
			.set({
				...data,
				arquivos: data.arquivos ? JSON.stringify(data.arquivos) : undefined,
				updatedAt: new Date().toISOString()
			})
			.where(eq(processoAdministrativo.id, id))
			.returning();
		return result;
	}

	async resolver(id: string, resultado: string, valorMulta?: number) {
		return this.update(id, {
			status: 'resolvido',
			resultado,
			valorMulta,
			dataResolucao: new Date().toISOString()
		});
	}

	async encaminharParaJustica(id: string, observacoes?: string) {
		return this.update(id, {
			status: 'encaminhado_justica',
			observacoes
		});
	}

	async delete(id: string) {
		const [result] = await db
			.delete(processoAdministrativo)
			.where(eq(processoAdministrativo.id, id))
			.returning();
		return result;
	}

	async exists(id: string) {
		const [result] = await db
			.select({ id: processoAdministrativo.id })
			.from(processoAdministrativo)
			.where(eq(processoAdministrativo.id, id))
			.limit(1);
		return !!result;
	}
}

export const processoAdministrativoRepository = new ProcessoAdministrativoRepository();
