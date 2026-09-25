import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/tests/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
