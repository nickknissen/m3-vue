// Only for the tests: the package ships its source, and each app builds it.
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: { environment: 'node', server: { deps: { inline: ['@material/material-color-utilities'] } } },
});
