import { db } from '../index';
import { item } from '../schemas';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';

export interface ItemCreateInput {
	nome: string;
	descricao?: string;
	categoria?: string;
	codigoPatrimonio?: string;
	disponivel?: boolean;
	condicao?: 'bom' | 'regular' | 'ruim';
	foto?: string;
	localizacao?: string;
	tags?: string[];
}

export interface ItemUpdateInput {
	nome?: string;
	descricao?: string;
	categoria?: string;
	codigoPatrimonio?: string;
	disponivel?: boolean;
	condicao?: 'bom' | 'regular' | 'ruim';
	foto?: string;
	localizacao?: string;
	tags?: string[];
}

export interface ItemFilters {
	nome?: string;
	categoria?: string;
	codigoPatrimonio?: string;
	disponivel?: boolean;
	condicao?: 'bom' | 'regular' | 'ruim';
	localizacao?: string;
	tag?: string; // busca por tag individual
	limit?: number;
	offset?: number;
	sortBy?: 'nome' | 'categoria' | 'createdAt' | 'condicao';
	sortOrder?: 'asc' | 'desc';
}

export class ItemRepository {
	async create(data: ItemCreateInput) {
		const [result] = await db
			.insert(item)
			.values({
				...data,
				tags: data.tags ? JSON.stringify(data.tags) : null,
				disponivel: data.disponivel ?? true,
				condicao: data.condicao ?? 'bom'
				// createdAt and updatedAt are handled by .defaultNow() in the schema
			})
			.returning();
		return result;
	}

	async findById(id: string) {
		const [result] = await db.select().from(item).where(eq(item.id, id)).limit(1);
		return result;
	}

	async findByCodigoPatrimonio(codigoPatrimonio: string) {
		const [result] = await db
			.select()
			.from(item)
			.where(eq(item.codigoPatrimonio, codigoPatrimonio))
			.limit(1);
		return result;
	}

	async findAll(filters?: ItemFilters) {
		const conditions = [];

		if (filters?.nome) {
			conditions.push(like(item.nome, `%${filters.nome}%`));
		}

		if (filters?.categoria) {
			conditions.push(like(item.categoria, `%${filters.categoria}%`));
		}

		if (filters?.codigoPatrimonio) {
			conditions.push(eq(item.codigoPatrimonio, filters.codigoPatrimonio));
		}

		if (filters?.disponivel !== undefined) {
			conditions.push(eq(item.disponivel, filters.disponivel));
		}

		if (filters?.condicao) {
			conditions.push(eq(item.condicao, filters.condicao));
		}

		if (filters?.localizacao) {
			conditions.push(like(item.localizacao, `%${filters.localizacao}%`));
		}

		if (filters?.tag) {
			conditions.push(like(item.tags, `%${filters.tag}%`));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let query = db.select().from(item);

		if (whereClause) {
			query = query.where(whereClause);
		}

		// Sorting
		if (filters?.sortBy) {
			const sortColumn =
				filters.sortBy === 'nome'
					? item.nome
					: filters.sortBy === 'categoria'
						? item.categoria
						: filters.sortBy === 'condicao'
							? item.condicao
							: item.createdAt;

			query = filters.sortOrder === 'desc' 
				? query.orderBy(desc(sortColumn))
				: query.orderBy(asc(sortColumn));
		} else {
			query = query.orderBy(desc(item.createdAt));
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

	async findDisponiveis() {
		return db.select().from(item).where(eq(item.disponivel, true));
	}

	async count(filters?: Omit<ItemFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>) {
		const conditions = [];

		if (filters?.nome) {
			conditions.push(like(item.nome, `%${filters.nome}%`));
		}

		if (filters?.categoria) {
			conditions.push(like(item.categoria, `%${filters.categoria}%`));
		}

		if (filters?.codigoPatrimonio) {
			conditions.push(eq(item.codigoPatrimonio, filters.codigoPatrimonio));
		}

		if (filters?.disponivel !== undefined) {
			conditions.push(eq(item.disponivel, filters.disponivel));
		}

		if (filters?.condicao) {
			conditions.push(eq(item.condicao, filters.condicao));
		}

		if (filters?.localizacao) {
			conditions.push(like(item.localizacao, `%${filters.localizacao}%`));
		}

		if (filters?.tag) {
			conditions.push(like(item.tags, `%${filters.tag}%`));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [result] = await db
			.select({ count: count() })
			.from(item)
			.where(whereClause);

		return result.count;
	}

	async update(id: string, data: ItemUpdateInput) {
		const [result] = await db
			.update(item)
			.set({
				...data,
				tags: data.tags ? JSON.stringify(data.tags) : undefined,
				updatedAt: new Date() // Use Date object, not ISO string
			})
			.where(eq(item.id, id))
			.returning();
		return result;
	}

	async delete(id: string) {
		const [result] = await db.delete(item).where(eq(item.id, id)).returning();
		return result;
	}

	async exists(id: string) {
		const [result] = await db
			.select({ id: item.id })
			.from(item)
			.where(eq(item.id, id))
			.limit(1);
		return !!result;
	}

	async marcarComoIndisponivel(id: string) {
		return this.update(id, { disponivel: false });
	}

	async marcarComoDisponivel(id: string) {
		return this.update(id, { disponivel: true });
	}
}

export const itemRepository = new ItemRepository();
