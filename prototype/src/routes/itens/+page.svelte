<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { Plus, Search, Edit, Trash2, Eye, CheckCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let itens = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchTerm = $state('');
	let filterDisponivel = $state<string>('');

	async function loadItens() {
		loading = true;
		try {
			const params: any = {};
			if (searchTerm) params.nome = searchTerm;
			if (filterDisponivel === 'true') params.disponivel = true;
			if (filterDisponivel === 'false') params.disponivel = false;
			const response = await api.get('/itens', { params });
			itens = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar itens';
		} finally {
			loading = false;
		}
	}

	async function deleteItem(id: string) {
		if (!confirm('Tem certeza que deseja excluir este item?')) return;
		
		try {
			await api.delete(`/itens/${id}`);
			await loadItens();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao excluir item');
		}
	}

	function handleViewItem(id: string) {
		goto(`/itens/${id}`);
	}

	function handleEditItem(id: string) {
		goto(`/itens/${id}/editar`);
	}

	onMount(() => {
		loadItens();
	});
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Itens</h1>
		<a 
			href="/itens/novo" 
			class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
		>
			<Plus size={20} />
			Novo Item
		</a>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4 flex-wrap">
			<div class="flex-1 min-w-[200px] relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
				<input 
					type="text" 
					placeholder="Buscar por nome, categoria..." 
					class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={searchTerm}
					oninput={() => loadItens()}
				/>
			</div>
			<div>
				<select 
					class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={filterDisponivel}
					onchange={() => loadItens()}
				>
					<option value="">Todos</option>
					<option value="true">Disponíveis</option>
					<option value="false">Indisponíveis</option>
				</select>
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
	{:else if itens.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-500 text-lg">Nenhum item encontrado</p>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Patrimônio</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condição</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each itens as item}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{item.nome}</div>
								{#if item.descricao}
									<div class="text-sm text-gray-500 truncate max-w-xs">{item.descricao}</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{item.categoria || '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{item.codigoPatrimonio || '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {
									item.condicao === 'bom' ? 'bg-green-100 text-green-800' :
									item.condicao === 'regular' ? 'bg-yellow-100 text-yellow-800' :
									'bg-red-100 text-red-800'
								}">
									{item.condicao === 'bom' ? 'Bom' : item.condicao === 'regular' ? 'Regular' : 'Ruim'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {item.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{item.disponivel ? 'Disponível' : 'Indisponível'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<div class="flex justify-end gap-2">
									<button 
										type="button"
										onclick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewItem(item.id); }}
										class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition cursor-pointer"
										title="Ver detalhes"
									>
										<Eye size={18} />
									</button>
									<button 
										type="button"
										onclick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditItem(item.id); }}
										class="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition cursor-pointer"
										title="Editar"
									>
										<Edit size={18} />
									</button>
									<button 
										type="button"
										onclick={(e) => { e.preventDefault(); e.stopPropagation(); deleteItem(item.id); }}
										class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition cursor-pointer"
										title="Excluir"
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
