import path from "path";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import react from "@vitejs/plugin-react";
import svgr from "@svgr/rollup";

// Make a custom __dirname
// because vite can only work with ES Modules, so __dirname does not exist
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const electronEntryPath = path.resolve(__dirname, "src", "main", "main.ts");
const rendererPath = path.resolve(__dirname, "src", "renderer");
const assetsPath = path.resolve(__dirname, "assets");

export default defineConfig({
  // vite config for renderer module
  root: rendererPath,
  build: {
    sourcemap: "inline",
    outDir: path.resolve(__dirname, "dist", "renderer"),
  },
  resolve: {
    // this makes it possible to do absolute import in React project
    alias: [
      { find: "@", replacement: path.resolve(rendererPath) },
      { find: "@icons", replacement: path.resolve(assetsPath, "icons") },
      { find: "@models", replacement: path.resolve(assetsPath, "models") },
    ],
  },
  // development server config
  server: {
    port: +(process.env.VITE_DEV_SERVER_PORT || 3333),
  },
  plugins: [
    react({}),
    svgr({}),
    electron([
      // vite config for main process module
      {
        entry: electronEntryPath,
        vite: {
          build: {
            sourcemap: "inline",
            outDir: path.resolve(__dirname, "dist", "main"),
          },
        },
      },
      // vite config for preload module
      {
        entry: path.join(__dirname, "src/preload/preload.ts"),
        vite: {
          build: {
            sourcemap: "inline",
            outDir: path.resolve(__dirname, "dist", "preload"),
          },
        },
      },
    ]),
  ],
});
