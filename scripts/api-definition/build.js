const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const apiDefinition = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      version: '0.0.0',
      title: 'kv-persistent-value',
      description: 'A simple key-value store API powering GitHub actions.',
      contact: {
        name: 'Aaron Imming',
        email: 'aaim@protonmail.com',
        url: 'https://github.com/aaimio/kv-persistent-value',
      },
      license: {
        name: 'MIT',
        url: 'https://github.com/aaimio/kv-persistent-value/blob/master/LICENSE',
      },
    },
    servers: [
      {
        url: 'https://persistent.aaim.io/api',
      },
    ],
  },
  apis: [path.join(process.cwd(), 'src', 'index.ts')],
});

// TODO: Publish this config somewhere.