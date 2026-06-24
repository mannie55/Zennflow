import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  permissions: [
    "storage",
    "unlimitedStorage",
    "alarms",
    "notifications",
  ],
  host_permissions: ["http://localhost:3001/*"],
  action: {
    default_icon: {
      48: "public/logo.png",
    },
  },
  chrome_url_overrides: {
    newtab: "src/newTab/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.jsx"],
      matches: ["https://*/*"],
    },
  ],
  background: {
    service_worker: "src/background.js",
    type: "module",
  },
});
