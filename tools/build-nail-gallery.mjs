// Generated gallery builder: folder names match the spreadsheet folder column.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";

const root = process.cwd();
const mediaRoot = join(root, "Images", "Nails");
const csvPath = join(root, "assets", "data", "nails.csv");
const outputPath = join(root, "assets", "data", "nails-gallery.json");
const supported = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".webm", ".m4v"]);
const videos = new Set([".mp4", ".mov", ".webm", ".m4v"]);

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field.trim()); field = ""; }
    else if (char === "\n") { row.push(field.trim()); rows.push(row); row = []; field = ""; }
    else if (char !== "\r") field += char;
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter(values => values.some(Boolean)).map(values =>
    Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").replaceAll("\\n", "\n")]))
  );
}

function simplifySize(value) {
  return String(value || "").split(/\s+-\s+/)[0].trim();
}

function extractShape(value) {
  const match = String(value || "").match(/💅\s*([^\n#]+?)(?:,\s*Size\b|$)/i);
  return match ? match[1].trim() : "";
}

function cleanCaption(value) {
  return String(value || "")
    .split("💅")[0]
    .split(/(?:^|\s)#/)[0]
    .trim();
}

function webPath(...parts) {
  return parts.map(part => encodeURIComponent(part)).join("/");
}

const metadataRows = parseCsv(await readFile(csvPath, "utf8"));
const metadata = new Map(metadataRows.map(row => [row.folder.toLocaleLowerCase(), row]));
const entries = await readdir(mediaRoot, { withFileTypes: true });
const sets = [];

for (const entry of entries.filter(item => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  const row = metadata.get(entry.name.toLocaleLowerCase()) || {
    id: "",
    folder: entry.name,
    name: entry.name,
    size: "",
    collection: "",
    client: "",
    instagram_url: "",
    caption: "",
    video_caption: ""
  };
  const files = (await readdir(join(mediaRoot, entry.name), { withFileTypes: true }))
    .filter(file => file.isFile() && supported.has(extname(file.name).toLowerCase()))
    .map(file => {
      const extension = extname(file.name).toLowerCase();
      return {
        type: videos.has(extension) ? "video" : "image",
        src: webPath("Images", "Nails", entry.name, file.name),
        name: file.name
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "image" ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });

  if (!files.length) continue;
  sets.push({
    id: row.id || entry.name,
    folder: entry.name,
    name: row.name || entry.name,
    size: simplifySize(row.size),
    shape: extractShape(row.caption || row.video_caption),
    collection: row.collection || "",
    client: row.client || "",
    instagram_url: row.instagram_url || "",
    caption: cleanCaption(row.caption || row.video_caption),
    cover: files.find(file => file.type === "image" && /cover/i.test(file.name))?.src
      || files.find(file => file.type === "image")?.src
      || files[0].src,
    media: files
  });
}

sets.sort((a, b) => {
  const aId = Number(a.id);
  const bId = Number(b.id);
  const aHasNumericId = Number.isFinite(aId);
  const bHasNumericId = Number.isFinite(bId);

  if (aHasNumericId && bHasNumericId && aId !== bId) return bId - aId;
  if (aHasNumericId !== bHasNumericId) return aHasNumericId ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, { numeric: true });
});

await mkdir(join(root, "assets", "data"), { recursive: true });
await writeFile(outputPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  sets
}, null, 2) + "\n");

const missingFolders = metadataRows.filter(row =>
  row.folder && !entries.some(entry => entry.isDirectory() && entry.name.toLocaleLowerCase() === row.folder.toLocaleLowerCase())
);
console.log(`Generated ${sets.length} nail sets. ${missingFolders.length} spreadsheet rows are waiting for matching folders.`);
