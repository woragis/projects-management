<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let formData = $state({
		clienteId: '',
		matricula: '',
		departamento: '',
		cargo: '',
		ativo: true
	});

	let clientes = $state<any[]>([]);
	let loading = $state(false);
	let loadingClientes = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await api.get('/clientes');
			clientes = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar clientes';
		} finally {
			loadingClientes = false;
		}
	});

	async function handleSubmit() {
		loading = true;
		error = null;

		try {
			await api.post('/professores', formData);
			goto('/professores');
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao criar professor';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/professores" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Novo Professor</h1>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{/if}

	{#if loadingClientes}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else}
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="bg-white rounded-lg shadow p-6 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="md:col-span-2">
					<label for="clienteId" class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
					<select 
						id="clienteId"
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.clienteId}
					>
						<option value="">Selecione um cliente</option>
						{#each clientes as cliente}
							<option value={cliente.id}>{cliente.nomeCompleto} - {cliente.cpf}</option>
						{/each}
					</select>
				</div>

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
					href="/professores" 
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
