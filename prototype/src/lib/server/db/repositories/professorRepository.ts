import { db } from '../index';
import { professor, usuario } from '../schemas';
import { eq, and, like, desc, asc, count } from 'drizzle-orm';

export interface ProfessorCreateInput {
	usuarioId: string;
	matricula: string;
	departamento?: string;
	cargo?: string;
	ativo?: boolean;
}

export interface ProfessorUpdateInput {
	matricula?: string;
	departamento?: string;
	cargo?: string;
	ativo?: boolean;
}

export interface ProfessorFilters {
	nome?: string;
	matricula?: string;
	departamento?: string;
	cargo?: string;
	ativo?: boolean;
	limit?: number;
	offset?: number;
	sortBy?: 'nomeCompleto' | 'matricula' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
}

export class ProfessorRepository {
	async create(data: ProfessorCreateInput) {
		const [result] = await db
			.insert(professor)
			.values({
				...data,
				ativo: data.ativo ?? true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			})
			.returning();
		return result;
	}

	async findById(id: string) {
		const [result] = await db
			.select({
				professor: professor,
				usuario: usuario
			})
			.from(professor)
			.innerJoin(usuario, eq(professor.usuarioId, usuario.id))
			.where(eq(professor.id, id))
			.limit(1);
		return result;
	}

	async findByMatricula(matricula: string) {
		const [result] = await db
			.select()
			.from(professor)
			.where(eq(professor.matricula, matricula))
			.limit(1);
		return result;
	}

	async findByUsuarioId(usuarioId: string) {
		const [result] = await db
			.select()
			.from(professor)
			.where(eq(professor.usuarioId, usuarioId))
			.limit(1);
		return result;
	}

	async findAll(filters?: ProfessorFilters) {
		const conditions = [];

		if (filters?.matricula) {
			conditions.push(eq(professor.matricula, filters.matricula));
		}

		if (filters?.departamento) {
			conditions.push(like(professor.departamento, `%${filters.departamento}%`));
		}

		if (filters?.cargo) {
			conditions.push(like(professor.cargo, `%${filters.cargo}%`));
		}

		if (filters?.ativo !== undefined) {
			conditions.push(eq(professor.ativo, filters.ativo));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let query = db
			.select({
				professor: professor,
				usuario: usuario
			})
			.from(professor)
			.innerJoin(usuario, eq(professor.usuarioId, usuario.id));

		if (whereClause) {
			query = query.where(whereClause);
		}

		// Filter by usuario nome if provided
		if (filters?.nome) {
			query = query.where(
				and(
					whereClause || undefined,
					like(usuario.nomeCompleto, `%${filters.nome}%`)
				)
			);
		}

		// Sorting
		if (filters?.sortBy) {
			const sortColumn =
				filters.sortBy === 'nomeCompleto'
					? usuario.nomeCompleto
					: filters.sortBy === 'matricula'
						? professor.matricula
						: professor.createdAt;

			query = filters.sortOrder === 'desc' 
				? query.orderBy(desc(sortColumn))
				: query.orderBy(asc(sortColumn));
		} else {
			query = query.orderBy(desc(professor.createdAt));
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

	async count(filters?: Omit<ProfessorFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>) {
		const conditions = [];

		if (filters?.matricula) {
			conditions.push(eq(professor.matricula, filters.matricula));
		}

		if (filters?.departamento) {
			conditions.push(like(professor.departamento, `%${filters.departamento}%`));
		}

		if (filters?.cargo) {
			conditions.push(like(professor.cargo, `%${filters.cargo}%`));
		}

		if (filters?.ativo !== undefined) {
			conditions.push(eq(professor.ativo, filters.ativo));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let countQuery = db.select({ count: count() }).from(professor);

		if (filters?.nome) {
			countQuery = db
				.select({ count: count() })
				.from(professor)
				.innerJoin(usuario, eq(professor.usuarioId, usuario.id))
				.where(
					and(
						whereClause || undefined,
						like(usuario.nomeCompleto, `%${filters.nome}%`)
					)
				);
		} else if (whereClause) {
			countQuery = countQuery.where(whereClause);
		}

		const [result] = await countQuery;
		return result.count;
	}

	async update(id: string, data: ProfessorUpdateInput) {
		const [result] = await db
			.update(professor)
			.set({
				...data,
				updatedAt: new Date().toISOString()
			})
			.where(eq(professor.id, id))
			.returning();
		return result;
	}

	async delete(id: string) {
		const [result] = await db.delete(professor).where(eq(professor.id, id)).returning();
		return result;
	}

	async exists(id: string) {
		const [result] = await db
			.select({ id: professor.id })
			.from(professor)
			.where(eq(professor.id, id))
			.limit(1);
		return !!result;
	}
}

export const professorRepository = new ProfessorRepository();
