// Blog posts as typed content blocks. The build gate (scripts/check-blog.mjs)
// enforces: explicit `published`, meta description <= 155 chars, a visual in
// the first 150 words and never more than 180 words of prose between
// visuals, no HTML in plain-text fields, and only internal links / images
// that exist.
//
// Block types: paragraph, heading, gameCard, ideaGrid, steps, table,
// pickerChart, tvMock, phoneMock, example, callout, pullQuote, revealGrid.
// quickAnswer / takeaways / cover / faq live outside `blocks` (page order).

import { THANKSGIVING_GAMES } from "./posts/thanksgiving-games.js";
import { SPOTLIGHT_GUIDE } from "./posts/spotlight-guide.js";
import { HOSTING_GUIDE } from "./posts/hosting-guide.js";
import { SPECTRUM_GUIDE } from "./posts/spectrum-guide.js";
import { ALBUM_GUIDE } from "./posts/album-guide.js";
import { CHRISTMAS_FAMILY } from "./posts/christmas-family.js";
import { CHRISTMAS_ADULTS } from "./posts/christmas-adults.js";
import { OFFICE_CHRISTMAS } from "./posts/office-christmas.js";
import { CHRISTMAS_EMOJI_GAME } from "./posts/christmas-emoji-game.js";
import { NEW_YEARS_EVE_GAMES } from "./posts/new-years-eve-games.js";
import { THIS_OR_THAT_QUESTIONS } from "./posts/this-or-that-questions.js";
import { TWO_TRUTHS_LIE_IDEAS } from "./posts/two-truths-lie-ideas.js";
import { ICEBREAKER_GAMES_WORK } from "./posts/icebreaker-games-work.js";
import { GAMES_LIKE_JACKBOX } from "./posts/games-like-jackbox.js";

const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const CALL = (title, text, tone = "tip") => ({ type: "callout", title, text, tone });

export const BLOG_POSTS = [
  SPOTLIGHT_GUIDE,
  HOSTING_GUIDE,
  SPECTRUM_GUIDE,
  ALBUM_GUIDE,
  THANKSGIVING_GAMES,
  CHRISTMAS_FAMILY,
  CHRISTMAS_ADULTS,
  OFFICE_CHRISTMAS,
  CHRISTMAS_EMOJI_GAME,
  NEW_YEARS_EVE_GAMES,
  THIS_OR_THAT_QUESTIONS,
  TWO_TRUTHS_LIE_IDEAS,
  ICEBREAKER_GAMES_WORK,
  GAMES_LIKE_JACKBOX,
];
