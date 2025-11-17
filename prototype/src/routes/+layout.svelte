<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import '../app.css';
	import { page } from '$app/stores';
	import { authStore, type User } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { 
		Home, 
		Users, 
		UserCheck, 
		Package, 
		BookOpen, 
		Bell, 
		FileText,
		Menu,
		X,
		LogOut,
		User as UserIcon
	} from 'lucide-svelte';
	
	let { children } = $props();
	let menuOpen = $state(false);
	let user = $state<User | null>(null);
	let loading = $state(true);

	onMount(async () => {
		// Subscribe to auth store to get updates
		const unsubscribe = authStore.subscribe((u) => {
			user = u;
		});

		// Se estiver na página de login, não verificar autenticação
		try {
			const currentPath = $page?.url?.pathname || '';
			if (currentPath === '/login') {
				loading = false;
				return () => unsubscribe();
			}
		} catch (e) {
			// Se $page não estiver disponível, continuar normalmente
			console.warn('Page store not available:', e);
		}

		// Verificar se já temos um usuário no store (ex: após registro/login)
		const currentUser = get(authStore);
		if (currentUser) {
			user = currentUser;
			loading = false;
			return () => unsubscribe();
		}

		// Verificar autenticação ao carregar
		try {
			const currentUser = await authStore.checkAuth();
			if (!currentUser) {
				goto('/login');
				return () => unsubscribe();
			}
		} catch (err) {
			console.error('Auth check error:', err);
			goto('/login');
			return () => unsubscribe();
		} finally {
			loading = false;
		}

		return () => {
			unsubscribe();
		};
	});

	async function handleLogout() {
		await authStore.logout();
	}

	function getUserDisplayName() {
		if (!user) return '';
		return user.nomeCompleto || user.cpf || 'Usuário';
	}

	function getUserRoleName() {
		if (!user) return '';
		const roles: Record<string, string> = {
			'super_admin': 'Super Admin',
			'admin': 'Admin',
			'professor': 'Professor',
			'aluno': 'Aluno'
		};
		return roles[user.role] || user.role;
	}
</script>

<svelte:head>
	<title>Sistema de Empréstimos</title>
	<meta name="description" content="Sistema de Empréstimos">
	<meta name="keywords" content="Sistema de Empréstimos, Empréstimos, Biblioteca, UFPE">
	<meta name="author" content="UFPE">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="icon" href="/favicon.ico">
	<link rel="stylesheet" href="/styles.css">
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<aside class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 {menuOpen ? 'translate-x-0' : '-translate-x-full'}">
		<div class="flex items-center justify-between h-16 px-6 border-b border-gray-800">
			<h1 class="text-xl font-bold">Sistema de Empréstimos</h1>
			<button 
				onclick={() => menuOpen = false}
				class="lg:hidden text-gray-400 hover:text-white"
			>
				<X size={24} />
			</button>
		</div>

		<!-- User Info -->
		{#if user}
			<div class="px-6 py-4 border-b border-gray-800">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
						<UserIcon size={20} />
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-white truncate">{getUserDisplayName()}</p>
						<p class="text-xs text-gray-400">{getUserRoleName()}</p>
					</div>
				</div>
			</div>
		{/if}
		
		<nav class="mt-6">
			<a 
				href="/" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '') === '/' ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<Home size={20} class="mr-3" />
				Dashboard
			</a>
			
			<a 
				href="/usuarios" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '').startsWith('/usuarios') ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<Users size={20} class="mr-3" />
				Usuários
			</a>
			
			<a 
				href="/professores" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '').startsWith('/professores') ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<UserCheck size={20} class="mr-3" />
				Professores
			</a>
			
			<a 
				href="/itens" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '').startsWith('/itens') ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<Package size={20} class="mr-3" />
				Itens
			</a>
			
			<a 
				href="/emprestimos" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '').startsWith('/emprestimos') ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<BookOpen size={20} class="mr-3" />
				Empréstimos
			</a>
			
			<a 
				href="/notificacoes" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '').startsWith('/notificacoes') ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<Bell size={20} class="mr-3" />
				Notificações
			</a>
			
			<a 
				href="/processos-administrativos" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '').startsWith('/processos-administrativos') ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<FileText size={20} class="mr-3" />
				Processos Administrativos
			</a>
		</nav>

		<!-- Logout Button -->
		{#if user}
			<div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
				<button
					onclick={handleLogout}
					class="w-full flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
				>
					<LogOut size={20} />
					<span>Sair</span>
				</button>
			</div>
		{/if}
	</aside>

	<!-- Mobile menu button -->
	<div class="lg:hidden fixed top-4 left-4 z-40">
		<button 
			onclick={() => menuOpen = true}
			class="p-2 bg-gray-900 text-white rounded-md"
		>
			<Menu size={24} />
		</button>
	</div>

	<!-- Overlay -->
	{#if menuOpen}
		<button
			type="button"
			aria-label="Fechar menu"
			class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
			onclick={() => menuOpen = false}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					menuOpen = false;
				}
			}}
		></button>
	{/if}

	<!-- Main content -->
	{#if loading}
		<main class="lg:ml-64 min-h-screen p-6 flex items-center justify-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</main>
	{:else if (($page?.url?.pathname || '') === '/login')}
		<main class="min-h-screen">
			{@render children()}
		</main>
	{:else if user}
		<main class="lg:ml-64 min-h-screen p-6">
			<div class="max-w-7xl mx-auto">
				{@render children()}
			</div>
		</main>
	{/if}
</div>