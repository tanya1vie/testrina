import { cp, link, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pagesRoot = join(repositoryRoot, "pages");
const outputRoot = join(repositoryRoot, "dist");

const rootFiles = [
  "CNAME",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "backblue.gif",
  "fade.gif",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon.ico",
  "sitemap.xml",
];

async function hardLinkTree(source, destination) {
  const sourceStats = await stat(source);
  if (!sourceStats.isDirectory()) {
    await mkdir(dirname(destination), { recursive: true });
    try {
      await link(source, destination);
    } catch (error) {
      if (error.code !== "EXDEV") throw error;
      await cp(source, destination);
    }
    return;
  }

  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  await Promise.all(
    entries.map((entry) => hardLinkTree(join(source, entry.name), join(destination, entry.name))),
  );
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

await Promise.all(rootFiles.map((path) => cp(join(repositoryRoot, path), join(outputRoot, path))));
await writeFile(join(outputRoot, ".nojekyll"), "");

await cp(join(repositoryRoot, "shared"), join(outputRoot, "shared"), { recursive: true });
await cp(join(repositoryRoot, "files"), join(outputRoot, "files"), { recursive: true });

// Portfolio media is large and immutable during a build. Hard links make local
// builds fast and space-efficient while still presenting normal files to the
// Pages artifact uploader. A cross-device build automatically falls back to a copy.
await hardLinkTree(join(repositoryRoot, "Images"), join(outputRoot, "Images"));

const pageDirectories = (await readdir(pagesRoot, { withFileTypes: true })).filter((entry) =>
  entry.isDirectory(),
);

for (const page of pageDirectories) {
  const sourceDirectory = join(pagesRoot, page.name);

  if (page.name === "head-above-water") {
    await cp(sourceDirectory, join(outputRoot, "projects", page.name), { recursive: true });
    continue;
  }

  const sourceHtml = join(sourceDirectory, "index.html");
  const publicName = page.name === "home" ? "index.html" : `${page.name}.html`;
  await cp(sourceHtml, join(outputRoot, publicName));

  const pageAssets = (await readdir(sourceDirectory, { withFileTypes: true })).filter(
    (entry) => entry.name !== "index.html",
  );
  if (pageAssets.length) {
    const publicAssetDirectory = join(outputRoot, "pages", page.name);
    await mkdir(publicAssetDirectory, { recursive: true });
    await Promise.all(
      pageAssets.map((entry) =>
        cp(join(sourceDirectory, entry.name), join(publicAssetDirectory, entry.name), {
          recursive: entry.isDirectory(),
        }),
      ),
    );
  }
}

console.log(
  `Built ${pageDirectories.length} page directories into ${relative(repositoryRoot, outputRoot)}/.`,
);
