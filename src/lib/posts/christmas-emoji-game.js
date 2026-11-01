// Post 5 — Christmas Emoji Game: 40 Clues With Answers (DRAFT)
const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const CALL = (title, text, tone = "tip") => ({ type: "callout", title, text, tone });
const REVEAL = (title, items) => ({ type: "revealGrid", title, items: items.map(([clue, answer]) => ({ clue, answer })) });

export const CHRISTMAS_EMOJI_GAME = {
  slug: "christmas-emoji-game",
  cat: "Games", read: "Long read", icon: "🎄", soft: "#fff3cc",
  title: "Christmas Emoji Game: 40 Clues With Answers (Songs, Movies and Traditions)",
  description: "A ready-to-play Christmas emoji game with answers, plus how to run it as a group at home, at school or at work.",
  dek: "A ready-to-play Christmas emoji game with answers, plus how to run it as a group at home, at school or at work.",
  published: true,
  quickAnswer: "Forty original emoji clues in three sets — songs, movies, and traditions — each at three difficulties. Tap any clue to reveal its answer, or put the clues on a TV and let everyone guess together.",
  takeaways: [
    "Answers are hidden until tapped — no scrolling past spoilers",
    "Easy clues use the picture literally; hard ones use sounds and wordplay",
    "Write your own by building the phrase from its sounds, not its meaning",
    "On paper, read aloud, or on the TV — the same clues work three ways",
  ],
  blocks: [
    P("An emoji game lives on its clues, so the clues come first: forty of them, sorted by category and difficulty, with every answer hidden until you tap it. All of them were written for this page, for paper or read-aloud play. (FamParty's Emoji Decoder, mentioned later, runs the same shape on TV with its own general pack — none of these forty are in the app.) After the clues, there's a short guide to running the game, and to writing your own clues that are hard for the right reasons."),
    CALL("How difficulty works here", "Easy clues picture the thing itself (🎅 is doing heavy lifting). Medium clues add a second idea. Hard clues work by sound — reading the emoji names aloud gets you the phrase — so give hard rounds more time and expect groaning.", "tip"),

    H("Christmas songs"),
    REVEAL("Easy songs", [
      ["🎄 🪨", "Rockin' Around the Christmas Tree"],
      ["🔔 🛷", "Jingle Bells "],
      ["❄️ ⛄", "Frosty the Snowman"],
      ["🔴 👃 🦌", "Rudolph the Red-Nosed Reindeer"],
      ["🎅 🏙️", "Santa Claus Is Comin' to Town"],
    ]),
    REVEAL("Medium songs", [
      ["🌟 🌃", "O Holy Night (starry night)"],
      ["👼 📣", "Hark! The Herald Angels Sing"],
      ["🐑 🐑 👶", "Away in a Manger "],
      ["❄️ 🎩 💃", "Walking in a Winter Wonderland"],
      ["🔕 🌃", "Silent Night"],
    ]),
    REVEAL("Hard songs (read the emoji names aloud)", [
      ["👁️ 🎅 💋", "I Saw Mommy Kissing Santa Claus (eye + Santa + kiss)"],
      ["🌰 🍬 🧚", "Dance of the Sugar Plum Fairy (nut + sweet + fairy)"],
      ["🎉 🌍", "Joy to the World"],
      ["🎄 🔟 ✌️", "The Twelve Days of Christmas (tree + ten + two)"],
    ]),

    H("Christmas movies"),
    REVEAL("Easy movies", [
      ["🏠 😱 👦", "Home Alone"],
      ["🧝 🎅", "Elf"],
      ["🚂 🌌 ❄️", "The Polar Express"],
      ["💚 🎄 😠", "How the Grinch Stole Christmas"],
      ["⛄ 🎩", "The Snowman"],
    ]),
    REVEAL("Medium movies", [
      ["💌 🎄", "Love Actually"],
      ["🎲 💀 🎄", "Die Hard"],
      ["👻 ⏰ 🎄", "A Christmas Carol"],
      ["🎅 📜 😈", "Bad Santa"],
    ]),
    REVEAL("Hard movies", [
      ["🌃 😴 🎄", "The Nightmare Before Christmas"],
      ["🎄 🏙️ 🗽", "Miracle on 34th Street (tree + city + statue)"],
    ]),

    H("Traditions and festive things"),
    REVEAL("Easy traditions", [
      ["🦌 🛷 🎁", "Reindeer pulling the sleigh with presents"],
      ["🍬 🦯", "Candy cane"],
      ["🧦 🔥", "Stockings by the fireplace"],
      ["🎄 ⭐", "Star on top of the tree"],
      ["🥛 🍪 🎅", "Milk and cookies for Santa"],
    ]),
    REVEAL("Medium traditions", [
      ["💋 🌿", "Kissing under the mistletoe"],
      ["📅 🍫 🚪", "Advent calendar"],
      ["🎁 📦 😱", "Secret Santa (gift + surprise)"],
      ["🦃 🥧 🍽️", "Christmas dinner"],
      ["✉️ 💌 🎅", "Letter to Santa"],
    ]),
    REVEAL("Hard traditions", [
      ["🎄 🔌 💡 💡", "Untangling the Christmas lights"],
      ["🥊 📦 🎁", "Boxing Day (boxing glove + box + gift)"],
      ["🎄 🚪 🎶", "Carol singers at the door"],
      ["🧦 🍊", "An orange in the stocking"],
    ]),

    H("How to run it as a group"),
    { type: "steps", title: "Three ways to play the same clues", items: [
      "On paper: print or copy the clues without the answers (copy them from the clue lists above, not the revealed text). One point per correct phrase; answers read out at the end.",
      "Read aloud: the host reads the emoji names — \"tree, rock\" — and the room shouts. Reading names aloud is a different, harder game than seeing the pictures, so treat it as the advanced mode.",
      "On the TV with an app: FamParty's Emoji Decoder runs this shape — clue on the big screen, four choices on every phone, speed scores more — with its own general pack of clues, not these forty.",
    ] },
    P("For a mixed-age room, run the easy set as a warm-up with everyone shouting, then switch to individual or paired answers for medium and hard. For a classroom or team, pairs beat solo: the discussion between the two people holding one phone is most of the fun and most of the noise, in the good way."),
    P("Scoring is worth deciding before the first clue, because it changes how people play. Fastest-correct-wins makes a room loud and rewards the confident; one point per correct answer, whenever it comes, keeps younger players in it to the last clue. Teams of two split the difference: one person reads the emoji names aloud — which, as the hard set shows, is sometimes the hint itself — and the other holds the answer sheet. If you're playing on paper, let pairs mark their own and swap sheets to check; the checking is where the arguments about whether \"tree plus rock\" can mean two different songs happen, and those arguments are the best part."),
    H("Writing your own clues"),
    { type: "pickerChart", title: "Pick a scoring style first", items: [
        { if: "A loud, confident room", play: "Fastest correct wins", note: "Speed is the spice; wrong-but-fast scores nothing" },
        { if: "Kids or mixed ages", play: "A point whenever you're right", note: "Nobody is out of it before the last clue" },
        { if: "Pairs on one phone", play: "Team points, shared sheet", note: "Swap sheets to mark; the argument is the prize" },
      ] },
    P("Build the phrase from its sounds, not its meaning. Start from the answer and break it into syllables; find an emoji whose name sounds like each syllable; fill gaps with literal pictures. \"Mistletoe\" is 💋 (kiss) plus 🦶 (toe) if you want it hard, or 🌿 with a kiss for medium. The mistake to avoid is picturing the \"idea\": three snowflakes could be winter, snow, cold, or Christmas itself, and a clue that could be anything is just a guess. Test every clue on one person who hasn't seen the answer. If they get it in under a minute with one wrong turn, it's a good medium. If they get it instantly, it's easy. If they're still stuck, add one literal emoji — never remove one."),
    { type: "tvMock", game: "Emoji Decoder", header: "Emoji Decoder · Round 3", emoji: "🍕🎉", question: "What phrase is this?", choices: ["Pizza Party", "Movie Night", "Birthday Cake", "Picnic Day"], footer: "A real clue from the app's general pack — not one of the forty above." },
    CALL("If a clue needs an apology, rewrite it", "When a clue only works with an explanation attached, it doesn't work yet. The fix is always another emoji — ideally one literal picture to anchor it — never a longer explanation.", "warn"),
  ],
  faq: [
    { q: "Can I print this game?", a: "Yes — copy the clue text (not the revealed answers) into a document. The answers stay hidden here behind taps, so check your printout doesn't include them." },
    { q: "How many clues make a game?", a: "Twelve to fifteen is a good round: five easy to warm up, then mediums, then two hard ones to finish. Forty are provided so you can pick a set your room hasn't seen." },
    { q: "Do the emoji look the same on every phone?", a: "Mostly. The common objects used here (trees, bells, snow) render recognisably across phones, though styles differ. Avoid brand-new or obscure emoji in your own clues." },
    { q: "Can kids play the hard set?", a: "The sound-based hard clues suit older kids and adults. Younger players do well on the easy set, especially in pairs with an adult." },
  ],
  related: ["christmas-games-for-the-family", "christmas-party-games-for-adults"],
  gameSlug: "emoji-decoder",
};
