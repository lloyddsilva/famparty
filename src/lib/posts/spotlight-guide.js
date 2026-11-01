// Rewrite — spotlight-stories-that-worked (deep technique guide)
const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const CALL = (title, text, tone = "tip") => ({ type: "callout", title, text, tone });

export const SPOTLIGHT_GUIDE = {
  slug: "spotlight-stories-that-worked", cat: "Ideas", read: "Long read", icon: "🎤", soft: "#ffe0e9",
  title: "Two truths and a lie: writing statements that split the vote",
  description: "How to write two truths and a lie statements that split the vote: what makes a lie believable, weak vs strong sets, and how to act.",
  dek: "The secret is a boring lie and an outrageous truth. How to write statements that split the vote.",
  published: true,
  quickAnswer: "Make the lie the dullest of your three statements, give the truths specific details (numbers, places, names), match all three in length and tone, and don't defend the lie when people ask questions.",
  takeaways: [
    "Believability is about size: a lie the same size as your truths",
    "Specific details make truths sound invented — use that",
    "Weak sets fail in predictable ways you can fix in one edit",
    "As the featured player, your job after the reveal is the story",
  ],
  blocks: [
    P("Two truths and a lie lives or dies in the writing. The guessing is quick; the writing is where the featured player decides whether the room splits, argues and demands a replay — or shrugs and picks the obvious one in four seconds. This guide is about the writing and the short performance that follows it. It stays on technique: if you want a big bank of example statements to adapt, that's a separate post (Two Truths and a Lie ideas), linked at the end. The two deliberately don't repeat each other's examples."),
    { type: "steps", title: "The game in twenty seconds", items: ["Write two truths and one lie, privately.", "Everyone else guesses the lie.", "The featured player tells one true story. That's the round."] },
    { type: "pullQuote", text: "A believable lie is not a clever lie. It's a sized lie." },
    H("What makes a lie believable"),
    P("A believable lie is not a clever lie. It's a sized lie. Voters don't judge statements one at a time; they judge the set, and they instinctively pick the statement that feels different in scale from the other two. A lie about meeting someone famous fails next to truths about breakfast, not because it's impossible, but because it's the only statement in the set carrying a headline. Match the lie's size — its drama, its rarity, its consequences — to your more ordinary truth, and it stops glowing."),
    P("The second force is specificity, and it cuts in a direction most people don't expect. Details make a statement sound invented. \"I ate the same lunch for 200 days\" sounds like a fabrication precisely because of the number; a real memory keeps its numbers, a made-up one usually rounds them off. So specific truths read as lies, and a smooth, detail-free lie reads as the kind of thing that's too boring to invent. That asymmetry is the whole game."),
    { type: "example", title: "Feel the size difference", items: [
        { label: "Too big", text: "\"I once met a head of state.\" — a headline looking for two whispers to hide behind." },
        { label: "Sized right", text: "\"I queued behind a footballer at a petrol station in 2019 and said nothing.\" — same claim, shrunk to life-size with details." },
      ] },
    CALL("The room judges the set, not the statement", "Voters compare your three against each other. Anything that stands out — in size, voice or drama — gets picked, true or not."),
    { type: "ideaGrid", title: "The four dials of a believable set", items: [
      { title: "Size", text: "All three statements should carry roughly the same amount of drama. One headline in the set is a flare." },
      { title: "Specificity", text: "Numbers, street names, years, brands. Put them in the truths; leave the lie smooth." },
      { title: "Length and tone", text: "Three statements of similar length, written the same way. A one-line joke next to two careful sentences is a tell." },
      { title: "Testability", text: "Talents nobody can check on the spot (perfect pitch, double-jointed thumbs) are safer ground than claims the room can test immediately." },
    ] },
    H("Anatomy of a weak set — and the one-edit fix"),
    P("Weak sets fail in a small number of repeatable ways. The first is the celebrity flare: one statement involves fame, danger or a record, and the other two involve groceries. The fix is not a better lie; it's to demote the lie to grocery level and promote one truth to carry the surprise instead. The second is the tone break: two statements written carefully and one written as a punchline. Voters read the odd style as the odd fact. Rewrite all three in the same voice, out loud, and the break disappears."),
    P("The third failure is the checkable claim. \"I can juggle\" in a room with fruit available is not a statement, it's an invitation. Move untestable claims in, or accept the test as part of the show and be ready. The fourth is the double-negative tangle — statements with \"never\" and \"not\" force voters to do logic instead of reading faces, and confused voters just pick the longest. One negative per set, maximum."),
    { type: "example", title: "One set, before and after", items: [
      { label: "Before", text: "\"I met a famous footballer. / I like toast. / I have been to France.\" — the lie (any of them) glows; nothing has texture." },
      { label: "After", text: "\"I queued behind a famous footballer at a petrol station in 2019 and said nothing. / I've eaten the same lunch for 200 days. / I have a brother.\" — every statement has a size, two have details, and the plainest one is the lie." },
      { label: "The edit", text: "Nothing was added but specificity and balance. Same facts, completely different vote." },
    ] },
    H("Writing your three, step by step"),
    { type: "steps", title: "A five-minute writing routine", items: [
      "List six true things first. Don't write the lie yet — a lie invented in a vacuum will outsize your life.",
      "Pick the two truths with the most specific details: a number, a place, a year, a name.",
      "Now write a lie the size of your duller truth. If it sounds exciting, shrink it.",
      "Rewrite all three in one voice and similar length. Read them aloud; fix any that sounds performed.",
      "Check the set for testability and negatives. One of each, no more.",
      "Decide your story before the vote: which truth will you tell after the reveal, and what's its best first sentence?",
    ] },
    P("That last step is the one people skip, and it's the one the room remembers. The vote creates thirty seconds of attention aimed at you. Having the first sentence of the true story ready — \"So, the pyjamas. It was February and the door had swollen shut…\" — turns a win into the moment the game exists for."),
    H("Acting as the featured player"),
    P("During the vote, your job is to give nothing away unevenly. Answer questions about all three statements with the same energy and roughly the same amount of detail. The classic tell is defending the lie harder than the truths, or laughing only at questions about one statement. If anything, tell the true stories with a slight smirk, as if they were the suspicious ones — voters read confidence backwards more often than you'd think."),
    { type: "phoneMock", title: "During the vote, your phone just waits", lines: ["Your three statements are on the TV", "Keep the same face for all of them", "Your story comes after the reveal"] },
    CALL("Don't perform innocence", "Saying \"would I lie to you?\" or over-explaining a truth marks it. Calm, equal treatment of all three is the whole act. The room is reading differences, not guilt.", "tip"),
    P("When the lie is revealed, the featured player scores for everyone fooled — and then the game hands them the microphone. In FamParty's Spotlight that beat is thirty seconds on the TV with no typing allowed, because you should be talking. Use it on one truth, told properly: where you were, what happened, the detail that proves it. The optional one-line save afterwards is for the family album; the story itself belongs to the room, out loud."),
    { type: "tvMock", game: "Spotlight", header: "Spotlight · Your turn", emoji: "🎤", question: "Which one is the lie?", choices: ["Same lunch, 200 days", "I have a brother", "Locked out in pyjamas"], footer: "Votes are private on phones. The story comes after the reveal." },
    { type: "phoneMock", title: "Writing yours (Spotlight prep)", lines: ["Statement 1 — a truth, with a detail", "Statement 2 — a truth, with a detail", "Statement 3 — mark which one is the lie", "Anyone can switch to just watching instead"] },
    H("Hosting notes"),
    P("If you're hosting, protect the writing time. Two minutes of quiet while people write is what separates sets worth voting on from whatever was typed while laughing. Read the three statements off the TV yourself if the featured player would rather not; the statements matter more than who voices them. And if a set collapses — everyone spots it instantly — don't apologise for the player. Reveal fast, enjoy the story anyway, and move on. The story was always the prize."),
    { type: "ideaGrid", title: "The host's three moves", items: [
        { title: "Protect the writing", text: "Two quiet minutes while people write. Sets written in noise are guessable in seconds." },
        { title: "Read it yourself", text: "If the featured player would rather not perform, the host reads the statements off the TV." },
        { title: "Reveal fast on a collapse", text: "Everyone spotted it? Reveal, take the story, move on. Never apologise for a player." },
      ] },
    { type: "pullQuote", text: "Load the truths with detail, keep the lie plain, and let the room's instincts work against them." },
  ],
  faq: [
    { q: "What makes a lie too obvious?", a: "Anything much grander than your truths. If the lie needs a celebrity, a record or a rescue, the room will pick it on sight. Match the lie's size to your most ordinary truth." },
    { q: "Should the lie come first, second or third?", a: "It shouldn't matter — and in FamParty it can't be gamed, because statements are shuffled before they're shown. Write the set, not the order." },
    { q: "Can kids play?", a: "Yes — statements about school, food and animals work well. Anyone who doesn't want a turn can just watch and vote, which is a complete way to play." },
    { q: "Where can I find example statements to adapt?", a: "The companion post, 100 Two Truths and a Lie Ideas, is a bank of fill-in-able examples sorted by group. This post is the technique; that one is the raw material." },
  ],
  related: ["hosting-grandparents-and-kids", "spectrum-questions-for-any-room"],
  gameSlug: "spotlight",
};
