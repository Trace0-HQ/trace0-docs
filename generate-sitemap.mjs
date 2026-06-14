import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream, readFileSync } from "fs";
import { Readable } from "stream";

const BASE_URL = "https://docs.trace0hq.com";
const docs = JSON.parse(readFileSync("./docs.json", "utf-8"));

function extractPages(items) {
  const pages = [];
  for (const item of items) {
    if (typeof item === "string") {
      pages.push(item);
    } else if (item.pages) {
      pages.push(...extractPages(item.pages));
    }
  }
  return pages;
}

const groups = docs.navigation.groups;
const allPages = extractPages(groups.flatMap((g) => g.pages));

const links = allPages.map((page) => ({
  url: `/${page}/`,
  changefreq: "weekly",
  priority: 0.8,
}));

const stream = new SitemapStream({ hostname: BASE_URL });
const writeStream = createWriteStream("./sitemap.xml");

Readable.from(links).pipe(stream).pipe(writeStream);

writeStream.on("finish", () => {
  console.log(`sitemap.xml generated with ${links.length} URLs`);
});
