import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ArcoResolver } from "unplugin-vue-components/resolvers";
import { TinyVueSingleResolver } from "@opentiny/unplugin-tiny-vue";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "node:path";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueJsx(),
    AutoImport({
      resolvers: [ArcoResolver(), TinyVueSingleResolver]
    }),
    Components({
      resolvers: [
        ArcoResolver({
          sideEffect: true
        }),
        TinyVueSingleResolver
      ]
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icon")],
      symbolId: "icon-[name]",
      inject: "body-last",
      customDomId: "__svg__icons__dom__"
    })
  ],
  resolve: {
    extensions: [".js", ".jsx", ".vue", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    target: "esnext",
    outDir: "build"
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/hostApi": {
        target: "https://eggdrop.zeabur.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hostApi/, ""),
        ws: true,
        configure: (proxy, options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            //處理 CORS
            proxyRes.headers["Access-Control-Allow-Origin"] = "*";
            proxyRes.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
            proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization";
          });
        }
      }
    }
  }
});
