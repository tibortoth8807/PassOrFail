import { defineConfig } from 'vite';

// base './' so the build works on GitHub Pages under /<repo>/ as well as on a custom domain.
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
});
