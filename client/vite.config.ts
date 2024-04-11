import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Enables React fast refresh and other features
    tsconfigPaths() // Handles path aliases defined in tsconfig.json
  ],
  // Add any additional config settings here
});
