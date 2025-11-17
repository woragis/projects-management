import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { emprestimo } from './emprestimo';
import { cliente } from './cliente';

export const processoAdministrativo = sqliteTable('processo_administrativo', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	emprestimoId: text('emprestimo_id')
		.references(() => emprestimo.id, { onDelete: 'set null' }),
	clienteId: text('cliente_id')
		.notNull()
		.references(() => cliente.id, { onDelete: 'cascade' }),
	tipo: text('tipo').notNull(), // perda, quebra, mas_condicoes, roubo
	descricao: text('descricao').notNull(),
	status: text('status')
		.notNull()
		.default('aberto'), // aberto, em_andamento, resolvido, encaminhado_justica
	resultado: text('resultado'), // demissao, processo_judicial, multa, absolvido, etc
	valorMulta: integer('valor_multa'), // em centavos
	dataOcorrencia: text('data_ocorrencia').notNull(), // ISO date string
	dataResolucao: text('data_resolucao'),
	observacoes: text('observacoes'),
	arquivos: text('arquivos'), // JSON array de URLs/paths de documentos
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const processoAdministrativoRelations = relations(processoAdministrativo, ({ one }) => ({
	emprestimo: one(emprestimo, {
		fields: [processoAdministrativo.emprestimoId],
		references: [emprestimo.id]
	}),
	cliente: one(cliente, {
		fields: [processoAdministrativo.clienteId],
		references: [cliente.id]
	})
}));
