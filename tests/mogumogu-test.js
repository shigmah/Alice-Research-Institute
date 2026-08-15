import { RandomManager } from "../src/core/RandomManager.js";
import { MogumoguJudge } from "../src/event/MogumoguJudge.js";
import { MogumoguChallenge } from "../src/event/MogumoguChallenge.js";

class FixedRandom extends RandomManager {
  constructor(values) {
    super();
    this.values = [...values];
  }

  rollDice() {
    const value = this.values.shift();
    if (value === undefined) throw new Error("no fixed dice value");
    return value;
  }

  nextDouble() {
    const value = this.values.shift();
    if (value === undefined) throw new Error("no fixed random value");
    return value;
  }
}

// 出目2: 偶数なので、もぐもぐ判定が先に行われる。
// 確率0なら食べない。その後2は成功回数+1。
{
  const random = new FixedRandom([2, 0.99]);
  const judge = new MogumoguJudge({
    randomManager: random,
    baseProbability: 0,
    hungerCorrection: () => 0
  });
  const challenge = new MogumoguChallenge({
    randomManager: random,
    judge
  });

  challenge.start();
  const result = challenge.executeStep();

  console.assert(result.finished === false, "challenge continues");
  console.assert(result.successCount === 1, "success count increments");
}

// 出目4: 偶数なので、もぐもぐ判定で食べたら出目判定へ進まず失敗。
{
  const random = new FixedRandom([4, 0]);
  const judge = new MogumoguJudge({
    randomManager: random,
    baseProbability: 1,
    hungerCorrection: () => 0
  });
  const challenge = new MogumoguChallenge({
    randomManager: random,
    judge
  });

  challenge.start();
  const result = challenge.executeStep();

  console.assert(result.finished === true, "challenge ends");
  console.assert(result.success === false, "mogumogu is failure");
  console.assert(result.reason === "mogumogu", "mogumogu reason");
}

// 奇数3ではもぐもぐ判定を実行せず、成功回数だけ増える。
{
  const random = new FixedRandom([3]);
  const judge = new MogumoguJudge({
    randomManager: random,
    baseProbability: 1
  });
  const challenge = new MogumoguChallenge({
    randomManager: random,
    judge
  });

  challenge.start();
  const result = challenge.executeStep();

  console.assert(result.finished === false, "odd success continues");
  console.assert(result.successCount === 1, "odd success count");
}

// 5成功で終了。
{
  const random = new FixedRandom([3, 3, 3, 3, 3]);
  const judge = new MogumoguJudge({
    randomManager: random,
    baseProbability: 0
  });
  const challenge = new MogumoguChallenge({
    randomManager: random,
    judge
  });

  challenge.start();
  let result;
  for (let i = 0; i < 5; i++) result = challenge.executeStep();

  console.assert(result.finished === true, "five successes finish");
  console.assert(result.success === true, "five successes succeed");
  console.assert(result.successCount === 5, "success count five");
}

console.log("Mogumogu tests: PASS");
