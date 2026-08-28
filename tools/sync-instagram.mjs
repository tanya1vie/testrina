import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const expectedUsername = (process.env.INSTAGRAM_USERNAME || "mani__festations").toLowerCase();
const output = process.env.INSTAGRAM_OUTPUT || "assets/data/instagram-posts.json";
const limit = Math.min(Math.max(Number(process.env.INSTAGRAM_POST_LIMIT || 50), 1), 100);

if (!token) throw new Error("Missing INSTAGRAM_ACCESS_TOKEN");

async function instagramRequest(path, params = {}) {
  const url = new URL(`https://graph.instagram.com/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  url.searchParams.set("access_token", token);

  const response = await fetch(url, {
    headers: { "User-Agent": "testrina-instagram-gallery/1.0" }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Instagram API returned ${response.status}: ${body}`);
  }
  return response.json();
}

const account = await instagramRequest("me", {
  fields: "id,username,account_type"
});

if (!account.username) {
  throw new Error("Instagram token is valid but did not return an account username.");
}
if (account.username.toLowerCase() !== expectedUsername) {
  throw new Error(
    `Instagram token belongs to @${account.username}, not expected @${expectedUsername}.`
  );
}

const fields = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
  "children{media_type,media_url,thumbnail_url}"
].join(",");

const payload = await instagramRequest("me/media", {
  fields,
  limit
});

const posts = (payload.data || []).map(post => ({
  id: post.id,
  caption: post.caption || "",
  media_type: post.media_type,
  media_url: post.media_url || "",
  thumbnail_url: post.thumbnail_url || "",
  permalink: post.permalink || "",
  timestamp: post.timestamp || "",
  children: (post.children?.data || []).map(child => ({
    media_type: child.media_type,
    media_url: child.media_url || "",
    thumbnail_url: child.thumbnail_url || ""
  }))
})).filter(post => post.permalink && (post.media_url || post.thumbnail_url || post.children.length));

if (!posts.length) {
  throw new Error("Instagram returned no usable posts; the existing gallery data was left unchanged.");
}

await mkdir(dirname(output), { recursive: true });
await writeFile(
  output,
  `${JSON.stringify({
    account: account.username,
    updated_at: new Date().toISOString(),
    posts
  }, null, 2)}\n`
);

console.log(`Verified @${account.username}; saved ${posts.length} posts to ${output}`);
