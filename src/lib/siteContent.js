// Marketing content: games, occasions, blog. Placeholder blog copy is marked as such.

export const GAMES = [
  { slug: "emoji-decoder", icon: "🧩", name: "Emoji Decoder", tag: "The warm-up", length: "~8 min", players: "3–12 players", soft: "#fff3cc",
    blurb: "Guess the phrase from the emojis before the clock runs out. Fast fingers score more — shouting at the TV is encouraged.",
    feels: "Like shouting answers at a game show. Zero learning curve; grandparents and kids play as equals, and the fastest finger in the room becomes a legend by round three.",
    how: ["An emoji clue appears on the TV: 🍕🎉", "Four choices on every phone — tap one before the timer ends", "Faster correct answers score more; streaks build bonus points", "The reveal lands big on TV, then the leaderboard shuffles"] },
  { slug: "spotlight", icon: "🎤", name: "Spotlight", tag: "The heart of it", length: "~12 min", players: "3–12 players", soft: "#ffe0e9",
    blurb: "Two truths and a lie, written privately on your phone. Fool the room, then take 30 seconds in the spotlight to tell the real story.",
    feels: "The best part of a family dinner, structured. Someone at every table has a story nobody has heard — Spotlight is how it finally gets told, with a scoreboard cheering it on.",
    how: ["Everyone privately writes two truths and one lie (prompt starters help)", "One player at a time is in the spotlight; the statements are shuffled so the lie has no tell", "Everyone else votes for the lie — guessers score, the featured player scores per person fooled", "Then 30 seconds with the microphone: tell the real story out loud"] },
  { slug: "spectrum", icon: "🎚️", name: "Spectrum", tag: "The conversation starter", length: "~8 min", players: "3–12 players", soft: "#ffffff",
    blurb: "Cook at home or order in? Place yourself, predict the crowd, then watch everyone's avatars land on the big spectrum at once.",
    feels: "\"Wait — YOU put yourself there?!\" Outliers get celebrated, not just winners: Lonely Island for the furthest from the crowd, Mind Reader for whoever predicted it best.",
    how: ["A pair of opposites appears: Cook at home ↔ Order takeaway", "Place yourself on the slider, then predict where the crowd will land", "Every avatar dot lands on the TV spectrum at once", "Awards for the outlier, the mind reader, and the dead centre"] },
  { slug: "finish-it", icon: "✍️", name: "Finish It", tag: "The comedy round", length: "~10 min", players: "3–12 players", soft: "#e4dcff",
    blurb: "Everyone finishes the same sentence. Answers are dealt onto the TV one by one — the funniest ending wins, whoever wrote it.",
    feels: "The family's funniest person gets discovered, and it is not always who you expect. Anonymity means the quiet kid can beat the loud uncle.",
    how: ["One sentence on the TV: \"The secret to surviving a family road trip is ___\"", "Everyone writes an ending privately on their phone", "The host deals the answers onto the TV one at a time — authors stay secret", "Everyone votes (never for their own), then the authors are unmasked"] },
  { slug: "remember-this", icon: "🧠", name: "Remember This?", tag: "The memory game", length: "~8 min", players: "Family album", soft: "#ffffff",
    blurb: "True stories from your last show come back. Who met a penguin? Who slept in a tent for a week? Your family's history is the quiz.",
    feels: "Proof the family has a history. Last month's throwaway truth becomes tonight's fiercest argument — and the writer sits there smiling, unable to score on their own story.",
    how: ["Needs a family album: true statements saved from earlier Spotlight games", "A saved statement appears on the TV, author hidden", "Everyone guesses who wrote it; the writer cannot score on their own", "Kept for 60 days after your last show, then deleted"] },
];

export const OCCASIONS = [
  { slug: "family-night", icon: "🛋️", name: "Family night", soft: "#fff3cc", sub: "Kids, parents, grandparents, one screen.",
    intro: "The whole point of FamParty. Ages 8 to 80 in the same game, on the same screen, with nobody operating a laptop or explaining rules twice.",
    show: ["spotlight", "emoji-decoder", "remember-this"],
    tips: ["Put the TV on first and let people join while snacks happen — the lobby is the warm-up", "Spotlight early, while stories are still being volunteered", "Finish with Remember This? so the night ends on family history, not just points", "Kids who don't want the spotlight can just watch and vote — that's a full role"] },
  { slug: "game-night", icon: "🎂", name: "Game night", soft: "#ffe0e9", sub: "Friends, snacks, mild betrayal.",
    intro: "Friends, birthdays, reunions: break the ice in the first five minutes, then let the fooling, voting and unmasking do the rest.",
    show: ["emoji-decoder", "finish-it", "spectrum"],
    tips: ["Emoji Decoder first — zero rules, instant shouting", "Finish It while energy is high; anonymous answers mean bold answers", "Spectrum last, when people are ready to defend their strangest opinions", "The host can pause any round that turns into a debate. Let it"] },
  { slug: "teams", icon: "💻", name: "Teams & video calls", soft: "#e4dcff", sub: "Share the screen. Five warm minutes.",
    intro: "A five-minute opener that isn't a corporate exercise. Share the TV screen on your call; everyone plays on their own phone, wherever they are.",
    show: ["spectrum", "emoji-decoder"],
    tips: [" spectrum first: one slider tap is the lowest-effort participation there is", "Keep it to one or two games — you're an opener, not the meeting", "Prompts are preference-based only; nothing about work, beliefs or identity", "Works the same in the room: meeting-room screen up, phones out"] },
];

export const POSTS = [
  { slug: "spotlight-stories-that-worked", cat: "Ideas", read: "4 min", icon: "🎤", soft: "#ffe0e9", title: "Two truths and a lie: statements that actually fooled a room",
    dek: "The secret is a boring lie and an outrageous truth. Placeholder post — real stories land after the first season of shows.",
    body: ["Every Spotlight round teaches the same lesson: the lie that works is the dull one. \"I have a brother\" has fooled more rooms than any invented celebrity encounter, because the truths next to it were doing all the showing off.", "Three patterns that work: a specific number (\"I've eaten the same lunch for 200 days\"), a place only you would know, and a talent nobody can test on the spot. Pair one outrageous truth with one beige lie and watch the votes split.", "And when you are the featured player: don't defend the lie. Tell the true stories like they're the suspicious ones. The 30-second story beat afterwards is where the game pays off — the points are just an excuse to hear it."] },
  { slug: "hosting-grandparents-and-kids", cat: "Hosting tips", read: "5 min", icon: "🛋️", soft: "#fff3cc", title: "One game, ages 8 to 80: hosting across generations",
    dek: "Big tap targets, pausable timers, and a just-watch role. Placeholder post.",
    body: ["The mixed-age room fails in predictable places: tiny text, fast reading, and being put on the spot. FamParty is built around all three — answers are enormous tap targets, the host can pause any timer, and nobody has to perform.", "Practical moves: put the most confident reader in charge of nothing. Seat grandparents where the TV is biggest to them, not closest to the snacks. Let kids just watch and vote in Spotlight until they demand a turn — they will, usually by round two.", "Start with Emoji Decoder. It has no rules to explain, and the first time a grandparent beats everyone on speed, the room is yours for the night."] },
  { slug: "spectrum-questions-for-any-room", cat: "Games", read: "3 min", icon: "🎚️", soft: "#e4dcff", title: "Spectrum pairs that start arguments (the good kind)",
    dek: "Cook at home or order in? The pairs that reveal a room. Placeholder post.",
    body: ["A good Spectrum pair has no right answer and a strong smell of identity: how you holiday, how you eat, how you spend a Sunday. The reveal works because everyone commits before anyone sees the crowd.", "The pairs that land hardest are the ones where the room expects unanimity and doesn't get it. One person always puts pineapple at the extreme end. That person becomes the evening's main character, briefly and gloriously.", "Keep it to preferences — food, weather, holidays, hobbies. The moment a pair touches beliefs or identity, the game stops being a game."] },
  { slug: "your-family-album-explained", cat: "Family album", read: "4 min", icon: "🧠", soft: "#fff3cc", title: "The family album: what it keeps, and for how long",
    dek: "Sixty days, your roster, your stories — and a delete button that means it. Placeholder post.",
    body: ["A family album is one private link that remembers who's who: your roster, the true stories people chose to save in Spotlight, and everyone's scores. Next show, Remember This? deals those stories back as a game.", "It is kept for 60 days after your last show, then deleted. No accounts, no indefinite archive: the link is the only key, which is why we tell you plainly to share it only with family. Export everything as JSON whenever you like, and delete the album yourself with a typed confirmation whenever you like.", "Every statement carries a \"don't save this\" option, because the best stories are sometimes the ones that should only live in the room."] },
];
