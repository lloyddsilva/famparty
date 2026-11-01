# Third-party notices

## LDNOOBW word list (via `naughty-words`)

The profanity word list used by `src/lib/blockedWords.js` comes from the
[List of Dirty, Naughty, Obscene and Otherwise Bad Words](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words)
(LDNOOBW), distributed under the Creative Commons Attribution 4.0
International License (CC BY 4.0), and consumed through the
[`naughty-words`](https://www.npmjs.com/package/naughty-words) npm package.

Modifications: FamParty adds a small number of variant terms and removes
"dick" (also a person's name). Matching logic (word boundaries) is our own.

## Fonts: Gelasio and Outfit

The typefaces served from `public/fonts/` (variable woff2) are:

- **Gelasio** — Copyright 2022 The Gelasio Project Authors
  (https://github.com/SorkinType/Gelasio)
- **Outfit** — Copyright 2021 The Outfit Project Authors
  (https://github.com/Outfitio/Outfit-Fonts)

Both are licensed under the **SIL Open Font License, Version 1.1**. The full
licence texts are included in this repo at `public/fonts/OFL-Gelasio.txt` and
`public/fonts/OFL-Outfit.txt`. The fonts are self-hosted; no requests are
made to Google at runtime.
