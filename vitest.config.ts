import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      'server-only': require.resolve('./__mocks__/server-only.js')
    }
  },
});
