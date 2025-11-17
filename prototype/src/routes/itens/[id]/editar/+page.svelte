<script lang="ts">
	import { onMount } from 'svelte';
	import api from '$lib/api/client';
	import { ArrowLeft, Save, Upload, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { uploadFile, validateImageFile } from '$lib/utils/upload';

	let formData = $state({
		nome: '',
		descricao: '',
		categoria: '',
		codigoPatrimonio: '',
		disponivel: true,
		condicao: 'bom',
		foto: '',
		localizacao: '',
		tags: [] as string[]
	});

	let tagInput = $state('');
	let loading = $state(false);
	let loadingData = $state(true);
	let uploadingImage = $state(false);
	let error = $state<string | null>(null);
	let imagePreview = $state<string | null>(null);
	let selectedFile = $state<File | null>(null);

	onMount(async () => {
		try {
			const id = $page.params?.id;
			if (!id) {
				error = 'ID não encontrado';
				loadingData = false;
				return;
			}
			const response = await api.get(`/itens/${id}`);
			const item = response.data.data;
			formData = {
				nome: item.nome || '',
				descricao: item.descricao || '',
				categoria: item.categoria || '',
				codigoPatrimonio: item.codigoPatrimonio || '',
				disponivel: item.disponivel ?? true,
				condicao: item.condicao || 'bom',
				foto: item.foto || '',
				localizacao: item.localizacao || '',
				tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : []
			};
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao carregar item';
		} finally {
			loadingData = false;
		}
	});

	function addTag() {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			formData.tags = [...formData.tags, tagInput.trim()];
			tagInput = '';
		}
	}

	function removeTag(tag: string) {
		formData.tags = formData.tags.filter(t => t !== tag);
	}

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
			const result = await uploadFile(selectedFile, 'item');
			if (result.success && result.url) {
				formData.foto = result.url;
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
		formData.foto = '';
	}

	async function handleSubmit() {
		// Se houver arquivo selecionado mas ainda não foi feito upload, fazer upload primeiro
		if (selectedFile && !imagePreview) {
			await handleUpload();
			if (error) return;
		}

		loading = true;
		error = null;

		const id = $page.params?.id;
		if (!id) {
			error = 'ID não encontrado';
			loading = false;
			return;
		}
		try {
			await api.put(`/itens/${id}`, formData);
			goto(`/itens/${id}`);
		} catch (err: any) {
			error = err.response?.data?.error || 'Erro ao atualizar item';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href={`/itens/${$page.params?.id || ''}`} class="text-gray-600 hover:text-gray-900">
			<ArrowLeft size={24} />
		</a>
		<h1 class="text-3xl font-bold text-gray-900">Editar Item</h1>
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
				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
					<input 
						type="text" 
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.nome}
					/>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
					<textarea 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						rows="3"
						bind:value={formData.descricao}
					></textarea>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.categoria}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Código Patrimônio</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.codigoPatrimonio}
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Condição</label>
					<select 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.condicao}
					>
						<option value="bom">Bom</option>
						<option value="regular">Regular</option>
						<option value="ruim">Ruim</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">Localização</label>
					<input 
						type="text" 
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						bind:value={formData.localizacao}
					/>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Foto</label>
					
					<!-- Preview da imagem -->
					{#if imagePreview || formData.foto}
						<div class="mb-4 relative inline-block">
							<img 
								src={imagePreview || formData.foto} 
								alt="Preview" 
								class="w-32 h-32 object-cover rounded-lg border border-gray-300"
							/>
							{#if selectedFile || imagePreview}
								<button
									type="button"
									onclick={removeImage}
									class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
								>
									<X size={16} />
								</button>
							{/if}
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
							bind:value={formData.foto}
						/>
					</div>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
					<div class="flex gap-2 mb-2">
						<input 
							type="text" 
							placeholder="Adicionar tag..."
							class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							bind:value={tagInput}
							onkeypress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
						/>
						<button 
							type="button"
							onclick={addTag}
							class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
						>
							Adicionar
						</button>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each formData.tags as tag}
							<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
								{tag}
								<button type="button" onclick={() => removeTag(tag)} class="text-blue-600 hover:text-blue-800">
									×
								</button>
							</span>
						{/each}
					</div>
				</div>

				<div>
					<label class="flex items-center gap-2">
						<input 
							type="checkbox" 
							class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							bind:checked={formData.disponivel}
						/>
						<span class="text-sm font-medium text-gray-700">Disponível</span>
					</label>
				</div>
			</div>

			<div class="flex justify-end gap-4">
				<a 
					href={`/itens/${$page.params?.id || ''}`}
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
