import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server forced to port 3000 to match the backend's CORS config
// (SecurityConfig.java allows http://localhost:3000 by default)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
