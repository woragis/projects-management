<script lang="ts">
	import api from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { LogIn, UserPlus } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth';

	let isLogin = $state(true);
	let loading = $state(false);
	let error = $state<string | null>(null);

	let loginData = $state({
		cpf: '',
		senha: ''
	});

	let registerData = $state({
		cpf: '',
		rg: '',
		dataNascimento: '',
		nomeCompleto: '',
		email: '',
		telefone: '',
		whatsapp: '',
		endereco: '',
		senha: '',
		senhaConfirmacao: ''
	});

	async function handleLogin() {
		loading = true;
		error = null;

		try {
			const user = await authStore.login(loginData.cpf, loginData.senha);
			
			// Aguardar um pouco para garantir que o cookie foi definido
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Verificar autenticação novamente para garantir que está sincronizado
			await authStore.checkAuth();
			
			// Redirecionar para dashboard
			goto('/');
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao fazer login';
		} finally {
			loading = false;
		}
	}

	async function handleRegister() {
		loading = true;
		error = null;

		// Validações
		if (!registerData.cpf || !registerData.rg || !registerData.dataNascimento || !registerData.nomeCompleto) {
			error = 'Preencha todos os campos obrigatórios';
			loading = false;
			return;
		}

		if (registerData.senha !== registerData.senhaConfirmacao) {
			error = 'As senhas não coincidem';
			loading = false;
			return;
		}

		try {
			const { senhaConfirmacao, ...dataToSend } = registerData;
			const user = await authStore.register(dataToSend);
			
			// Aguardar um pouco para garantir que o cookie foi definido
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Verificar autenticação novamente para garantir que está sincronizado
			await authStore.checkAuth();
			
			// Redirecionar para dashboard
			goto('/');
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao registrar';
		} finally {
			loading = false;
		}
	}

	function toggleMode() {
		isLogin = !isLogin;
		error = null;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="bg-white rounded-2xl shadow-xl p-8">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-2">
					Sistema de Empréstimos
				</h1>
				<p class="text-gray-600">
					{isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
				</p>
			</div>

			{#if error}
				<div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
					{error}
				</div>
			{/if}

			{#if isLogin}
				<!-- Login Form -->
				<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="space-y-6">
					<div>
						<label for="loginCpf" class="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
						<input
							id="loginCpf"
							type="text"
							required
							placeholder="000.000.000-00"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={loginData.cpf}
						/>
					</div>

					<div>
						<label for="loginSenha" class="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
						<input
							id="loginSenha"
							type="password"
							required
							placeholder="Digite sua senha"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={loginData.senha}
						/>
						<p class="mt-2 text-xs text-gray-500">
							Nota: Por enquanto, use seu CPF como senha
						</p>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
					>
						<LogIn size={20} />
						{loading ? 'Entrando...' : 'Entrar'}
					</button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-sm text-gray-600">
						Ainda não tem conta?
						<button
							type="button"
							onclick={toggleMode}
							class="ml-1 text-blue-600 hover:text-blue-700 font-medium"
						>
							Cadastre-se
						</button>
					</p>
				</div>
			{:else}
				<!-- Register Form -->
				<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="regCpf" class="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
							<input
								id="regCpf"
								type="text"
								required
								placeholder="000.000.000-00"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={registerData.cpf}
							/>
						</div>

						<div>
							<label for="regRg" class="block text-sm font-medium text-gray-700 mb-2">RG *</label>
							<input
								id="regRg"
								type="text"
								required
								placeholder="00.000.000-0"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={registerData.rg}
							/>
						</div>
					</div>

					<div>
						<label for="regNome" class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
						<input
							id="regNome"
							type="text"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={registerData.nomeCompleto}
						/>
					</div>

					<div>
						<label for="regDataNascimento" class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
						<input
							id="regDataNascimento"
							type="date"
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={registerData.dataNascimento}
						/>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="regEmail" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
							<input
								id="regEmail"
								type="email"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={registerData.email}
							/>
						</div>

						<div>
							<label for="regTelefone" class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
							<input
								id="regTelefone"
								type="tel"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={registerData.telefone}
							/>
						</div>
					</div>

					<div>
						<label for="regWhatsapp" class="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
						<input
							id="regWhatsapp"
							type="tel"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={registerData.whatsapp}
						/>
					</div>

					<div>
						<label for="regEndereco" class="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
						<textarea
							id="regEndereco"
							rows="2"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={registerData.endereco}
						></textarea>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="regSenha" class="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
							<input
								id="regSenha"
								type="password"
								required
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={registerData.senha}
							/>
						</div>

						<div>
							<label for="regSenhaConfirmacao" class="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha *</label>
							<input
								id="regSenhaConfirmacao"
								type="password"
								required
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								bind:value={registerData.senhaConfirmacao}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
					>
						<UserPlus size={20} />
						{loading ? 'Cadastrando...' : 'Cadastrar'}
					</button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-sm text-gray-600">
						Já tem conta?
						<button
							type="button"
							onclick={toggleMode}
							class="ml-1 text-blue-600 hover:text-blue-700 font-medium"
						>
							Faça login
						</button>
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
