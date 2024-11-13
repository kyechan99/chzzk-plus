// vite.config.ts
import { defineConfig } from "file:///Users/youngcheon/Desktop/dev/chzzk-plus/node_modules/vite/dist/node/index.js";
import svgr from "file:///Users/youngcheon/Desktop/dev/chzzk-plus/node_modules/vite-plugin-svgr/dist/index.js";
import react from "file:///Users/youngcheon/Desktop/dev/chzzk-plus/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { crx } from "file:///Users/youngcheon/Desktop/dev/chzzk-plus/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  name: "Chzzk Plus",
  description: "\uB124\uC774\uBC84 \uC2A4\uD2B8\uB9AC\uBC0D \uC11C\uBE44\uC2A4 Chzzk Plus",
  version: "1.3.5",
  manifest_version: 3,
  icons: {
    "16": "icon16.png",
    "32": "icon32.png",
    "64": "icon64.png",
    "128": "icon128.png"
  },
  permissions: ["storage"],
  content_scripts: [
    {
      matches: ["*://chzzk.naver.com/*"],
      js: ["src/content.tsx"]
    }
  ],
  host_permissions: ["http://www.google.com/", "https://www.google.com/"],
  background: {
    service_worker: "src/background.ts"
  },
  action: {
    default_icon: "icon128.png",
    default_popup: "index.html",
    default_title: "Open Extension App"
  }
};

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [svgr(), react(), crx({ manifest: manifest_default })]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b3VuZ2NoZW9uL0Rlc2t0b3AvZGV2L2NoenprLXBsdXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b3VuZ2NoZW9uL0Rlc2t0b3AvZGV2L2NoenprLXBsdXMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvdW5nY2hlb24vRGVza3RvcC9kZXYvY2h6emstcGx1cy92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgc3ZnciBmcm9tIFwidml0ZS1wbHVnaW4tc3ZnclwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB7IGNyeCB9IGZyb20gXCJAY3J4anMvdml0ZS1wbHVnaW5cIjtcblxuaW1wb3J0IG1hbmlmZXN0IGZyb20gXCIuL21hbmlmZXN0Lmpzb25cIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtzdmdyKCksIHJlYWN0KCksIGNyeCh7IG1hbmlmZXN0IH0pXSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiQ2h6emsgUGx1c1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiXHVCMTI0XHVDNzc0XHVCQzg0IFx1QzJBNFx1RDJCOFx1QjlBQ1x1QkMwRCBcdUMxMUNcdUJFNDRcdUMyQTQgQ2h6emsgUGx1c1wiLFxuICBcInZlcnNpb25cIjogXCIxLjMuNVwiLFxuICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcbiAgXCJpY29uc1wiOiB7XG4gICAgXCIxNlwiOiBcImljb24xNi5wbmdcIixcbiAgICBcIjMyXCI6IFwiaWNvbjMyLnBuZ1wiLFxuICAgIFwiNjRcIjogXCJpY29uNjQucG5nXCIsXG4gICAgXCIxMjhcIjogXCJpY29uMTI4LnBuZ1wiXG4gIH0sXG4gIFwicGVybWlzc2lvbnNcIjogW1wic3RvcmFnZVwiXSxcbiAgXCJjb250ZW50X3NjcmlwdHNcIjogW1xuICAgIHtcbiAgICAgIFwibWF0Y2hlc1wiOiBbXCIqOi8vY2h6emsubmF2ZXIuY29tLypcIl0sXG4gICAgICBcImpzXCI6IFtcInNyYy9jb250ZW50LnRzeFwiXVxuICAgIH1cbiAgXSxcbiAgXCJob3N0X3Blcm1pc3Npb25zXCI6IFtcImh0dHA6Ly93d3cuZ29vZ2xlLmNvbS9cIiwgXCJodHRwczovL3d3dy5nb29nbGUuY29tL1wiXSxcbiAgXCJiYWNrZ3JvdW5kXCI6IHtcbiAgICBcInNlcnZpY2Vfd29ya2VyXCI6IFwic3JjL2JhY2tncm91bmQudHNcIlxuICB9LFxuICBcImFjdGlvblwiOiB7XG4gICAgXCJkZWZhdWx0X2ljb25cIjogXCJpY29uMTI4LnBuZ1wiLFxuICAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcImluZGV4Lmh0bWxcIixcbiAgICBcImRlZmF1bHRfdGl0bGVcIjogXCJPcGVuIEV4dGVuc2lvbiBBcHBcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBTLFNBQVMsb0JBQW9CO0FBQ3ZVLE9BQU8sVUFBVTtBQUNqQixPQUFPLFdBQVc7QUFDbEIsU0FBUyxXQUFXOzs7QUNIcEI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLGFBQWU7QUFBQSxFQUNmLFNBQVc7QUFBQSxFQUNYLGtCQUFvQjtBQUFBLEVBQ3BCLE9BQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxhQUFlLENBQUMsU0FBUztBQUFBLEVBQ3pCLGlCQUFtQjtBQUFBLElBQ2pCO0FBQUEsTUFDRSxTQUFXLENBQUMsdUJBQXVCO0FBQUEsTUFDbkMsSUFBTSxDQUFDLGlCQUFpQjtBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUFBLEVBQ0Esa0JBQW9CLENBQUMsMEJBQTBCLHlCQUF5QjtBQUFBLEVBQ3hFLFlBQWM7QUFBQSxJQUNaLGdCQUFrQjtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxRQUFVO0FBQUEsSUFDUixjQUFnQjtBQUFBLElBQ2hCLGVBQWlCO0FBQUEsSUFDakIsZUFBaUI7QUFBQSxFQUNuQjtBQUNGOzs7QURuQkEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLEtBQUssR0FBRyxNQUFNLEdBQUcsSUFBSSxFQUFFLDJCQUFTLENBQUMsQ0FBQztBQUM5QyxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
