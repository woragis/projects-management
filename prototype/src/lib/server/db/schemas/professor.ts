import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { usuario } from './usuario';

export const professor = sqliteTable('professor', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	usuarioId: text('usuario_id')
		.notNull()
		.references(() => usuario.id, { onDelete: 'cascade' }),
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
	usuario: one(usuario, {
		fields: [professor.usuarioId],
		references: [usuario.id]
	})
}));
