/**
 * Theoretical probability calculations for fair six-sided dice.
 *
 * This class is deliberately separate from RandomManager:
 * RandomManager generates actual rolls; this class calculates the
 * theoretical distribution used by NPC strategies.
 */
export class DiceProbabilityCalculator {
  getDiceSumDistribution(diceCount) {
    if (!Number.isInteger(diceCount) || diceCount < 1) {
      return new Map();
    }

    let distribution = new Map();
    for (let face = 1; face <= 6; face += 1) {
      distribution.set(face, 1 / 6);
    }

    for (let dice = 2; dice <= diceCount; dice += 1) {
      const nextDistribution = new Map();

      for (const [currentSum, currentProbability] of distribution) {
        for (let face = 1; face <= 6; face += 1) {
          const nextSum = currentSum + face;
          const probability = (nextDistribution.get(nextSum) ?? 0)
            + currentProbability / 6;
          nextDistribution.set(nextSum, probability);
        }
      }

      distribution = nextDistribution;
    }

    return distribution;
  }

  isPrime(value) {
    if (!Number.isInteger(value) || value < 2) return false;
    if (value === 2) return true;
    if (value % 2 === 0) return false;

    for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
      if (value % divisor === 0) return false;
    }

    return true;
  }

  getPrimeSumProbability(diceCount) {
    const distribution = this.getDiceSumDistribution(diceCount);
    let probability = 0;

    for (const [sum, value] of distribution) {
      if (this.isPrime(sum)) probability += value;
    }

    return probability;
  }

  getCatDefeatProbability(currentCatCount, diceCount) {
    if (!Number.isInteger(currentCatCount) || currentCatCount <= 0) {
      return currentCatCount === 0 ? 1 : 0;
    }
    if (!Number.isInteger(diceCount) || diceCount <= 0) return 0;

    const distribution = this.getDiceSumDistribution(diceCount);
    const defeatThreshold = currentCatCount * 2;
    let probability = 0;

    for (const [sum, value] of distribution) {
      if (this.isPrime(sum) && sum >= defeatThreshold) {
        probability += value;
      }
    }

    return probability;
  }

  getExpectedNextCatCount(currentCatCount, diceCount) {
    if (!Number.isInteger(currentCatCount) || currentCatCount < 0) {
      return 0;
    }
    if (!Number.isInteger(diceCount) || diceCount <= 0) return 0;

    if (diceCount === 1) {
      return currentCatCount + 3.5;
    }

    const distribution = this.getDiceSumDistribution(diceCount);
    let expectedCatCount = 0;

    for (const [sum, probability] of distribution) {
      const nextCatCount = this.isPrime(sum)
        ? Math.max(0, currentCatCount - Math.abs(sum - currentCatCount))
        : currentCatCount;

      expectedCatCount += probability * nextCatCount;
    }

    return expectedCatCount;
  }
}

export default DiceProbabilityCalculator;
