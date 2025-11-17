<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Edit } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let cliente = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await api.get(`/clientes/${page.params.id}`);
			cliente = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar cliente';
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/clientes" class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Detalhes do Cliente</h1>
		<a 
			href={`/clientes/${page.params.id}/editar`}
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
	{:else if cliente}
		<div class="bg-white rounded-lg shadow p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Nome Completo</label>
					<p class="text-lg font-semibold text-gray-900">{cliente.nomeCompleto}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">CPF</label>
					<p class="text-lg text-gray-900">{cliente.cpf}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">RG</label>
					<p class="text-lg text-gray-900">{cliente.rg}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Data de Nascimento</label>
					<p class="text-lg text-gray-900">{new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
					<p class="text-lg text-gray-900">{cliente.email || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
					<p class="text-lg text-gray-900">{cliente.telefone || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">WhatsApp</label>
					<p class="text-lg text-gray-900">{cliente.whatsapp || '-'}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-500 mb-1">Endereço</label>
					<p class="text-lg text-gray-900">{cliente.endereco || '-'}</p>
				</div>
			</div>

			{#if cliente.fotoPerfil}
				<div class="md:col-span-2 mt-6">
					<label class="block text-sm font-medium text-gray-500 mb-2">Foto de Perfil</label>
					<img src={cliente.fotoPerfil} alt={cliente.nomeCompleto} class="w-48 h-48 object-cover rounded-lg border border-gray-300 shadow-md" />
				</div>
			{/if}
		</div>
	{/if}
</div>
