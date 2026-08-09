import type { APIRoute } from "astro";
import { CONDITION_CATEGORIES } from "../content/condition-categories";
import { getTreatments } from "../lib/wix/data";
import { getHealthArticles } from "../lib/wix/blog";

export const prerender = false;
const BASE = "https://marin-holy-17907997-marinholyhillacu.wix-site-host.com";

export const GET: APIRoute = async () => {
  const [services, articles] = await Promise.all([getTreatments(), getHealthArticles()]);
  const paths = ["/", "/dr-kang", "/new-patient", "/services", "/conditions", "/articles", "/va-insurance", "/contact", ...services.map((service) => `/services/${service.slug}`), ...CONDITION_CATEGORIES.map((category) => `/conditions/${category.slug}`), ...articles.map((article) => `/articles/${encodeURIComponent(article.slug)}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `\n  <url><loc>${BASE}${path}</loc></url>`).join("")}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};
