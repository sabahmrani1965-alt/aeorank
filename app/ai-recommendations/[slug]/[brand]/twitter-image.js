// Same card as opengraph-image.js; route config must be declared here, not re-exported.
export { default } from "./opengraph-image";
export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Does ChatGPT recommend this brand? Daily AI answer data by AEOrank";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
