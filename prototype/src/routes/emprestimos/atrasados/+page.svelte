<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let emprestimos = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function loadAtrasados() {
		loading = true;
		try {
			const response = await api.get('/emprestimos/atrasados');
			emprestimos = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar empréstimos atrasados';
		} finally {
			loading = false;
		}
	}

	async function devolverEmprestimo(id: string, itemId: string) {
		if (!confirm('Confirmar devolução deste item?')) return;
		
		try {
			await api.post(`/emprestimos/${id}/devolver`, {});
			await api.put(`/itens/${itemId}`, { disponivel: true });
			await loadAtrasados();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao devolver item');
		}
	}

	onMount(() => {
		loadAtrasados();
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/emprestimos" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900 flex items-center gap-2">
			<AlertCircle class="text-red-600" size={32} />
			Empréstimos Atrasados
		</h1>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if emprestimos.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-500 text-lg">Nenhum empréstimo atrasado encontrado</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each emprestimos as emp}
				<div class="bg-white rounded-lg shadow border-l-4 border-red-500 p-6 hover:shadow-lg transition">
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="text-lg font-semibold text-gray-900">{emp.item?.nome}</h3>
							<p class="text-sm text-gray-500">{emp.solicitante?.nomeCompleto}</p>
						</div>
						<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
							Atrasado
						</span>
					</div>

					<div class="space-y-2 text-sm text-gray-600 mb-4">
						<p><strong>Data Início:</strong> {new Date(emp.emprestimo.dataInicio).toLocaleDateString('pt-BR')}</p>
						<p class="text-red-600 font-semibold">
							<strong>Devolução Prevista:</strong> {new Date(emp.emprestimo.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}
						</p>
						{#if emp.professorAutorizador}
							<p><strong>Autorizado por:</strong> {emp.professorAutorizador.cliente?.nomeCompleto}</p>
						{/if}
					</div>

					<div class="flex gap-2">
						<button 
							onclick={() => goto(`/emprestimos/${emp.emprestimo.id}`)}
							class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
						>
							Ver Detalhes
						</button>
						<button 
							onclick={() => devolverEmprestimo(emp.emprestimo.id, emp.item.id)}
							class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
						>
							<CheckCircle size={18} />
							Devolver
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
