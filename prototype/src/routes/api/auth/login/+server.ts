import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const { cpf, senha } = body;

		if (!cpf || !senha) {
			return json({ error: 'CPF e senha são obrigatórios' }, { status: 400 });
		}

		// Buscar usuário por CPF
		const usuario = await usuarioRepository.findByCpf(cpf);

		if (!usuario) {
			return json({ error: 'CPF ou senha inválidos' }, { status: 401 });
		}

		// TODO: Verificar senha (por enquanto, apenas validação básica)
		// Em produção, usar bcrypt ou similar
		// Por enquanto, vamos usar um sistema simples: senha = CPF para desenvolvimento
		if (senha !== cpf) {
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
