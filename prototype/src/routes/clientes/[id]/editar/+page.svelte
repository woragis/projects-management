<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Save, Upload, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { uploadFile, validateImageFile } from '$lib/utils/upload';

	let formData = $state({
		cpf: '',
		rg: '',
		dataNascimento: '',
		nomeCompleto: '',
		fotoPerfil: '',
		email: '',
		telefone: '',
		whatsapp: '',
		endereco: ''
	});

	let loading = $state(false);
	let loadingData = $state(true);
	let uploadingImage = $state(false);
	let error = $state<string | null>(null);
	let imagePreview = $state<string | null>(null);
	let selectedFile = $state<File | null>(null);

	onMount(async () => {
		try {
			const response = await api.get(`/clientes/${page.params.id}`);
			const cliente = response.data.data;
			formData = {
				cpf: cliente.cpf || '',
				rg: cliente.rg || '',
				dataNascimento: cliente.dataNascimento || '',
				nomeCompleto: cliente.nomeCompleto || '',
				fotoPerfil: cliente.fotoPerfil || '',
				email: cliente.email || '',
				telefone: cliente.telefone || '',
				whatsapp: cliente.whatsapp || '',
				endereco: cliente.endereco || ''
			};
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar cliente';
		} finally {
			loadingData = false;
		}
	});

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (!file) return;

		const validation = validateImageFile(file);
		if (!validation.valid) {
			error = validation.error || 'Arquivo inválido';
			return;
		}

		selectedFile = file;
		error = null;

		// Criar preview
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function handleUpload() {
		if (!selectedFile) return;

		uploadingImage = true;
		error = null;

		try {
			const result = await uploadFile(selectedFile, 'cliente');
			if (result.success && result.url) {
				formData.fotoPerfil = result.url;
				selectedFile = null;
				imagePreview = null;
			} else {
				error = result.error || 'Erro ao fazer upload da imagem';
			}
		} catch (err: any) {
			error = err.message || 'Erro ao fazer upload da imagem';
		} finally {
			uploadingImage = false;
		}
	}

	function removeImage() {
		selectedFile = null;
		imagePreview = null;
		formData.fotoPerfil = '';
	}

	async function handleSubmit() {
		// Se houver arquivo selecionado mas ainda não foi feito upload, fazer upload primeiro
		if (selectedFile && !imagePreview) {
			await handleUpload();
			if (error) return;
		}

		loading = true;
		error = null;

		try {
			await api.put(`/clientes/${page.params.id}`, formData);
			goto(`/clientes/${page.params.id}`);
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao atualizar cliente';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href={`/clientes/${page.params.id}`} class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Editar Cliente</h1>
	</div>

	{#if loadingData}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	{:else}
		{#if error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
				{error}
			</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="bg-white rounded-lg shadow p-6 space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
					<input 
						type="text" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.nomeCompleto}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
					<input 
						type="text" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.cpf}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">RG *</label>
					<input 
						type="text" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.rg}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
					<input 
						type="date" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.dataNascimento}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
					<input 
						type="email" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.email}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
					<input 
						type="tel" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.telefone}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
					<input 
						type="tel" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.whatsapp}
					/>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
					
					<!-- Preview da imagem -->
					{#if imagePreview || formData.fotoPerfil}
						<div class="mb-4 relative inline-block">
							<img 
								src={imagePreview || formData.fotoPerfil} 
								alt="Preview" 
								class="w-32 h-32 object-cover rounded-lg border border-gray-300"
							/>
						<button
							type="button"
							onclick={removeImage}
							class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
						>
							<X size={16} />
						</button>
						</div>
					{/if}

					<!-- Input de arquivo -->
					<div class="flex gap-4 items-end">
						<div class="flex-1">
							<input 
								type="file" 
								accept="image/*"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								onchange={handleFileSelect}
							/>
							<p class="text-xs text-gray-500 mt-1">Formatos aceitos: JPG, PNG, GIF (máx. 5MB)</p>
						</div>
						{#if selectedFile}
							<button
								type="button"
								onclick={handleUpload}
								disabled={uploadingImage}
								class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
							>
								<Upload size={18} />
								{uploadingImage ? 'Enviando...' : 'Enviar'}
							</button>
						{/if}
					</div>

					<!-- URL alternativa (opcional) -->
					<div class="mt-4">
						<label class="block text-sm font-medium text-gray-700 mb-2">Ou informe uma URL</label>
						<input 
							type="url" 
							placeholder="https://exemplo.com/imagem.jpg"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={formData.fotoPerfil}
						/>
					</div>
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
				<textarea 
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					rows="3"
					bind:value={formData.endereco}
				></textarea>
			</div>

			<div class="flex justify-end gap-4">
				<a 
					href={`/clientes/${page.params.id}`}
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
