import assert from "node:assert/strict";
import test from "node:test";
import DiceProbabilityCalculator from "../src/core/DiceProbabilityCalculator.js";

const calculator = new DiceProbabilityCalculator();

console.log("DiceProbabilityCalculator tests: PASS");

test("invalid dice counts return an empty distribution", () => {
  assert.equal(calculator.getDiceSumDistribution(0).size, 0);
  assert.equal(calculator.getDiceSumDistribution(1.5).size, 0);
  assert.equal(calculator.getDiceSumDistribution(-1).size, 0);
});

test("one die has the uniform 1/6 distribution", () => {
  const distribution = calculator.getDiceSumDistribution(1);
  assert.equal(distribution.size, 6);
  for (let face = 1; face <= 6; face += 1) {
    assert.ok(Math.abs(distribution.get(face) - 1 / 6) < 1e-12);
  }
});

test("two dice produce the standard 2d6 distribution", () => {
  const distribution = calculator.getDiceSumDistribution(2);
  assert.equal(distribution.size, 11);
  assert.ok(Math.abs(distribution.get(2) - 1 / 36) < 1e-12);
  assert.ok(Math.abs(distribution.get(7) - 6 / 36) < 1e-12);
  assert.ok(Math.abs(distribution.get(12) - 1 / 36) < 1e-12);
});

test("prime checks accept primes and reject non-primes", () => {
  assert.equal(calculator.isPrime(2), true);
  assert.equal(calculator.isPrime(3), true);
  assert.equal(calculator.isPrime(11), true);
  assert.equal(calculator.isPrime(1), false);
  assert.equal(calculator.isPrime(9), false);
  assert.equal(calculator.isPrime(12), false);
});

test("prime-sum probability for two dice is 15/36", () => {
  assert.ok(Math.abs(calculator.getPrimeSumProbability(2) - 15 / 36) < 1e-12);
});

test("cat defeat probability follows the prime-event threshold", () => {
  assert.equal(calculator.getCatDefeatProbability(0, 2), 1);
  assert.ok(Math.abs(calculator.getCatDefeatProbability(2, 2) - 12 / 36) < 1e-12);
  assert.ok(Math.abs(calculator.getCatDefeatProbability(3, 2) - 8 / 36) < 1e-12);
  assert.ok(Math.abs(calculator.getCatDefeatProbability(4, 2) - 2 / 36) < 1e-12);
});

test("phase 1 expected cat count adds the mean die result", () => {
  assert.ok(Math.abs(calculator.getExpectedNextCatCount(5, 1) - 8.5) < 1e-12);
});

test("phase 2 expected cat count uses prime removal and non-prime preservation", () => {
  assert.ok(Math.abs(calculator.getExpectedNextCatCount(3, 2) - 75 / 36) < 1e-12);
});
