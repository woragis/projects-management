import { writable } from 'svelte/store';
import api from '../api/client';
import { goto } from '$app/navigation';
import type { UserRole } from '$lib/server/db/schemas/usuario';

export interface User {
	id: string;
	cpf: string;
	rg: string;
	dataNascimento: string;
	nomeCompleto: string;
	fotoPerfil?: string;
	email?: string;
	telefone?: string;
	whatsapp?: string;
	endereco?: string;
	role: UserRole;
	solicitacaoProfessor: boolean;
	createdAt: string;
	updatedAt: string;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<User | null>(null);

	return {
		subscribe,
		set,
		login: async (cpf: string, senha: string) => {
			try {
				const response = await api.post('/auth/login', { cpf, senha });
				set(response.data.data);
				return response.data.data;
			} catch (error: any) {
				throw error;
			}
		},
		register: async (data: any) => {
			try {
				const response = await api.post('/auth/register', data);
				set(response.data.data);
				return response.data.data;
			} catch (error: any) {
				throw error;
			}
		},
		logout: async () => {
			try {
				await api.post('/auth/logout');
				set(null);
				goto('/login');
			} catch (error: any) {
				// Mesmo se der erro, limpar o estado local
				set(null);
				goto('/login');
			}
		},
		checkAuth: async () => {
			try {
				const response = await api.get('/auth/me');
				set(response.data.data);
				return response.data.data;
			} catch (error: any) {
				set(null);
				return null;
			}
		},
		isAdmin: (user: User | null) => {
			if (!user) return false;
			return user.role === 'super_admin' || user.role === 'admin';
		},
		isProfessor: (user: User | null) => {
			if (!user) return false;
			return user.role === 'professor' || user.role === 'super_admin' || user.role === 'admin';
		},
		isSuperAdmin: (user: User | null) => {
			if (!user) return false;
			return user.role === 'super_admin';
		}
	};
}

export const authStore = createAuthStore();
