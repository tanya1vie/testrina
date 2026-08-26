# Testrina portfolio

This repository is the source for Tatiana Estrina's static portfolio site. It is served directly by GitHub Pages, so there is no compile step and the public HTML files remain at the repository root to preserve their existing URLs.

## Repository layout

```text
.
├── *.html                     Public site pages (stable URLs)
├── Images/                    Published portfolio media (legacy URL retained)
├── assets/
│   ├── css/                   Shared styles
│   ├── data/                  Browser-consumed generated data
│   ├── js/                    Shared browser scripts
│   └── source-nails/          Editable/source artwork for the nail portfolio
├── projects/
│   └── head-above-water/      Standalone interactive flood-map project
├── head-above-water-main/     Compatibility redirect for the former project URL
├── docs/                      Setup and maintenance notes
├── tools/                     Local and CI maintenance scripts
└── .github/workflows/         Scheduled automation
```

`Images/` intentionally retains its original name. Renaming it would invalidate existing media URLs and bookmarks without improving runtime behavior.

The former `/head-above-water-main/` route remains as a small redirect so existing links continue to work after the standalone project moved under `projects/`.

## Development

The site needs only a static web server. For example, serve the repository root with the editor or server of your choice, then open `index.html` through that server so shared header/footer requests work.

Run the repository checks before committing:

```sh
npm test
```

The checks use Node.js only and install no third-party packages. They verify the reorganized directory contract and shared references, JavaScript syntax, and JSON validity.

## Instagram gallery

The nail gallery data is refreshed by a scheduled GitHub Action. Setup and token-renewal instructions are in [`docs/instagram-setup.md`](docs/instagram-setup.md).

To refresh it manually after providing the required environment variables:

```sh
npm run sync:instagram
```
