import { db } from '../index';
import { emprestimo, item, usuario, professor } from '../schemas';
import { eq, and, or, desc, asc, count, gte, lte, like } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export interface EmprestimoCreateInput {
	itemId: string;
	solicitanteId: string;
	professorAutorizadorId?: string;
	adminAprovadorId?: string;
	statusAprovacao?: 'pendente' | 'aprovado' | 'rejeitado';
	dataInicio: string;
	dataDevolucaoPrevista: string;
	pessoaQuePegou?: string;
	salaQuePegou?: string;
	localizacaoAtual?: string;
	observacoes?: string;
}

export interface EmprestimoUpdateInput {
	itemId?: string;
	dataDevolucaoPrevista?: string;
	dataDevolucaoReal?: string;
	status?: 'ativo' | 'devolvido' | 'atrasado' | 'cancelado';
	statusAprovacao?: 'pendente' | 'aprovado' | 'rejeitado';
	professorAutorizadorId?: string;
	adminAprovadorId?: string;
	pessoaQuePegou?: string;
	salaQuePegou?: string;
	localizacaoAtual?: string;
	observacoes?: string;
}

export interface EmprestimoFilters {
	solicitanteId?: string;
	itemId?: string;
	professorAutorizadorId?: string;
	status?: 'ativo' | 'devolvido' | 'atrasado' | 'cancelado';
	statusAprovacao?: 'pendente' | 'aprovado' | 'rejeitado';
	dataInicioInicio?: string; // data inicial do período
	dataInicioFim?: string; // data final do período
	atrasados?: boolean; // apenas emprestimos atrasados
	search?: string; // busca por nome do item ou solicitante
	limit?: number;
	offset?: number;
	sortBy?: 'dataInicio' | 'dataDevolucaoPrevista' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
}

export class EmprestimoRepository {
	async create(data: EmprestimoCreateInput) {
		const [result] = await db
			.insert(emprestimo)
			.values({
				...data,
				status: 'ativo',
				statusAprovacao: data.statusAprovacao || 'pendente'
				// createdAt and updatedAt are handled by .defaultNow() in the schema
			})
			.returning();
		return result;
	}

	async findById(id: string) {
		// Criar alias para usuario do professor
		const usuarioProfessor = alias(usuario, 'usuario_professor');
		
		const [result] = await db
			.select({
				emprestimo: emprestimo,
				item: item,
				solicitante: usuario,
				professorAutorizador: professor,
				usuarioProfessor: usuarioProfessor
			})
			.from(emprestimo)
			.innerJoin(item, eq(emprestimo.itemId, item.id))
			.innerJoin(usuario, eq(emprestimo.solicitanteId, usuario.id))
			.leftJoin(professor, eq(emprestimo.professorAutorizadorId, professor.id))
			.leftJoin(usuarioProfessor, eq(professor.usuarioId, usuarioProfessor.id))
			.where(eq(emprestimo.id, id))
			.limit(1);
		
		// Buscar admin aprovador se existir
		if (result?.emprestimo.adminAprovadorId) {
			const admin = await db.select().from(usuario).where(eq(usuario.id, result.emprestimo.adminAprovadorId)).limit(1);
			return { ...result, adminAprovador: admin[0] || null };
		}
		
		return result;
	}

	async findBySolicitante(solicitanteId: string, apenasAtivos = false) {
		const conditions = [eq(emprestimo.solicitanteId, solicitanteId)];

		if (apenasAtivos) {
			conditions.push(eq(emprestimo.status, 'ativo'));
		}

		return db
			.select({
				emprestimo: emprestimo,
				item: item,
				professorAutorizador: professor
			})
			.from(emprestimo)
			.innerJoin(item, eq(emprestimo.itemId, item.id))
			.leftJoin(professor, eq(emprestimo.professorAutorizadorId, professor.id))
			.where(and(...conditions))
			.orderBy(desc(emprestimo.dataInicio));
	}

	async countAtivosPorSolicitante(solicitanteId: string) {
		const [result] = await db
			.select({ count: count() })
			.from(emprestimo)
			.where(
				and(
					eq(emprestimo.solicitanteId, solicitanteId),
					eq(emprestimo.status, 'ativo')
				)
			);
		return result.count;
	}

	async findAll(filters?: EmprestimoFilters) {
		const conditions = [];

		if (filters?.solicitanteId) {
			conditions.push(eq(emprestimo.solicitanteId, filters.solicitanteId));
		}

		if (filters?.itemId) {
			conditions.push(eq(emprestimo.itemId, filters.itemId));
		}

		if (filters?.professorAutorizadorId) {
			conditions.push(eq(emprestimo.professorAutorizadorId, filters.professorAutorizadorId));
		}

		if (filters?.status) {
			conditions.push(eq(emprestimo.status, filters.status));
		}

		if (filters?.statusAprovacao) {
			conditions.push(eq(emprestimo.statusAprovacao, filters.statusAprovacao));
		}

		if (filters?.dataInicioInicio) {
			conditions.push(gte(emprestimo.dataInicio, filters.dataInicioInicio));
		}

		if (filters?.dataInicioFim) {
			conditions.push(lte(emprestimo.dataInicio, filters.dataInicioFim));
		}

		// Empréstimos atrasados: status ativo e data de devolução prevista < hoje
		if (filters?.atrasados) {
			const hoje = new Date().toISOString().split('T')[0];
			conditions.push(
				and(
					eq(emprestimo.status, 'ativo'),
					lte(emprestimo.dataDevolucaoPrevista, hoje)
				)
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Criar alias para usuario do professor
		const usuarioProfessor = alias(usuario, 'usuario_professor');
		
		let query = db
			.select({
				emprestimo: emprestimo,
				item: item,
				solicitante: usuario,
				professorAutorizador: professor,
				usuarioProfessor: usuarioProfessor
			})
			.from(emprestimo)
			.innerJoin(item, eq(emprestimo.itemId, item.id))
			.innerJoin(usuario, eq(emprestimo.solicitanteId, usuario.id))
			.leftJoin(professor, eq(emprestimo.professorAutorizadorId, professor.id))
			.leftJoin(usuarioProfessor, eq(professor.usuarioId, usuarioProfessor.id));

		// Busca por texto (nome do item ou solicitante)
		if (filters?.search) {
			const searchConditions = [
				like(item.nome, `%${filters.search}%`),
				like(usuario.nomeCompleto, `%${filters.search}%`)
			];
			const searchClause = or(...searchConditions);
			
			if (whereClause) {
				query = query.where(and(whereClause, searchClause));
			} else {
				query = query.where(searchClause);
			}
		} else if (whereClause) {
			query = query.where(whereClause);
		}

		// Sorting
		if (filters?.sortBy) {
			const sortColumn =
				filters.sortBy === 'dataInicio'
					? emprestimo.dataInicio
					: filters.sortBy === 'dataDevolucaoPrevista'
						? emprestimo.dataDevolucaoPrevista
						: emprestimo.createdAt;

			query = filters.sortOrder === 'desc' 
				? query.orderBy(desc(sortColumn))
				: query.orderBy(asc(sortColumn));
		} else {
			query = query.orderBy(desc(emprestimo.createdAt));
		}

		// Pagination
		if (filters?.limit) {
			query = query.limit(filters.limit);
		}

		if (filters?.offset) {
			query = query.offset(filters.offset);
		}

		return await query;
	}

	async findAtrasados() {
		try {
			const hoje = new Date().toISOString().split('T')[0];
			const usuarioProfessor = alias(usuario, 'usuario_professor');
			
			return await db
				.select({
					emprestimo: emprestimo,
					item: item,
					solicitante: usuario,
					professorAutorizador: professor,
					usuarioProfessor: usuarioProfessor
				})
				.from(emprestimo)
				.innerJoin(item, eq(emprestimo.itemId, item.id))
				.innerJoin(usuario, eq(emprestimo.solicitanteId, usuario.id))
				.leftJoin(professor, eq(emprestimo.professorAutorizadorId, professor.id))
				.leftJoin(usuarioProfessor, eq(professor.usuarioId, usuarioProfessor.id))
				.where(
					and(
						eq(emprestimo.status, 'ativo'),
						lte(emprestimo.dataDevolucaoPrevista, hoje)
					)
				)
				.orderBy(asc(emprestimo.dataDevolucaoPrevista));
		} catch (error) {
			console.error('Error finding atrasados:', error);
			return [];
		}
	}

	async findProximosAVencer(diasAntecedencia = 1) {
		const dataLimite = new Date();
		dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);
		const dataLimiteStr = dataLimite.toISOString().split('T')[0];

		const hoje = new Date().toISOString().split('T')[0];
		const usuarioProfessor = alias(usuario, 'usuario_professor');

		return db
			.select({
				emprestimo: emprestimo,
				item: item,
				solicitante: usuario,
				professorAutorizador: professor,
				usuarioProfessor: usuarioProfessor
			})
			.from(emprestimo)
			.innerJoin(item, eq(emprestimo.itemId, item.id))
			.innerJoin(usuario, eq(emprestimo.solicitanteId, usuario.id))
			.leftJoin(professor, eq(emprestimo.professorAutorizadorId, professor.id))
			.leftJoin(usuarioProfessor, eq(professor.usuarioId, usuarioProfessor.id))
			.where(
				and(
					eq(emprestimo.status, 'ativo'),
					gte(emprestimo.dataDevolucaoPrevista, hoje),
					lte(emprestimo.dataDevolucaoPrevista, dataLimiteStr)
				)
			)
			.orderBy(asc(emprestimo.dataDevolucaoPrevista));
	}

	async count(filters?: Omit<EmprestimoFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>) {
		const conditions = [];

		if (filters?.solicitanteId) {
			conditions.push(eq(emprestimo.solicitanteId, filters.solicitanteId));
		}

		if (filters?.itemId) {
			conditions.push(eq(emprestimo.itemId, filters.itemId));
		}

		if (filters?.professorAutorizadorId) {
			conditions.push(eq(emprestimo.professorAutorizadorId, filters.professorAutorizadorId));
		}

		if (filters?.status) {
			conditions.push(eq(emprestimo.status, filters.status));
		}

		if (filters?.statusAprovacao) {
			conditions.push(eq(emprestimo.statusAprovacao, filters.statusAprovacao));
		}

		if (filters?.dataInicioInicio) {
			conditions.push(gte(emprestimo.dataInicio, filters.dataInicioInicio));
		}

		if (filters?.dataInicioFim) {
			conditions.push(lte(emprestimo.dataInicio, filters.dataInicioFim));
		}

		if (filters?.atrasados) {
			const hoje = new Date().toISOString().split('T')[0];
			conditions.push(
				and(
					eq(emprestimo.status, 'ativo'),
					lte(emprestimo.dataDevolucaoPrevista, hoje)
				)
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Se houver busca por texto, precisa fazer join com item e usuario
		if (filters?.search) {
			const searchConditions = [
				like(item.nome, `%${filters.search}%`),
				like(usuario.nomeCompleto, `%${filters.search}%`)
			];
			const searchClause = or(...searchConditions);
			
			const finalWhere = whereClause ? and(whereClause, searchClause) : searchClause;
			
			const [result] = await db
				.select({ count: count() })
				.from(emprestimo)
				.innerJoin(item, eq(emprestimo.itemId, item.id))
				.innerJoin(usuario, eq(emprestimo.solicitanteId, usuario.id))
				.where(finalWhere);
			
			return result.count;
		}

		const [result] = await db
			.select({ count: count() })
			.from(emprestimo)
			.where(whereClause);

		return result.count;
	}

	async update(id: string, data: EmprestimoUpdateInput) {
		const [result] = await db
			.update(emprestimo)
			.set({
				...data,
				updatedAt: new Date() // Use Date object, not ISO string
			})
			.where(eq(emprestimo.id, id))
			.returning();
		return result;
	}

	async devolver(id: string, dataDevolucaoReal?: string) {
		return this.update(id, {
			status: 'devolvido',
			dataDevolucaoReal: dataDevolucaoReal || new Date().toISOString()
		});
	}

	async cancelar(id: string) {
		return this.update(id, {
			status: 'cancelado'
		});
	}

	async marcarComoAtrasado(id: string) {
		return this.update(id, {
			status: 'atrasado'
		});
	}

	async atualizarStatusAtrasados() {
		const hoje = new Date().toISOString().split('T')[0];
		const result = await db
			.update(emprestimo)
			.set({
				status: 'atrasado',
				updatedAt: new Date() // Use Date object, not ISO string
			})
			.where(
				and(
					eq(emprestimo.status, 'ativo'),
					lte(emprestimo.dataDevolucaoPrevista, hoje)
				)
			)
			.returning();
		return result;
	}

	async delete(id: string) {
		const [result] = await db.delete(emprestimo).where(eq(emprestimo.id, id)).returning();
		return result;
	}

	async exists(id: string) {
		const [result] = await db
			.select({ id: emprestimo.id })
			.from(emprestimo)
			.where(eq(emprestimo.id, id))
			.limit(1);
		return !!result;
	}
}

export const emprestimoRepository = new EmprestimoRepository();
