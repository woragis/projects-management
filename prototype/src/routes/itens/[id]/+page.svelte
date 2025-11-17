<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Edit } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let item = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const id = $page.params?.id;
			if (!id) {
				error = 'ID não encontrado';
				loading = false;
				return;
			}
			const response = await api.get(`/itens/${id}`);
			item = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar item';
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/itens" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Detalhes do Item</h1>
		<a 
			href={`/itens/${$page.params?.id || ''}/editar`}
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
	{:else if item}
		<div class="bg-white rounded-lg shadow p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-500 mb-1">Nome</label>
					<p class="text-lg font-semibold text-gray-900">{item.nome}</p>
				</div>

				{#if item.descricao}
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
						<p class="text-lg text-gray-900">{item.descricao}</p>
					</div>
				{/if}

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Categoria</label>
					<p class="text-lg text-gray-900">{item.categoria || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Código Patrimônio</label>
					<p class="text-lg text-gray-900">{item.codigoPatrimonio || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Condição</label>
					<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {
						item.condicao === 'bom' ? 'bg-green-100 text-green-800' :
						item.condicao === 'regular' ? 'bg-yellow-100 text-yellow-800' :
						'bg-red-100 text-red-800'
					}">
						{item.condicao === 'bom' ? 'Bom' : item.condicao === 'regular' ? 'Regular' : 'Ruim'}
					</span>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
					<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {item.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
						{item.disponivel ? 'Disponível' : 'Indisponível'}
					</span>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Localização</label>
					<p class="text-lg text-gray-900">{item.localizacao || '-'}</p>
				</div>

				{#if item.tags}
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-500 mb-2">Tags</label>
						<div class="flex flex-wrap gap-2">
							{#each (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) as tag}
								<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{tag}</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if item.foto}
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-500 mb-2">Foto</label>
						<img src={item.foto} alt={item.nome} class="w-64 h-64 object-cover rounded-lg border border-gray-300 shadow-md" />
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
