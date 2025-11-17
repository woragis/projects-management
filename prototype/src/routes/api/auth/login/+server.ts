import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';
import { normalizeCpf } from '$lib/server/utils/cpf';
import bcrypt from 'bcrypt';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const { cpf, senha } = body;

		console.log('🔍 LOGIN - Raw input:', { cpf, cpfType: typeof cpf });

		if (!cpf || !senha) {
			return json({ error: 'CPF e senha são obrigatórios' }, { status: 400 });
		}

		// Normalizar CPF (remover formatação)
		const normalizedCpf = normalizeCpf(cpf);

		console.log('🔍 LOGIN - Normalized CPF:', { normalizedCpf });

		// Buscar usuário por CPF
		const usuario = await usuarioRepository.findByCpf(normalizedCpf);

		console.log('🔍 LOGIN - User found:', usuario ? { id: usuario.id, cpf: usuario.cpf } : 'NOT FOUND');

		if (!usuario) {
			return json({ error: 'CPF ou senha inválidos' }, { status: 401 });
		}

		// Verificar senha
		if (!usuario.senhaHash) {
			return json({ error: 'Usuário sem senha cadastrada. Por favor, redefina sua senha.' }, { status: 401 });
		}

		const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

		if (!senhaValida) {
			return json({ error: 'CPF ou senha inválidos' }, { status: 401 });
		}

		// Criar sessão (usando cookie simples)
		// Em produção, usar JWT ou session store seguro
		cookies.set('session', usuario.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 dias
		});

		// Retornar dados do usuário (sem senha)
		const { ...userData } = usuario;
		return json({ 
			data: userData,
			message: 'Login realizado com sucesso'
		});
	} catch (error: any) {
		console.error('Login error:', error);
		return json({ error: error.message || 'Erro ao fazer login' }, { status: 500 });
	}
};
