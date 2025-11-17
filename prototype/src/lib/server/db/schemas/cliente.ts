import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cliente = sqliteTable('cliente', {
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
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});
