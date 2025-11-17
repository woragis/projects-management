import { DB_ERROR_CODES, APP_ERROR_CODES, type ErrorCode } from './codes';
import { getErrorMessage, mapPostgresErrorCode, mapNodeErrorCode } from './messages';

export { DB_ERROR_CODES, APP_ERROR_CODES };
export type { ErrorCode };

/**
 * Application Error Class
 */
export class AppError extends Error {
	public readonly code: ErrorCode;
	public readonly statusCode: number;
	public readonly details?: any;
	public readonly originalError?: Error;

	constructor(
		code: ErrorCode,
		message?: string,
		statusCode: number = 500,
		details?: any,
		originalError?: Error
	) {
		super(message || getErrorMessage(code));
		this.name = 'AppError';
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
		this.originalError = originalError;
		
		// Maintain proper stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}
	}

	toJSON() {
		return {
			error: this.message,
			errorCode: this.code,
			statusCode: this.statusCode,
			details: this.details,
			...(process.env.NODE_ENV === 'development' && {
				stack: this.stack,
				originalError: this.originalError?.message
			})
		};
	}
}

/**
 * Database Error Class
 */
export class DatabaseError extends AppError {
	constructor(
		pgError: any,
		operation: string = 'database operation'
	) {
		// Drizzle wraps errors, so we need to dig deep to find the actual error
		// Try multiple paths to find the real error
		let actualError = pgError;
		
		// Check if it's a Drizzle error with nested error
		if (pgError?.cause) {
			actualError = pgError.cause;
		}
		if (pgError?.originalError) {
			actualError = pgError.originalError;
		}
		if (pgError?.error) {
			actualError = pgError.error;
		}
		
		// Sometimes the error is nested deeper
		if (actualError?.cause) {
			actualError = actualError.cause;
		}
		if (actualError?.originalError) {
			actualError = actualError.originalError;
		}
		
		// Extract error code - check multiple possible locations
		const pgCode = actualError?.code || 
		               pgError?.code || 
		               actualError?.errno ||
		               pgError?.errno;
		
		// Extract message - prefer the actual error message over Drizzle's wrapper
		const pgMessage = actualError?.message || 
		                 pgError?.message || 
		                 'Unknown database error';
		
		const pgDetail = actualError?.detail || pgError?.detail;
		const pgHint = actualError?.hint || pgError?.hint;
		
		// Map to our error code
		let errorCode: ErrorCode = DB_ERROR_CODES.UNKNOWN_DB_ERROR;
		if (pgCode) {
			// Try Node.js error code first (ENOTFOUND, ECONNREFUSED, etc.)
			const nodeMapped = mapNodeErrorCode(String(pgCode));
			if (nodeMapped !== DB_ERROR_CODES.UNKNOWN_DB_ERROR) {
				errorCode = nodeMapped;
			} else {
				// Try PostgreSQL error code
				errorCode = mapPostgresErrorCode(String(pgCode));
			}
		}
		
		// Determine status code based on error type
		let statusCode = 500;
		if (errorCode === DB_ERROR_CODES.AUTH_FAILED || errorCode === DB_ERROR_CODES.INVALID_AUTHORIZATION) {
			statusCode = 503; // Service Unavailable
		} else if (errorCode === DB_ERROR_CODES.CONNECTION_REFUSED || 
		           errorCode === DB_ERROR_CODES.CONNECTION_TIMEOUT ||
		           errorCode === DB_ERROR_CODES.CONNECTION_RESET ||
		           errorCode === DB_ERROR_CODES.DNS_ERROR) {
			statusCode = 503; // Service Unavailable - can't reach database
		}
		
		const details: any = {
			operation,
			errorCode: pgCode,
			errorMessage: pgMessage,
			detail: pgDetail,
			hint: pgHint,
			position: actualError?.position || pgError?.position,
			table: actualError?.table || pgError?.table,
			column: actualError?.column || pgError?.column,
			constraint: actualError?.constraint || pgError?.constraint
		};
		
		// Add connection-specific details for network errors
		if (actualError?.hostname || actualError?.port || actualError?.syscall) {
			details.connection = {
				hostname: actualError?.hostname,
				port: actualError?.port,
				syscall: actualError?.syscall,
				code: actualError?.code,
				errno: actualError?.errno
			};
		}
		
		// Include raw error for debugging in development
		if (process.env.NODE_ENV === 'development') {
			details.rawError = {
				message: actualError?.message,
				code: actualError?.code,
				errno: actualError?.errno,
				syscall: actualError?.syscall,
				hostname: actualError?.hostname,
				port: actualError?.port,
				stack: actualError?.stack
			};
		}
		
		super(
			errorCode,
			getErrorMessage(errorCode),
			statusCode,
			details,
			pgError instanceof Error ? pgError : new Error(pgMessage)
		);
		
		this.name = 'DatabaseError';
	}
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: AppError | Error) {
	if (error instanceof AppError) {
		return error.toJSON();
	}
	
	// Fallback for unknown errors
	return {
		error: error.message || 'Erro desconhecido',
		errorCode: APP_ERROR_CODES.INTERNAL_SERVER_ERROR,
		statusCode: 500,
		...(process.env.NODE_ENV === 'development' && {
			stack: error.stack
		})
	};
}

