import test from "node:test";
import assert from "node:assert/strict";
import DiceProbabilityCalculator from "../src/core/DiceProbabilityCalculator.js";

const calculator = new DiceProbabilityCalculator();
const primeProbability2d6 = calculator.getPrimeSumProbability(2);
const nonPrimeProbability2d6 = 1 - primeProbability2d6;
const EPSILON = 1e-12;

// For 2d6, prime sums are 2, 3, 5, 7, and 11.
// Their frequencies are 1 + 2 + 4 + 6 + 2 = 15 of 36.
test("Two-dice transition probabilities are 5/12 to 3 dice and 7/12 to 1 die", () => {
  assert.ok(Math.abs(primeProbability2d6 - 15 / 36) < EPSILON);
  assert.ok(Math.abs(nonPrimeProbability2d6 - 21 / 36) < EPSILON);
});

test("A two-dice state is more likely to fall to one die than rise to three", () => {
  assert.ok(nonPrimeProbability2d6 > primeProbability2d6);
  assert.ok(Math.abs((nonPrimeProbability2d6 - primeProbability2d6) - 1 / 6) < EPSILON);
});

test("Expected number of consecutive low-count turns is finite", () => {
  // Let L2 be the expected remaining number of turns while at 2 dice,
  // and L1 while at 1 die. From 1 die the next state is always 2 dice.
  // L1 = 1 + L2
  // L2 = 1 + q * L1, where q = 7/12.
  // Therefore L2 = 19/5 = 3.8 and L1 = 24/5 = 4.8.
  const q = nonPrimeProbability2d6;
  const expectedFrom2 = (1 + q) / (1 - q);
  const expectedFrom1 = 1 + expectedFrom2;

  assert.ok(Math.abs(expectedFrom2 - 19 / 5) < EPSILON);
  assert.ok(Math.abs(expectedFrom1 - 24 / 5) < EPSILON);
});

console.log("P(2→3) =", primeProbability2d6);
console.log("P(2→1) =", nonPrimeProbability2d6);
console.log("Expected low-count run from 2 =", (1 + nonPrimeProbability2d6) / (1 - nonPrimeProbability2d6));
console.log("Expected low-count run from 1 =", 1 + (1 + nonPrimeProbability2d6) / (1 - nonPrimeProbability2d6));
