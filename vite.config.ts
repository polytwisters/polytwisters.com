import { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), VitePWA()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        arc_polygon: resolve(__dirname, "arc_polygon.html"),
      },
    },
  },
});
