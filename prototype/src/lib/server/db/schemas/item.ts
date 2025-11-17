import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { emprestimo } from './emprestimo';

export const item = sqliteTable('item', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nome: text('nome').notNull(),
	descricao: text('descricao'),
	categoria: text('categoria'), // Ex: Equipamento, Livro, Material Didático, etc
	codigoPatrimonio: text('codigo_patrimonio').unique(),
	disponivel: integer('disponivel', { mode: 'boolean' }).notNull().default(true),
	condicao: text('condicao').notNull().default('bom'), // bom, regular, ruim
	foto: text('foto'), // URL ou path da imagem
	localizacao: text('localizacao'), // Sala ou local onde o item está armazenado
	tags: text('tags'), // JSON array de tags para busca
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const itemRelations = relations(item, ({ many }) => ({
	emprestimos: many(emprestimo)
}));
