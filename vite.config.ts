import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Changed from 'terser' to 'esbuild' for better compatibility
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion'],
          utils: ['@supabase/supabase-js']
        }
      }
    }
  },
  define: {
    // Ensure environment variables are available at build time
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});