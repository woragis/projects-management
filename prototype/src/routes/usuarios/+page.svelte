<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { Plus, Search, Edit, Trash2, Eye, UserCheck } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { authStore, type User } from '$lib/stores/auth';
	import { formatCPF } from '$lib/utils/format';

	let usuarios = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchTerm = $state('');
	let user = $state<User | null>(null);

	onMount(() => {
		const unsubscribe = authStore.subscribe((u) => {
			user = u;
		});
		loadUsuarios();
		return unsubscribe;
	});

	async function loadUsuarios() {
		loading = true;
		try {
			const params: any = {};
			if (searchTerm) params.nome = searchTerm;
			const response = await api.get('/usuarios', { params });
			usuarios = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar usuários';
		} finally {
			loading = false;
		}
	}

	async function deleteUsuario(id: string) {
		if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
		
		try {
			await api.delete(`/usuarios/${id}`);
			await loadUsuarios();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao excluir usuário');
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
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Usuários</h1>
		<a 
			href="/usuarios/novo" 
			class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
		>
			<Plus size={20} />
			Novo Usuário
		</a>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{/if}

	<div class="bg-white rounded-lg shadow">
		<div class="p-4 border-b border-gray-200">
			<div class="flex gap-4">
				<div class="flex-1 relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
					<input
						type="text"
						placeholder="Buscar por nome..."
						class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={searchTerm}
						oninput={() => loadUsuarios()}
					/>
				</div>
			</div>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else if usuarios.length === 0}
			<div class="text-center py-12 text-gray-500">
				Nenhum usuário encontrado
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each usuarios as usuario}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										{#if usuario.fotoPerfil}
											<img src={usuario.fotoPerfil} alt={usuario.nomeCompleto} class="w-10 h-10 rounded-full mr-3 object-cover" />
										{:else}
											<div class="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
												<span class="text-gray-600 font-medium">{usuario.nomeCompleto.charAt(0).toUpperCase()}</span>
											</div>
										{/if}
										<div>
											<div class="text-sm font-medium text-gray-900">{usuario.nomeCompleto}</div>
											{#if usuario.telefone}
												<div class="text-sm text-gray-500">{usuario.telefone}</div>
											{/if}
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{formatCPF(usuario.cpf)}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.email || '-'}</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getRoleBadge(usuario.role).class}">
										{getRoleBadge(usuario.role).label}
									</span>
									{#if usuario.solicitacaoProfessor}
										<span class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
											Solicitou Professor
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex gap-2">
										<button 
											onclick={() => goto(`/usuarios/${usuario.id}`)}
											class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition"
											title="Ver detalhes"
										>
											<Eye size={18} />
										</button>
										<button 
											onclick={() => goto(`/usuarios/${usuario.id}/editar`)}
											class="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition"
											title="Editar"
										>
											<Edit size={18} />
										</button>
										{#if authStore.isAdmin(user)}
											<button 
												onclick={() => deleteUsuario(usuario.id)} 
												class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition"
												title="Excluir"
											>
												<Trash2 size={18} />
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
