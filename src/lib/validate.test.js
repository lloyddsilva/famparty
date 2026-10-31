import { test } from "node:test";
import assert from "node:assert/strict";
import { isCleanName, isCleanText } from "./validate.js";

test("names and free text reject blocked words", () => {
  assert.equal(isCleanText("a perfectly nice story"), true);
  assert.equal(isCleanText("this is shit"), false);
  assert.equal(isCleanName("Alex"), true);
  assert.equal(isCleanName(""), false);
});

test("word boundaries: innocent words containing blocked substrings pass", () => {
  for (const s of ["I love grapes", "We hung new drapes", "My trapeze class", "I scraped my knee"]) {
    assert.equal(isCleanText(s), true, s);
  }
  // …and the actual words still fail, including with punctuation.
  assert.equal(isCleanText("Well, shit."), false);
});
