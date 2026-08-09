// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "path";

const rootDir =
  typeof import.meta !== "undefined" && import.meta.dirname ? import.meta.dirname : __dirname;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: {
        "@frontend": path.resolve(rootDir, "./frontend"),
        "@backend": path.resolve(rootDir, "./backend"),
        "@agent": path.resolve(rootDir, "./agent"),
        "@components": path.resolve(rootDir, "./frontend/components"),
        "@features": path.resolve(rootDir, "./frontend/features"),
        "@hooks": path.resolve(rootDir, "./frontend/hooks"),
        "@lib": path.resolve(rootDir, "./backend/lib"),
        "@services": path.resolve(rootDir, "./backend/services"),
        "@integrations": path.resolve(rootDir, "./backend/integrations"),
        "@/components": path.resolve(rootDir, "./frontend/components"),
        "@/features": path.resolve(rootDir, "./frontend/features"),
        "@/hooks": path.resolve(rootDir, "./frontend/hooks"),
        "@/lib": path.resolve(rootDir, "./backend/lib"),
        "@/services": path.resolve(rootDir, "./backend/services"),
        "@/integrations": path.resolve(rootDir, "./backend/integrations"),
      },
    },
  },
});
