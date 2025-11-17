<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { 
		Users, 
		UserCheck, 
		Package, 
		BookOpen, 
		Bell, 
		FileText,
		TrendingUp,
		AlertCircle
	} from 'lucide-svelte';

	let stats = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await api.get('/dashboard');
			stats = response.data.data;
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar dados';
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if stats}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			<!-- Total Clientes -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Total Clientes</p>
						<p class="text-2xl font-bold text-gray-900 mt-2">{stats.totalClientes}</p>
					</div>
					<Users class="text-blue-500" size={32} />
				</div>
			</div>

			<!-- Total Professores -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Total Professores</p>
						<p class="text-2xl font-bold text-gray-900 mt-2">{stats.totalProfessores}</p>
					</div>
					<UserCheck class="text-green-500" size={32} />
				</div>
			</div>

			<!-- Total Itens -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Total Itens</p>
						<p class="text-2xl font-bold text-gray-900 mt-2">{stats.totalItens}</p>
					</div>
					<Package class="text-purple-500" size={32} />
				</div>
			</div>

			<!-- Itens Disponíveis -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Disponíveis</p>
						<p class="text-2xl font-bold text-green-600 mt-2">{stats.totalItensDisponiveis}</p>
					</div>
					<TrendingUp class="text-green-500" size={32} />
				</div>
			</div>

			<!-- Empréstimos Ativos -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Empréstimos Ativos</p>
						<p class="text-2xl font-bold text-blue-600 mt-2">{stats.totalEmprestimosAtivos}</p>
					</div>
					<BookOpen class="text-blue-500" size={32} />
				</div>
			</div>

			<!-- Empréstimos Atrasados -->
			<div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Empréstimos Atrasados</p>
						<p class="text-2xl font-bold text-red-600 mt-2">{stats.totalEmprestimosAtrasados}</p>
					</div>
					<AlertCircle class="text-red-500" size={32} />
				</div>
			</div>

			<!-- Notificações Pendentes -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Notificações Pendentes</p>
						<p class="text-2xl font-bold text-yellow-600 mt-2">{stats.totalNotificacoesPendentes}</p>
					</div>
					<Bell class="text-yellow-500" size={32} />
				</div>
			</div>

			<!-- Processos Abertos -->
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-gray-500 text-sm font-medium">Processos Abertos</p>
						<p class="text-2xl font-bold text-orange-600 mt-2">{stats.totalProcessosAbertos}</p>
					</div>
					<FileText class="text-orange-500" size={32} />
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
			<a 
				href="/emprestimos?status=ativo" 
				class="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition shadow"
			>
				<h3 class="font-semibold text-lg mb-2">Ver Empréstimos Ativos</h3>
				<p class="text-blue-100">Visualize todos os empréstimos em andamento</p>
			</a>

			<a 
				href="/emprestimos/atrasados" 
				class="bg-red-600 text-white rounded-lg p-6 hover:bg-red-700 transition shadow"
			>
				<h3 class="font-semibold text-lg mb-2">Ver Empréstimos Atrasados</h3>
				<p class="text-red-100">Itens que precisam ser devolvidos</p>
			</a>

			<a 
				href="/processos-administrativos?status=aberto" 
				class="bg-orange-600 text-white rounded-lg p-6 hover:bg-orange-700 transition shadow"
			>
				<h3 class="font-semibold text-lg mb-2">Processos Administrativos</h3>
				<p class="text-orange-100">Gerencie processos em aberto</p>
			</a>
		</div>
	{/if}
</div>