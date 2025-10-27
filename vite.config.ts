import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to remove ./ from asset paths
const removeLeadingDotSlash = (): Plugin => ({
  name: 'remove-leading-dot-slash',
  enforce: 'post',
  generateBundle(_, bundle) {
    for (const file of Object.values(bundle)) {
      if (file.type === 'asset' && file.fileName === 'index.html') {
        let html = file.source as string;
        html = html.replace(/src="\.\/assets\//g, 'src="assets/');
        html = html.replace(/href="\.\/assets\//g, 'href="assets/');
        file.source = html;
      }
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), removeLeadingDotSlash()],
  base: '',
  optimizeDeps: {
    exclude: ['lucide-react', '@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    outDir: 'deploy',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
