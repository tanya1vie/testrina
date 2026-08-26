# Testrina portfolio

This repository contains Tatiana Estrina's static portfolio site. The editable source is organized by page, while the build keeps the existing public URLs such as `/work.html` and `/seesaw.html` unchanged.

## Repository layout

```text
.
├── pages/
│   ├── home/                  Homepage HTML, styles, and scripts
│   ├── work/                  Project-gallery HTML, styles, and script
│   ├── <page>/                One folder for each canonical site page
│   └── head-above-water/      Standalone interactive flood-map page
├── shared/
│   ├── components/            Shared header and footer
│   ├── data/                  Browser-consumed generated data
│   ├── scripts/               Scripts used by multiple pages
│   └── styles/                Styles used by multiple pages
├── Images/                    Published portfolio media (legacy URL retained)
├── assets/source-nails/       Editable/source artwork for the nail portfolio
├── files/                     Public downloadable files
├── docs/                      Setup and maintenance notes
├── tools/                     Build, validation, and maintenance scripts
└── dist/                      Generated public site (ignored by Git)
```

`Images/` intentionally retains its original name so existing media URLs and bookmarks keep working. Redirect-only aliases from the old Wix migration have been removed; internal links use the canonical pages directly.

## Development

Install the development tools once:

```sh
npm install
```

Build and validate the complete site:

```sh
npm test
```

The generated website is in `dist/`. To preview it in VS Code, open `dist/index.html` with Live Server. You can also serve the `dist/` folder with any static web server.

When editing, change files under `pages/` or `shared/`, then rebuild. Do not edit generated files in `dist/`.

Format or check all maintained source files with:

```sh
npm run format
npm run format:check
```

GitHub Actions runs the same build and validation, then deploys only `dist/` to GitHub Pages.

## Instagram gallery

The nail gallery data is refreshed by a scheduled GitHub Action. Setup and token-renewal instructions are in [`docs/instagram-setup.md`](docs/instagram-setup.md).

To refresh it manually after providing the required environment variables:

```sh
npm run sync:instagram
```
