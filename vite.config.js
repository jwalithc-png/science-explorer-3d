import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { remoteControlPlugin } from './vite-remote-plugin.js';

export default defineConfig({
  plugins: [
    basicSsl(),
    remoteControlPlugin()
  ],
  server: {
    port: 3050,
    open: true,
    host: true,
    https: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
