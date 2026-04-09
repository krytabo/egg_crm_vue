// vite.config.mjs
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ArcoResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { TinyVueSingleResolver } from '@opentiny/unplugin-tiny-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const testEnv = 'https://staging-api-staging-07d7.up.railway.app';
  const prodEnv = 'https://eggdrop.up.railway.app';
  const apiTarget = env.VITE_APP_AXIOS_BASEURL || 'https://staging-api-staging-07d7.up.railway.app';

  return {
    plugins: [
      vue(),
      tailwindcss(),
      vueJsx(),
      AutoImport({
        resolvers: [ArcoResolver(), ElementPlusResolver(), TinyVueSingleResolver, TDesignResolver({ library: 'mobile-vue' }), TDesignResolver({ library: 'vue-next' })],
      }),
      Components({
        resolvers: [ArcoResolver({ sideEffect: true }), ElementPlusResolver(), TinyVueSingleResolver, TDesignResolver({ library: 'mobile-vue' }), TDesignResolver({ library: 'vue-next' })],
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
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/hostApi/, ''),
          ws: true,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
            });
          },
        },
      },
    },
  };
});
