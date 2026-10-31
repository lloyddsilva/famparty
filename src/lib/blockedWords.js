// Word list: the open-source LDNOOBW list (List of Dirty, Naughty, Obscene
// and Otherwise Bad Words, https://github.com/LDNOOBW — CC BY 4.0, via the
// `naughty-words` package), plus FamParty additions for variants the list
// misses. Matching is done in validate.js.
//
// Deliberate allowances (removed from the upstream list):
// - "dick": also a person's name. Host hide is the backstop for the rest.
// Filters will always miss things; this list is a net, not a guarantee.

import naughtyWords from "naughty-words";

const ADDITIONS = [
  "fucking", "fucker", "motherfucker", "shitty", "shithead", "bullshit",
  "bitches", "whores", "rapist", "nazi", "retard", "slut", "pornstar", "fucked", "shits", "wanker", "arse",
];
const ALLOWANCES = new Set(["dick"]);

export const BLOCKED_TERMS = [...new Set(
  [...(naughtyWords.en || []), ...ADDITIONS]
    .map((w) => String(w).toLowerCase().trim())
    .filter((w) => w && !ALLOWANCES.has(w)),
)];

// Exact innocent phrases that are allowed before any matching happens.
export const ALLOWED_PHRASES = ["cock a doodle doo", "pussy cat", "blue tit", "blue tits"];
