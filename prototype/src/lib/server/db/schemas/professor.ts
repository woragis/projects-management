import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { cliente } from './cliente';

export const professor = sqliteTable('professor', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	clienteId: text('cliente_id')
		.notNull()
		.references(() => cliente.id, { onDelete: 'cascade' }),
	matricula: text('matricula').notNull().unique(),
	departamento: text('departamento'),
	cargo: text('cargo'), // Ex: Professor Titular, Professor Adjunto, etc
	ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const professorRelations = relations(professor, ({ one }) => ({
	cliente: one(cliente, {
		fields: [professor.clienteId],
		references: [cliente.id]
	})
}));
