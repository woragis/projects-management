import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { emprestimo } from './emprestimo';

export const item = pgTable('item', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nome: text('nome').notNull(),
	descricao: text('descricao'),
	categoria: text('categoria'), // Ex: Equipamento, Livro, Material Didático, etc
	codigoPatrimonio: text('codigo_patrimonio').unique(),
	disponivel: boolean('disponivel').notNull().default(true),
	condicao: text('condicao').notNull().default('bom'), // bom, regular, ruim
	foto: text('foto'), // URL ou path da imagem
	localizacao: text('localizacao'), // Sala ou local onde o item está armazenado
	tags: text('tags'), // JSON array de tags para busca
	createdAt: timestamp('created_at')
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
});

export const itemRelations = relations(item, ({ many }) => ({
	emprestimos: many(emprestimo)
}));
