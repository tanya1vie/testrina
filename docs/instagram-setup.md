# No-auth Instagram gallery

This branch keeps the repository's current `assets/`, `tools/`, and `docs/` structure while replacing the authenticated Instagram API sync with a public-profile scraper for `@mani__festations`.

## Run the first sync

1. Open **Actions → Scrape Instagram gallery**.
2. Click **Run workflow**.
3. Choose the `instagram-no-auth-scraper` branch.
4. Click **Run workflow** again.
5. After it succeeds, `assets/data/instagram-posts.json` contains the latest public posts.

No Instagram password, cookie, access token, or GitHub repository secret is required.

## Reliability warning

The scraper uses Instagram's undocumented public web-profile response. Instagram may change it, require a login, or block GitHub Actions without warning. The scraper validates the response before writing, so a failed scrape retains the last successful gallery data.

Scheduled workflows only run from GitHub's default branch. Daily automatic scraping begins after this branch is merged into `main`.

## Behavior

- Supports public image, video, and carousel posts.
- Uses the first media item as the gallery thumbnail.
- Preserves the original Instagram caption.
- Links every description to the original Instagram post.
- Usually retrieves the latest 12 posts exposed by the public response.
