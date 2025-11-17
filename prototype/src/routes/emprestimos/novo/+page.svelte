<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { formatCPF } from '$lib/utils/format';

	let formData = $state({
		itemId: '',
		solicitanteId: '',
		professorAutorizadorId: '',
		dataInicio: new Date().toISOString().split('T')[0],
		dataDevolucaoPrevista: '',
		pessoaQuePegou: '',
		salaQuePegou: '',
		localizacaoAtual: '',
		observacoes: ''
	});

	let itens = $state<any[]>([]);
	let usuarios = $state<any[]>([]);
	let professores = $state<any[]>([]);
	let loading = $state(false);
	let loadingData = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const [itensRes, usuariosRes, professoresRes] = await Promise.all([
				api.get('/itens/disponiveis'),
				api.get('/usuarios'),
				api.get('/professores')
			]);
			itens = itensRes.data.data;
			usuarios = usuariosRes.data.data;
			professores = professoresRes.data.data;
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
				professorAutorizadorId: formData.professorAutorizadorId || undefined
			};
			await api.post('/emprestimos', payload);
			goto('/emprestimos');
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao criar empréstimo';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/emprestimos" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Novo Empréstimo</h1>
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
					<label class="block text-sm font-medium text-gray-700 mb-2">Item *</label>
					<select 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.itemId}
					>
						<option value="">Selecione um item</option>
						{#each itens as item}
							<option value={item.id}>{item.nome}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Solicitante *</label>
					<select 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.solicitanteId}
					>
						<option value="">Selecione um usuário</option>
						{#each usuarios as usuario}
							<option value={usuario.id}>{usuario.nomeCompleto} - {formatCPF(usuario.cpf)}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Professor Autorizador</label>
					<select 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.professorAutorizadorId}
					>
						<option value="">Selecione um professor</option>
						{#each professores as prof}
							<option value={prof.professor.id}>{prof.usuario.nomeCompleto}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
					<input 
						type="date" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.dataInicio}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Data de Devolução Prevista *</label>
					<input 
						type="date" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.dataDevolucaoPrevista}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Pessoa que Pegou</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.pessoaQuePegou}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Sala onde Pegou</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.salaQuePegou}
					/>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Localização Atual</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.localizacaoAtual}
					/>
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
					href="/emprestimos" 
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
