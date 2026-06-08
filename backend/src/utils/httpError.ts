export class HttpError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new HttpError(400, 'BAD_REQUEST', message, details);
}

export function unauthorized(message = 'Authentication is required.') {
  return new HttpError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message = 'You do not have permission to access this resource.') {
  return new HttpError(403, 'FORBIDDEN', message);
}

export function notFound(message = 'Resource not found.') {
  return new HttpError(404, 'NOT_FOUND', message);
}

export function conflict(message: string) {
  return new HttpError(409, 'CONFLICT', message);
}
