import { defineConfig, mergeConfig } from 'vite';
import { baseConfig } from './vite.base';
import { componentTagger } from 'lovable-tagger';

export default mergeConfig(
  baseConfig,
  defineConfig({
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [componentTagger()],
    build: {
      sourcemap: true,
    },
  })
);
