export const FORBIDDEN_CONTENT = {
  'application/json': {
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403, description: 'HTTP status code' },
        message: { type: 'string', example: 'Forbidden', description: 'Error message' },
        error: { type: 'string', example: 'Forbidden', description: 'Error details' },
      },
      required: ['statusCode', 'message', 'error'],
    },
  },
};

export const NOT_FOUND_CONTENT = {
  'application/json': {
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404, description: 'HTTP status code' },
        message: { type: 'string', example: 'Image not found', description: 'Error message' },
        error: { type: 'string', example: 'Not Found', description: 'Error details' },
      },
      required: ['statusCode', 'message', 'error'],
    },
  },
};
