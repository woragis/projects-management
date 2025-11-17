/**
 * Normalize CPF by removing formatting (dots and dashes)
 * This ensures consistent storage and comparison
 * @param cpf - CPF with or without formatting
 * @returns CPF with only numbers (no dots, dashes, or spaces)
 */
export function normalizeCpf(cpf: string): string {
	if (!cpf) return '';
	return cpf.replace(/[.\-\s]/g, '').trim();
}

/**
 * Validate CPF format (must have 11 digits after normalization)
 * @param cpf - CPF to validate
 * @returns true if valid format
 */
export function isValidCpfFormat(cpf: string): boolean {
	const normalized = normalizeCpf(cpf);
	return normalized.length === 11 && /^\d+$/.test(normalized);
}

