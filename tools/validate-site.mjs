import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const checkedReferences = new Set();

const requiredPaths = [
  "assets/css/base.css",
  "assets/data/instagram-posts.json",
  "assets/js/cursor.js",
  "docs/instagram-setup.md",
  "header.html",
  "head-above-water-main/index.html",
  "footer.html",
  "index.html",
  "projects/head-above-water/index.html",
  "tools/sync-instagram.mjs"
];

const retiredPaths = [
  "CSS Files",
  "JavaScript Files",
  "Nail content",
  "data/instagram-posts.json",
  "scripts/sync-instagram.mjs"
];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function isExternal(reference) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference);
}

function cleanReference(reference) {
  const withoutFragment = reference.split("#", 1)[0].split("?", 1)[0].trim();
  try {
    return decodeURIComponent(withoutFragment);
  } catch {
    return withoutFragment;
  }
}

async function checkReference(source, reference) {
  if (!reference || isExternal(reference)) return;

  const cleaned = cleanReference(reference);
  if (!cleaned) return;

  const target = cleaned.startsWith("/")
    ? join(root, cleaned.slice(1))
    : resolve(dirname(source), cleaned);
  const normalizedTarget = normalize(target);
  const repositoryPath = relative(root, normalizedTarget).replaceAll("\\", "/");
  const isSharedPath = /^(?:assets|Images\/Navigation)\//.test(repositoryPath)
    || repositoryPath === "projects/head-above-water/index.html"
    || /^(?:header|footer|index|ceramics-gallery|work|about)\.html$/.test(repositoryPath);
  if (!isSharedPath) return;

  const key = `${source}\0${normalizedTarget}`;
  if (checkedReferences.has(key)) return;
  checkedReferences.add(key);

  if (!normalizedTarget.startsWith(`${root}/`) && normalizedTarget !== root) {
    failures.push(`${relative(root, source)}: reference escapes the repository: ${reference}`);
    return;
  }

  if (await exists(normalizedTarget)) return;
  if (!extname(normalizedTarget) && await exists(`${normalizedTarget}.html`)) return;
  if (await exists(join(normalizedTarget, "index.html"))) return;

  failures.push(`${relative(root, source)}: missing local reference: ${reference}`);
}

async function validateHtml(path) {
  const html = await readFile(path, "utf8");
  const references = [
    ...html.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi),
    ...html.matchAll(/\bfetch\(\s*["']([^"']+)["']/gi)
  ];
  await Promise.all(references.map(match => checkReference(path, match[1])));
}

for (const path of requiredPaths) {
  if (!await exists(join(root, path))) failures.push(`Required path is missing: ${path}`);
}

for (const path of retiredPaths) {
  if (await exists(join(root, path))) failures.push(`Retired path still exists: ${path}`);
}

const rootEntries = await readdir(root, { withFileTypes: true });
const maintainedPages = rootEntries
  .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
  .map(entry => join(root, entry.name));
maintainedPages.push(join(root, "projects/head-above-water/index.html"));

await Promise.all(maintainedPages.map(validateHtml));

const sharedTextFiles = [
  ...maintainedPages,
  join(root, ".github/workflows/sync-instagram.yml"),
  join(root, "assets/js/instagramGallery.js"),
  join(root, "docs/instagram-setup.md"),
  join(root, "tools/sync-instagram.mjs")
];
const retiredReferences = [
  "CSS Files/",
  "JavaScript Files/",
  "scripts/sync-instagram.mjs"
];

for (const path of sharedTextFiles) {
  const contents = await readFile(path, "utf8");
  for (const retiredReference of retiredReferences) {
    if (contents.includes(retiredReference)) {
      failures.push(`${relative(root, path)}: retired reference remains: ${retiredReference}`);
    }
  }
}

const browserScripts = (await readdir(join(root, "assets/js"), { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith(".js"))
  .map(entry => join(root, "assets/js", entry.name));
const maintenanceScripts = (await readdir(join(root, "tools"), { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith(".mjs"))
  .map(entry => join(root, "tools", entry.name));

for (const path of [...browserScripts, ...maintenanceScripts]) {
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  if (result.status !== 0) {
    failures.push(`${relative(root, path)}: JavaScript syntax check failed\n${result.stderr.trim()}`);
  }
}

JSON.parse(await readFile(join(root, "assets/data/instagram-posts.json"), "utf8"));

const homePage = await readFile(join(root, "index.html"), "utf8");
const homeScript = await readFile(join(root, "assets/js/puzzle.js"), "utf8");
const accessibilityContract = [
  [homePage, 'class="skip-link"', "Homepage skip link is missing"],
  [homePage, '<main id="main-content">', "Homepage main landmark is missing"],
  [homePage, 'aria-hidden="true"', "Animated homepage text needs a static accessible alternative"],
  [homeScript, 'aria-label", "Explore work by discipline"', "Work explorer navigation label is missing"],
  [homeScript, 'prefers-reduced-motion: reduce', "Reduced-motion support is missing"]
];

for (const [contents, marker, message] of accessibilityContract) {
  if (!contents.includes(marker)) failures.push(message);
}

if (failures.length) {
  console.error(`Site validation failed with ${failures.length} issue(s):`);
  failures.sort().forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${maintainedPages.length} public pages, ${checkedReferences.size} shared references, `
    + `${browserScripts.length + maintenanceScripts.length} scripts, and the Instagram data file.`
  );
}
