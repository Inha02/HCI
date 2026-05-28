const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HCI_NOON API',
      version: '1.0.0',
      description: 'EAR 기반 안구 데이터 API',
    },
    servers: [
      {
        url: 'http://localhost:5001',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // 여기 중요
};

const specs = swaggerJsdoc(options);

module.exports = specs;
