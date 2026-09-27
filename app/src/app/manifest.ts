import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wise Old Man - OSRS Progress Tracker",
    short_name: "Wise Old Man",
    description:
      "Track your Old School RuneScape progress: XP gains, achievements, clan affiliations and competitions - Open source and free",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#101319",
    theme_color: "#101319",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
