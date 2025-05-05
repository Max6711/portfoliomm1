import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        entryFileNames: 'commonHelpers.js',
      },
    },
  },
});
