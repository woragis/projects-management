<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Edit } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let professor = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await api.get(`/professores/${page.params.id}`);
			professor = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar professor';
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/professores" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Detalhes do Professor</h1>
		<a 
			href={`/professores/${page.params.id}/editar`}
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
	{:else if professor}
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-6">Informações do Professor</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Nome Completo</label>
					<p class="text-lg font-semibold text-gray-900">{professor.cliente?.nomeCompleto}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">CPF</label>
					<p class="text-lg text-gray-900">{professor.cliente?.cpf}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Matrícula</label>
					<p class="text-lg text-gray-900">{professor.professor?.matricula}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Departamento</label>
					<p class="text-lg text-gray-900">{professor.professor?.departamento || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Cargo</label>
					<p class="text-lg text-gray-900">{professor.professor?.cargo || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
					<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {professor.professor?.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
						{professor.professor?.ativo ? 'Ativo' : 'Inativo'}
					</span>
				</div>
			</div>
		</div>
	{/if}
</div>
