/**
 * Formata um valor em centavos para formato de moeda brasileira (R$)
 * @param value - Valor em centavos
 * @returns String formatada como "R$ 1.234,56"
 */
export function formatCurrency(value: number | string | null | undefined): string {
	if (value === null || value === undefined) {
		return 'R$ 0,00';
	}

	// Se for string, converter para número
	const numValue = typeof value === 'string' ? parseFloat(value) : value;

	// Se for NaN ou não for um número válido
	if (isNaN(numValue)) {
		return 'R$ 0,00';
	}

	// Converter centavos para reais (se o valor for muito grande, assumir que já está em reais)
	// Valores menores que 1000 provavelmente estão em centavos
	const reais = numValue < 1000 && numValue > 0 ? numValue / 100 : numValue;

	// Formatar como moeda brasileira
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL'
	}).format(reais);
}

/**
 * Formata um CPF removendo caracteres não numéricos e adicionando a máscara
 * @param cpf - CPF com ou sem formatação
 * @returns CPF formatado como "000.000.000-00"
 */
export function formatCPF(cpf: string | null | undefined): string {
	if (!cpf) {
		return '';
	}

	// Remove tudo que não é número
	const numbers = cpf.replace(/\D/g, '');

	// Se não tiver 11 dígitos, retorna o valor original ou vazio
	if (numbers.length !== 11) {
		return cpf;
	}

	// Aplica a máscara: 000.000.000-00
	return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata um RG removendo caracteres não numéricos e adicionando a máscara
 * @param rg - RG com ou sem formatação
 * @returns RG formatado como "00.000.000-0"
 */
export function formatRG(rg: string | null | undefined): string {
	if (!rg) {
		return '';
	}

	// Remove tudo que não é número
	const numbers = rg.replace(/\D/g, '');

	// Se não tiver entre 7 e 9 dígitos, retorna o valor original
	if (numbers.length < 7 || numbers.length > 9) {
		return rg;
	}

	// Aplica a máscara baseada no tamanho
	if (numbers.length === 9) {
		// Formato: 00.000.000-0
		return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
	} else if (numbers.length === 8) {
		// Formato: 0.000.000-0
		return numbers.replace(/(\d{1})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
	} else {
		// Formato: 000.000-0
		return numbers.replace(/(\d{3})(\d{3})(\d{1})/, '$1.$2-$3');
	}
}

/**
 * Remove a formatação de CPF/RG, deixando apenas números
 * @param value - Valor formatado
 * @returns Apenas números
 */
export function unformatDocument(value: string | null | undefined): string {
	if (!value) {
		return '';
	}
	return value.replace(/\D/g, '');
}

/**
 * Formata um telefone removendo caracteres não numéricos e adicionando a máscara
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone formatado como "(00) 00000-0000" ou "(00) 0000-0000"
 */
export function formatPhone(phone: string | null | undefined): string {
	if (!phone) {
		return '';
	}

	// Remove tudo que não é número
	const numbers = phone.replace(/\D/g, '');

	// Se não tiver 10 ou 11 dígitos, retorna o valor original
	if (numbers.length !== 10 && numbers.length !== 11) {
		return phone;
	}

	// Se tiver 11 dígitos (celular): (00) 00000-0000
	if (numbers.length === 11) {
		return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
	}

	// Se tiver 10 dígitos (fixo): (00) 0000-0000
	return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

/**
 * Formata uma data para o formato brasileiro
 * @param date - Data como string ISO, Date object ou timestamp
 * @returns Data formatada como "dd/mm/yyyy"
 */
export function formatDate(date: string | Date | number | null | undefined): string {
	if (!date) {
		return '';
	}

	try {
		const dateObj = typeof date === 'string' || typeof date === 'number' 
			? new Date(date) 
			: date;

		if (isNaN(dateObj.getTime())) {
			return '';
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		}).format(dateObj);
	} catch {
		return '';
	}
}

/**
 * Formata uma data e hora para o formato brasileiro
 * @param date - Data como string ISO, Date object ou timestamp
 * @returns Data e hora formatada como "dd/mm/yyyy HH:mm"
 */
export function formatDateTime(date: string | Date | number | null | undefined): string {
	if (!date) {
		return '';
	}

	try {
		const dateObj = typeof date === 'string' || typeof date === 'number' 
			? new Date(date) 
			: date;

		if (isNaN(dateObj.getTime())) {
			return '';
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(dateObj);
	} catch {
		return '';
	}
}

