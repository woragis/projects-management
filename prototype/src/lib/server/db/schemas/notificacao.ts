import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { usuario } from './usuario';
import { emprestimo } from './emprestimo';

export const notificacao = sqliteTable('notificacao', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	emprestimoId: text('emprestimo_id')
		.notNull()
		.references(() => emprestimo.id, { onDelete: 'cascade' }),
	destinatarioId: text('destinatario_id')
		.notNull()
		.references(() => usuario.id, { onDelete: 'cascade' }),
	tipo: text('tipo').notNull(), // email, whatsapp
	assunto: text('assunto').notNull(),
	mensagem: text('mensagem').notNull(),
	status: text('status').notNull().default('pendente'), // pendente, enviada, falha
	dataEnvio: text('data_envio'), // ISO date string - quando foi enviada
	dataAgendamento: text('data_agendamento').notNull(), // ISO date string - quando deveria ser enviada
	tentativas: integer('tentativas').notNull().default(0),
	erro: text('erro'), // Mensagem de erro se houver falha
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const notificacaoRelations = relations(notificacao, ({ one }) => ({
	emprestimo: one(emprestimo, {
		fields: [notificacao.emprestimoId],
		references: [emprestimo.id]
	}),
	destinatario: one(usuario, {
		fields: [notificacao.destinatarioId],
		references: [usuario.id]
	})
}));
