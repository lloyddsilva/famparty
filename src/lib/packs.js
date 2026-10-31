// Content packs: generated once offline (scripts/generate-content.mjs), human review required.
// `reviewed` must be true before the pack gate (scripts/check-packs.mjs) passes.

export const EMOJI_PACK = {
  id: "emoji-decoder-1", title: "Emoji Decoder — Starter Pack", reviewed: true,
  items: [
    { emoji: "🍕🎉", answer: "Pizza Party", choices: ["Pizza Party", "Movie Night", "Birthday Cake", "Picnic Day"] },
    { emoji: "🏠❤️👨‍👩‍👧", answer: "Family Home", choices: ["School Trip", "Family Home", "Summer Camp", "Road Trip"] },
    { emoji: "🌧️☂️", answer: "Rainy Day", choices: ["Beach Day", "Snow Day", "Rainy Day", "Windy Night"] },
    { emoji: "🎂🕯️🎈", answer: "Birthday Party", choices: ["Wedding Day", "Birthday Party", "Graduation", "New Year"] },
    { emoji: "🚗🗺️🎶", answer: "Road Trip", choices: ["Train Ride", "Boat Trip", "Road Trip", "Bike Race"] },
    { emoji: "🍿🎬🌙", answer: "Movie Night", choices: ["Game Night", "Movie Night", "Story Time", "Dance Party"] },
    { emoji: "⚽🏆🥇", answer: "Winning the Game", choices: ["Winning the Game", "Scoring a Test", "Running Late", "Team Meeting"] },
    { emoji: "🏖️🍦☀️", answer: "Summer Vacation", choices: ["Winter Holiday", "First Day of School", "Summer Vacation", "Camping Trip"] },
    { emoji: "🐶🛁🫧", answer: "Bath Time for the Dog", choices: ["Walking the Dog", "Feeding the Cat", "Bath Time for the Dog", "Vet Visit"] },
    { emoji: "📚🌙😴", answer: "Bedtime Story", choices: ["Morning News", "Bedtime Story", "Homework Time", "Lullaby Concert"] },
  ],
};

export const SPECTRUM_PACK = {
  id: "spectrum-1", title: "Spectrum — Starter Pack", reviewed: true,
  items: [
    { left: "Cook at home", right: "Order takeaway" },
    { left: "Beach holiday", right: "Mountain holiday" },
    { left: "Early bird", right: "Night owl" },
    { left: "Cats", right: "Dogs" },
    { left: "Plan everything", right: "Wing it" },
    { left: "Sweet", right: "Savoury" },
    { left: "City break", right: "Countryside escape" },
    { left: "Board games", right: "Video games" },
    { left: "Summer", right: "Winter" },
    { left: "Tea", right: "Coffee" },
  ],
};

export const FINISHIT_PACK = {
  id: "finish-it-1", title: "Finish It — Starter Pack", reviewed: true,
  items: [
    "The secret to surviving a long family road trip is ___",
    "Grandma's real superpower is ___",
    "The house rule nobody admits to breaking is ___",
    "If our family had a motto, it would be ___",
    "The best thing to find in the fridge at midnight is ___",
    "Never challenge Grandpa to ___",
    "The group chat is mostly just ___",
    "Every family reunion needs more ___",
    "The Wi-Fi password should honestly be ___",
    "The trophy for family game night should be ___",
  ],
};

export const ALL_PACKS = [EMOJI_PACK, SPECTRUM_PACK, FINISHIT_PACK];
