const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // no afecta en CI, se sobreescribe por env
    defaultCommandTimeout: 15000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});


// const { defineConfig } = require('cypress');

// module.exports = defineConfig({
//   e2e: {
//     baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
//     video: false,
//     defaultCommandTimeout: 10000,
//   },
// });
