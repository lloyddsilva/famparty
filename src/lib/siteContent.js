// Marketing content: games, occasions, blog. Blog art is a pastel tile + emoji until pack title cards exist.

export const GAMES = [
  { slug: "emoji-decoder", icon: "🧩", name: "Emoji Decoder", tag: "The warm-up", length: "10 rounds", players: "3–12 players", soft: "#fff3cc",
    blurb: "Guess the phrase from the emojis before the clock runs out. Fast fingers score more — shouting at the TV is encouraged.",
    feels: "Like shouting answers at a game show. Zero learning curve; grandparents and kids play as equals, and the fastest finger in the room earns its bragging rights.",
    how: ["An emoji clue appears on the TV: 🍕🎉", "Four choices on every phone — tap one before the timer ends", "Faster correct answers score more; streaks build bonus points", "The reveal lands big on TV, then the leaderboard shuffles"] },
  { slug: "spotlight", icon: "🎤", name: "Spotlight", tag: "The heart of it", length: "One turn each", players: "3–12 players", soft: "#ffe0e9",
    blurb: "Two truths and a lie, written privately on your phone. Fool the room, then take 30 seconds in the spotlight to tell the real story.",
    feels: "The best part of a family dinner, structured. Someone at every table has a story nobody has heard — Spotlight is how it finally gets told, with a scoreboard cheering it on.",
    how: ["Everyone privately writes two truths and one lie (prompt starters help)", "One player at a time is in the spotlight; the statements are shuffled so the lie has no tell", "Everyone else votes for the lie — guessers score, the featured player scores per person fooled", "Then 30 seconds with the microphone: tell the real story out loud"] },
  { slug: "spectrum", icon: "🎚️", name: "Spectrum", tag: "The conversation starter", length: "10 rounds", players: "3–12 players", soft: "#ffffff",
    blurb: "Cook at home or order in? Place yourself, predict the crowd, then watch everyone's avatars land on the big spectrum at once.",
    feels: "\"Wait — YOU put yourself there?!\" Outliers get celebrated, not just winners: Lonely Island for the furthest from the crowd, Mind Reader for whoever predicted it best.",
    how: ["A pair of opposites appears: Cook at home ↔ Order takeaway", "Place yourself on the slider, then predict where the crowd will land", "Every avatar dot lands on the TV spectrum at once", "Awards for the outlier, the mind reader, and the dead centre"] },
  { slug: "finish-it", icon: "✍️", name: "Finish It", tag: "The comedy round", length: "10 rounds", players: "3–12 players", soft: "#e4dcff",
    blurb: "Everyone finishes the same sentence. Answers are dealt onto the TV one by one — the funniest ending wins, whoever wrote it.",
    feels: "The family's funniest person gets discovered, and it is not always who you expect. Anonymity means the quiet kid can beat the loud uncle.",
    how: ["One sentence on the TV: \"The secret to surviving a family road trip is ___\"", "Everyone writes an ending privately on their phone", "The host deals the answers onto the TV one at a time — authors stay secret", "Everyone votes (never for their own), then the authors are unmasked"] },
];

export const OCCASIONS = [
  { slug: "family-night", icon: "🛋️", name: "Family night", soft: "#fff3cc", sub: "Kids, parents, grandparents, one screen.",
    intro: "The whole point of FamParty. Kids, parents and grandparents in the same game, on the same screen, with nobody operating a laptop or explaining rules twice.",
    show: ["spotlight", "emoji-decoder", "finish-it"],
    tips: ["Put the TV on first and let people join while snacks happen — the lobby is the warm-up", "Spotlight early, while stories are still being volunteered", "Finish with Finish It, so the night ends on the funniest anonymous answer, not just points", "Kids who don't want the spotlight can just watch and vote — that's a full role"] },
  { slug: "game-night", icon: "🎂", name: "Game night", soft: "#ffe0e9", sub: "Friends, snacks, mild betrayal.",
    intro: "Friends, birthdays, reunions: break the ice at the start of the night, then let the fooling, voting and unmasking do the rest.",
    show: ["emoji-decoder", "finish-it", "spectrum"],
    tips: ["Emoji Decoder first — zero rules, instant shouting", "Finish It while energy is high; anonymous answers mean bold answers", "Spectrum last, when people are ready to defend their strangest opinions", "The host can pause any round that turns into a debate. Let it"] },
  { slug: "teams", icon: "💻", name: "Teams & video calls", soft: "#e4dcff", sub: "Share the screen. A short opener.",
    intro: "A short opener that isn't a corporate exercise. The idea: share the TV screen on your call and everyone plays on their own phone. Screen-sharing play is still being tested, so run one quick game first to check your setup.",
    show: ["spectrum", "emoji-decoder"],
    tips: ["Spectrum first: one slider tap is about the lowest-effort way to get a whole room participating", "Keep it to one short game — you're an opener, not the meeting", "Prompts are preference-based only; nothing about work, beliefs or identity", "Screen-sharing play is still being tested — run one quick game first to check your setup"] },
];

import { BLOG_POSTS } from "./blogPosts.js";

// Landing/blog index consume the published posts in the shared shape.
export const POSTS = BLOG_POSTS.filter((p) => p.published).map((p) => ({
  slug: p.slug, cat: p.cat, read: p.read, icon: p.icon, soft: p.soft,
  title: p.title, dek: p.dek, description: p.description,
}));
