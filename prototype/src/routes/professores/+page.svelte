<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { Plus, Search, Edit, Trash2, Eye } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { formatCPF } from '$lib/utils/format';

	let professores = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchTerm = $state('');

	async function loadProfessores() {
		loading = true;
		try {
			const params: any = {};
			if (searchTerm) params.nome = searchTerm;
			const response = await api.get('/professores', { params });
			professores = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar professores';
		} finally {
			loading = false;
		}
	}

	async function deleteProfessor(id: string) {
		if (!confirm('Tem certeza que deseja excluir este professor?')) return;
		
		try {
			await api.delete(`/professores/${id}`);
			await loadProfessores();
		} catch (err: any) {
			alert(err.response?.data?.error || 'Erro ao excluir professor');
		}
	}

	onMount(() => {
		loadProfessores();
	});
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900">Professores</h1>
		<a 
			href="/professores/novo" 
			class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
		>
			<Plus size={20} />
			Novo Professor
		</a>
	</div>

	<!-- Search -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4">
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
				<input 
					type="text" 
					placeholder="Buscar por nome, matrícula..." 
					class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={searchTerm}
					oninput={() => loadProfessores()}
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
	{:else if professores.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-500 text-lg">Nenhum professor encontrado</p>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each professores as prof}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{prof?.usuario?.nomeCompleto || 'Não informado'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500 font-mono">{prof?.usuario?.cpf ? formatCPF(prof.usuario.cpf) : '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{prof.professor?.matricula}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{prof.professor?.departamento || '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{prof.professor?.cargo || '-'}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {prof.professor?.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{prof.professor?.ativo ? 'Ativo' : 'Inativo'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<div class="flex justify-end gap-2">
									<button 
										onclick={() => goto(`/professores/${prof.professor.id}`)}
										class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition"
										title="Ver detalhes"
									>
										<Eye size={18} />
									</button>
									<button 
										onclick={() => goto(`/professores/${prof.professor.id}/editar`)}
										class="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition"
										title="Editar"
									>
										<Edit size={18} />
									</button>
									<button 
										onclick={() => deleteProfessor(prof.professor.id)}
										class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition"
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
