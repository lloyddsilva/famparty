# Content packs — final review list (in play order)

Provenance, accurately: generated offline with Muse Spark 1.3 and Muse
Image 1.0 (Meta Model API, `https://api.meta.ai/v1`), then edited with Muse
in OpenCode, and reviewed by Lloyd. Not verbatim model output, and not
tested with real people. Raw model outputs are unchanged in
`content/outputs/`. The packs in `src/lib/packs.js` are **not** verbatim
model text: many items were edited, rewritten, replaced, reordered or cut
**by Muse in OpenCode at Lloyd's direction** across his review rounds.
Every item below that is not raw model text is marked, with its old text
shown. **Approved: Lloyd replied "Packs approved" with the final edits
recorded here, and `reviewed` was flipped to true as his recorded decision.**

**Safety:** checked — all-ages, no real people, no brands, no factual claims
that can be wrong. Originality, accurately: the text was written or generated
for this project and wasn't checked against other games. Spectrum labels make
no topic claims beyond the pair itself (earlier drafts of this file claimed
the list "avoids religion" while items 5–7 were a Christmas cluster; that
cluster is gone and the claim is not repeated).

**Order matters:** the engine plays items in order and defaults to 5 rounds,
so items 1–5 of each pack are the opening. Each pack is ordered on purpose:
easy/funny/varied first. Note: with the 10-round maximum, items beyond #10
of the Emoji/Spectrum/Finish It packs are spares that a normal show won't
reach — judge the first 10 hardest.

**Edits record (summary):** build-time formatting (choice order, preamble
stripping); Lloyd's Part 2 fixes; then Lloyd's quality pass — Emoji rounds
rewritten so the answer is the obvious reading of *all* the emoji and each
wrong answer fits *part* of the clue; Spectrum labels rewritten in spoken
style, 1–4 words a side, clusters broken up, two-axis pairs cut to one axis;
Finish It role-dependent prompts cut from 8 to 3 and awkward prompts
rewritten; Spotlight starters that nudged location-sharing ("A place near
home"), unjudgeable material (favourite smell, a dream) or boasting replaced
or reworked.

---

## Emoji Decoder — 12 rounds (opening 5 first)

1. 🍕🎉 — **Pizza Party** · Birthday Cake / Cheese Pizza / Taco Party
   *(clue and answer reused from the old starter pack — not new. The model's original #1 was the Hot Apple Pie round, removed — see #12 note)*
2. 🏖️🍦☀️ — **Day At The Beach** · Ice Cream Sundae / Swimming Pool / Sunny Garden
   *(clue remixed from the starter pack's 🏖️🍦☀️ "Summer Vacation" — not new. Edited: was ☀️😎🏖️ "Sunny Day Out" with "Sunny Day Off / Sunny Park Day" — both defensible)*
3. 🎂🕯️🎉 — **Birthday Party** · Wedding Cake / Candle Light / Party Games Night
   *(clue close to the starter pack's 🎂🕯️🎈 "Birthday Party" — not new. Edited from the model's "Birthday Cake Time"; "Birthday Party Time" was defensible)*
4. 🐱🥛 — **Cat Drinks Milk** · Afternoon Cat Nap / Glass Of Milk / Cat And Mouse
   *(kept from Part 2 fix — clue 🐱🐟🥛 → 🐱🥛; wrong answers reworked to fit part of the clue)*
5. 🧺🌳🍎 — **Picnic In The Park** · Apple Pie / Climbing Trees In Summer / Fresh Apples
   *(final fix at approval: "Afternoon In The Park" was defensible and "Laundry Basket" also appeared in #6 — both replaced)*
   *(Part 2 replacement for the Christmas round; wrong answers reworked to fit part of the clue)*
6. 🧺👕🧦 — **Do The Laundry** · Laundry Basket / T-Shirt / Warm Socks
   *(wrong answers rewritten twice: model's were near-synonyms, Part 2's had no link to the clue)*
7. 🎒📚🚌 — **Back To School** · Bus Ride / Book Club / New School Backpack
   *(edited: was "Off To School / Back To Class / Pack For School" — all arguably right)*
8. 💡🔌💤 — **Lights Out** · Light Bulb / Plug It In / Sleep Tight
   *(edited: was "Turn Off The Lights" — nothing separated off from on, and "Turn Off The Lamp" was defensible)*
9. 🎬🍿🛋️ — **Movie Night** · Popcorn Snack / Couch Nap / Film Set
   *(edited: was 🍕🧀📺 "Pizza Movie Night" — the clue showed a TV, and "Pizza Family Night" was defensible)*
10. ❄️☃️🧤 — **Build A Snowman** · Shovel The Driveway / Catch A Snowflake / Drink Hot Cocoa
    *(kept from Part 2 fix — "Make A Snowman" synonym removed)*
11. 🐶🎾🦴 — **Dog Playing Fetch** · Tennis Match Final / Puppy Dog / Rubber Bone
    *(Part 2 replacement for the Halloween round; shortened from "Playing Fetch With A Dog" so the answer doesn't stand out by length/grammar)*
12. 🍳🥓🍞 — **Cooked Breakfast** · Fried Egg / Toast And Butter / Bacon Sandwich
    *(new, written by Muse in OpenCode, replacing the model's "Hot Apple Pie" round — "Hot" vs "Warm" was too fine a distinction for 20 seconds)*

Removed and not replaced in this pack: the model's ⛈️🏠☕ — **Stormy Night In**
· wrong: Rainy Night In / Stormy Day Out / Snowy Night In. (An earlier version
of this file and the packs header wrongly described it as rewritten; it was
removed outright in the quality pass.)

Local check: every round has exactly 4 choices, the answer is among them, no
duplicates, answer positions run 0,2,1,3,3,1,3,0,1,0,2,3 (all four positions
used), and the answer is the longest choice in 0 of 12 rounds.

## Spectrum — 20 pairs (labels 1–4 words a side)

1. Early Bird | Night Owl
2. Sweet | Salty
3. Beach Vacation | Mountain Vacation *(US English at approval; was "Beach Holiday | Mountain Holiday")*
4. Plan Ahead | Wing It
5. Cook At Home | Eat Out
6. Open Gifts Slowly | Tear Them Open
7. Sunny Day | Rainy Day
8. City Trip | Country Escape *(US English at approval; was "City Break")*
9. Dogs | Cats
10. Board Games | Video Games
11. Crunchy Peanut Butter | Smooth Peanut Butter
12. Stay In | Go Out
13. Camping | Hotel Stay
14. Coloring In | Playing Tag *(US spelling at approval)*
15. On My Own | With A Team
16. Watch Together | Watch Alone
17. Make The Bed | Leave It Unmade *(replaced at approval: was "Neat And Tidy | Soft And Cosy" — no clear axis)*
18. Thank-You Note | Thank-You Call *(replaced at approval: was "Written Note | Video Call" — had lost the thank-you meaning)*
19. Thin Pancakes | Thick Pancakes
20. Dinner Outside | Dinner Inside *(replaced at approval: was "Cookout Outside | Picnic Inside" — read oddly)*

All 20 were rewritten in this pass from the model's adjective-padded labels
(e.g. "Thin Crispy Pancakes | Thick Fluffy Pancakes", "Neatly Folded Blankets
| Cozily Tossed Blankets"). Changes of substance: the holiday cluster
(decorating early/late, gifts, Christmas tree) is now one general celebration
pair (#6); the weather cluster is one pair (#7); the pet cluster is one pair
(#9) and "Watching Garden Birds | Watching Tank Fish" is deleted; #15 was
solo-vs-group *and* jigsaw-vs-trivia, #18 (old numbering) was big/family vs
quiet/solo — both are now single-axis (#15, #16 above). The opening 5 are
habits/food/travel/habits/food, not all food. Longest label is "Crunchy
Peanut Butter" (3 words); checked at 390px — no horizontal overflow — and
the TV spectrum layout takes left/right labels of this size without issue.

## Finish It — 20 prompts (strongest first)

1. The group chat went completely silent after someone sent a photo of ___.
   *(rewritten at approval: was "Our family group chat exploded when Mom sent a photo of ___." — role-specific opener, didn't suit friends/mixed groups)*
2. The winner of game night gets to keep ___ for a whole week..
3. We knew we were lost when we saw a sign for ___.
4. The fridge at midnight is the perfect place to find ___.
5. The couch cushions are hiding ___ again..
6. Our dog barked all night because he saw ___.
7. The mysterious noise in the attic turned out to be ___.
8. Game night got really loud as soon as we started playing with ___.
9. We had to pause the game because everyone was laughing at ___.
10. The group chat in one emoji: ___. *(rewritten: was "The most-used emoji in our family chat should be ___." — an emoji-only answer was tested: it passes the word filter, submits, and renders on the TV, so an emoji answer is a valid funny answer here)*
11. My autocorrect changed "I love you" to ___. *(kept: tested against the word filter — strong rude answers (profanity, sexual terms) are blocked; mild ones like "fart" pass, which is the filter's documented line, with host hide as backstop)*
12. The only road trip snack left in the car was ___. *(rewritten: was "The best road trip snack is definitely ___." — invited a sincere answer)*
13. Grandma always keeps ___ in her purse just in case..
14. The secret ingredient in the famous cookies is ___. *(rewritten: was "Grandma's cookies would be even sillier with ___ inside.")*
15. If this group had a motto, it would be ___. *(new, group-neutral)*
16. Never challenge the reigning champion to ___. *(new, group-neutral)*
17. The house rule nobody admits to breaking is ___. *(new wording, any group)*
18. The best excuse for being late is ___. *(replaced at approval: was "The Wi-Fi password should honestly be ___." — a real password could have ended up on a TV)*
19. Grandpa's secret to staying young is ___.
20. For my birthday dinner, I really want ___ instead of cake..

Role-dependent prompts: 2 of 20 (#13 Grandma, #19 Grandpa), down from 8 —
the Mom opener was made group-neutral at approval. Every prompt in the file
ends "___." (four prompts were missing their final period; fixed, and this
list matches packs.js exactly). Cut in this pass: "Mom said the laundry pile…", "We've only been driving
for ten minutes and Dad already wants…", "At Grandma and Grandpa's house, the
rule is always…", "Dad's famous pancakes…", plus the old #10/#18 above.

## Spotlight starters — 20 (most inviting first)

1. Something I have won...
2. An animal I have seen up close...
3. Something I have broken...
4. A place I have been...
5. Something I can make or cook...
6. Something I have tried once...
7. A food I have tasted...
8. Something I lost and then found...
9. Something funny that happened to me...
10. A skill I learned from family...
11. Something I have collected...
12. A holiday memory I have...
13. Something I made with my hands...
14. A race I have run… *(replaced at approval: was "A job I would like to try for one day..." — like the dream starter, nobody can catch it)*
15. Something I have helped fix...
16. A game I am hard to beat at... *(reworked from "A game I like to play...")*
17. A book or movie I have seen twice... *(reworked from "A book or movie I love...")*
18. A song I know all the words to...
19. A kind thing someone did for me... *(reworked from "Something kind I did for someone..." — invited boasting)*
20. Something I am good at...

All starters use the "…" character, matching the original starter pack style.
Removed from the model's list: "A place near home I like to go..." (nudged
kids to share where they live; answers can appear on TV), "A smell I really
like..." and "A dream I remember..." (nothing to catch — nobody can judge
them). The rest are experiences that could be true or false: won, seen,
broken, been, tried, lost, collected, fixed. Note for Part 3: only
`SPOTLIGHT_STARTERS[0]` is currently shown in the app; Part 3 will pick a
different starter per player from a stable value (player id).

## Art (muse-image-1.0) — approved by Lloyd, placement is Part 3

1. `content/outputs/art/emoji-decoder-card.webp` — emoji faces around a TV. Generic smiley faces; approved including this card.
2. `content/outputs/art/spotlight-card.webp` — a child telling a story on stage to a seated family audience.
3. `content/outputs/art/spectrum-card.webp` — family members behind a slider, beach left, snowy mountains right.
4. `content/outputs/art/finish-it-card.webp` — speech bubbles and a pencil around a TV.

All four inspected: no text or letters, no brands, no real people, all-ages.
Nothing displays pack-art yet, so the files change nothing until Part 3 puts
each card on its matching game card on /games (with alt text, no layout shift,
desktop and phone checked) — and nowhere else.

## Still weak — Lloyd's call

- Emoji #4/#5 answers are the give-away choice if a player reads slowly
  ("Cat Drinks Milk" among cat/milk fragments is very guessable). They're in
  the opening 5 deliberately as confidence-builders, but you may find them
  too easy.
- Spectrum #17 was replaced at approval (Make The Bed | Leave It Unmade);
  no known weak pair remains flagged, but the middle of the list (#11-#16)
  is less vivid than the opening.
- Finish It #18 was replaced at approval (the Wi-Fi password prompt is gone).
- Items 11–20 of Emoji/Spectrum/Finish It are spares under the 10-round cap;
  if you want them seen, the show length would have to change (not doing
  that without your say-so).
