export class ClassicRule {
  /**
   * クラシックモードの出目→ゲーム効果を担当するルール。
   * Dice / RollResult / Cat生成そのものとは分離する。
   */
  resolve(rollResult) {
    const generatedCats = rollResult.values.filter(value =>
      [2, 3, 5].includes(value)
    ).length;

    return {
      generatedCats,
      successValues: [2, 3, 5],
      failedValues: [1, 4, 6]
    };
  }
}
