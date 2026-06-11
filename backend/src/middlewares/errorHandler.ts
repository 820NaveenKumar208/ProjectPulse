import type { ErrorRequestHandler } from 'express';

import { HttpError } from '../utils/httpError.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  void next;

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectIds) globally as 404 Not Found
  if (error?.name === 'CastError') {
    response.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found.',
      },
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong.',
    },
  });
};
