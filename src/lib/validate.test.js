import { test } from "node:test";
import assert from "node:assert/strict";
import { isCleanName, isCleanText } from "./validate.js";

test("names and free text reject blocked words", () => {
  assert.equal(isCleanText("a perfectly nice story"), true);
  assert.equal(isCleanText("this is shit"), false);
  assert.equal(isCleanName("Alex"), true);
  assert.equal(isCleanName(""), false);
});
