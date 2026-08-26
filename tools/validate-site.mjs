import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { access, readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = resolve(repositoryRoot, process.argv[2] ?? "dist");
const failures = [];
const checkedReferences = new Set();

const redirectAliases = [
  "bruce-wendy.html",
  "copy-2-of-template-1.html",
  "copy-2-of-template.html",
  "copy-3-of-template.html",
  "copy-of-core-ii-studio.html",
  "copy-of-hostile-pantry.html",
  "copy-of-projects.html",
  "copy-of-spatial.html",
  "copy-of-template.html",
  "distorted-projections.html",
  "evolutionaryGame.html",
  "feed.html",
  "figure-taxonomy.html",
  "head-above-water-main/index.html",
  "hostile-caesar-salad.html",
  "intothewoods.html",
  "pheno.html",
  "portfoliobook/index.html",
  "projects-1.html",
  "see-x-saw.html",
  "trekking.html",
];

const requiredSourcePaths = [
  "pages/home/index.html",
  "pages/home/styles.css",
  "pages/home/puzzle.js",
  "pages/work/index.html",
  "pages/work/styles.css",
  "pages/work/script.js",
  "pages/head-above-water/index.html",
  "shared/components/header.html",
  "shared/components/footer.html",
  "shared/styles/base.css",
  "shared/scripts/cursor.js",
  "shared/data/instagram-posts.json",
  "tools/build-site.mjs",
];

const retiredSourcePaths = [
  ...redirectAliases,
  "header.html",
  "footer.html",
  "head-above-water-main",
  "portfoliobook",
  "assets/css",
  "assets/js",
  "assets/data",
];

const nativeMigratedPages = [
  "berlin-wall.html",
  "berryblitz.html",
  "bookstore.html",
  "bruce.html",
  "conservatory.html",
  "crab.html",
  "deeptime.html",
  "feltmate.html",
  "flatland.html",
  "gallery.html",
  "hotel-for-giants.html",
  "houseofcards.html",
  "janus.html",
  "maladies.html",
  "matter.html",
  "ocad1.html",
  "ocad2.html",
  "pier.html",
  "polysapien.html",
  "portfolioBook.html",
  "preschool.html",
  "sanfran.html",
  "tort.html",
  "videogamesBook.html",
];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory, predicate = () => true) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path, predicate)));
    else if (predicate(path)) files.push(path);
  }
  return files;
}

function isExternal(reference) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference);
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

async function existsWithExactCase(path) {
  const pathFromRoot = relative(publicRoot, path);
  if (!pathFromRoot) return true;

  let current = publicRoot;
  for (const part of pathFromRoot.split(sep)) {
    const entries = await readdir(current);
    if (!entries.includes(part)) return false;
    current = join(current, part);
  }
  return true;
}

async function checkReference(source, reference, baseDirectory = dirname(source)) {
  if (!reference || isExternal(reference)) return;
  const cleaned = cleanReference(reference);
  if (!cleaned || cleaned.includes("${")) return;

  const target = cleaned.startsWith("/")
    ? join(publicRoot, cleaned.slice(1))
    : resolve(baseDirectory, cleaned);
  const normalizedTarget = normalize(target);
  const key = `${source}\0${normalizedTarget}`;
  if (checkedReferences.has(key)) return;
  checkedReferences.add(key);

  if (!normalizedTarget.startsWith(`${publicRoot}${sep}`) && normalizedTarget !== publicRoot) {
    failures.push(`${relative(publicRoot, source)}: reference escapes the site: ${reference}`);
    return;
  }

  if (await exists(normalizedTarget)) {
    if (!(await existsWithExactCase(normalizedTarget))) {
      failures.push(
        `${relative(publicRoot, source)}: local reference has incorrect capitalization: ${reference}`,
      );
      return;
    }
    const targetStats = await stat(normalizedTarget);
    if (!targetStats.isDirectory()) return;
    const indexPath = join(normalizedTarget, "index.html");
    if ((await exists(indexPath)) && (await existsWithExactCase(indexPath))) return;
  }

  if (
    !extname(normalizedTarget) &&
    (await exists(`${normalizedTarget}.html`)) &&
    (await existsWithExactCase(`${normalizedTarget}.html`))
  )
    return;

  failures.push(`${relative(publicRoot, source)}: missing local reference: ${reference}`);
}

async function validateHtml(path, baseDirectory = dirname(path)) {
  const html = (await readFile(path, "utf8")).replace(/<!--[\s\S]*?-->/g, "");
  const accessibilityHtml = html.replace(
    /<div\b[^>]*\bid=["']flipbookImages["'][^>]*>[\s\S]*?<\/div>/gi,
    "",
  );

  for (const image of accessibilityHtml.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(image[0])) {
      failures.push(
        `${relative(publicRoot, path)}: image is missing an alt attribute: ${image[0].slice(0, 100)}`,
      );
    }
  }

  if (/http-equiv=["']refresh["']/i.test(html)) {
    failures.push(`${relative(publicRoot, path)}: redirect-only pages are not allowed`);
  }

  const references = [
    ...html.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi),
    ...html.matchAll(/\bfetch\(\s*["']([^"']+)["']/gi),
    ...html.matchAll(/\burl\(\s*["']?([^"')]+)["']?\s*\)/gi),
    ...html.matchAll(
      /["']([^"']+\.(?:avif|gif|heic|jpe?g|png|svg|tiff?|webp|mov|mp4|mkv)(?:[?#][^"']*)?)["']/gi,
    ),
  ];

  for (const srcset of html.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const candidate of srcset[1].split(",")) {
      const path = candidate.trim().split(/\s+/, 1)[0];
      references.push([path, path]);
    }
  }

  await Promise.all(references.map((match) => checkReference(path, match[1], baseDirectory)));
}

for (const path of requiredSourcePaths) {
  if (!(await exists(join(repositoryRoot, path))))
    failures.push(`Required source path is missing: ${path}`);
}

for (const path of retiredSourcePaths) {
  if (await exists(join(repositoryRoot, path)))
    failures.push(`Retired source path still exists: ${path}`);
}

const pageDirectories = (
  await readdir(join(repositoryRoot, "pages"), { withFileTypes: true })
).filter((entry) => entry.isDirectory());
for (const page of pageDirectories) {
  if (!(await exists(join(repositoryRoot, "pages", page.name, "index.html")))) {
    failures.push(`Page folder is missing index.html: pages/${page.name}`);
  }
}

const expectedLocalPages = new Map(
  pageDirectories
    .filter((page) => page.name !== "head-above-water")
    .map((page) => [page.name === "home" ? "index.html" : `${page.name}.html`, page.name]),
);
const actualLocalPages = (await readdir(repositoryRoot)).filter((name) => name.endsWith(".html"));
for (const [publicName, pageName] of expectedLocalPages) {
  const source = await readFile(join(repositoryRoot, "pages", pageName, "index.html"), "utf8");
  const localPublicPath = join(repositoryRoot, publicName);
  if (!(await exists(localPublicPath))) {
    failures.push(`Local public page is missing: ${publicName}`);
  } else if ((await readFile(localPublicPath, "utf8")) !== source) {
    failures.push(
      `Local public page is out of sync with pages/${pageName}/index.html: ${publicName}`,
    );
  }
}
for (const publicName of actualLocalPages) {
  if (!expectedLocalPages.has(publicName))
    failures.push(`Unexpected root HTML page: ${publicName}`);
}

const localHeadAboveWater = join(repositoryRoot, "projects/head-above-water/index.html");
if (!(await exists(localHeadAboveWater))) {
  failures.push("Local Head Above Water public page is missing");
} else if (
  (await readFile(localHeadAboveWater, "utf8")) !==
  (await readFile(join(repositoryRoot, "pages/head-above-water/index.html"), "utf8"))
) {
  failures.push("Local Head Above Water public page is out of sync");
}

if (!(await exists(publicRoot)))
  failures.push(`Built site is missing: ${relative(repositoryRoot, publicRoot)}`);

const publicRootPages = (await readdir(publicRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => join(publicRoot, entry.name));
const expectedRootPageCount = pageDirectories.length - 1;
if (publicRootPages.length !== expectedRootPageCount) {
  failures.push(
    `Built root has ${publicRootPages.length} pages; expected ${expectedRootPageCount} canonical pages`,
  );
}

const headAboveWaterPage = join(publicRoot, "projects/head-above-water/index.html");
if (!(await exists(headAboveWaterPage))) failures.push("Head Above Water build output is missing");

for (const alias of redirectAliases) {
  if (await exists(join(publicRoot, alias)))
    failures.push(`Redirect alias was published: ${alias}`);
}

await Promise.all(publicRootPages.map((path) => validateHtml(path)));
if (await exists(headAboveWaterPage)) await validateHtml(headAboveWaterPage);

for (const component of ["header.html", "footer.html"]) {
  const path = join(publicRoot, "shared/components", component);
  if (await exists(path)) await validateHtml(path, publicRoot);
}

const cssFiles = await collectFiles(publicRoot, (path) => path.endsWith(".css"));
for (const path of cssFiles) {
  const css = await readFile(path, "utf8");
  await Promise.all(
    [...css.matchAll(/\burl\(\s*["']?([^"')]+)["']?\s*\)/gi)].map((match) =>
      checkReference(path, match[1]),
    ),
  );
}

const galleryPage = await readFile(join(publicRoot, "work.html"), "utf8");
for (const path of nativeMigratedPages) {
  const html = await readFile(join(publicRoot, path), "utf8");
  for (const marker of [
    'id="main-content"',
    "<h1",
    'href="shared/styles/base.css"',
    'href="shared/styles/projectPage.css"',
    'src="shared/scripts/siteChrome.js"',
  ]) {
    if (!html.includes(marker))
      failures.push(`${path}: migrated-page marker is missing: ${marker}`);
  }
  if (path !== "gallery.html" && !galleryPage.includes(`href="${path}"`)) {
    failures.push(`${path}: migrated project is not linked from work.html`);
  }
}

const sourceScripts = [
  ...(await collectFiles(join(repositoryRoot, "shared/scripts"), (path) => path.endsWith(".js"))),
  ...(await collectFiles(join(repositoryRoot, "pages"), (path) => path.endsWith(".js"))),
  ...(await collectFiles(join(repositoryRoot, "tools"), (path) => path.endsWith(".mjs"))),
];
for (const path of sourceScripts) {
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  if (result.status !== 0) {
    failures.push(
      `${relative(repositoryRoot, path)}: JavaScript syntax failed\n${result.stderr.trim()}`,
    );
  }
}

JSON.parse(await readFile(join(repositoryRoot, "shared/data/instagram-posts.json"), "utf8"));

const sourceTextFiles = [
  ...(await collectFiles(join(repositoryRoot, "pages"), (path) => /\.(?:html|css|js)$/.test(path))),
  ...(await collectFiles(join(repositoryRoot, "shared"), (path) =>
    /\.(?:html|css|js|json)$/.test(path),
  )),
];
for (const path of sourceTextFiles) {
  const contents = await readFile(path, "utf8");
  for (const alias of redirectAliases) {
    if (contents.includes(alias)) {
      failures.push(
        `${relative(repositoryRoot, path)}: deleted redirect alias is still referenced: ${alias}`,
      );
    }
  }
  for (const retiredReference of ["assets/css/", "assets/js/", "assets/data/"]) {
    if (contents.includes(retiredReference)) {
      failures.push(
        `${relative(repositoryRoot, path)}: retired reference remains: ${retiredReference}`,
      );
    }
  }
}

const homePage = await readFile(join(publicRoot, "index.html"), "utf8");
const homeScript = await readFile(join(repositoryRoot, "pages/home/puzzle.js"), "utf8");
for (const [contents, marker, message] of [
  [homePage, 'class="skip-link"', "Homepage skip link is missing"],
  [homePage, '<main id="main-content">', "Homepage main landmark is missing"],
  [homePage, 'aria-hidden="true"', "Animated homepage text needs an accessible alternative"],
  [homePage, 'aria-label="Explore work by discipline"', "Homepage explorer label is missing"],
  [homeScript, 'tabindex: "0"', "Homepage explorer keyboard links are missing"],
  [homeScript, "prefers-reduced-motion: reduce", "Reduced-motion support is missing"],
]) {
  if (!contents.includes(marker)) failures.push(message);
}

if (failures.length) {
  console.error(`Site validation failed with ${failures.length} issue(s):`);
  failures.sort().forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${publicRootPages.length + 1} canonical pages, ${checkedReferences.size} local references, ` +
      `${sourceScripts.length} scripts, ${cssFiles.length} stylesheets, and the shared data file.`,
  );
}
