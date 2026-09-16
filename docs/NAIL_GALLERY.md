# Updating the nail gallery

The gallery is generated from two things:

1. Media folders inside `Images/Nails/`
2. Spreadsheet data in `assets/data/nails.csv`

## Add a new nail set

1. Add a new row to `assets/data/nails.csv`.
2. Give the row a unique `id`.
3. Set `folder` to the exact folder name you plan to use.
4. Add a folder with that exact name inside `Images/Nails/`.
5. Put all related JPG, JPEG, PNG, WEBP, GIF, MP4, MOV, WEBM, or M4V files inside it.
6. Commit and push the spreadsheet and folder.

The first image alphabetically becomes the gallery cover. All images and videos appear in the popup. Images are shown before videos.

GitHub Actions runs **Build nail gallery** automatically and updates `assets/data/nails-gallery.json`. You do not edit the generated JSON manually.

## Spreadsheet columns

- `id`: stable unique number that controls the gallery order (lowest first)
- `folder`: exact matching folder name under `Images/Nails`
- `name`: title shown on the website
- `size`: nail size or format
- `collection`: collection/category
- `client`: client notes
- `instagram_url`: optional original post
- `caption`: main description
- `video_caption`: used when the main caption is blank

The CSV can be opened and edited in Excel, Numbers, or Google Sheets. Export it as CSV before replacing the repository file.
