# Connect the Instagram gallery

The site uses Instagram's official API. The access token is stored only in GitHub Actions and is never exposed by the webpage.

## 1. Prepare the Instagram account

1. Confirm `@mani__festations` is a Professional Creator or Business account.
2. Sign in to the Instagram account in a separate browser tab.
3. Open [Meta for Developers](https://developers.facebook.com/apps/) and sign in with the Meta account that manages it.

## 2. Create and configure the Meta app

1. Select **Create App**.
2. Choose the use case for accessing the **Instagram API**. If Meta shows app types, choose **Business**.
3. Name it something recognizable, such as **Mani Festations Website**.
4. In the app dashboard, add **Instagram** and choose **API setup with Instagram login**.
5. Under **Generate access tokens**, select **Add account**.
6. Sign in as `@mani__festations` and approve access.
7. Select **Generate token** for that account.
8. Copy the complete token. Treat it like a password; do not paste it into a website file, commit, issue, or chat.

Meta changes labels occasionally. The important outcome is a token for `@mani__festations` with permission to read its profile and media.

## 3. Store the token in GitHub

1. Open [testrina Actions secrets](https://github.com/tanya1vie/testrina/settings/secrets/actions).
2. Select **New repository secret**.
3. Enter this exact name: `INSTAGRAM_ACCESS_TOKEN`
4. Paste the token into **Secret**.
5. Select **Add secret**.

## 4. Run the first sync

1. Open [testrina Actions](https://github.com/tanya1vie/testrina/actions).
2. Select **Sync Instagram gallery** in the left sidebar.
3. Select **Run workflow**.
4. Choose the `main` branch.
5. Select the green **Run workflow** button.
6. Open the new run and wait for all steps to show green checkmarks.

The workflow verifies that the token belongs to `@mani__festations`, downloads up to 50 posts, writes `assets/data/instagram-posts.json`, and commits the data to `main`.

## 5. Verify the website

1. Open `assets/data/instagram-posts.json` on GitHub and confirm that `posts` is populated.
2. Wait a few minutes for GitHub Pages to deploy.
3. Open the nail gallery and confirm the images, captions, and original-post links appear.

After the first successful run, GitHub refreshes the gallery every day at approximately 08:17 UTC. Before a token is configured, scheduled runs skip successfully and do not generate failure emails.

## Troubleshooting

- **Token belongs to another account:** Generate the token while signed into `@mani__festations`.
- **Invalid or expired token:** Generate a replacement token and update the existing GitHub secret.
- **Permission error:** Reconnect the Instagram account in the Meta app and approve profile/media access.
- **Workflow is green but says skipped:** The `INSTAGRAM_ACCESS_TOKEN` secret is missing or its name is misspelled.
- **Git push is rejected:** In repository **Settings → Actions → General → Workflow permissions**, select **Read and write permissions**, then save.

Instagram tokens expire or can be revoked. Replace the GitHub secret whenever Meta provides a new token.
