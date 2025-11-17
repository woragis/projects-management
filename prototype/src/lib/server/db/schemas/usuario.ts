import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export type UserRole = 'super_admin' | 'admin' | 'professor' | 'aluno';

export const usuario = sqliteTable('usuario', {
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
	role: text('role', { enum: ['super_admin', 'admin', 'professor', 'aluno'] })
		.notNull()
		.$defaultFn(() => 'aluno' as UserRole),
	solicitacaoProfessor: integer('solicitacao_professor', { mode: 'boolean' })
		.notNull()
		.default(false), // Aluno pediu para virar professor
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});
