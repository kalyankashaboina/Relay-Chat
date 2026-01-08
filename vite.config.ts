import localConfig from './vite/vite.local';
import prodConfig from './vite/vite.prod';

export default ({ mode }: { mode: string }) => {
  if (mode === 'production') return prodConfig;
  return localConfig;
};
