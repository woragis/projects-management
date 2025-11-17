import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const sessionId = cookies.get('session');
	
	// Se está na página de login, permitir acesso sem verificação
	if (url.pathname === '/login') {
		return {};
	}

	// Retornar sessionId para uso no cliente
	// O redirecionamento será feito no cliente se necessário
	return {
		sessionId: sessionId || null
	};
};
