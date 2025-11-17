<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { formatCPF } from '$lib/utils/format';

	let formData = $state({
		usuarioId: '',
		emprestimoId: '',
		tipo: 'perda' as 'perda' | 'quebra' | 'mas_condicoes' | 'roubo',
		descricao: '',
		dataOcorrencia: new Date().toISOString().split('T')[0],
		observacoes: ''
	});

	let usuarios = $state<any[]>([]);
	let emprestimos = $state<any[]>([]);
	let loading = $state(false);
	let loadingData = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const [usuariosRes, emprestimosRes] = await Promise.all([
				api.get('/usuarios'),
				api.get('/emprestimos', { params: { status: 'ativo' } })
			]);
			usuarios = usuariosRes.data.data;
			emprestimos = emprestimosRes.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar dados';
		} finally {
			loadingData = false;
		}
	});

	async function handleSubmit() {
		loading = true;
		error = null;

		try {
			const payload = {
				...formData,
				emprestimoId: formData.emprestimoId || undefined
			};
			await api.post('/processos-administrativos', payload);
			goto('/processos-administrativos');
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao criar processo';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/processos-administrativos" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Novo Processo Administrativo</h1>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{/if}

	{#if loadingData}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else}
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="bg-white rounded-lg shadow p-6 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Usuário *</label>
					<select 
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
					<label class="block text-sm font-medium text-gray-700 mb-2">Empréstimo (Opcional)</label>
					<select 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.emprestimoId}
					>
						<option value="">Nenhum empréstimo relacionado</option>
						{#each emprestimos as emp}
							<option value={emp.emprestimo.id}>
								{emp.item?.nome} - {emp.solicitante?.nomeCompleto}
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
					<select 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.tipo}
					>
						<option value="perda">Perda</option>
						<option value="quebra">Quebra</option>
						<option value="mas_condicoes">Más Condições</option>
						<option value="roubo">Roubo</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Data da Ocorrência *</label>
					<input 
						type="date" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.dataOcorrencia}
					/>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
					<textarea 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						rows="5"
						bind:value={formData.descricao}
					></textarea>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
					<textarea 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						rows="3"
						bind:value={formData.observacoes}
					></textarea>
				</div>
			</div>

			<div class="flex justify-end gap-4">
				<a 
					href="/processos-administrativos" 
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
