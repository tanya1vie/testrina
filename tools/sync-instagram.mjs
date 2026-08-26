import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const output = process.env.INSTAGRAM_OUTPUT || "shared/data/instagram-posts.json";
const limit = Math.min(Number(process.env.INSTAGRAM_POST_LIMIT || 50), 100);

if (!token) throw new Error("Missing INSTAGRAM_ACCESS_TOKEN");

const fields = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
  "children{media_type,media_url,thumbnail_url}",
].join(",");
const url = new URL("https://graph.instagram.com/me/media");
url.searchParams.set("fields", fields);
url.searchParams.set("limit", String(limit));
url.searchParams.set("access_token", token);

const response = await fetch(url);
if (!response.ok) {
  const body = await response.text();
  throw new Error(`Instagram API returned ${response.status}: ${body}`);
}

const payload = await response.json();
const posts = (payload.data || []).map((post) => ({
  id: post.id,
  caption: post.caption || "",
  media_type: post.media_type,
  media_url: post.media_url || "",
  thumbnail_url: post.thumbnail_url || "",
  permalink: post.permalink,
  timestamp: post.timestamp,
  children: (post.children?.data || []).map((child) => ({
    media_type: child.media_type,
    media_url: child.media_url || "",
    thumbnail_url: child.thumbnail_url || "",
  })),
}));

await mkdir(dirname(output), { recursive: true });
await writeFile(
  output,
  `${JSON.stringify({ updated_at: new Date().toISOString(), posts }, null, 2)}\n`,
);
console.log(`Saved ${posts.length} Instagram posts to ${output}`);
