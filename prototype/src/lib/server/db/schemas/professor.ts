import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usuario } from './usuario';

export const professor = pgTable('professor', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	usuarioId: text('usuario_id')
		.notNull()
		.references(() => usuario.id, { onDelete: 'cascade' }),
	matricula: text('matricula').notNull().unique(),
	departamento: text('departamento'),
	cargo: text('cargo'), // Ex: Professor Titular, Professor Adjunto, etc
	ativo: boolean('ativo').notNull().default(true),
	createdAt: timestamp('created_at')
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
});

export const professorRelations = relations(professor, ({ one }) => ({
	usuario: one(usuario, {
		fields: [professor.usuarioId],
		references: [usuario.id]
	})
}));
