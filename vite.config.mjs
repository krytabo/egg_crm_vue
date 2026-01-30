// vite.config.mjs
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import { TinyVueSingleResolver } from '@opentiny/unplugin-tiny-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';
import path from 'node:path';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueJsx(),
    AutoImport({
      resolvers: [ArcoResolver(), TinyVueSingleResolver, TDesignResolver({ library: 'mobile-vue' })],
    }),
    Components({
      resolvers: [ArcoResolver({ sideEffect: true }), TinyVueSingleResolver, TDesignResolver({ library: 'mobile-vue' })],
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icon')],
      symbolId: 'icon-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    host: true,
    port: 5176,
    proxy: {
      '/hostApi': {
        target: 'https://eggdrop-crm.zeabur.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hostApi/, ''),
        ws: true,
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
          });
        },
      },
    },
  },
});
