import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		cookies.delete('session', { path: '/' });
		return json({ message: 'Logout realizado com sucesso' });
	} catch (error: any) {
		return json({ error: error.message || 'Erro ao fazer logout' }, { status: 500 });
	}
};
