import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usuario } from './usuario';
import { professor } from './professor';
import { item } from './item';
import { processoAdministrativo } from './processoAdministrativo';

export const emprestimo = pgTable('emprestimo', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	itemId: text('item_id')
		.notNull()
		.references(() => item.id, { onDelete: 'cascade' }),
	solicitanteId: text('solicitante_id')
		.notNull()
		.references(() => usuario.id, { onDelete: 'cascade' }),
	professorAutorizadorId: text('professor_autorizador_id')
		.references(() => professor.id, { onDelete: 'set null' }),
	statusAprovacao: text('status_aprovacao')
		.notNull()
		.default('pendente'), // pendente, aprovado, rejeitado
	adminAprovadorId: text('admin_aprovador_id')
		.references(() => usuario.id, { onDelete: 'set null' }),
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
	createdAt: timestamp('created_at')
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
});

export const emprestimoRelations = relations(emprestimo, ({ one, many }) => ({
	item: one(item, {
		fields: [emprestimo.itemId],
		references: [item.id]
	}),
	solicitante: one(usuario, {
		fields: [emprestimo.solicitanteId],
		references: [usuario.id]
	}),
	professorAutorizador: one(professor, {
		fields: [emprestimo.professorAutorizadorId],
		references: [professor.id],
		relationName: 'professorAutorizador'
	}),
	adminAprovador: one(usuario, {
		fields: [emprestimo.adminAprovadorId],
		references: [usuario.id],
		relationName: 'adminAprovador'
	}),
	processosAdministrativos: many(processoAdministrativo)
}));
