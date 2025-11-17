<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { formatCPF } from '$lib/utils/format';

	let formData = $state({
		usuarioId: '',
		matricula: '',
		departamento: '',
		cargo: '',
		ativo: true
	});

	let usuarios = $state<any[]>([]);
	let loading = $state(false);
	let loadingUsuarios = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await api.get('/usuarios');
			usuarios = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar usuários';
		} finally {
			loadingUsuarios = false;
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

	{#if loadingUsuarios}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else}
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="bg-white rounded-lg shadow p-6 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="md:col-span-2">
					<label for="usuarioId" class="block text-sm font-medium text-gray-700 mb-2">Usuário *</label>
					<select 
						id="usuarioId"
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.usuarioId}
					>
						<option value="">Selecione um usuário</option>
						{#each usuarios as usuario}
							<option value={usuario.id}>{usuario.nomeCompleto} - {formatCPF(usuario.cpf)}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="matricula" class="block text-sm font-medium text-gray-700 mb-2">Matrícula *</label>
					<input 
						id="matricula"
						type="text" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.matricula}
					/>
				</div>

				<div>
					<label for="departamento" class="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
					<input 
						id="departamento"
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.departamento}
					/>
				</div>

				<div>
					<label for="cargo" class="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
					<input 
						id="cargo"
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
