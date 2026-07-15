import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        settings: fileURLToPath(new URL('./pages/settings.html', import.meta.url)),
        game: fileURLToPath(new URL('./pages/game.html', import.meta.url)),
        winner: fileURLToPath(new URL('./pages/winner.html', import.meta.url)),
        draw: fileURLToPath(new URL('./pages/draw.html', import.meta.url)),
        gameOver: fileURLToPath(new URL('./pages/game-over.html', import.meta.url))
      }
    }
  }
});