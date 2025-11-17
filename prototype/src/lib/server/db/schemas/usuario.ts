import { pgTable, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export type UserRole = 'super_admin' | 'admin' | 'professor' | 'aluno';

export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'professor', 'aluno']);

export const usuario = pgTable('usuario', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	cpf: text('cpf').notNull().unique(),
	rg: text('rg').notNull().unique(),
	dataNascimento: text('data_nascimento').notNull(), // ISO date string
	nomeCompleto: text('nome_completo').notNull(),
	fotoPerfil: text('foto_perfil'), // URL ou path da imagem
	email: text('email'),
	telefone: text('telefone'),
	whatsapp: text('whatsapp'),
	endereco: text('endereco'),
	senhaHash: text('senha_hash'),
	role: userRoleEnum('role')
		.notNull()
		.default('aluno'),
	solicitacaoProfessor: boolean('solicitacao_professor')
		.notNull()
		.default(false), // Aluno pediu para virar professor
	createdAt: timestamp('created_at')
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
});
