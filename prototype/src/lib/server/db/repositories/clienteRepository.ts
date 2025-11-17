import { db } from '../index';
import { cliente } from '../schemas/cliente';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';

export interface ClienteCreateInput {
	cpf: string;
	rg: string;
	dataNascimento: string;
	nomeCompleto: string;
	fotoPerfil?: string;
	email?: string;
	telefone?: string;
	whatsapp?: string;
	endereco?: string;
}

export interface ClienteUpdateInput {
	cpf?: string;
	rg?: string;
	dataNascimento?: string;
	nomeCompleto?: string;
	fotoPerfil?: string;
	email?: string;
	telefone?: string;
	whatsapp?: string;
	endereco?: string;
}

export interface ClienteFilters {
	nome?: string;
	cpf?: string;
	rg?: string;
	email?: string;
	telefone?: string;
	limit?: number;
	offset?: number;
	sortBy?: 'nomeCompleto' | 'createdAt' | 'cpf';
	sortOrder?: 'asc' | 'desc';
}

export class ClienteRepository {
	async create(data: ClienteCreateInput) {
		const [result] = await db
			.insert(cliente)
			.values({
				...data,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			})
			.returning();
		return result;
	}

	async findById(id: string) {
		const [result] = await db.select().from(cliente).where(eq(cliente.id, id)).limit(1);
		return result;
	}

	async findByCpf(cpf: string) {
		const [result] = await db.select().from(cliente).where(eq(cliente.cpf, cpf)).limit(1);
		return result;
	}

	async findByRg(rg: string) {
		const [result] = await db.select().from(cliente).where(eq(cliente.rg, rg)).limit(1);
		return result;
	}

	async findAll(filters?: ClienteFilters) {
		const conditions = [];

		if (filters?.nome) {
			conditions.push(like(cliente.nomeCompleto, `%${filters.nome}%`));
		}

		if (filters?.cpf) {
			conditions.push(eq(cliente.cpf, filters.cpf));
		}

		if (filters?.rg) {
			conditions.push(eq(cliente.rg, filters.rg));
		}

		if (filters?.email) {
			conditions.push(like(cliente.email, `%${filters.email}%`));
		}

		if (filters?.telefone) {
			conditions.push(
				or(
					like(cliente.telefone, `%${filters.telefone}%`),
					like(cliente.whatsapp, `%${filters.telefone}%`)
				)
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let query = db.select().from(cliente);

		if (whereClause) {
			query = query.where(whereClause);
		}

		// Sorting
		if (filters?.sortBy) {
			const sortColumn =
				filters.sortBy === 'nomeCompleto'
					? cliente.nomeCompleto
					: filters.sortBy === 'cpf'
						? cliente.cpf
						: cliente.createdAt;

			query = filters.sortOrder === 'desc' 
				? query.orderBy(desc(sortColumn))
				: query.orderBy(asc(sortColumn));
		} else {
			query = query.orderBy(desc(cliente.createdAt));
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

	async count(filters?: Omit<ClienteFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>) {
		const conditions = [];

		if (filters?.nome) {
			conditions.push(like(cliente.nomeCompleto, `%${filters.nome}%`));
		}

		if (filters?.cpf) {
			conditions.push(eq(cliente.cpf, filters.cpf));
		}

		if (filters?.rg) {
			conditions.push(eq(cliente.rg, filters.rg));
		}

		if (filters?.email) {
			conditions.push(like(cliente.email, `%${filters.email}%`));
		}

		if (filters?.telefone) {
			conditions.push(
				or(
					like(cliente.telefone, `%${filters.telefone}%`),
					like(cliente.whatsapp, `%${filters.telefone}%`)
				)
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [result] = await db
			.select({ count: count() })
			.from(cliente)
			.where(whereClause);

		return result.count;
	}

	async update(id: string, data: ClienteUpdateInput) {
		const [result] = await db
			.update(cliente)
			.set({
				...data,
				updatedAt: new Date().toISOString()
			})
			.where(eq(cliente.id, id))
			.returning();
		return result;
	}

	async delete(id: string) {
		const [result] = await db.delete(cliente).where(eq(cliente.id, id)).returning();
		return result;
	}

	async exists(id: string) {
		const [result] = await db
			.select({ id: cliente.id })
			.from(cliente)
			.where(eq(cliente.id, id))
			.limit(1);
		return !!result;
	}
}

export const clienteRepository = new ClienteRepository();
