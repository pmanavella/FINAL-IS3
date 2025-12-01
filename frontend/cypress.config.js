const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    video: false,
    defaultCommandTimeout: 10000
  }
});
