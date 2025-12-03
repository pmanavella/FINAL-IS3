// /// <reference types="vitest" />
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   test: {
//     environment: 'happy-dom',
//     globals: true,
//     setupFiles: './setupTests.js',
//     coverage: {
//       provider: 'v8',
//       reporter: ['text', 'lcov', 'cobertura'],
//       reportsDirectory: 'coverage',
//       thresholds: {       
//         statements: 70,
//         branches: 50,
//         functions: 70,
//         lines: 70,
//       },
//       all: true,
//       exclude: [
//         "src/main.jsx",           // entrypoint real NO testeable
//         "src/App.jsx",            // archivo gigante, JSX, navegación, efectos
//         "src/**/__tests__/**",    // los propios tests
//         "src/mocks/**",           // mocks si existieran
//       ],
//     },
//   }  
// });

/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./setupTests.js'],

  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov'],
    reportsDirectory: 'coverage',
    include: ['src/**/*.{js,jsx}'],
    exclude: ['src/__tests__/**', 'src/**/*.d.ts'],
    statements: 70,
    branches: 50,
    functions: 70,
    lines: 70,
    },
  },
});
