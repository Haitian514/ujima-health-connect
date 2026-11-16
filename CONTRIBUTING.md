# Contributing to MedConnect

Contributions are welcome through GitHub issues and pull requests. Anyone can fork this public repository; the maintainer reviews changes before merging them.

## Start locally

1. Fork the repository, then clone your fork.
2. Create a branch: `git switch -c your-change`.
3. Serve the app: `python -m http.server 4173 --directory dist` (on Windows, `py -m http.server 4173 --directory dist` also works).
4. Open <http://localhost:4173>.
5. Run `npm test` with Node.js 22 or newer. There are no npm dependencies to install.

The editable application source is in `dist/`; it is intentionally checked in and does not require a build step.

## Before opening a pull request

- Explain the concrete problem and resulting behavior. Link an issue when one exists.
- Run `npm run check` and include the result in the pull request.
- For visible changes, check phone and desktop layouts and include a screenshot. Check for horizontal overflow, keyboard access, and readable contrast.
- Keep provider source links and all third-party attribution intact.
- Keep saved lists and personal calendar notes local unless a separately reviewed backend change explicitly adds synchronization.
- Use fictional test inputs, rather than patient records or private contact information, in issues, screenshots, and fixtures.

## Working with directory data

The directory is a snapshot imported on 2026-11-13. When correcting a listing, cite its original public Ujima profile or another authoritative provider source. Update the matching entry in both `dist/directory.json` and `dist/directory.js`, and keep their contents consistent.

Preserve the distinction between street-level matches, approximate area locations, and listings without coordinates. A Census match is an address-range estimate, not verification that a provider currently occupies an office. Do not invent insurance acceptance, languages, provider identities, photos, appointment slots, or booking confirmations.

When changing cached assets, update the cache/version identifiers in `dist/sw.js` and the corresponding asset queries in `dist/index.html` together. Keep map tiles outside the app's offline cache and retain visible OpenStreetMap attribution.

Provider photos and branding have their own rights; public repository access does not grant a blanket content reuse license. See [NOTICE.md](NOTICE.md) and [dist/sources.json](dist/sources.json).

## Deployment

The current hosted app is managed separately. A pull request or merge does not automatically publish the production app. A maintainer can deploy the contents of `dist/` to a static HTTPS host after review. Home Screen installation and service workers require HTTPS outside localhost.
