<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, CheckCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let processo = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let resolvendo = $state(false);
	let resultado = $state('');
	let valorMulta = $state('');

	async function resolver() {
		if (!resultado.trim()) {
			alert('Informe o resultado do processo');
			return;
		}
		
		resolvendo = true;
		try {
			await api.post(`/processos-administrativos/${page.params.id}/resolver`, {
				resultado,
				valorMulta: valorMulta ? Math.round(parseFloat(valorMulta) * 100) : undefined
			});
			await loadProcesso();
			resultado = '';
			valorMulta = '';
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao resolver processo');
		} finally {
			resolvendo = false;
		}
	}

	async function loadProcesso() {
		loading = true;
		try {
			const response = await api.get(`/processos-administrativos/${page.params.id}`);
			processo = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar processo';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadProcesso();
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/processos-administrativos" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Detalhes do Processo</h1>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if processo}
		<div class="bg-white rounded-lg shadow p-6 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
					<p class="text-lg font-semibold text-gray-900 capitalize">{processo.processo.tipo.replace('_', ' ')}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
					<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {
						processo.processo.status === 'aberto' ? 'bg-yellow-100 text-yellow-800' :
						processo.processo.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
						processo.processo.status === 'resolvido' ? 'bg-green-100 text-green-800' :
						'bg-red-100 text-red-800'
					}">
						{processo.processo.status === 'aberto' ? 'Aberto' :
						 processo.processo.status === 'em_andamento' ? 'Em Andamento' :
						 processo.processo.status === 'resolvido' ? 'Resolvido' : 'Encaminhado à Justiça'}
					</span>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
					<p class="text-lg text-gray-900">{processo.cliente?.nomeCompleto}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Data Ocorrência</label>
					<p class="text-lg text-gray-900">{new Date(processo.processo.dataOcorrencia).toLocaleDateString('pt-BR')}</p>
				</div>

				{#if processo.processo.dataResolucao}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Data Resolução</label>
						<p class="text-lg text-gray-900">{new Date(processo.processo.dataResolucao).toLocaleDateString('pt-BR')}</p>
					</div>
				{/if}

				{#if processo.processo.resultado}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Resultado</label>
						<p class="text-lg text-gray-900">{processo.processo.resultado}</p>
					</div>
				{/if}

				{#if processo.processo.valorMulta}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Valor da Multa</label>
						<p class="text-lg text-gray-900">R$ {(processo.processo.valorMulta / 100).toFixed(2)}</p>
					</div>
				{/if}

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
					<p class="text-lg text-gray-900 whitespace-pre-wrap">{processo.processo.descricao}</p>
				</div>

				{#if processo.processo.observacoes}
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-500 mb-1">Observações</label>
						<p class="text-lg text-gray-900 whitespace-pre-wrap">{processo.processo.observacoes}</p>
					</div>
				{/if}
			</div>

			{#if processo.processo.status === 'aberto' || processo.processo.status === 'em_andamento'}
				<div class="border-t pt-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Resolver Processo</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="md:col-span-2">
							<label class="block text-sm font-medium text-gray-700 mb-2">Resultado *</label>
							<input 
								type="text" 
								required
								placeholder="Ex: Demissão, Processo Judicial, Multa, Absolvido..."
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={resultado}
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Valor da Multa (R$)</label>
							<input 
								type="number" 
								step="0.01"
								placeholder="0.00"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={valorMulta}
							/>
						</div>
						<div class="md:col-span-2">
							<button 
								onclick={resolver}
								disabled={resolvendo || !resultado.trim()}
								class="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
							>
								<CheckCircle size={20} />
								{resolvendo ? 'Resolvendo...' : 'Resolver Processo'}
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
