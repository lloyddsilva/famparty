// Rewrite — your-family-album-explained (must match the code and /privacy exactly)
const P = (text) => ({ type: "paragraph", text });
const H = (text) => ({ type: "heading", text });
const CALL = (title, text, tone = "tip") => ({ type: "callout", title, text, tone });

export const ALBUM_GUIDE = {
  slug: "your-family-album-explained", cat: "Family album", read: "Long read", icon: "🧠", soft: "#fff3cc",
  title: "The family album: what it keeps, and for how long",
  description: "Exactly how the FamParty family album works: what's saved, what isn't, opt-outs, the 60-day expiry, member vs owner links, export and delete.",
  dek: "Sixty days, your roster, your stories — and a delete button that means it.",
  published: true,
  quickAnswer: "A family album is one private link holding your roster, the true statements saved from Spotlight (they save by default; anyone can opt out per statement), story lines a player chooses to save, and scores from album-room games (those save automatically). Everything is kept for 60 days after your last activity, then deleted.",
  takeaways: [
    "True statements save by default in album rooms — the opt-out is per statement",
    "Scores save automatically; story lines only save if the player types and saves one",
    "Member link plays and views; owner link also exports and deletes",
    "60 days after last activity, the whole album expires and is deleted",
  ],
  blocks: [
    P("The family album is the part of FamParty with a memory. A normal room forgets everything when it expires; an album remembers who's who, keeps the stories your family chose to keep, and deals them back as a game. Because it's the one part of the service that stores anything, it deserves an exact explanation. Everything below matches how the code and the privacy policy actually behave — if you ever find a difference, the privacy policy is the one to hold us to."),
    H("What's saved"),
    { type: "table", caption: "Exactly what an album holds", head: ["Thing", "When it saves", "Can you stop it?"], rows: [
      ["Album name", "When you create the album", "Delete the album"],
      ["Roster members (name + avatar)", "When someone is added to the roster", "Delete the album (members aren't removed one by one)"],
      ["Spotlight true statements", "At the end of each Spotlight turn, in an album room", "Yes — every statement has a \"don't save this\" option"],
      ["Spotlight story lines", "Only if the featured player types one after their story and taps save", "Yes — simply don't save one"],
      ["Game results and scores", "At the end of a game played in an album room", "Play in a normal room instead"],
      ["Album link tokens", "At creation, stored only as hashes", "Delete the album"],
    ] },
    P("Two rows surprise people. True statements save by default at the end of your turn; your control is the per-statement \"don't save this\" tick. Scores save automatically in album rooms. What never saves: the lie, anything from a non-album room, and story lines nobody typed."),
    H("What isn't saved"),
    { type: "tvMock", game: "Remember This?", header: "Remember This? · From the album", emoji: "🧠", question: "\"I once met a penguin.\"", footer: "Whose true statement is this? Guess on your phones — the writer can't score." },
    P("Nothing from ordinary rooms. A room that wasn't started from an album leaves nothing behind when it expires — names, answers and scores in a normal room are gone with it. Chat doesn't exist in FamParty, so there's no chat to save. And your album links themselves are stored only as cryptographic hashes: we couldn't read you your link back if we wanted to, which is the point of the next section."),
    CALL("Why hashes matter to you", "Because the link is stored hashed, nobody at FamParty can read it back to you. That's a feature with a cost: save the owner link when it's shown.", "warn"),
    H("The link is the only key: member vs owner"),
    P("Creating an album gives you two links. The member link plays and views: join shows as a roster member, see the roster, saved stories and scores. The owner link does everything the member link does, plus export and delete. There are no accounts and no passwords, which means the links are the whole security model — anyone who has a link has what the link can do. Share the member link with family; keep the owner link somewhere safer, like a password manager."),
    { type: "example", title: "Two links, two jobs", items: [
        { label: "Member link", text: "Join shows as yourself, see the roster, saved stories and scores. This is the one that goes in the family chat." },
        { label: "Owner link", text: "Everything the member link does, plus Export (JSON) and Delete. This one lives in a password manager, not the group chat." },
      ] },
    CALL("If you lose the owner link", "We can't recover it and can't look it up — it's stored hashed. You'd keep playing on the member link, but export and delete live behind the owner link, so save it when it's shown. It's displayed once, at creation.", "warn"),
    H("The 60-day rule"),
    P("An album is kept for 60 days after your last activity, then deleted. Activity means anything that shows the album is alive: starting a show from it, adding a member, or saving a statement or a result. Each of those restarts the clock. Every key carries the same 60-day expiry, refreshed together, so the album expires as a whole. The album page always shows the current position: when you were last active, and the date the album would expire if nothing else happened."),
    P("Deletion at expiry is automatic and total — roster, stories, scores and link tokens go together. Export first if you want a copy. Provider backups may retain data briefly after deletion; the privacy policy says the same."),
    H("Export and delete"),
    { type: "steps", title: "Your two exits, both behind the owner link", items: [
      "Export: one tap downloads a JSON file with the album name, roster, every saved statement and story line, and all game results. It's yours; keep it wherever you keep family things.",
      "Delete: type DELETE to confirm. The album, its roster, stories, scores and both links stop working immediately and permanently.",
      "Do nothing: 60 days after your last show, member or saved story, the album deletes itself.",
    ] },
    H("How Remember This? uses the album"),
    P("Remember This? is the reason the album keeps truths. It deals saved true statements back to the room — \"I once met a penguin\" — and everyone guesses who wrote it. Three rules keep it fair and kind: only true statements are ever dealt (lies are never saved, so they can't come back), the writer can't score on their own statement, and statements saved in the current show are excluded, so the deck always comes from earlier shows. The album needs a handful of saved truths from players in the room before the game can start; one good Spotlight game seeds it."),
    { type: "example", title: "One statement's journey", items: [
      { label: "Written", text: "Ana writes two truths and a lie in Spotlight prep, and leaves the opt-outs unticked." },
      { label: "Saved", text: "Her turn ends; the two truths save to the album against Ana. The lie is discarded with the room." },
      { label: "Dealt back", text: "Next month, in a new room, Remember This? shows one truth. The room guesses. Ana just smiles." },
      { label: "Gone", text: "Sixty days after the family's last activity, the statement expires with the rest of the album — unless exported first." },
    ] },
    CALL("Playing without an album is always an option", "Nothing in this post is required. Rooms without an album are complete games; the album only exists for families who want the rematch.", "tip"),
  ],
  faq: [
    { q: "What happens if we lose the link?", a: "We can't recover it — there are no accounts to look it up by, and the link is stored hashed. Save the owner link somewhere safe when you create the album." },
    { q: "Can we keep an album forever?", a: "Only by using it. Any show, new member or saved story restarts the 60-day clock; export gives you a permanent copy of the data itself." },
    { q: "Who can see our album?", a: "Anyone with one of its links — that's the whole model, stated plainly on the album page. The member link is for playing and viewing; keep the owner link (export/delete) to yourself." },
    { q: "Does deleting mid-show cause problems?", a: "The show in progress keeps playing from the live room. Saves attempted after deletion simply don't land — there's nothing left to save into." },
  ],
  related: ["spotlight-stories-that-worked", "hosting-grandparents-and-kids"],
  gameSlug: "remember-this",
};
