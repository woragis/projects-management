<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { 
		Home, 
		Users, 
		UserCheck, 
		Package, 
		BookOpen, 
		Bell, 
		FileText,
		Menu,
		X
	} from 'lucide-svelte';
	
	let { children } = $props();
	let menuOpen = $state(false);
</script>

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
		
		<nav class="mt-6">
			<a 
				href="/" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '') === '/' ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<Home size={20} class="mr-3" />
				Dashboard
			</a>
			
			<a 
				href="/clientes" 
				class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white {($page.url?.pathname || '').startsWith('/clientes') ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}"
			>
				<Users size={20} class="mr-3" />
				Clientes
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
			class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
	<main class="lg:ml-64 min-h-screen p-6">
		<div class="max-w-7xl mx-auto">
			{@render children()}
		</div>
	</main>
</div>