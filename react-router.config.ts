import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  presets: [vercelPreset()],
  buildDirectory: "build",
  appDirectory: "app",
  // Ensure proper serverBuildFile for Vercel deployment
  serverBuildFile: "index.js",
  // Configure for proper asset handling
  future: {
    unstable_optimizeDeps: false,
  },
} satisfies Config; 
