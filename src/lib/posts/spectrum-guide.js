// Rewrite — spectrum-questions-for-any-room (large original pair set)
const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const CALL = (title, text, tone = "tip") => ({ type: "callout", title, text, tone });
const GRID = (title, pairs) => ({ type: "ideaGrid", title, items: pairs.map(([a, b]) => ({ title: `${a} ↔ ${b}`, text: "" })) });

export const SPECTRUM_GUIDE = {
  slug: "spectrum-questions-for-any-room", cat: "Games", read: "Long read", icon: "🎚️", soft: "#e4dcff",
  title: "Spectrum pairs that start arguments (the good kind)",
  description: "Original this-or-that spectrum pairs sorted by family, friends, work and kids, plus what makes a pair work and how to run the reveal.",
  dek: "Cook at home or order in? Choosing pairs that give a room something to argue about.",
  published: true,
  quickAnswer: "Pick pairs with no right answer and a strong smell of taste — food, holidays, Sundays — where everyone must place themselves before seeing where the crowd lands. Keep every pair about preferences, never beliefs.",
  takeaways: [
    "Commit first, reveal together — that's the whole mechanic",
    "A good pair splits the room; a great pair splits it unexpectedly",
    "Preferences only: no politics, identity, health or money",
    "The discussion is the game; the dot is just the excuse",
  ],
  blocks: [
    P("A spectrum pair looks like the simplest thing in the world: two opposites, one line, put yourself somewhere on it. The reason rooms argue about it for ten minutes is the order of operations. Everyone commits to a position while nobody can see anyone else's — no anchoring, no drifting toward the majority — and then every position lands at once. The surprise isn't where you are. It's where everyone else is, and how wrong your guess about them was."),
    { type: "pullQuote", text: "The surprise isn't where you are. It's where everyone else is." },
    P("This post is mostly the raw material: forty original pairs, sorted by who's in the room. Around them, the short version of what makes a pair work, a few that fall flat and why, and how to run the reveal so it turns into conversation instead of a shrug."),
    H("What makes a pair work"),
    P("Four things. First, both ends must be genuinely livable: if one end is a joke answer, everyone piles onto the other and there's no spread to reveal. Second, the pair should be about taste, not correctness — the moment one end is objectively better, you're running a quiz. Third, it helps if people have evidence about each other: pairs about visible habits (cooking, holidays, mornings) let the room check placements against what they know, which is where the \"you're not a night owl, I've seen you\" arguments come from. Fourth, the middle must mean something. On a good pair, the centre is a real position, not a refuge."),
    CALL("Commit before you see anyone else", "The order is the mechanic: place yourself while the room is invisible, then let every position land at once."),
    GRID("For family", [
      ["Cook at home", "Order takeaway"], ["Beach holiday", "Mountain holiday"], ["Early bird", "Night owl"],
      ["Sweet tooth", "Savoury tooth"], ["Plan the holiday", "Wing the holiday"], ["Cats", "Dogs"],
      ["Big Sunday lunch", "Quiet Sunday"], ["Board games", "Card games"], ["City break", "Countryside escape"],
      ["Homemade gifts", "Bought gifts"],
    ]),
    P("Family pairs work best when they're about the family's own habits, because the evidence is in the room. Anything the family actually does together — food, holidays, Sundays, pets — will produce at least one placement that somebody disputes on sight, and that dispute is the content."),
    GRID("For friends", [
      ["Group chat", "Phone call"], ["Host dinner", "Be hosted"], ["Dance floor", "Watching the dance floor"],
      ["Spicy", "Mild"], ["Karaoke star", "Karaoke audience"], ["Road trip driver", "Road trip DJ"],
      ["Save it", "Spend it"], ["Series binge", "One episode a week"], ["Camping", "Hotel with a door"],
      ["First to text back", "Replies eventually"],
    ]),
    CALL("The evidence test", "Before using a pair, ask: could someone in this room be caught out by it? If nobody's placement can be challenged with a story, the reveal will be polite — and forgettable.", "tip"),
    GRID("For work (preferences only)", [
      ["Inbox zero", "Inbox jungle"], ["Meetings", "Messages"], ["Morning standup", "Evening wrap-up"],
      ["Deep focus", "Quick chats"], ["Plan the week", "Ride the week"], ["Camera on", "Camera off"],
      ["Office buzz", "Home quiet"], ["Lunch at desk", "Lunch away"], ["One tab", "Forty tabs"],
      ["Finish early", "Finish perfect"],
    ]),
    P("Work pairs need one extra rule: nothing that maps onto performance, seniority or lifestyle judgement. Where you sit between \"plan the week\" and \"ride the week\" is taste. Anything about beliefs, health, money or how someone lives outside work is out — not because it's dangerous conversation, but because a game that makes one person explain themselves to their manager has failed at its only job."),
    GRID("For kids", [
      ["Ice cream", "Cake"], ["Super speed", "Super strength"], ["Beach", "Snow"],
      ["Dogs", "Cats"], ["Summer", "Winter"], ["Trains", "Planes"],
      ["Pancakes", "Waffles"], ["Dinosaurs", "Dragons"], ["Swimming", "Climbing"],
      ["Stories", "Songs"],
    ]),
    H("Pairs that fall flat"),
    { type: "table", caption: "Three ways a pair dies, and the fix", head: ["Flat pair", "Why it dies", "Better version"], rows: [
      ["Tea ↔ Coffee", "Fine, but for many rooms it's a habit, not an identity — thin arguments", "First drink of the day ↔ Last drink of the day (when are you most yourself?)"],
      ["Good ↔ Evil", "One end is unplayable; everyone stands at the same end", "Rule follower ↔ Rule bender"],
      ["Healthy food ↔ Junk food", "One end is 'correct'; the middle becomes confession", "Cook from scratch ↔ Assemble and heat"],
      ["Rich ↔ Poor", "About money and luck, not taste; makes the room careful", "Save it ↔ Spend it"],
      ["Introvert ↔ Extrovert", "Asks people to label themselves in public", "Big night out ↔ Night in with two people"],
    ] },
    P("The pattern in every flat pair is the same: one end costs something to stand on. The fix is never to abandon the topic — it's to find the version of it that's pure preference, where both ends are just how somebody likes things."),
    H("Running the reveal"),
    { type: "steps", title: "From placement to argument in four moves", items: [
      "Read the pair aloud and give people a beat to place themselves privately. No table talk yet — early talk anchors late placers.",
      "If your version has it, take the majority prediction now: which end will the crowd lean to? It gives quiet players a second way to be right.",
      "Reveal everything at once. Never one player at a time; the pattern is the point.",
      "Interview the edges first: the most isolated placement and anyone the room got wrong. \"Explain yourself\" beats \"who agrees?\" every time.",
    ] },
    P("Two hosting habits keep the discussion kind. Interview placements, not people: \"what pulls you that far left?\" lands better than \"why are you like this?\". And let people move after the argument — a player who shifts their dot because a story persuaded them is the game working at its best, not a rule break. In FamParty's Spectrum, the reveal also names the Lonely Island (furthest from the crowd), the Mind Reader (best prediction) and the Dead Center; if you're playing on paper, stealing those three awards costs nothing and gives the reveal a second beat."),
    { type: "tvMock", game: "Spectrum", header: "Spectrum · Reveal", emoji: "🎚️", question: "Cook at home ↔ Order takeaway", choices: ["🦊 far left", "🐼 middle", "🦄 far right", "🐸 also far right, louder"], footer: "Every avatar lands at once. The crowd leans right." },
    CALL("Keep it to preferences", "Food, weather, holidays, hobbies, how you spend a Sunday. The moment a pair touches beliefs, identity or health, the game stops being a game.", "warn"),
  ],
  faq: [
    { q: "How many pairs make a game?", a: "Eight to ten is a good length. Stop while a pair is still being argued about, not after the energy has gone." },
    { q: "Can we write our own pairs?", a: "Yes — inside references to your own group's habits make the strongest pairs, as long as they stay about preferences and both ends are livable." },
    { q: "What if everyone lands in the same place?", a: "That's a result too: ask what would have to change to move the room. Or keep a couple of known splitters (cats and dogs has never once been unanimous) for the end." },
    { q: "Is this the same as This or That questions?", a: "Related. A spectrum adds the middle, the simultaneous reveal, and — in the group version — predicting where the crowd lands, which is where the arguments start." },
  ],
  related: ["spotlight-stories-that-worked", "hosting-grandparents-and-kids"],
  gameSlug: "spectrum",
};
