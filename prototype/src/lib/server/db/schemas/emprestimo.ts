import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { cliente } from './cliente';
import { professor } from './professor';
import { item } from './item';
import { processoAdministrativo } from './processoAdministrativo';

export const emprestimo = sqliteTable('emprestimo', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	itemId: text('item_id')
		.notNull()
		.references(() => item.id, { onDelete: 'cascade' }),
	solicitanteId: text('solicitante_id')
		.notNull()
		.references(() => cliente.id, { onDelete: 'cascade' }),
	professorAutorizadorId: text('professor_autorizador_id')
		.references(() => professor.id, { onDelete: 'set null' }),
	dataInicio: text('data_inicio').notNull(), // ISO date string
	dataDevolucaoPrevista: text('data_devolucao_prevista').notNull(), // ISO date string
	dataDevolucaoReal: text('data_devolucao_real'),
	status: text('status')
		.notNull()
		.default('ativo'), // ativo, devolvido, atrasado, cancelado
	// Rastreio
	pessoaQuePegou: text('pessoa_que_pegou'), // Nome da pessoa física que pegou
	salaQuePegou: text('sala_que_pegou'), // Sala onde foi retirado
	localizacaoAtual: text('localizacao_atual'), // Onde está atualmente
	observacoes: text('observacoes'),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const emprestimoRelations = relations(emprestimo, ({ one, many }) => ({
	item: one(item, {
		fields: [emprestimo.itemId],
		references: [item.id]
	}),
	solicitante: one(cliente, {
		fields: [emprestimo.solicitanteId],
		references: [cliente.id]
	}),
	professorAutorizador: one(professor, {
		fields: [emprestimo.professorAutorizadorId],
		references: [professor.id],
		relationName: 'professorAutorizador'
	}),
	processosAdministrativos: many(processoAdministrativo)
}));
