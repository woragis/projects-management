<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, CheckCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let emprestimo = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function devolver() {
		if (!confirm('Confirmar devolução deste item?')) return;
		
		try {
			await api.post(`/emprestimos/${page.params.id}/devolver`, {});
			await api.put(`/itens/${emprestimo.item.id}`, { disponivel: true });
			await loadEmprestimo();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao devolver item');
		}
	}

	async function loadEmprestimo() {
		loading = true;
		try {
			const response = await api.get(`/emprestimos/${page.params.id}`);
			emprestimo = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar empréstimo';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadEmprestimo();
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/emprestimos" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Detalhes do Empréstimo</h1>
		{#if emprestimo && emprestimo.emprestimo.status === 'ativo'}
			<button 
				onclick={devolver}
				class="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
			>
				<CheckCircle size={20} />
				Devolver
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if emprestimo}
		<div class="bg-white rounded-lg shadow p-6 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Item</label>
					<p class="text-lg font-semibold text-gray-900">{emprestimo.item?.nome}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Solicitante</label>
					<p class="text-lg text-gray-900">{emprestimo.solicitante?.nomeCompleto}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
					<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {
						emprestimo.emprestimo.status === 'ativo' ? 'bg-green-100 text-green-800' :
						emprestimo.emprestimo.status === 'atrasado' ? 'bg-red-100 text-red-800' :
						emprestimo.emprestimo.status === 'devolvido' ? 'bg-gray-100 text-gray-800' :
						'bg-yellow-100 text-yellow-800'
					}">
						{emprestimo.emprestimo.status === 'ativo' ? 'Ativo' :
						 emprestimo.emprestimo.status === 'atrasado' ? 'Atrasado' :
						 emprestimo.emprestimo.status === 'devolvido' ? 'Devolvido' : 'Cancelado'}
					</span>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Data de Início</label>
					<p class="text-lg text-gray-900">{new Date(emprestimo.emprestimo.dataInicio).toLocaleDateString('pt-BR')}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Data de Devolução Prevista</label>
					<p class="text-lg text-gray-900">{new Date(emprestimo.emprestimo.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}</p>
				</div>

				{#if emprestimo.emprestimo.dataDevolucaoReal}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Data de Devolução Real</label>
						<p class="text-lg text-gray-900">{new Date(emprestimo.emprestimo.dataDevolucaoReal).toLocaleDateString('pt-BR')}</p>
					</div>
				{/if}

				{#if emprestimo.professorAutorizador}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Professor Autorizador</label>
						<p class="text-lg text-gray-900">{emprestimo.usuarioProfessor?.nomeCompleto || 'Professor'}</p>
					</div>
				{/if}

				{#if emprestimo.emprestimo.pessoaQuePegou}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Pessoa que Pegou</label>
						<p class="text-lg text-gray-900">{emprestimo.emprestimo.pessoaQuePegou}</p>
					</div>
				{/if}

				{#if emprestimo.emprestimo.salaQuePegou}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Sala onde Pegou</label>
						<p class="text-lg text-gray-900">{emprestimo.emprestimo.salaQuePegou}</p>
					</div>
				{/if}

				{#if emprestimo.emprestimo.localizacaoAtual}
					<div>
						<label class="block text-sm font-medium text-gray-500 mb-1">Localização Atual</label>
						<p class="text-lg text-gray-900">{emprestimo.emprestimo.localizacaoAtual}</p>
					</div>
				{/if}

				{#if emprestimo.emprestimo.observacoes}
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-500 mb-1">Observações</label>
						<p class="text-lg text-gray-900 whitespace-pre-wrap">{emprestimo.emprestimo.observacoes}</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
