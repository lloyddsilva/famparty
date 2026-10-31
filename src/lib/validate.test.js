import { test } from "node:test";
import assert from "node:assert/strict";
import { isCleanName, isCleanText } from "./validate.js";

test("names and free text reject blocked words", () => {
  assert.equal(isCleanText("a perfectly nice story"), true);
  assert.equal(isCleanText("this is shit"), false);
  assert.equal(isCleanName("Alex"), true);
  assert.equal(isCleanName(""), false);
});

test("LDNOOBW list is wired in, including phrases", () => {
  assert.equal(isCleanText("alabama hot pocket"), false);
  assert.equal(isCleanText("a perfectly ordinary sentence"), true);
});

test("final pass: innocent phrases, additions, and light normalisation", () => {
  for (const s of ["cock-a-doodle-doo", "pussy cat", "blue tit", "blue tits"]) {
    assert.equal(isCleanText(s), true, s);
  }
  for (const s of ["wanker", "arse", "fuuuck", "sh!t", "f*ck", "f-uck"]) {
    assert.equal(isCleanText(s), false, s);
  }
  // the four innocents survive normalisation too
  for (const s of ["I love grapes", "We hung new drapes", "My trapeze class", "I scraped my knee"]) {
    assert.equal(isCleanText(s), true, s);
  }
});

test("the word dick is intentionally allowed (it is also a name)", () => {
  assert.equal(isCleanName("Dick"), true);
});

test("word boundaries: innocent words containing blocked substrings pass", () => {
  for (const s of ["I love grapes", "We hung new drapes", "My trapeze class", "I scraped my knee"]) {
    assert.equal(isCleanText(s), true, s);
  }
  // …and the actual words still fail, including with punctuation.
  assert.equal(isCleanText("Well, shit."), false);
});

test("variants and compounds are blocked as whole words", () => {
  for (const s of ["fucking", "shitty", "bitches", "motherfucker", "shithead", "pornstar", "That was fucking brilliant",
                   "asshole", "cock", "slut", "fucked", "shits", "nazi", "retard", "rapist"]) {
    assert.equal(isCleanText(s), false, s);
  }
});
