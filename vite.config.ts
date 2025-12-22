import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

/// <reference types="vitest" />
/// <reference types="vite/client" />

export default defineConfig({
    plugins: [react(), svgr()],
    server: {
        port: 3000,
        hmr: false
    },
    test: {
        environment: 'happy-dom',
        setupFiles: ['./movie-catalog/src/setupTests.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
});