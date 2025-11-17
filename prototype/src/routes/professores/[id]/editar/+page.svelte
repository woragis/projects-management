<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let formData = $state({
		matricula: '',
		departamento: '',
		cargo: '',
		ativo: true
	});

	let loading = $state(false);
	let loadingData = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await api.get(`/professores/${page.params.id}`);
			const prof = response.data.data;
			formData = {
				matricula: prof.professor?.matricula || '',
				departamento: prof.professor?.departamento || '',
				cargo: prof.professor?.cargo || '',
				ativo: prof.professor?.ativo ?? true
			};
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar professor';
		} finally {
			loadingData = false;
		}
	});

	async function handleSubmit() {
		loading = true;
		error = null;

		try {
			await api.put(`/professores/${page.params.id}`, formData);
			goto(`/professores/${page.params.id}`);
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao atualizar professor';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href={`/professores/${page.params.id}`} class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Editar Professor</h1>
	</div>

	{#if loadingData}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else}
		{#if error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
				{error}
			</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="bg-white rounded-lg shadow p-6 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Matrícula *</label>
					<input 
						type="text" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.matricula}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.departamento}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.cargo}
					/>
				</div>

				<div>
					<label class="flex items-center gap-2">
						<input 
							type="checkbox" 
							class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							bind:checked={formData.ativo}
						/>
						<span class="text-sm font-medium text-gray-700">Ativo</span>
					</label>
				</div>
			</div>

			<div class="flex justify-end gap-4">
				<a 
					href={`/professores/${page.params.id}`}
					class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
				>
					Cancelar
				</a>
				<button 
					type="submit"
					disabled={loading}
					class="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
				>
					<Save size={20} />
					{loading ? 'Salvando...' : 'Salvar'}
				</button>
			</div>
		</form>
	{/if}
</div>
