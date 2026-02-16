import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署路径配置：使用根路径，让 Socket.io 自己处理
const base = '/';

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
