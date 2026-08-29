import { access, readdir, readFile, stat } from "node:fs/promises";
import { sep } from "node:path";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const checkedReferences = new Set();

// Every non-placeholder page registered by the original Wix site has an
// explicit native page or compatibility route in this repository. The Wix
// homepage (single-project) is intentionally excluded at the owner's request;
// fullscreen-page was an empty Wix placeholder.
const legacyWixRouteMap = [
  ["about", "about.html"], ["bach", "bach.html"], ["berryblitz", "berryblitz.html"],
  ["bookstore", "bookstore.html"], ["bruce", "bruce.html"], ["cave", "cave.html"],
  ["conservatory", "conservatory.html"], ["copy-2-of-template", "hotel-for-giants.html"],
  ["copy-2-of-template-1", "blob.html"], ["copy-3-of-template", "dailypaper.html"],
  ["copy-of-core-ii-studio", "berlin-wall.html"], ["copy-of-hostile-pantry", "matter.html"],
  ["copy-of-projects", "interaction-design.html"], ["copy-of-spatial", "industrial-design.html"],
  ["copy-of-template", "maladies.html"], ["crab", "crab.html"],
  ["deeptime", "deeptime.html"], ["feltmate", "feltmate.html"], ["figure", "figure.html"], ["flatland", "flatland.html"],
  ["gallery", "gallery.html"], ["hostilesalad", "hostilesalad.html"], ["houseofcards", "houseofcards.html"],
  ["intothewoods", "woods.html"], ["janus", "janus.html"], ["maladies", "maladies.html"],
  ["marche", "marche.html"], ["matter", "matter.html"], ["microhouse", "microhouse.html"],
  ["ocad1", "ocad1.html"], ["ocad2", "ocad2.html"], ["ossurary", "ossurary.html"],
  ["pheno", "phenom.html"], ["pier", "pier.html"], ["polysapien", "polysapien.html"],
  ["portfoliobook", "portfoliobook/index.html"], ["preschool", "preschool.html"],
  ["projects-1", "spatial-design.html"], ["projections", "projections.html"], ["sanfran", "sanfran.html"],
  ["seaweed", "seaweed.html"], ["seesaw", "seesaw.html"], ["stratum", "stratum.html"],
  ["swrm", "swrm.html"], ["tort", "tort.html"], ["trekking", "trekkingCabins.html"],
  ["tripix", "tripix.html"], ["uproot", "uproot.html"], ["vela", "vela.html"], ["work", "work.html"],
  ["yamal", "yamal.html"]
];

const nativeMigratedPages = [
  "berlin-wall.html", "berryblitz.html", "bookstore.html", "bruce.html", "conservatory.html",
  "crab.html", "deeptime.html", "feltmate.html", "flatland.html", "gallery.html",
  "hotel-for-giants.html", "houseofcards.html", "janus.html", "maladies.html", "matter.html",
  "ocad1.html", "ocad2.html", "pier.html", "polysapien.html", "portfolioBook.html", "preschool.html", "sanfran.html",
  "tort.html", "videogamesBook.html"
];

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

async function existsWithExactCase(path) {
  const pathFromRoot = relative(root, path);
  if (!pathFromRoot) return true;

  let current = root;
  for (const part of pathFromRoot.split(sep)) {
    const entries = await readdir(current);
    if (!entries.includes(part)) return false;
    current = join(current, part);
  }
  return true;
}

function cleanReference(reference) {
  const decodedEntities = reference.replaceAll("&amp;", "&");
  const withoutFragment = decodedEntities.split("#", 1)[0].split("?", 1)[0].trim();
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

  const key = `${source}\0${normalizedTarget}`;
  if (checkedReferences.has(key)) return;
  checkedReferences.add(key);

  if (!normalizedTarget.startsWith(`${root}/`) && normalizedTarget !== root) {
    failures.push(`${relative(root, source)}: reference escapes the repository: ${reference}`);
    return;
  }

  if (await exists(normalizedTarget)) {
    if (!await existsWithExactCase(normalizedTarget)) {
      failures.push(`${relative(root, source)}: local reference has incorrect capitalization: ${reference}`);
      return;
    }
    const targetStat = await stat(normalizedTarget);
    if (!targetStat.isDirectory()) return;
    if (await exists(join(normalizedTarget, "index.html")) && await existsWithExactCase(join(normalizedTarget, "index.html"))) return;
  }
  if (!extname(normalizedTarget) && await exists(`${normalizedTarget}.html`) && await existsWithExactCase(`${normalizedTarget}.html`)) return;

  failures.push(`${relative(root, source)}: missing local reference: ${reference}`);
}

async function validateHtml(path) {
  const html = (await readFile(path, "utf8")).replace(/<!--[\s\S]*?-->/g, "");
  // The thesis flipbook source images are display:none preload data; they do
  // not enter the accessibility tree. Validate every rendered image instead.
  const accessibilityHtml = html.replace(
    /<div\b[^>]*\bid=["']flipbookImages["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
  for (const image of accessibilityHtml.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(image[0])) {
      failures.push(`${relative(root, path)}: image is missing an alt attribute: ${image[0].slice(0, 100)}`);
    }
  }
  const references = [
    ...html.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi),
    ...html.matchAll(/\bfetch\(\s*["']([^"']+)["']/gi),
    ...html.matchAll(/\burl\(\s*["']?([^"')]+)["']?\s*\)/gi),
    ...html.matchAll(/["']([^"']+\.(?:avif|gif|heic|jpe?g|png|svg|tiff?|webp|mov|mp4|mkv)(?:[?#][^"']*)?)["']/gi)
  ];
  await Promise.all(references.map(match => checkReference(path, match[1])));
}

for (const path of requiredPaths) {
  if (!await exists(join(root, path))) failures.push(`Required path is missing: ${path}`);
}

for (const [route, target] of legacyWixRouteMap) {
  if (!await exists(join(root, target))) failures.push(`Wix route /${route} has no migration target: ${target}`);
}

const galleryPage = await readFile(join(root, "work.html"), "utf8");
for (const path of nativeMigratedPages) {
  const html = await readFile(join(root, path), "utf8");
  const requiredMarkers = [
    'id="main-content"', "<h1", 'href="assets/css/base.css"',
    'href="assets/css/projectPage.css"', 'src="assets/js/siteChrome.js"'
  ];
  for (const marker of requiredMarkers) {
    if (!html.includes(marker)) failures.push(`${path}: migrated-page style/accessibility marker is missing: ${marker}`);
  }

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*["'][^"']+["']/i.test(image[0])) {
      failures.push(`${path}: migrated image needs non-empty alternative text: ${image[0].slice(0, 100)}`);
    }
  }

  if (path !== "gallery.html" && !galleryPage.includes(`href="${path}"`)) {
    failures.push(`${path}: migrated project is not linked from work.html`);
  }
}

for (const path of retiredPaths) {
  if (await exists(join(root, path))) failures.push(`Retired path still exists: ${path}`);
}

const rootEntries = await readdir(root, { withFileTypes: true });
const maintainedPages = rootEntries
  .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
  .map(entry => join(root, entry.name));
maintainedPages.push(join(root, "projects/head-above-water/index.html"));
maintainedPages.push(join(root, "portfoliobook/index.html"));

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
  [homePage, 'aria-label="Explore work by discipline"', "Work explorer navigation label is missing"],
  [homeScript, 'tabindex: "0"', "Work explorer keyboard links are missing"],
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
    `Validated ${maintainedPages.length} public pages, ${checkedReferences.size} local references, `
    + `${browserScripts.length + maintenanceScripts.length} scripts, and the Instagram data file.`
  );
}
