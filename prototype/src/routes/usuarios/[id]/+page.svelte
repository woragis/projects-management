<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Edit, UserCheck, CheckCircle, XCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore, type User } from '$lib/stores/auth';

	let usuario = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let user = $state<User | null>(null);

	onMount(() => {
		const unsubscribe = authStore.subscribe((u) => {
			user = u;
		});
		loadUsuario();
		return unsubscribe;
	});

	async function loadUsuario() {
		try {
			const id = $page.params?.id;
			if (!id) {
				error = 'ID não encontrado';
				loading = false;
				return;
			}
			const response = await api.get(`/clientes/${id}`);
			usuario = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar usuário';
		} finally {
			loading = false;
		}
	}

	async function solicitarProfessor() {
		if (!confirm('Deseja solicitar para virar professor?')) return;
		
		const id = $page.params?.id;
		if (!id) {
			alert('ID não encontrado');
			return;
		}
		
		try {
			await api.post(`/usuarios/${id}/solicitar-professor`);
			alert('Solicitação enviada com sucesso!');
			await loadUsuario();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao solicitar');
		}
	}

	async function aprovarProfessor() {
		const id = $page.params?.id;
		if (!id) {
			alert('ID não encontrado');
			return;
		}
		
		const matricula = prompt('Digite a matrícula do professor:');
		if (!matricula) return;

		const departamento = prompt('Digite o departamento (opcional):') || undefined;
		const cargo = prompt('Digite o cargo (opcional):') || undefined;

		try {
			await api.post(`/usuarios/${id}/aprovar-professor`, {
				matricula,
				departamento,
				cargo
			});
			alert('Professor aprovado com sucesso!');
			await loadUsuario();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao aprovar professor');
		}
	}

	async function rejeitarSolicitacao() {
		if (!confirm('Deseja rejeitar a solicitação de professor?')) return;
		
		const id = $page.params?.id;
		if (!id) {
			alert('ID não encontrado');
			return;
		}
		
		try {
			await api.post(`/usuarios/${id}/rejeitar-professor`);
			alert('Solicitação rejeitada');
			await loadUsuario();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao rejeitar solicitação');
		}
	}

	function getRoleBadge(role: string) {
		const badges: Record<string, { class: string; label: string }> = {
			'super_admin': { class: 'bg-purple-100 text-purple-800', label: 'Super Admin' },
			'admin': { class: 'bg-red-100 text-red-800', label: 'Admin' },
			'professor': { class: 'bg-blue-100 text-blue-800', label: 'Professor' },
			'aluno': { class: 'bg-green-100 text-green-800', label: 'Aluno' }
		};
		return badges[role] || { class: 'bg-gray-100 text-gray-800', label: role };
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/usuarios" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Detalhes do Usuário</h1>
		<a 
			href={`/usuarios/${$page.params?.id || ''}/editar`}
			class="ml-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
		>
			<Edit size={20} />
			Editar
		</a>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if usuario}
		<div class="bg-white rounded-lg shadow p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Nome Completo</label>
					<p class="text-lg font-semibold text-gray-900">{usuario.nomeCompleto}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">CPF</label>
					<p class="text-lg text-gray-900">{usuario.cpf}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">RG</label>
					<p class="text-lg text-gray-900">{usuario.rg}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Data de Nascimento</label>
					<p class="text-lg text-gray-900">{new Date(usuario.dataNascimento).toLocaleDateString('pt-BR')}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Role</label>
					<span class="px-3 py-1 inline-flex text-sm font-semibold rounded-full {getRoleBadge(usuario.role).class}">
						{getRoleBadge(usuario.role).label}
					</span>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
					<p class="text-lg text-gray-900">{usuario.email || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
					<p class="text-lg text-gray-900">{usuario.telefone || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">WhatsApp</label>
					<p class="text-lg text-gray-900">{usuario.whatsapp || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Endereço</label>
					<p class="text-lg text-gray-900">{usuario.endereco || '-'}</p>
				</div>
			</div>

			{#if usuario.fotoPerfil}
				<div class="md:col-span-2 mt-6">
					<label class="block text-sm font-medium text-gray-500 mb-2">Foto de Perfil</label>
					<img src={usuario.fotoPerfil} alt={usuario.nomeCompleto} class="w-48 h-48 object-cover rounded-lg border border-gray-300 shadow-md" />
				</div>
			{/if}

			<!-- Solicitação de Professor -->
			{#if usuario.role === 'aluno' && !usuario.solicitacaoProfessor && user?.id === usuario.id}
				<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p class="text-sm text-blue-800 mb-3">Deseja solicitar para virar professor?</p>
					<button
						onclick={solicitarProfessor}
						class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
					>
						<UserCheck size={18} />
						Solicitar para virar Professor
					</button>
				</div>
			{/if}

			{#if usuario.solicitacaoProfessor && authStore.isAdmin(user)}
				<div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p class="text-sm text-yellow-800 mb-3">Este usuário solicitou para virar professor</p>
					<div class="flex gap-2">
						<button
							onclick={aprovarProfessor}
							class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
						>
							<CheckCircle size={18} />
							Aprovar
						</button>
						<button
							onclick={rejeitarSolicitacao}
							class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
						>
							<XCircle size={18} />
							Rejeitar
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
