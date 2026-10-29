import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  build: {
    // Lightning CSS (Vite's default) rejects Semantic UI's `:after .header` selectors.
    cssMinify: "esbuild",
  },
});
