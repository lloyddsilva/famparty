// Content packs: generated once offline (scripts/generate-content.mjs), human review required.
// STATUS: the items below started as Muse Spark 1.3 / Muse Image 1.0 output
// (raw outputs, unchanged, in content/outputs/), but many items have since been
// edited, rewritten, replaced, reordered or cut by Muse in OpenCode at
// Lloyd's direction during his review rounds. It is NOT accurate to describe
// everything below as verbatim model text, and NOT accurate to describe it as
// hand-written starter content. content/REVIEW.md lists the final version of
// every item in play order and shows the old text for every changed item.
// REVIEWED: Lloyd approved these packs ("Packs approved", with his edits
// applied first) and `reviewed` was flipped to true as his recorded decision.
// Content provenance, accurately: generated offline with Muse Spark 1.3 and
// Muse Image 1.0, then edited with Muse in OpenCode, and reviewed by Lloyd.
// It is not verbatim model output, and it was not tested with real people.
// Art (muse-image-1.0) stays in content/outputs/art/ until Part 3 places the
// approved cards in public/pack-art/.
//
// Edit history (everything not listed here is verbatim raw model text):
//  Build: emoji choices reordered so the answer is not always first; Finish It
//    and Spotlight preambles/numbering/category headings removed; Spectrum
//    LEFT | RIGHT lines mapped to {left, right}.
//  Part 2 (Lloyd's flags): Emoji laundry/cat/snowman wrong answers replaced;
//    Christmas and Halloween rounds replaced (picnic, fetch); Spectrum pet
//    pairs made single-axis.
//  This round (Lloyd's quality pass, all edits by Muse in OpenCode at his
//    direction): every pack reordered on purpose (the engine plays items in
//    order and defaults to 5 rounds, so items 1-5 are the opening). Emoji:
//    Hot Apple Pie round removed; Sunny/Birthday/Back To School/Pizza Movie
//    Night/Turn Off The Lights/Stormy rounds rewritten so the answer is the
//    obvious reading of all emoji and each wrong answer fits part of the clue
//    (the model's Stormy round, "Stormy Night In", was removed outright, not
//    rewritten); the first three Emoji clues reuse or remix starter-pack clues;
//    Part 2's unlinkable wrong answers (laundry, picnic, fetch, cat) reworked
//    to fit part of the clue. Spectrum: labels rewritten in plain spoken style
//    (1-4 words a side), clusters broken up (one celebration, one weather,
//    one pet-species pair), two-axis pairs reduced to one axis. Finish It:
//    role-dependent prompts cut from 8 to 3, sincere/awkward prompts
//    rewritten, strongest prompts moved first. Spotlight: starters that nudge
//    location-sharing, unjudgeable tastes, or boasting replaced/reworked;
//    most inviting starters moved first.

export const EMOJI_PACK = {
  id: "emoji-decoder-1", title: "Emoji Decoder — Pack 1", reviewed: true,
  items: [
    { emoji: "🍕🎉", answer: "Pizza Party", choices: ["Pizza Party", "Birthday Cake", "Cheese Pizza", "Taco Party"] },
    { emoji: "🏖️🍦☀️", answer: "Day At The Beach", choices: ["Ice Cream Sundae", "Swimming Pool", "Day At The Beach", "Sunny Garden"] },
    { emoji: "🎂🕯️🎉", answer: "Birthday Party", choices: ["Wedding Cake", "Birthday Party", "Candle Light", "Party Games Night"] },
    { emoji: "🐱🥛", answer: "Cat Drinks Milk", choices: ["Afternoon Cat Nap", "Glass Of Milk", "Cat And Mouse", "Cat Drinks Milk"] },
    { emoji: "🧺🌳🍎", answer: "Picnic In The Park", choices: ["Apple Pie", "Climbing Trees In Summer", "Picnic In The Park", "Fresh Apples"] },
    { emoji: "🧺👕🧦", answer: "Do The Laundry", choices: ["Laundry Basket", "Do The Laundry", "T-Shirt", "Warm Socks"] },
    { emoji: "🎒📚🚌", answer: "Back To School", choices: ["Bus Ride", "Book Club", "New School Backpack", "Back To School"] },
    { emoji: "💡🔌💤", answer: "Lights Out", choices: ["Lights Out", "Light Bulb", "Plug It In", "Sleep Tight"] },
    { emoji: "🎬🍿🛋️", answer: "Movie Night", choices: ["Popcorn Snack", "Movie Night", "Couch Nap", "Film Set"] },
    { emoji: "❄️☃️🧤", answer: "Build A Snowman", choices: ["Build A Snowman", "Shovel The Driveway", "Catch A Snowflake", "Drink Hot Cocoa"] },
    { emoji: "🐶🎾🦴", answer: "Dog Playing Fetch", choices: ["Tennis Match Final", "Puppy Dog", "Dog Playing Fetch", "Rubber Bone"] },
    { emoji: "🍳🥓🍞", answer: "Cooked Breakfast", choices: ["Fried Egg", "Toast And Butter", "Bacon Sandwich", "Cooked Breakfast"] },
  ],
};

export const SPOTLIGHT_PACK = {
  id: "spotlight-starters-1", title: "Spotlight Starters — Pack 1", reviewed: true,
  items: [
    "Something I have won…",
    "An animal I have seen up close…",
    "Something I have broken…",
    "A place I have been…",
    "Something I can make or cook…",
    "Something I have tried once…",
    "A food I have tasted…",
    "Something I lost and then found…",
    "Something funny that happened to me…",
    "A skill I learned from family…",
    "Something I have collected…",
    "A vacation memory I have…",
    "Something I made with my hands…",
    "A race I have run…",
    "Something I have helped fix…",
    "A game I am hard to beat at…",
    "A book or movie I have seen twice…",
    "A song I know all the words to…",
    "A kind thing someone did for me…",
    "Something I am good at…",
  ],
};

export const SPECTRUM_PACK = {
  id: "spectrum-1", title: "Spectrum — Pack 1", reviewed: true,
  items: [
    { left: "Early Bird", right: "Night Owl" },
    { left: "Sweet", right: "Salty" },
    { left: "Beach Vacation", right: "Mountain Vacation" },
    { left: "Plan Ahead", right: "Wing It" },
    { left: "Cook At Home", right: "Eat Out" },
    { left: "Open Gifts Slowly", right: "Tear Them Open" },
    { left: "Sunny Day", right: "Rainy Day" },
    { left: "City Trip", right: "Country Escape" },
    { left: "Dogs", right: "Cats" },
    { left: "Board Games", right: "Video Games" },
    { left: "Crunchy Peanut Butter", right: "Smooth Peanut Butter" },
    { left: "Stay In", right: "Go Out" },
    { left: "Camping", right: "Hotel Stay" },
    { left: "Coloring In", right: "Playing Tag" },
    { left: "On My Own", right: "With A Team" },
    { left: "Watch Together", right: "Watch Alone" },
    { left: "Make The Bed", right: "Leave It Unmade" },
    { left: "Thank-You Note", right: "Thank-You Call" },
    { left: "Thin Pancakes", right: "Thick Pancakes" },
    { left: "Dinner Outside", right: "Dinner Inside" },
  ],
};

export const FINISHIT_PACK = {
  id: "finish-it-1", title: "Finish It — Pack 1", reviewed: true,
  items: [
    "The group chat went completely silent after someone sent a photo of ___.",
    "The winner of game night gets to keep ___ for a whole week.",
    "We knew we were lost when we saw a sign for ___.",
    "The fridge at midnight is the perfect place to find ___.",
    "The couch cushions are hiding ___ again.",
    "Our dog barked all night because he saw ___.",
    "The mysterious noise in the attic turned out to be ___.",
    "Game night got really loud as soon as we started playing with ___.",
    "We had to pause the game because everyone was laughing at ___.",
    "The group chat in one emoji: ___.",
    "My autocorrect changed \"I love you\" to ___.",
    "The only road trip snack left in the car was ___.",
    "Grandma always keeps ___ in her purse just in case.",
    "The secret ingredient in the famous cookies is ___.",
    "If this group had a motto, it would be ___.",
    "Never challenge the reigning champion to ___.",
    "The house rule nobody admits to breaking is ___.",
    "The best excuse for being late is ___.",
    "Grandpa's secret to staying young is ___.",
    "For my birthday dinner, I really want ___ instead of cake.",
  ],
};

export const ALL_PACKS = [EMOJI_PACK, SPOTLIGHT_PACK, SPECTRUM_PACK, FINISHIT_PACK];
