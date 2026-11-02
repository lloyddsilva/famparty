// Post 10 — 8 Games Like Jackbox for Your Next Party (DRAFT; facts checked
// against official sites on 2026-10-31 and must be re-checked on publish day)
const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const CALL = (title, text, tone = "tip") => ({ type: "callout", title, text, tone });

export const GAMES_LIKE_JACKBOX = {
  slug: "games-like-jackbox",
  cat: "Games", read: "Long read", icon: "📺", soft: "#fff3cc",
  title: "8 Games Like Jackbox for Your Next Party (Including Free Ones)",
  description: "Party games that use a shared screen and everyone's phones, compared on price, player count and setup.",
  dek: "Party games that use a shared screen and everyone's phones, compared on price, player count and setup.",
  published: false,
  quickAnswer: "The closest Jackbox-shaped alternatives split three ways: another hosted pack (Jackbox itself, or AirConsole's library), free browser games (skribbl.io, Gartic Phone, Codenames Online, Kahoot!), and smaller focused shows like FamParty (free during beta, 2–12 players, prompts written to be family-friendly, TV + phones, no accounts).",
  takeaways: [
    "Only the host needs to own Jackbox; everyone else joins free on a phone",
    "Free options trade polish and hosting for zero setup cost",
    "Player count is the sharpest divider: 8, 10, 12, or a classroom",
    "Check the content setting, not just the rating, before a family room",
  ],
  blocks: [
    P("People search for \"games like Jackbox\" for four honest reasons: the pack costs money and only one person can host it; the group is bigger than eight; the content needs to be safe for a family room; or tonight's group is remote, young, or allergic to installing anything. No alternative wins on all four, which is why this comparison is organised by what you're actually solving. Every price, player count and platform below was checked on the product's official site when this was written (October 31, 2026) and linked — prices in particular move, so treat them as a snapshot and re-check before you buy."),
    { type: "table", caption: "The short version (checked on official sites, Oct 31 2026)", head: ["Option", "Price", "Players", "Setup"], rows: [
      ["Jackbox Party Starter (jackboxgames.com)", "US$19.99 on console/Steam stores (US$9.99–10.99 seen on PC stores)", "1–8 per game (audience up to 10,000)", "Host buys and installs a pack; players join at jackbox.tv"],
      ["AirConsole (airconsole.com)", "Free to start; full access paid afterwards", "Varies by game", "Browser or TV app as the screen; phones as controllers"],
      ["FamParty (this site)", "Free during beta; no accounts", "2–12", "Host's phone runs it; TV opens a link; phones scan a QR code"],
      ["Kahoot! (kahoot.com)", "Free to sign up; premium plans exist", "Built for classrooms and large groups", "Host shows questions on a big screen; players join with a PIN"],
      ["Codenames Online (codenames.game)", "Free online version", "Two teams (the board game is 4–8+)", "Browser; nickname and a room link"],
      ["skribbl.io", "Free", "Public or private rooms (count not published)", "Browser drawing and guessing; no shared TV needed"],
      ["Gartic Phone (garticphone.com)", "Free in browser/app stores", "Group game; best with a voice call", "Browser or app; write, draw, describe, reveal the chain"],
      ["DIY: your own quiz on a shared screen", "Free", "As many as can see the screen", "Slides or paper, a confident host, phones down"],
    ] },

    H("1. Jackbox itself — and what it does better"),
    P("It has to be said first, because it's true: if you want the deepest catalogue of polished party games with presentation, voice acting and a decade of tuning, Jackbox is the thing itself, not an alternative to it. Per its official how-to-play page, one person buys and hosts a pack, everyone else joins free at jackbox.tv on a phone, and remote play works by the host screen-sharing. The Party Starter's official page lists three games for 1–8 players at US$19.99 on the console and Steam stores, an optional family-friendly setting, moderation settings, and audience play-along for up to 10,000. Choose it when the group is gamers, the night is long, and one person is happy to own and drive the software. Its limits are the search term's reasons: cost sits with the host, most games cap at eight players, and content varies by game, so the family-friendly setting matters."),
    { type: "pickerChart", title: "Is Jackbox itself your answer?", items: [
        { if: "One host owns software, group of gamers, long night", play: "Yes — buy a pack", note: "Guests join free; check the family-friendly setting per game" },
        { if: "Nobody wants to install or pay tonight", play: "Keep reading", note: "The free and focused options are below" },
      ] },
    { type: "pullQuote", text: "Guests always join free. The catalogue is what the host is buying." },
    H("2. AirConsole — the library play"),
    P("AirConsole (airconsole.com) turns a browser, TV app or connected screen into the console and phones into controllers, free to start with full access paid afterwards, per its homepage. It's the pick when variety matters more than curation: a library of smaller games under one roof rather than one authored show. Setup is a connect code on the screen and phones joining from the app or browser. Check its official site for the current catalogue and what the paid tier unlocks, because both change."),
    { type: "steps", title: "The hosted-pack shape, whoever makes it", items: ["One person owns and launches the show.", "Everyone else joins free on a phone with a room code.", "The host's screen is the stage; phones are controllers."] },
    CALL("The one-owner rule", "With hosted packs, ask who owns the software before the night, not during it. Guests joining free doesn't help if the host's laptop is the one that didn't arrive."),
    H("3. FamParty — the small, family-first show (this site, stated plainly)"),
    P("FamParty is us, so here are our real limits alongside the pitch. It's free during beta with no accounts; the host runs the show from their phone, the TV only displays, and 2–12 players join by QR code. Four games, with prompts written to be family-friendly, a word filter on typed text, and a host who can hide or remove players — including a storytelling game and a family album that remembers saved stories for sixty days. The honest limits: it needs at least two players, the catalogue is four games rather than hundreds, rooms are live for two hours rather than persistent, and screen-shared remote play is still being tested rather than proven. Choose it for a family room with a TV, a mixed-age group, and no desire to install or buy anything tonight."),
    { type: "phoneMock", title: "The host's phone is the remote", lines: ["▶ Start, pause, skip, reveal", "🙈 Hide a player on TV", "Room code: ABCD"] },
    { type: "tvMock", game: "FamParty · Emoji Decoder", header: "Emoji Decoder · Round 3", emoji: "🍕🎉", question: "What phrase is this?", choices: ["Pizza Party", "Movie Night", "Birthday Cake", "Picnic Day"], footer: "The TV displays. Phones answer." },
    H("4. Kahoot! — the quiz at scale"),
    P("Per its official what-is page, Kahoot! has the host show questions on a big screen while players answer on their own devices with a game PIN; it's built for classrooms, offices and living rooms, free to sign up with premium plans for schools and business. It's the answer when the group is large, the content is a quiz you wrote or picked, and learning-shaped fun is the point. It is not a living-room show in the Jackbox sense: the host authors or selects content, and the energy is classroom-bright rather than sofa-late."),
    { type: "example", title: "The same group, three right answers", items: [
      { label: "Eight gamers, long night", text: "Jackbox — catalogue depth wins." },
      { label: "Family of eleven, one TV", text: "FamParty — player count, and prompts written to be family-friendly with a host who can hide or remove players." },
      { label: "Scattered friends on a call", text: "Gartic Phone or skribbl.io — no shared screen needed." },
    ] },
    H("5. Codenames Online — the word game"),
    P("The official online version at codenames.game is free to enter in a browser with a nickname, and the board game it's based on is a two-team word-association game (the publisher, Czech Games, describes the app/board experience around 4–8 players in teams). One shared screen of word cards, two spymasters giving one-word clues, and the best quiet arguments in the genre. Choose it when your group would rather think than shout; it needs exactly two teams and at least one confident clue-giver per side."),
    { type: "phoneMock", title: "Every option here joins the same way", lines: ["Open the link or room code on the TV", "Type the code on your phone", "Pick a name — you're in"] },
    CALL("Teams change the maths", "Team formats (Codenames) scale by splitting the room, not by raising a player cap. Two teams of six play better than one crowd of twelve watching."),
    H("6. skribbl.io — drawing, free, no TV required"),
    P("skribbl.io's official site describes a free multiplayer drawing and guessing game: one player draws a word, everyone else races to guess it in chat, in public or private rooms, entirely in the browser. It drops the shared-TV shape — every player watches their own screen — which makes it the easiest remote option here and the least like a living-room show. Drawing skill is not required; drawing confidence helps, and younger players may need the private-room setting and an adult nearby, as with any public-room service."),
    { type: "ideaGrid", title: "Remote-first vs TV-first", items: [
        { title: "Remote-first", text: "Every player watches their own screen. Joining is a link; the room is optional." },
        { title: "TV-first", text: "One shared screen is the stage. Joining is a code; the room is the point." },
      ] },
    CALL("Check the specific game, not the brand", "Player caps and content settings vary title by title inside every catalogue here. The page for the exact game you're about to play is the only reliable source — including ours."),
    H("7. Gartic Phone — the telephone game, drawn"),
    P("Gartic Phone's official site lays out its loop plainly: write a quirky sentence, draw the sentence you receive, describe the drawing you receive, then watch the whole chain drift. It recommends playing on a voice call (it names Discord and Zoom) and offers browser and app versions. It's the funniest slow game on this list and the least competitive: nobody wins, the chain just degrades beautifully. Choose it for a remote group with a call already running."),
    H("8. DIY — a shared screen and a confident host"),
    P("The zero-cost, zero-install option that predates all of this: put questions, emoji clues or a spectrum on any shared screen — slides, a notes app, paper on a wall — and let people answer on paper, by hands, or by shouting in an orderly fashion. You lose private answers, automatic scoring and anonymity, and you gain complete control of content and zero accounts anywhere. For a one-off quiz night with a prepared host, it remains weirdly hard to beat."),
    { type: "example", title: "The DIY version, honestly assessed", items: [
        { label: "You gain", text: "Total control of content, zero accounts, zero cost." },
        { label: "You lose", text: "Private answers, automatic scoring, and anonymity — the three things phones are for." },
      ] },
    { type: "pickerChart", title: "Which is right for your group?", items: [
      { if: "Gamers, one host happy to own software, long night", play: "Jackbox", note: "Deepest catalogue; check each game's rating and the family-friendly setting" },
      { if: "You want a library, not a show", play: "AirConsole", note: "Free to start; check what full access unlocks today" },
      { if: "Family room, TV, ages mixed, nothing to install", play: "FamParty", note: "Free during beta, 2–12 players, four games with family-friendly prompts" },
      { if: "A quiz for a class, team or big group", play: "Kahoot!", note: "You bring or pick the questions" },
      { if: "Word people, two teams, quiet arguments", play: "Codenames Online", note: "Free in the browser" },
      { if: "Drawing and chaos, everyone remote", play: "skribbl.io or Gartic Phone", note: "No shared TV needed; Gartic wants a voice call" },
    ] },
    { type: "phoneMock", title: "Joining a FamParty room", lines: ["Scan the QR code on the TV", "Pick a name and an animal", "You're in — look at the big screen"] },
    CALL("What we left out, and why", "Anything whose price, player count or platform we couldn't confirm on an official page on the day of writing didn't make the table. Streaming-service game bundles and console exclusives change too often to summarise responsibly here — check the store page for your exact console before relying on any roundup, including this one.", "warn"),
  ],
  faq: [
    { q: "Is Jackbox worth it if free options exist?", a: "For a gaming group, often yes: one host purchase unlocks the deepest, most polished catalogue here, and guests always join free. The free options win on zero setup and group size, not on catalogue depth. (The family-room point is FamParty-specific: its prompts are written to be family-friendly, typed text passes a word filter, and the host can hide or remove players.)" },
    { q: "Which option works fully remote?", a: "skribbl.io and Gartic Phone are browser-native and need no shared screen. Jackbox's own guide describes remote play via the host screen-sharing. FamParty's screen-shared play is still being tested, so try a quick game first." },
    { q: "What's best for more than 8 players?", a: "FamParty goes to 12, Kahoot! is built for large groups, and Jackbox audience play-along extends some games far beyond the player cap — check the specific game's page, since caps vary by title." },
    { q: "What's safest for kids in the room?", a: "FamParty (prompts written to be family-friendly, a word filter on typed text, and a host who can hide or remove players) and Kahoot! (host-chosen content) give the host the most control. With Jackbox, use the family-friendly setting it offers and check each game's rating." },
  ],
  related: ["christmas-party-games-for-adults", "icebreaker-games-for-work"],
  gameSlug: "emoji-decoder",
};
