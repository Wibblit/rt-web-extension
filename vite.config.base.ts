import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import { defineConfig, BuildOptions } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { stripDevIcons, crxI18n } from "./custom-vite-plugins";
import manifest from "./manifest.json";
import devManifest from "./manifest.dev.json";
import pkg from "./package.json";
import path from "path";

const isDev = process.env.__DEV__ === "true";
// set this flag to true, if you want localization support
const localize = false;

export const baseManifest = {
  ...manifest,
  version: pkg.version,
  ...(isDev ? devManifest : ({} as ManifestV3Export)),
  ...(localize
    ? {
        name: "__MSG_extName__",
        description: "__MSG_extDescription__",
        default_locale: "en",
      }
    : {}),
} as ManifestV3Export;

export const baseBuildOptions: BuildOptions = {
  sourcemap: isDev,
  emptyOutDir: !isDev,
};

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    stripDevIcons(isDev),
    crxI18n({ localize, src: "./src/locales" }),
  ],
  publicDir: resolve(__dirname, "public"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        jobDetails: path.resolve(__dirname, "src/pages/jobDetails/index.html"),
        JobPageSkeleton: path.resolve(
          __dirname,
          "src/pages/jobPageSkeleton/index.html"
        ),
        loginPage: path.resolve(__dirname, "src/pages/auth/index.html"),
      },
      output: {
        entryFileNames: (chunk) => `src/pages/${chunk.name}/index.js`,
      },
    },
  },
});
