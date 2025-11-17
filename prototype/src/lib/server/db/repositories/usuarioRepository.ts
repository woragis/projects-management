import { db } from '../index';
import { usuario, type UserRole } from '../schemas/usuario';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';
import { DatabaseError } from '../../errors';
import { normalizeCpf } from '../../utils/cpf';

export interface UsuarioCreateInput {
	cpf: string;
	rg: string;
	dataNascimento: string;
	nomeCompleto: string;
	fotoPerfil?: string;
	email?: string;
	telefone?: string;
	whatsapp?: string;
	endereco?: string;
	senhaHash?: string | null;
	role?: UserRole;
}

export interface UsuarioUpdateInput {
	cpf?: string;
	rg?: string;
	dataNascimento?: string;
	nomeCompleto?: string;
	fotoPerfil?: string;
	email?: string;
	telefone?: string;
	whatsapp?: string;
	endereco?: string;
	role?: UserRole;
	solicitacaoProfessor?: boolean;
}

export interface UsuarioFilters {
	nome?: string;
	cpf?: string;
	rg?: string;
	email?: string;
	telefone?: string;
	role?: UserRole;
	solicitacaoProfessor?: boolean;
	limit?: number;
	offset?: number;
	sortBy?: 'nomeCompleto' | 'createdAt' | 'cpf';
	sortOrder?: 'asc' | 'desc';
}

export class UsuarioRepository {
	async create(data: UsuarioCreateInput) {
		// Se é o primeiro usuário, torna-se super_admin
		const totalUsuarios = await this.count();
		const role: UserRole = data.role || (totalUsuarios === 0 ? 'super_admin' : 'aluno');

		const [result] = await db
			.insert(usuario)
			.values({
				...data,
				role,
				solicitacaoProfessor: false
				// createdAt and updatedAt are handled by .defaultNow() in the schema
			})
			.returning();
		return result;
	}

	async findById(id: string) {
		const [result] = await db.select().from(usuario).where(eq(usuario.id, id)).limit(1);
		return result;
	}

	async findByCpf(cpf: string) {
		try {
			// Normalizar CPF antes de buscar (remove formatação)
			const normalizedCpf = normalizeCpf(cpf);
			console.log('🔍 REPOSITORY findByCpf - Input:', { original: cpf, normalized: normalizedCpf });
			
			const result = await db.select().from(usuario).where(eq(usuario.cpf, normalizedCpf)).limit(1);
			
			if (result[0]) {
				console.log('🔍 REPOSITORY findByCpf - Found:', { id: result[0].id, cpfInDb: result[0].cpf });
			} else {
				console.log('🔍 REPOSITORY findByCpf - Not found, searching for:', normalizedCpf);
			}
			
			return result[0];
		} catch (error: any) {
			console.error('❌ DATABASE ERROR in findByCpf:', error);
			throw new DatabaseError(error, 'findByCpf');
		}
	}

	async findByRg(rg: string) {
		try {
			const result = await db.select().from(usuario).where(eq(usuario.rg, rg)).limit(1);
			return result[0];
		} catch (error: any) {
			console.error('❌ DATABASE ERROR in findByRg:', error);
			throw new DatabaseError(error, 'findByRg');
		}
	}

	async findByRole(role: UserRole) {
		return db.select().from(usuario).where(eq(usuario.role, role));
	}

	async findSolicitacoesProfessor() {
		return db
			.select()
			.from(usuario)
			.where(eq(usuario.solicitacaoProfessor, true))
			.orderBy(desc(usuario.createdAt));
	}

	async findAll(filters?: UsuarioFilters) {
		const conditions = [];

		if (filters?.nome) {
			conditions.push(like(usuario.nomeCompleto, `%${filters.nome}%`));
		}

		if (filters?.cpf) {
			conditions.push(eq(usuario.cpf, filters.cpf));
		}

		if (filters?.rg) {
			conditions.push(eq(usuario.rg, filters.rg));
		}

		if (filters?.email) {
			conditions.push(like(usuario.email, `%${filters.email}%`));
		}

		if (filters?.telefone) {
			conditions.push(
				or(
					like(usuario.telefone, `%${filters.telefone}%`),
					like(usuario.whatsapp, `%${filters.telefone}%`)
				)
			);
		}

		if (filters?.role) {
			conditions.push(eq(usuario.role, filters.role));
		}

		if (filters?.solicitacaoProfessor !== undefined) {
			conditions.push(eq(usuario.solicitacaoProfessor, filters.solicitacaoProfessor));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		let query = db.select().from(usuario);

		if (whereClause) {
			query = query.where(whereClause);
		}

		// Sorting
		if (filters?.sortBy) {
			const sortColumn =
				filters.sortBy === 'nomeCompleto'
					? usuario.nomeCompleto
					: filters.sortBy === 'cpf'
						? usuario.cpf
						: usuario.createdAt;

			query = filters.sortOrder === 'desc' 
				? query.orderBy(desc(sortColumn))
				: query.orderBy(asc(sortColumn));
		} else {
			query = query.orderBy(desc(usuario.createdAt));
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

	async count(filters?: Omit<UsuarioFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>) {
		const conditions = [];

		if (filters?.nome) {
			conditions.push(like(usuario.nomeCompleto, `%${filters.nome}%`));
		}

		if (filters?.cpf) {
			conditions.push(eq(usuario.cpf, filters.cpf));
		}

		if (filters?.rg) {
			conditions.push(eq(usuario.rg, filters.rg));
		}

		if (filters?.email) {
			conditions.push(like(usuario.email, `%${filters.email}%`));
		}

		if (filters?.telefone) {
			conditions.push(
				or(
					like(usuario.telefone, `%${filters.telefone}%`),
					like(usuario.whatsapp, `%${filters.telefone}%`)
				)
			);
		}

		if (filters?.role) {
			conditions.push(eq(usuario.role, filters.role));
		}

		if (filters?.solicitacaoProfessor !== undefined) {
			conditions.push(eq(usuario.solicitacaoProfessor, filters.solicitacaoProfessor));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [result] = await db
			.select({ count: count() })
			.from(usuario)
			.where(whereClause);

		return result.count;
	}

	async update(id: string, data: UsuarioUpdateInput) {
		const [result] = await db
			.update(usuario)
			.set({
				...data,
				updatedAt: new Date() // Use Date object, not ISO string
			})
			.where(eq(usuario.id, id))
			.returning();
		return result;
	}

	async delete(id: string) {
		const [result] = await db.delete(usuario).where(eq(usuario.id, id)).returning();
		return result;
	}

	async exists(id: string) {
		const [result] = await db
			.select({ id: usuario.id })
			.from(usuario)
			.where(eq(usuario.id, id))
			.limit(1);
		return !!result;
	}

	async solicitarVirarProfessor(id: string) {
		return this.update(id, { solicitacaoProfessor: true });
	}

	async aprovarProfessor(id: string) {
		return this.update(id, { 
			role: 'professor', 
			solicitacaoProfessor: false 
		});
	}

	async rejeitarSolicitacaoProfessor(id: string) {
		return this.update(id, { solicitacaoProfessor: false });
	}
}

export const usuarioRepository = new UsuarioRepository();