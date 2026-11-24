import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { renderPage } from './src/render.js';

const contentFile = resolve(__dirname, 'src/content.json');

// Renders index.html from src/content.json at build time (and on every request in dev),
// so the shipped page is plain static HTML.
function portfolioRender() {
  return {
    name: 'portfolio-render',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const content = JSON.parse(readFileSync(contentFile, 'utf8'));
        return renderPage(html, content);
      },
    },
    configureServer(server) {
      server.watcher.add(contentFile);
      server.watcher.on('change', (file) => {
        if (resolve(file) === contentFile) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  plugins: [portfolioRender()],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 0,
  },
});
