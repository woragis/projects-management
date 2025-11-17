<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { Plus, Search, Eye, CheckCircle, AlertCircle, XCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { authStore, type User } from '$lib/stores/auth';

	let emprestimos = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let filterStatus = $state<string>('');
	let user = $state<User | null>(null);
	let showPendentes = $state(false);

	onMount(() => {
		const unsubscribe = authStore.subscribe((u) => {
			user = u;
		});
		loadEmprestimos();
		return unsubscribe;
	});

	async function loadEmprestimos() {
		loading = true;
		try {
			if (showPendentes) {
				const response = await api.get('/emprestimos/pendentes');
				emprestimos = response.data.data;
			} else {
				const params: any = {};
				if (filterStatus) params.status = filterStatus;
				const response = await api.get('/emprestimos', { params });
				emprestimos = response.data.data;
			}
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar empréstimos';
		} finally {
			loading = false;
		}
	}

	async function aprovarEmprestimo(id: string) {
		if (!confirm('Aprovar este empréstimo?')) return;
		
		try {
			await api.post(`/emprestimos/${id}/aprovar`);
			alert('Empréstimo aprovado com sucesso!');
			await loadEmprestimos();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao aprovar empréstimo');
		}
	}

	async function rejeitarEmprestimo(id: string) {
		const motivo = prompt('Digite o motivo da rejeição (opcional):');
		if (motivo === null) return; // Usuário cancelou
		
		try {
			await api.post(`/emprestimos/${id}/rejeitar`, { motivo });
			alert('Empréstimo rejeitado');
			await loadEmprestimos();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao rejeitar empréstimo');
		}
	}

	async function devolverEmprestimo(id: string, itemId: string) {
		if (!confirm('Confirmar devolução deste item?')) return;
		
		try {
			await api.post(`/emprestimos/${id}/devolver`, {});
			await api.put(`/itens/${itemId}`, { disponivel: true });
			await loadEmprestimos();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao devolver item');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Empréstimos</h1>
		<a 
			href="/emprestimos/novo" 
			class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
		>
			<Plus size={20} />
			Novo Empréstimo
		</a>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4">
			<div class="flex-1">
				<select 
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={filterStatus}
					disabled={showPendentes}
					onchange={() => loadEmprestimos()}
				>
					<option value="">Todos os status</option>
					<option value="ativo">Ativos</option>
					<option value="devolvido">Devolvidos</option>
					<option value="atrasado">Atrasados</option>
					<option value="cancelado">Cancelados</option>
				</select>
			</div>
			{#if authStore.isProfessor(user)}
				<button
					onclick={() => { showPendentes = !showPendentes; loadEmprestimos(); }}
					class="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
				>
					<AlertCircle size={20} />
					{showPendentes ? 'Ver Todos' : 'Ver Pendentes'}
				</button>
			{/if}
			<a 
				href="/emprestimos/atrasados" 
				class="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
			>
				<AlertCircle size={20} />
				Ver Atrasados
			</a>
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
	{:else if emprestimos.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-500 text-lg">Nenhum empréstimo encontrado</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each emprestimos as emp}
				<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="text-lg font-semibold text-gray-900">{emp.item?.nome}</h3>
							<p class="text-sm text-gray-500">{emp.solicitante?.nomeCompleto}</p>
						</div>
						<div class="flex flex-col gap-1">
							<span class="px-2 py-1 text-xs font-semibold rounded-full {
								emp.emprestimo.status === 'ativo' ? 'bg-green-100 text-green-800' :
								emp.emprestimo.status === 'atrasado' ? 'bg-red-100 text-red-800' :
								emp.emprestimo.status === 'devolvido' ? 'bg-gray-100 text-gray-800' :
								'bg-yellow-100 text-yellow-800'
							}">
								{emp.emprestimo.status === 'ativo' ? 'Ativo' :
								 emp.emprestimo.status === 'atrasado' ? 'Atrasado' :
								 emp.emprestimo.status === 'devolvido' ? 'Devolvido' : 'Cancelado'}
							</span>
							{#if emp.emprestimo.statusAprovacao}
								<span class="px-2 py-1 text-xs font-semibold rounded-full {
									emp.emprestimo.statusAprovacao === 'aprovado' ? 'bg-green-100 text-green-800' :
									emp.emprestimo.statusAprovacao === 'rejeitado' ? 'bg-red-100 text-red-800' :
									'bg-yellow-100 text-yellow-800'
								}">
									{emp.emprestimo.statusAprovacao === 'aprovado' ? 'Aprovado' :
									 emp.emprestimo.statusAprovacao === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
								</span>
							{/if}
						</div>
					</div>

					<div class="space-y-2 text-sm text-gray-600 mb-4">
						<p><strong>Data Início:</strong> {new Date(emp.emprestimo.dataInicio).toLocaleDateString('pt-BR')}</p>
						<p><strong>Devolução Prevista:</strong> {new Date(emp.emprestimo.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}</p>
						{#if emp.emprestimo.dataDevolucaoReal}
							<p><strong>Devolvido em:</strong> {new Date(emp.emprestimo.dataDevolucaoReal).toLocaleDateString('pt-BR')}</p>
						{/if}
						{#if emp.professorAutorizador}
							<p><strong>Autorizado por:</strong> {emp.usuarioProfessor?.nomeCompleto || 'Professor'}</p>
						{/if}
					</div>

					<div class="flex gap-2">
						<button 
							onclick={() => goto(`/emprestimos/${emp.emprestimo.id}`)}
							class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
						>
							<Eye size={18} />
							Ver
						</button>
						{#if emp.emprestimo.statusAprovacao === 'pendente' && authStore.isProfessor(user)}
							<button 
								onclick={() => aprovarEmprestimo(emp.emprestimo.id)}
								class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
							>
								<CheckCircle size={18} />
								Aprovar
							</button>
							<button 
								onclick={() => rejeitarEmprestimo(emp.emprestimo.id)}
								class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
							>
								<XCircle size={18} />
								Rejeitar
							</button>
						{:else if emp.emprestimo.status === 'ativo'}
							<button 
								onclick={() => devolverEmprestimo(emp.emprestimo.id, emp.item.id)}
								class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
							>
								<CheckCircle size={18} />
								Devolver
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
