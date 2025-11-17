/**
 * Database Error Codes
 * These map to PostgreSQL error codes and common connection errors
 */
export const DB_ERROR_CODES = {
	// Connection Errors
	CONNECTION_REFUSED: 'ECONNREFUSED',
	CONNECTION_TIMEOUT: 'ETIMEDOUT',
	CONNECTION_RESET: 'ECONNRESET',
	DNS_ERROR: 'ENOTFOUND',
	
	// PostgreSQL Error Codes
	AUTH_FAILED: '28P01', // Invalid password
	INVALID_AUTHORIZATION: '28000', // Invalid authorization specification
	DUPLICATE_DATABASE: '42P04', // Duplicate database
	DUPLICATE_TABLE: '42P07', // Duplicate table
	UNDEFINED_TABLE: '42P01', // Undefined table
	UNDEFINED_COLUMN: '42703', // Undefined column
	UNDEFINED_FUNCTION: '42883', // Undefined function
	SYNTAX_ERROR: '42601', // Syntax error
	INVALID_TEXT_REPRESENTATION: '22P02', // Invalid text representation
	NOT_NULL_VIOLATION: '23502', // Not null violation
	FOREIGN_KEY_VIOLATION: '23503', // Foreign key violation
	UNIQUE_VIOLATION: '23505', // Unique violation
	CHECK_VIOLATION: '23514', // Check violation
	
	// Application Error Codes
	QUERY_FAILED: 'DB_QUERY_FAILED',
	CONNECTION_POOL_ERROR: 'DB_POOL_ERROR',
	TRANSACTION_ERROR: 'DB_TRANSACTION_ERROR',
	UNKNOWN_DB_ERROR: 'DB_UNKNOWN_ERROR'
} as const;

/**
 * Application Error Codes
 */
export const APP_ERROR_CODES = {
	// Validation Errors
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
	INVALID_FORMAT: 'INVALID_FORMAT',
	
	// Authentication Errors
	AUTH_REQUIRED: 'AUTH_REQUIRED',
	AUTH_INVALID: 'AUTH_INVALID',
	AUTH_EXPIRED: 'AUTH_EXPIRED',
	
	// Resource Errors
	RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
	RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
	RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
	
	// Permission Errors
	PERMISSION_DENIED: 'PERMISSION_DENIED',
	INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
	
	// Server Errors
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

export type DbErrorCode = typeof DB_ERROR_CODES[keyof typeof DB_ERROR_CODES];
export type AppErrorCode = typeof APP_ERROR_CODES[keyof typeof APP_ERROR_CODES];
export type ErrorCode = DbErrorCode | AppErrorCode;

