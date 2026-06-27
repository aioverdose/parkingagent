// Generates PWA icons at standard sizes from the SVG source
// Run: node scripts/generate-pwa-icons.mjs
// Requires: npm install sharp (dev dependency)

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const svgBuffer = readFileSync(join(publicDir, "pwa-icon.svg"));

const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];

async function generate() {
  mkdirSync(join(publicDir, "icons"), { recursive: true });
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, "icons", `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }
  // Apple-specific sizes
  await sharp(svgBuffer).resize(180, 180).png().toFile(join(publicDir, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");

  // Write manifest with proper icon paths
  const manifest = {
    name: "Spotimization",
    short_name: "Spotimization",
    description: "AI-powered street parking matching — never circle the block again.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#2563EB",
    orientation: "portrait",
    categories: ["navigation", "lifestyle", "utilities"],
    prefer_related_applications: false,
    icons: sizes.map((s) => ({
      src: `/icons/icon-${s}x${s}.png`,
      sizes: `${s}x${s}`,
      type: "image/png",
      purpose: "any",
    })).concat(
      sizes.filter((s) => s >= 192).map((s) => ({
        src: `/icons/icon-${s}x${s}.png`,
        sizes: `${s}x${s}`,
        type: "image/png",
        purpose: "maskable",
      })),
    ),
    screenshots: [],
    shortcuts: [
      {
        name: "Find Parking",
        short_name: "Find",
        description: "Find nearby parking spots",
        url: "/?action=find",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Offer Spot",
        short_name: "Offer",
        description: "Offer your parking spot",
        url: "/?action=offer",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  };
  writeFileSync(join(publicDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("Generated manifest.json");
}

generate().catch(console.error);
