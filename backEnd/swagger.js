const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Financial Report API',
      version: '1.0.0',
      description: 'API to manage and generate financial reports using Node.js and MongoDB',
      contact: {
        name: 'Developer'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
  },
  // This points to where your JSDoc comments are located
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;