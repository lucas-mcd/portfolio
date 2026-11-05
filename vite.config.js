import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const securityHeaders = Object.fromEntries(JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url))).headers[0].headers.map(({ key, value }) => [key, value]));
export default defineConfig({ plugins: [react(), tailwindcss()], build: { sourcemap: false }, preview: { headers: securityHeaders } });
