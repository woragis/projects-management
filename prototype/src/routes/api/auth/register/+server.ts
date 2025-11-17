import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { usuarioRepository } from '$lib/server/db/repositories';
import { AppError, APP_ERROR_CODES, createErrorResponse } from '$lib/server/errors';
import { normalizeCpf } from '$lib/server/utils/cpf';
import bcrypt from 'bcrypt';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		let { cpf, rg, dataNascimento, nomeCompleto, email, telefone, whatsapp, endereco, senha, fotoPerfil } = body;

		// Normalizar CPF (remover formatação para armazenar consistentemente)
		const originalCpf = cpf;
		cpf = normalizeCpf(cpf);

		console.log('🔍 REGISTER - CPF normalization:', { originalCpf, normalizedCpf: cpf });

		// Validações básicas
		if (!cpf || !rg || !dataNascimento || !nomeCompleto || !senha) {
			const error = new AppError(
				APP_ERROR_CODES.MISSING_REQUIRED_FIELD,
				'CPF, RG, data de nascimento, nome completo e senha são obrigatórios',
				400
			);
			return json(createErrorResponse(error), { status: error.statusCode });
		}

		if (senha.length < 6) {
			const error = new AppError(
				APP_ERROR_CODES.INVALID_INPUT,
				'A senha deve ter no mínimo 6 caracteres',
				400
			);
			return json(createErrorResponse(error), { status: error.statusCode });
		}

		// Verificar se CPF já existe (já normalizado)
		let usuarioExistente;
		try {
			usuarioExistente = await usuarioRepository.findByCpf(cpf);
		} catch (error: any) {
			console.error('❌ REGISTER ERROR - CPF Check Failed:', error);
			const appError = error instanceof AppError ? error : new AppError(
				APP_ERROR_CODES.INTERNAL_SERVER_ERROR,
				'Erro ao verificar CPF',
				500,
				{ originalError: error.message }
			);
			return json(createErrorResponse(appError), { status: appError.statusCode });
		}
		if (usuarioExistente) {
			const error = new AppError(
				APP_ERROR_CODES.RESOURCE_ALREADY_EXISTS,
				'CPF já cadastrado',
				400
			);
			return json(createErrorResponse(error), { status: error.statusCode });
		}

		// Verificar se RG já existe
		let rgExistente;
		try {
			rgExistente = await usuarioRepository.findByRg(rg);
		} catch (error: any) {
			console.error('❌ REGISTER ERROR - RG Check Failed:', error);
			const appError = error instanceof AppError ? error : new AppError(
				APP_ERROR_CODES.INTERNAL_SERVER_ERROR,
				'Erro ao verificar RG',
				500,
				{ originalError: error.message }
			);
			return json(createErrorResponse(appError), { status: appError.statusCode });
		}
		if (rgExistente) {
			const error = new AppError(
				APP_ERROR_CODES.RESOURCE_ALREADY_EXISTS,
				'RG já cadastrado',
				400
			);
			return json(createErrorResponse(error), { status: error.statusCode });
		}

		// Hash da senha
		const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;

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
			senhaHash,
			role: undefined
		});

		console.log('🔍 REGISTER - User created:', { id: usuario.id, cpf: usuario.cpf });

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
		console.error('❌ REGISTER ERROR:', error);
		const appError = error instanceof AppError ? error : new AppError(
			APP_ERROR_CODES.INTERNAL_SERVER_ERROR,
			error.message || 'Erro ao registrar',
			500,
			{ originalError: error.message }
		);
		return json(createErrorResponse(appError), { status: appError.statusCode });
	}
};
