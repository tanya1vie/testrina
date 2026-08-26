# Instagram-powered nail gallery

This version replaces the hand-written project cards with posts from the professional Creator account `@mani__festations`. GitHub Actions refreshes `assets/data/instagram-posts.json` once per day; the browser never receives the private access token.

## Add these files to the repository

Keep the paths exactly as supplied:

- `nail-gallery.html` (rename it to the name of your existing gallery page if needed)
- `assets/js/instagramGallery.js`
- `tools/sync-instagram.mjs`
- `.github/workflows/sync-instagram.yml`
- `assets/data/instagram-posts.json`

## Connect Instagram

1. In Meta for Developers, create or select an app and add **Instagram API with Instagram Login**.
2. Connect the professional Creator account `@mani__festations` and complete the authorization flow with the basic Instagram business permission required to read the account's own media.
3. Generate a long-lived user access token for that account.
4. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**.
5. Name the secret `INSTAGRAM_ACCESS_TOKEN` and paste the token as its value.
6. Open **Actions → Sync Instagram gallery → Run workflow** to populate the gallery immediately.

After that, the workflow runs daily at approximately 08:17 UTC. GitHub may delay scheduled jobs during busy periods.

## Important token maintenance

Long-lived Instagram user tokens expire. Renew the token before its expiration date and replace the `INSTAGRAM_ACCESS_TOKEN` repository secret. If it expires, the last successfully downloaded gallery remains on the site, but new posts will stop appearing and the GitHub Action will show an error.

## Behavior

- Image, video, and carousel posts are supported.
- The first media item is used as the gallery thumbnail.
- Clicking a card opens all media from that post.
- The original caption appears unchanged in the description.
- Every description includes a link to the original Instagram post.
- The number of posts can be changed with `INSTAGRAM_POST_LIMIT` in the workflow (maximum 100 per refresh).
