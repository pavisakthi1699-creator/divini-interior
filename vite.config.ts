import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxies /api/* → XAMPP Apache at http://localhost/divine-interior/api/*
      // Make sure the project is at: C:\xampp\htdocs\divine-interior\
      '/api': {
        target: 'http://127.0.0.1:80',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/divineinterior/api'),
        // Log proxy errors to terminal so you can see what's happening
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('\n[Proxy Error] Is XAMPP running?', err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[Proxy] →', req.method, req.url);
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
