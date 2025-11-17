import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const { cpf, rg, dataNascimento, nomeCompleto, email, telefone, whatsapp, endereco, senha, fotoPerfil } = body;

		// Validações básicas
		if (!cpf || !rg || !dataNascimento || !nomeCompleto) {
			return json({ error: 'CPF, RG, data de nascimento e nome completo são obrigatórios' }, { status: 400 });
		}

		// Verificar se CPF já existe
		const usuarioExistente = await usuarioRepository.findByCpf(cpf);
		if (usuarioExistente) {
			return json({ error: 'CPF já cadastrado' }, { status: 400 });
		}

		// Verificar se RG já existe
		const rgExistente = await usuarioRepository.findByRg(rg);
		if (rgExistente) {
			return json({ error: 'RG já cadastrado' }, { status: 400 });
		}

		// Criar usuário (primeiro usuário será super_admin)
		const usuario = await usuarioRepository.create({
			cpf,
			rg,
			dataNascimento,
			nomeCompleto,
			email,
			telefone,
			whatsapp,
			endereco,
			fotoPerfil,
			role: undefined // O repository define automaticamente (super_admin se primeiro, senão aluno)
		});

		// TODO: Armazenar senha de forma segura
		// Por enquanto, não estamos armazenando senha
		// Em produção, usar bcrypt ou similar

		// Criar sessão automaticamente após registro
		cookies.set('session', usuario.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 dias
		});

		// Retornar dados do usuário
		const { ...userData } = usuario;
		return json({ 
			data: userData,
			message: 'Registro realizado com sucesso'
		}, { status: 201 });
	} catch (error: any) {
		console.error('Register error:', error);
		return json({ error: error.message || 'Erro ao registrar' }, { status: 500 });
	}
};
