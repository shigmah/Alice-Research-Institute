import { Dice } from "../models/Dice.js";
import { RollResult } from "../models/RollResult.js";
import { Cat } from "../models/Cat.js";
import { ClassicRule } from "../rules/ClassicRule.js";

export class ClassicMode {
  constructor({ dice = new Dice(), rule = new ClassicRule() } = {}) {
    this.dice = dice;
    this.rule = rule;
  }

  executeTurn(state) {
    const values = this.dice.rollMany(state.diceCount);
    const result = new RollResult(values);
    const outcome = this.rule.resolve(result);

    state.lastRolls = result.values;

    for (let i = 0; i < outcome.generatedCats; i++) {
      state.cats.push(new Cat({
        color: "white",
        lifetime: 3,
        createdAt: state.turn
      }));
    }

    return { result, outcome };
  }
}
