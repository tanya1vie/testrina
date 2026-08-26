import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const username = process.env.INSTAGRAM_USERNAME || "mani__festations";
const output = process.env.INSTAGRAM_OUTPUT || "assets/data/instagram-posts.json";
const limit = Math.min(Number(process.env.INSTAGRAM_POST_LIMIT || 12), 50);

// Bootstrap an anonymous browser session before requesting the undocumented
// public web-profile response. No login credentials or account cookies are used.
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36";
const profileUrl = `https://www.instagram.com/${username}/`;
const bootstrap = await fetch(profileUrl, {
  headers: { Accept: "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9", "User-Agent": userAgent }
});

const rawCookies = bootstrap.headers.get("set-cookie") || "";
const cookieNames = ["csrftoken", "mid", "ig_did", "datr"];
const cookies = cookieNames.map(name => {
  const match = rawCookies.match(new RegExp(`(?:^|,\\s*)${name}=([^;,]+)`));
  return match ? `${name}=${match[1]}` : "";
}).filter(Boolean).join("; ");
const csrf = rawCookies.match(/(?:^|,\s*)csrftoken=([^;,]+)/)?.[1] || "";

async function requestProfile(host) {
  const url = new URL(`https://${host}/api/v1/users/web_profile_info/`);
  url.searchParams.set("username", username);
  return fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": userAgent,
      "X-IG-App-ID": "936619743392459",
      "X-ASBD-ID": "129477",
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
      ...(cookies ? { Cookie: cookies } : {}),
      Referer: profileUrl
    }
  });
}

let response = await requestProfile("www.instagram.com");
if (!response.ok && response.status !== 404) {
  response = await requestProfile("i.instagram.com");
}
if (!response.ok) {
  throw new Error(`Instagram blocked the anonymous public-profile request (${response.status}). Existing gallery data was kept.`);
}

const payload = await response.json();
const edges = payload?.data?.user?.edge_owner_to_timeline_media?.edges;
if (!Array.isArray(edges) || edges.length === 0) {
  throw new Error("Instagram returned no public posts. Existing gallery data was kept.");
}

function mediaType(node) {
  if (node?.__typename === "GraphVideo" || node?.is_video) return "VIDEO";
  return "IMAGE";
}

const posts = edges.slice(0, limit).map(({ node }) => {
  const sidecar = node?.edge_sidecar_to_children?.edges || [];
  const children = sidecar.map(({ node: child }) => ({
    media_type: mediaType(child),
    media_url: child.video_url || child.display_url || "",
    thumbnail_url: child.display_url || ""
  }));
  const caption = node?.edge_media_to_caption?.edges?.[0]?.node?.text || "";

  return {
    id: node.id,
    caption,
    media_type: children.length ? "CAROUSEL_ALBUM" : mediaType(node),
    media_url: node.video_url || node.display_url || "",
    thumbnail_url: node.display_url || "",
    permalink: `https://www.instagram.com/p/${node.shortcode}/`,
    timestamp: node.taken_at_timestamp
      ? new Date(node.taken_at_timestamp * 1000).toISOString()
      : "",
    children
  };
}).filter(post => post.id && post.permalink && (post.media_url || post.children.length));

if (!posts.length) {
  throw new Error("Instagram's response contained no usable public posts. Existing gallery data was kept.");
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify({
  source: `https://www.instagram.com/${username}/`,
  updated_at: new Date().toISOString(),
  posts
}, null, 2)}\n`);

console.log(`Saved ${posts.length} public posts from @${username} to ${output}`);
