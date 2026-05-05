import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Financial Report API',
      version: '1.0.0',
      description: 'API to manage financial reports',
      contact: {
        name: 'Developer'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['./routes/*.ts'], // IMPORTANT: change to .ts
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;