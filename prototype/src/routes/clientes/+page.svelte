<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { Plus, Search, Edit, Trash2, Eye } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let clientes = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchTerm = $state('');

	async function loadClientes() {
		loading = true;
		try {
			const params: any = {};
			if (searchTerm) params.nome = searchTerm;
			const response = await api.get('/clientes', { params });
			clientes = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar clientes';
		} finally {
			loading = false;
		}
	}

	async function deleteCliente(id: string) {
		if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
		
		try {
			await api.delete(`/clientes/${id}`);
			await loadClientes();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao excluir cliente');
		}
	}

	onMount(() => {
		loadClientes();
	});
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Clientes</h1>
		<a 
			href="/clientes/novo" 
			class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
		>
			<Plus size={20} />
			Novo Cliente
		</a>
	</div>

	<!-- Search -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4">
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
				<input 
					type="text" 
					placeholder="Buscar por nome, CPF, RG, email..." 
					class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={searchTerm}
					oninput={() => loadClientes()}
				/>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if clientes.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-500 text-lg">Nenhum cliente encontrado</p>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RG</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each clientes as cliente}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{cliente.nomeCompleto}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{cliente.cpf}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{cliente.rg}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{cliente.email || '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{cliente.telefone || '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<div class="flex justify-end gap-2">
									<button 
										onclick={() => goto(`/clientes/${cliente.id}`)}
										class="text-blue-600 hover:text-blue-900"
									>
										<Eye size={18} />
									</button>
									<button 
										onclick={() => goto(`/clientes/${cliente.id}/editar`)}
										class="text-green-600 hover:text-green-900"
									>
										<Edit size={18} />
									</button>
									<button 
										onclick={() => deleteCliente(cliente.id)}
										class="text-red-600 hover:text-red-900"
									>
										<Trash2 size={18} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
