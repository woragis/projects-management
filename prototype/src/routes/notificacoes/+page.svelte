<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { Bell, Mail, MessageCircle, Eye } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let notificacoes = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let filterStatus = $state<string>('');

	async function loadNotificacoes() {
		loading = true;
		try {
			const params: any = {};
			if (filterStatus) params.status = filterStatus;
			const response = await api.get('/notificacoes', { params });
			notificacoes = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar notificações';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadNotificacoes();
	});
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold text-gray-900">Notificações</h1>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4">
			<div class="flex-1">
				<select 
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={filterStatus}
					onchange={() => loadNotificacoes()}
				>
					<option value="">Todos os status</option>
					<option value="pendente">Pendentes</option>
					<option value="enviada">Enviadas</option>
					<option value="falha">Falhas</option>
				</select>
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
	{:else if notificacoes.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<p class="text-gray-500 text-lg">Nenhuma notificação encontrada</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each notificacoes as notif}
				<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
					<div class="flex justify-between items-start mb-4">
						<div class="flex items-center gap-3">
							{#if notif.notificacao.tipo === 'email'}
								<Mail class="text-blue-500" size={24} />
							{:else}
								<MessageCircle class="text-green-500" size={24} />
							{/if}
							<div>
								<h3 class="text-lg font-semibold text-gray-900">{notif.notificacao.assunto}</h3>
								<p class="text-sm text-gray-500">Para: {notif.destinatario?.nomeCompleto}</p>
							</div>
						</div>
						<span class="px-2 py-1 text-xs font-semibold rounded-full {
							notif.notificacao.status === 'enviada' ? 'bg-green-100 text-green-800' :
							notif.notificacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
							'bg-red-100 text-red-800'
						}">
							{notif.notificacao.status === 'enviada' ? 'Enviada' :
							 notif.notificacao.status === 'pendente' ? 'Pendente' : 'Falha'}
						</span>
					</div>

					<div class="space-y-2 text-sm text-gray-600 mb-4">
						<p><strong>Tipo:</strong> {notif.notificacao.tipo === 'email' ? 'Email' : 'WhatsApp'}</p>
						<p><strong>Data Agendamento:</strong> {new Date(notif.notificacao.dataAgendamento).toLocaleString('pt-BR')}</p>
						{#if notif.notificacao.dataEnvio}
							<p><strong>Data Envio:</strong> {new Date(notif.notificacao.dataEnvio).toLocaleString('pt-BR')}</p>
						{/if}
						{#if notif.notificacao.erro}
							<p class="text-red-600"><strong>Erro:</strong> {notif.notificacao.erro}</p>
						{/if}
					</div>

					<div class="border-t pt-4">
						<p class="text-sm text-gray-700 whitespace-pre-wrap">{notif.notificacao.mensagem}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
