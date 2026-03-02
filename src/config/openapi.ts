/** OpenAPI 3.0 document for Swagger UI */
export const openApiDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Files Manager API',
    version: '1.0.0',
    description: 'API for documents, students, users and company settings.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/company': {
      get: {
        summary: 'Get company by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }],
        responses: { 200: { description: 'Company' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update company',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'id', required: true, schema: { type: 'integer', minimum: 1 } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', nullable: true },
                  address: { type: 'string', nullable: true },
                  logoUrl: { type: 'string', format: 'uri', nullable: true },
                  timezone: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated company' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
      },
      post: {
        summary: 'Create company',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', nullable: true },
                  address: { type: 'string', nullable: true },
                  logoUrl: { type: 'string', format: 'uri', nullable: true },
                  timezone: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Created company' }, 401: { description: 'Unauthorized' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
