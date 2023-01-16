import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // @ts-expect-error
  plugins: [solid()],
});
