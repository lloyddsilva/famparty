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

const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const CALL = (title, text, tone = "tip") => ({ type: "callout", title, text, tone });

export const BLOG_POSTS = [
  {
    slug: "spotlight-stories-that-worked", cat: "Ideas", read: "Short read", icon: "🎤", soft: "#ffe0e9",
    title: "Two truths and a lie: writing statements that split the vote",
    description: "How to write two truths and a lie statements that split the vote: a plain lie, specific details, and a story beat afterwards.",
    dek: "The secret is a boring lie and an outrageous truth. How to write statements that split the vote.",
    published: true,
    quickAnswer: "Make the lie the dullest of your three statements, give the truths specific details (numbers, places, names), and don't defend the lie when people ask questions.",
    takeaways: ["A plain, ordinary lie hides between vivid truths", "Specific details beat vague claims", "The story after the reveal is the point of the round"],
    blocks: [
      P("A reliable way to write a hard-to-spot lie is to make it the dullest of your three statements. If your truths are vivid and specific, a plain, ordinary lie tends to hide between them — the room's attention goes to the surprising claims first."),
      { type: "example", title: "A set built to split the vote", items: [
        { label: "Truth", text: "\"I've eaten the same lunch for 200 days.\"" },
        { label: "Truth", text: "\"I once locked myself out in my pyjamas. Twice.\"" },
        { label: "Lie", text: "\"I have a brother.\" (written by someone with no brother)" },
      ] },
      P("Three patterns worth trying: a specific number (\"I've eaten the same lunch for 200 days\"), a place only you would know, and a talent nobody can test on the spot. Pair one surprising truth with one ordinary lie and let the voters argue it out."),
      CALL("Don't defend the lie", "When it's your turn, tell the true stories like they're the suspicious ones. Answer questions about everything with the same energy, so the lie gets no special protection."),
      P("And when you are the featured player: don't defend the lie. Tell the true stories like they're the suspicious ones. The 30-second story beat afterwards is the point of the round — the points are just an excuse to hear it."),
      { type: "tvMock", game: "Spotlight", header: "Spotlight · Ana's turn", emoji: "🎤", question: "Which one is the lie?", choices: ["I've eaten the same lunch for 200 days", "I have a brother", "Locked out in my pyjamas. Twice."], footer: "Everyone votes on their phone. Ana tells the story after." },
    ],
    faq: [
      { q: "What makes a lie too obvious?", a: "Anything much grander than your truths. If the lie needs a celebrity, a record or a rescue, the room will pick it on sight. Match the lie's size to your most ordinary truth." },
      { q: "Can kids play?", a: "Yes — statements about school, food and animals work well. Anyone who doesn't want a turn can just watch and vote, which is a complete way to play." },
    ],
    related: ["hosting-grandparents-and-kids", "spectrum-questions-for-any-room"],
    gameSlug: "spotlight",
  },
  {
    slug: "hosting-grandparents-and-kids", cat: "Hosting tips", read: "Short read", icon: "🛋️", soft: "#fff3cc",
    title: "One game for every generation: hosting kids and grandparents together",
    description: "Setting up a game room where the youngest and oldest players both get in easily: big targets, pausable timers, a just-watch role.",
    dek: "Big tap targets, pausable timers, and a just-watch role: setting up a room where the youngest and oldest players both get in easily.",
    published: true,
    quickAnswer: "Choose games with no reading speed test, big tap targets and a host who can pause. Let anyone join by watching and voting until they ask for a turn.",
    takeaways: ["Reading speed is the hidden difficulty setting", "The host's pause button is an accessibility feature", "Watching and voting is a complete way to play"],
    blocks: [
      P("Mixed-age rooms tend to snag in predictable places: tiny text, fast reading, and being put on the spot. Look for games where the answers are big tap targets, the host can pause any timer, and nobody has to perform in front of the room."),
      { type: "ideaGrid", title: "Set the room up like this", items: [
        { title: "Biggest screen wins", text: "Give everyone a clear view of the TV; the important text lives there, not on phones." },
        { title: "One decision per screen", text: "If a turn needs reading, choosing and typing at once, younger and older players drop out first." },
        { title: "A watching role", text: "Voting from the sofa is real participation. Let people upgrade themselves when they're ready." },
        { title: "A host who narrates", text: "Reading the question aloud costs nothing and includes anyone who can't read the screen comfortably." },
      ] },
      P("Practical moves: don't put the most confident reader in charge of anything. Give everyone a clear view of the TV. In Spotlight, let hesitant players just watch and vote until they ask for a turn — watching and voting is a complete way to play."),
      CALL("Start with the simplest game", "A first game with no rules to explain lets the room learn the joining flow — scan, name, animal, tap — before anything with writing or strategy shows up."),
      P("Starting with Emoji Decoder helps for exactly that reason: there are no rules to explain, the choices are on every phone, and the host can always reveal early if a round runs long."),
      { type: "phoneMock", title: "What a turn looks like", lines: ["🍕🎉 What phrase is this?", "A · Pizza Party", "B · Movie Night", "One big tap. Locked in."] },
    ],
    faq: [
      { q: "What if someone can't use a phone?", a: "Pair them with a neighbour as a team of two on one phone. The game doesn't change; the tapping is shared." },
      { q: "How do we stop one person dominating?", a: "Use games where everyone answers at the same time, and let the host hold reveals until the room has argued a little." },
    ],
    related: ["spotlight-stories-that-worked", "your-family-album-explained"],
    gameSlug: "emoji-decoder",
  },
  {
    slug: "spectrum-questions-for-any-room", cat: "Games", read: "Short read", icon: "🎚️", soft: "#e4dcff",
    title: "Spectrum pairs that start arguments (the good kind)",
    description: "Choosing this-or-that spectrum pairs that give a room something to argue about: preferences, identity of taste, and one glorious outlier.",
    dek: "Cook at home or order in? Choosing pairs that give a room something to argue about.",
    published: true,
    quickAnswer: "Pick pairs with no right answer and a strong smell of taste — food, holidays, Sundays — where everyone must commit before seeing where the crowd lands.",
    takeaways: ["Commit first, reveal together", "Preferences only, never beliefs", "The outlier is the entertainment"],
    blocks: [
      P("A good Spectrum pair has no right answer and a strong smell of identity: how you holiday, how you eat, how you spend a Sunday. The reveal works because everyone commits before anyone sees the crowd."),
      { type: "ideaGrid", title: "Pairs that give a room something to chew on", items: [
        { title: "Cook at home ↔ Order takeaway", text: "Everyone has a position and a justification." },
        { title: "Beach holiday ↔ Mountain holiday", text: "Splits families cleanly down the middle." },
        { title: "Early bird ↔ Night owl", text: "The room will immediately start checking the claim against evidence." },
        { title: "Plan everything ↔ Wing it", text: "Best played before any group trip is discussed." },
        { title: "Cats ↔ Dogs", text: "An old argument that never stays quiet for long." },
        { title: "Sweet ↔ Savoury", text: "Low stakes, surprisingly strong feelings." },
      ] },
      P("Pairs tend to work well when the room expects agreement and might not get it — a strong food opinion, a holiday preference, a Sunday-morning habit. Leave room in the pair for someone to be gloriously alone at one end."),
      CALL("Keep it to preferences", "Food, weather, holidays, hobbies. The moment a pair touches beliefs, identity or health, the game stops being a game.", "warn"),
      { type: "tvMock", game: "Spectrum", header: "Spectrum · Reveal", emoji: "🎚️", question: "Cook at home ↔ Order takeaway", choices: ["🦊 far left", "🐼 middle", "🦄 far right"], footer: "Every avatar lands at once. The outlier explains themselves." },
    ],
    faq: [
      { q: "How many pairs make a game?", a: "Eight to ten is a good length. Stop while a pair is still being argued about, not after the energy has gone." },
      { q: "Can we write our own pairs?", a: "Yes — inside jokes about your own group's habits make the best pairs, as long as they stay about preferences." },
    ],
    related: ["spotlight-stories-that-worked", "hosting-grandparents-and-kids"],
    gameSlug: "spectrum",
  },
  {
    slug: "your-family-album-explained", cat: "Family album", read: "Short read", icon: "🧠", soft: "#fff3cc",
    title: "The family album: what it keeps, and for how long",
    description: "How the FamParty family album works: roster, saved stories, scores, the 60-day rule, export and delete.",
    dek: "Sixty days, your roster, your stories — and a delete button that means it.",
    published: true,
    quickAnswer: "A family album is one private link holding your roster, the true stories saved from Spotlight (anyone can opt out of saving theirs) and everyone's scores. It's kept for 60 days after your last show, then deleted.",
    takeaways: ["The link is the only key", "True statements save by default; opting out is per statement", "Export or delete at any time with the owner link"],
    blocks: [
      P("A family album is one private link that remembers who's who: your roster, the true stories saved from Spotlight (anyone can opt out of saving theirs), and everyone's scores. Next show, Remember This? deals those stories back as a game."),
      { type: "steps", title: "How an album lives", items: [
        "Create the album and save the member and owner links somewhere safe.",
        "Add your people to the roster once — names and animals.",
        "Start shows from the album so scores and stories attach to the right people.",
        "Each show, member or saved story restarts the 60-day clock.",
        "Export as JSON whenever you like; delete with a typed confirmation whenever you like.",
      ] },
      P("It is kept for 60 days after your last show, then deleted. No accounts, no indefinite archive: the link is the only key, which is why we tell you plainly to share it only with family. Export everything as JSON whenever you like, and delete the album yourself with a typed confirmation whenever you like."),
      CALL("The opt-out is part of the design", "Every statement carries a \"don't save this\" option, because the best stories are sometimes the ones that should only live in the room.", "tip"),
      { type: "example", title: "What comes back in Remember This?", items: [
        { label: "On the TV", text: "\"I once met a penguin.\" — true statement, author hidden" },
        { label: "On phones", text: "Ana · Ben · Cleo · Dan — who wrote it?" },
        { label: "The rule", text: "The writer can't score on their own statement." },
      ] },
    ],
    faq: [
      { q: "What happens if we lose the link?", a: "We can't recover it — there are no accounts to look it up by. Save the owner link somewhere safe when you create the album." },
      { q: "Can we keep an album forever?", a: "Only by using it. Any show, new member or saved story restarts the 60-day clock; export gives you a permanent copy of the data." },
    ],
    related: ["spotlight-stories-that-worked", "hosting-grandparents-and-kids"],
    gameSlug: "remember-this",
  },
  THANKSGIVING_GAMES
];
