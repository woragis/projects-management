import { DB_ERROR_CODES, APP_ERROR_CODES, type ErrorCode } from './codes';

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	// Database Connection Errors
	[DB_ERROR_CODES.CONNECTION_REFUSED]: 'Não foi possível conectar ao banco de dados. O servidor recusou a conexão.',
	[DB_ERROR_CODES.CONNECTION_TIMEOUT]: 'Tempo de conexão com o banco de dados expirado. Tente novamente.',
	[DB_ERROR_CODES.CONNECTION_RESET]: 'Conexão com o banco de dados foi resetada. Tente novamente.',
	[DB_ERROR_CODES.DNS_ERROR]: 'Não foi possível resolver o endereço do banco de dados.',
	
	// PostgreSQL Errors
	[DB_ERROR_CODES.AUTH_FAILED]: 'Falha na autenticação com o banco de dados. Verifique as credenciais.',
	[DB_ERROR_CODES.INVALID_AUTHORIZATION]: 'Autorização inválida para acessar o banco de dados.',
	[DB_ERROR_CODES.DUPLICATE_DATABASE]: 'Banco de dados duplicado.',
	[DB_ERROR_CODES.DUPLICATE_TABLE]: 'Tabela duplicada.',
	[DB_ERROR_CODES.UNDEFINED_TABLE]: 'Tabela não encontrada no banco de dados.',
	[DB_ERROR_CODES.UNDEFINED_COLUMN]: 'Coluna não encontrada na tabela.',
	[DB_ERROR_CODES.UNDEFINED_FUNCTION]: 'Função não encontrada no banco de dados.',
	[DB_ERROR_CODES.SYNTAX_ERROR]: 'Erro de sintaxe na consulta ao banco de dados.',
	[DB_ERROR_CODES.INVALID_TEXT_REPRESENTATION]: 'Formato de dados inválido.',
	[DB_ERROR_CODES.NOT_NULL_VIOLATION]: 'Campo obrigatório não pode ser nulo.',
	[DB_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Violação de chave estrangeira. Registro relacionado não existe.',
	[DB_ERROR_CODES.UNIQUE_VIOLATION]: 'Valor já existe e deve ser único.',
	[DB_ERROR_CODES.CHECK_VIOLATION]: 'Valor não atende às regras de validação.',
	
	// Application Database Errors
	[DB_ERROR_CODES.QUERY_FAILED]: 'Falha ao executar consulta no banco de dados.',
	[DB_ERROR_CODES.CONNECTION_POOL_ERROR]: 'Erro no pool de conexões do banco de dados.',
	[DB_ERROR_CODES.TRANSACTION_ERROR]: 'Erro na transação do banco de dados.',
	[DB_ERROR_CODES.UNKNOWN_DB_ERROR]: 'Erro desconhecido no banco de dados.',
	
	// Validation Errors
	[APP_ERROR_CODES.VALIDATION_ERROR]: 'Erro de validação nos dados fornecidos.',
	[APP_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Campo obrigatório não foi fornecido.',
	[APP_ERROR_CODES.INVALID_FORMAT]: 'Formato de dados inválido.',
	
	// Authentication Errors
	[APP_ERROR_CODES.AUTH_REQUIRED]: 'Autenticação necessária para acessar este recurso.',
	[APP_ERROR_CODES.AUTH_INVALID]: 'Credenciais inválidas.',
	[APP_ERROR_CODES.AUTH_EXPIRED]: 'Sessão expirada. Faça login novamente.',
	
	// Resource Errors
	[APP_ERROR_CODES.RESOURCE_NOT_FOUND]: 'Recurso não encontrado.',
	[APP_ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'Recurso já existe.',
	[APP_ERROR_CODES.RESOURCE_CONFLICT]: 'Conflito com recurso existente.',
	
	// Permission Errors
	[APP_ERROR_CODES.PERMISSION_DENIED]: 'Permissão negada para esta operação.',
	[APP_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Permissões insuficientes para esta operação.',
	
	// Server Errors
	[APP_ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor.',
	[APP_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível.'
};

/**
 * Get user-friendly error message for an error code
 */
export function getErrorMessage(code: ErrorCode): string {
	return ERROR_MESSAGES[code] || ERROR_MESSAGES[DB_ERROR_CODES.UNKNOWN_DB_ERROR];
}

/**
 * Map PostgreSQL error codes to our error codes
 */
export function mapPostgresErrorCode(pgCode: string): ErrorCode {
	const codeMap: Record<string, ErrorCode> = {
		'28P01': DB_ERROR_CODES.AUTH_FAILED,
		'28000': DB_ERROR_CODES.INVALID_AUTHORIZATION,
		'42P04': DB_ERROR_CODES.DUPLICATE_DATABASE,
		'42P07': DB_ERROR_CODES.DUPLICATE_TABLE,
		'42P01': DB_ERROR_CODES.UNDEFINED_TABLE,
		'42703': DB_ERROR_CODES.UNDEFINED_COLUMN,
		'42883': DB_ERROR_CODES.UNDEFINED_FUNCTION,
		'42601': DB_ERROR_CODES.SYNTAX_ERROR,
		'22P02': DB_ERROR_CODES.INVALID_TEXT_REPRESENTATION,
		'23502': DB_ERROR_CODES.NOT_NULL_VIOLATION,
		'23503': DB_ERROR_CODES.FOREIGN_KEY_VIOLATION,
		'23505': DB_ERROR_CODES.UNIQUE_VIOLATION,
		'23514': DB_ERROR_CODES.CHECK_VIOLATION
	};
	
	return codeMap[pgCode] || DB_ERROR_CODES.UNKNOWN_DB_ERROR;
}

/**
 * Map Node.js error codes to our error codes
 */
export function mapNodeErrorCode(nodeCode: string): ErrorCode {
	const codeMap: Record<string, ErrorCode> = {
		'ECONNREFUSED': DB_ERROR_CODES.CONNECTION_REFUSED,
		'ETIMEDOUT': DB_ERROR_CODES.CONNECTION_TIMEOUT,
		'ECONNRESET': DB_ERROR_CODES.CONNECTION_RESET,
		'ENOTFOUND': DB_ERROR_CODES.DNS_ERROR,
		'EAI_AGAIN': DB_ERROR_CODES.DNS_ERROR,
		'ENETUNREACH': DB_ERROR_CODES.CONNECTION_REFUSED,
		'EHOSTUNREACH': DB_ERROR_CODES.CONNECTION_REFUSED
	};
	
	// Also check if the code string contains these patterns
	const upperCode = nodeCode.toUpperCase();
	for (const [key, value] of Object.entries(codeMap)) {
		if (upperCode.includes(key)) {
			return value;
		}
	}
	
	return codeMap[nodeCode] || DB_ERROR_CODES.UNKNOWN_DB_ERROR;
}

