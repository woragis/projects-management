<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { Plus, FileText, AlertCircle, CheckCircle, Eye } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { formatCurrency, formatDate } from '$lib/utils/format';

	let processos = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let filterStatus = $state<string>('');

	async function loadProcessos() {
		loading = true;
		try {
			const params: any = {};
			if (filterStatus) params.status = filterStatus;
			const response = await api.get('/processos-administrativos', { params });
			processos = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar processos';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadProcessos();
	});
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Processos Administrativos</h1>
		<a 
			href="/processos-administrativos/novo" 
			class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
		>
			<Plus size={20} />
			Novo Processo
		</a>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4">
			<div class="flex-1">
				<select 
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={filterStatus}
					onchange={() => loadProcessos()}
				>
					<option value="">Todos os status</option>
					<option value="aberto">Abertos</option>
					<option value="em_andamento">Em Andamento</option>
					<option value="resolvido">Resolvidos</option>
					<option value="encaminhado_justica">Encaminhado à Justiça</option>
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
	{:else if processos.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-500 text-lg">Nenhum processo encontrado</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each processos as proc}
				<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="text-lg font-semibold text-gray-900 capitalize">
								{proc.processo.tipo.replace('_', ' ')}
							</h3>
							<p class="text-sm text-gray-500">{proc.usuario?.nomeCompleto}</p>
						</div>
						<span class="px-2 py-1 text-xs font-semibold rounded-full {
							proc.processo.status === 'aberto' ? 'bg-yellow-100 text-yellow-800' :
							proc.processo.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
							proc.processo.status === 'resolvido' ? 'bg-green-100 text-green-800' :
							'bg-red-100 text-red-800'
						}">
							{proc.processo.status === 'aberto' ? 'Aberto' :
							 proc.processo.status === 'em_andamento' ? 'Em Andamento' :
							 proc.processo.status === 'resolvido' ? 'Resolvido' : 'Encaminhado à Justiça'}
						</span>
					</div>

					<div class="space-y-2 text-sm text-gray-600 mb-4">
						<p><strong>Data Ocorrência:</strong> {formatDate(proc.processo.dataOcorrencia)}</p>
						{#if proc.processo.dataResolucao}
							<p><strong>Data Resolução:</strong> {formatDate(proc.processo.dataResolucao)}</p>
						{/if}
						{#if proc.processo.resultado}
							<p><strong>Resultado:</strong> {proc.processo.resultado}</p>
						{/if}
						{#if proc.processo.valorMulta}
							<p><strong>Multa:</strong> <span class="font-semibold text-green-600">{formatCurrency(proc.processo.valorMulta)}</span></p>
						{/if}
					</div>

					<p class="text-sm text-gray-700 mb-4 line-clamp-2">{proc.processo.descricao}</p>

					<div class="flex gap-2">
						<button 
							onclick={() => goto(`/processos-administrativos/${proc.processo.id}`)}
							class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
						>
							<Eye size={18} />
							Ver
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
