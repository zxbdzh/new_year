import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署路径配置
// 如果应用部署在子路径，修改此值
// 例如：部署在 https://your-site.com/newyear-game/，则设置为 '/newyear-game/'
const base = '/newyear-game/';

// https://vite.dev/config/
export default defineConfig({
  base: base,
  plugins: [react()],
  build: {
    // 添加版本号到文件名，避免缓存问题
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
});
