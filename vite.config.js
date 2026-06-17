import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            includeAssets: ["icons/icon.svg", "pwa-192.png", "pwa-512.png"],
            manifest: {
                name: "Azure Quest: SC-300 + AZ-500",
                short_name: "Azure Quest",
                description: "Bite-sized gamified Microsoft security exam prep.",
                theme_color: "#111827",
                background_color: "#020617",
                display: "standalone",
                orientation: "portrait",
                start_url: "/",
                scope: "/",
                icons: [
                    { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                    { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
                ]
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2}"],
                navigateFallback: "/index.html",
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return request.destination === "document";
                        },
                        handler: "NetworkFirst",
                        options: { cacheName: "pages-cache" }
                    },
                    {
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return ["script", "style", "image", "font"].includes(request.destination);
                        },
                        handler: "StaleWhileRevalidate",
                        options: { cacheName: "assets-cache" }
                    }
                ]
            },
            devOptions: { enabled: true }
        })
    ]
});
