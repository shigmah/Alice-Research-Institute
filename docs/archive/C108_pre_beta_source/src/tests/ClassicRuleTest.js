// ========================================
// ClassicRule Test
// ========================================

export function testClassicRule({
    gameState,
    catManager,
    classicRule
}) {

    console.log("========================================");
    console.log("CLASSIC RULE TEST");
    console.log("========================================");


    // ====================================================
    // TEST 1 : CONTINUE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 1 : CLASSIC CONTINUE");
    console.log("----------------------------------------");

    catManager.clear();

    catManager.createCat(
        "white",
        Infinity,
        gameState.getTurn()
    );

    const continueResult =
        classicRule.isFinished()
            ? "DEFEAT"
            : "CONTINUE";

    console.log(
        "ClassicRule result:",
        continueResult
    );


    // ====================================================
    // TEST 2 : DEFEAT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 2 : CLASSIC DEFEAT");
    console.log("----------------------------------------");

    catManager.clear();

    const defeatResult =
        classicRule.isFinished()
            ? "DEFEAT"
            : "CONTINUE";

    console.log(
        "ClassicRule result:",
        defeatResult
    );


 // ====================================================
// TEST 3 : EXECUTE TURN - PHASE 1
// ====================================================

console.log("----------------------------------------");
console.log("TEST 3 : CLASSIC EXECUTE TURN - PHASE 1");
console.log("----------------------------------------");

catManager.clear();

// Phase 1
gameState.setCurrentDiceCount(1);

// RandomManagerはClassicRuleが保持しているものを使用
const randomManager =
    classicRule.randomManager;

randomManager.setSeed(1);

const beforeCatCount =
    catManager.getCats().length;

const turnResult =
    classicRule.executeTurn();

const afterCatCount =
    catManager.getCats().length;

const currentDiceCount =
    gameState.getCurrentDiceCount();

console.log(
    "Before cat count:",
    beforeCatCount
);

console.log(
    "After cat count:",
    afterCatCount
);

console.log(
    "Dice results:",
    gameState.getDiceResults()
);

console.log(
    "Current dice count:",
    currentDiceCount
);

console.log(
    "ExecuteTurn result:",
    turnResult
);


// ====================================================
// TEST 4 : EXECUTE TURN - PHASE 2 PRIME
// ====================================================

console.log("----------------------------------------");
console.log("TEST 4 : CLASSIC EXECUTE TURN - PHASE 2 PRIME");
console.log("----------------------------------------");

// ----------------------------------------
// テスト状態を準備
// ----------------------------------------

catManager.clear();

gameState.setCurrentDiceCount(2);

// ClassicRuleが保持しているRandomManagerを使用
classicRule.randomManager.setSeed(2);

// ----------------------------------------
// 猫を4匹用意
// ----------------------------------------

for (let i = 0; i < 4; i++) {

    catManager.createCat(
        "white",
        Infinity,
        gameState.getTurn()
    );
}

const test4BeforeCatCount =
    catManager.getCats().length;

console.log(
    "Before cat count:",
    test4BeforeCatCount
);

// ----------------------------------------
// Execute Turn
// ----------------------------------------

const test4TurnResult =
    classicRule.executeTurn();

// ----------------------------------------
// 結果取得
// ----------------------------------------

const test4DiceResults =
    gameState.getDiceResults();

const test4DiceTotal =
    gameState.getDiceTotal();

const test4AfterCatCount =
    catManager.getCats().length;

const test4CurrentDiceCount =
    gameState.getCurrentDiceCount();

console.log(
    "Dice results:",
    test4DiceResults
);

console.log(
    "Dice total:",
    test4DiceTotal
);

console.log(
    "After cat count:",
    test4AfterCatCount
);

console.log(
    "Current dice count:",
    test4CurrentDiceCount
);

console.log(
    "ExecuteTurn result:",
    test4TurnResult
);

// ----------------------------------------
// TEST 4 判定
// ----------------------------------------

const test4Passed =
    test4BeforeCatCount === 4 &&
    test4DiceResults.length === 2 &&
    test4DiceResults[0] === 5 &&
    test4DiceResults[1] === 2 &&
    test4DiceTotal === 7 &&
    test4AfterCatCount === 1 &&
    test4TurnResult === "CONTINUE";

console.log(
    "ClassicRule TEST 4:",
    test4Passed ? "PASS" : "FAIL"
);


// ====================================================
// TEST RESULT
// ====================================================

const test1Passed =
    continueResult === "CONTINUE";

const test2Passed =
    defeatResult === "DEFEAT";

console.log("----------------------------------------");

console.log(
    "ClassicRule TEST 1:",
    test1Passed ? "PASS" : "FAIL"
);

console.log(
    "ClassicRule TEST 2:",
    test2Passed ? "PASS" : "FAIL"
);

console.log(
    "ClassicRule TEST 4:",
    test4Passed ? "PASS" : "FAIL"
);

console.log("----------------------------------------");


// ====================================================
// TEST 5 : CLASSIC EXECUTE TURN - PHASE 2 NON-PRIME
// ====================================================

console.log(
    "----------------------------------------"
);

console.log(
    "TEST 5 : CLASSIC EXECUTE TURN - PHASE 2 NON-PRIME"
);

console.log(
    "----------------------------------------"
);


// ----------------------------------------
// テスト状態を準備
// ----------------------------------------

catManager.clear();

gameState.setCurrentDiceCount(2);

// Seed 3 → [5, 1] → 合計 6
randomManager.setSeed(3);


// ----------------------------------------
// 猫を4匹用意
// ----------------------------------------

for (let i = 0; i < 4; i++) {

    catManager.createCat(
        "white",
        Infinity,
        gameState.getTurn()
    );
}


const test5BeforeCatCount =
    catManager.getCats().length;

console.log(
    "Before cat count:",
    test5BeforeCatCount
);


// ----------------------------------------
// Execute Turn
// ----------------------------------------

const test5TurnResult =
    classicRule.executeTurn();


// ----------------------------------------
// 結果取得
// ----------------------------------------

const test5DiceResults =
    gameState.getDiceResults();

const test5DiceTotal =
    gameState.getDiceTotal();

const test5AfterCatCount =
    catManager.getCats().length;

const test5CurrentDiceCount =
    gameState.getCurrentDiceCount();


console.log(
    "Dice results:",
    test5DiceResults
);

console.log(
    "Dice total:",
    test5DiceTotal
);

console.log(
    "After cat count:",
    test5AfterCatCount
);

console.log(
    "Current dice count:",
    test5CurrentDiceCount
);

console.log(
    "ExecuteTurn result:",
    test5TurnResult
);


// ----------------------------------------
// TEST 5 判定
// ----------------------------------------

const test5Passed =
    test5BeforeCatCount === 4 &&
    test5DiceResults.length === 2 &&
    test5DiceResults[0] === 5 &&
    test5DiceResults[1] === 1 &&
    test5DiceTotal === 6 &&
    test5AfterCatCount === 4 &&
    test5CurrentDiceCount === 1 &&
    test5TurnResult === "CONTINUE";


console.log(
    "ClassicRule TEST 5:",
    test5Passed
        ? "PASS"
        : "FAIL"
);

// ====================================================
// TEST 6 : CLASSIC EXECUTE TURN - PHASE 2 DEFEAT
// ====================================================

console.log(
    "----------------------------------------"
);

console.log(
    "TEST 6 : CLASSIC EXECUTE TURN - PHASE 2 DEFEAT"
);

console.log(
    "----------------------------------------"
);


// ----------------------------------------
// テスト状態を準備
// ----------------------------------------

catManager.clear();

gameState.setCurrentDiceCount(2);

// Seed 2 → [5, 2] → 合計 7（素数）
randomManager.setSeed(2);


// ----------------------------------------
// 猫を1匹用意
// ----------------------------------------

catManager.createCat(
    "white",
    Infinity,
    gameState.getTurn()
);

const test6BeforeCatCount =
    catManager.getCats().length;

console.log(
    "Before cat count:",
    test6BeforeCatCount
);


// ----------------------------------------
// Execute Turn
// ----------------------------------------

const test6TurnResult =
    classicRule.executeTurn();


// ----------------------------------------
// 結果取得
// ----------------------------------------

const test6DiceResults =
    gameState.getDiceResults();

const test6DiceTotal =
    gameState.getDiceTotal();

const test6AfterCatCount =
    catManager.getCats().length;

const test6CurrentDiceCount =
    gameState.getCurrentDiceCount();


console.log(
    "Dice results:",
    test6DiceResults
);

console.log(
    "Dice total:",
    test6DiceTotal
);

console.log(
    "After cat count:",
    test6AfterCatCount
);

console.log(
    "Current dice count:",
    test6CurrentDiceCount
);

console.log(
    "ExecuteTurn result:",
    test6TurnResult
);


// ----------------------------------------
// TEST 6 判定
// ----------------------------------------

const test6Passed =
    test6BeforeCatCount === 1 &&
    test6DiceResults.length === 2 &&
    test6DiceResults[0] === 5 &&
    test6DiceResults[1] === 2 &&
    test6DiceTotal === 7 &&
    test6AfterCatCount === 0 &&
    test6TurnResult === "DEFEAT";


console.log(
    "ClassicRule TEST 6:",
    test6Passed
        ? "PASS"
        : "FAIL"
);

// ====================================================
// TEST 7 : CLASSIC CHECK RESULT
// ====================================================

console.log(
    "----------------------------------------"
);

console.log(
    "TEST 7 : CLASSIC CHECK RESULT"
);

console.log(
    "----------------------------------------"
);


// ----------------------------------------
// TEST 7-1 : SUCCESS
// ----------------------------------------

gameState.setDiceResults(
    [2, 3, 5]
);

const test7SuccessResult =
    classicRule.checkResult();

console.log(
    "TEST 7-1 result:",
    test7SuccessResult
);


// ----------------------------------------
// TEST 7-2 : FAILURE
// ----------------------------------------

gameState.setDiceResults(
    [2, 4]
);

const test7FailureResult =
    classicRule.checkResult();

console.log(
    "TEST 7-2 result:",
    test7FailureResult
);


// ----------------------------------------
// TEST 7 判定
// ----------------------------------------

const test7Passed =
    test7SuccessResult === true &&
    test7FailureResult === false;

console.log(
    "ClassicRule TEST 7:",
    test7Passed
        ? "PASS"
        : "FAIL"
);

// ====================================================
// TEST 8 : CLASSIC + ALICE INTEGRATION
// ====================================================

console.log(
    "----------------------------------------"
);

console.log(
    "TEST 8 : CLASSIC + ALICE INTEGRATION"
);

console.log(
    "----------------------------------------"
);


// ----------------------------------------
// テスト状態を準備
// ----------------------------------------

catManager.clear();

gameState.setCurrentDiceCount(2);

randomManager.setSeed(2);


// ----------------------------------------
// 寿命1の猫を1匹
// 無限寿命の猫を1匹
// ----------------------------------------

const currentTurn =
    gameState.getTurn();

catManager.createCat(
    "white",
    1,
    currentTurn - 1
);

catManager.createCat(
    "white",
    Infinity,
    currentTurn - 1
);


const test8BeforeCatCount =
    catManager.getCats().length;

console.log(
    "Before cat count:",
    test8BeforeCatCount
);


// ----------------------------------------
// Execute Turn
// ----------------------------------------

const test8TurnResult =
    classicRule.executeTurn();


// ----------------------------------------
// 結果取得
// ----------------------------------------

const test8AfterCatCount =
    catManager.getCats().length;

const test8DiceResults =
    gameState.getDiceResults();

const test8DiceTotal =
    gameState.getDiceTotal();

const test8CurrentDiceCount =
    gameState.getCurrentDiceCount();

console.log(
    "Dice results:",
    test8DiceResults
);

console.log(
    "Dice total:",
    test8DiceTotal
);

console.log(
    "After cat count:",
    test8AfterCatCount
);

console.log(
    "Current dice count:",
    test8CurrentDiceCount
);

console.log(
    "ExecuteTurn result:",
    test8TurnResult
);


// ----------------------------------------
// TEST 8 判定
// ----------------------------------------

const test8Passed =
    test8BeforeCatCount === 2 &&
    test8DiceResults.length === 2 &&
    test8DiceResults[0] === 5 &&
    test8DiceResults[1] === 2 &&
    test8DiceTotal === 7 &&
    test8AfterCatCount === 0 &&
    test8TurnResult === "DEFEAT";

console.log(
    "ClassicRule TEST 8:",
    test8Passed
        ? "PASS"
        : "FAIL"
);

return {

    test1Passed,
    test2Passed,
    test4Passed,
    test5Passed,
    test6Passed,
    test7Passed,
    test8Passed,

    turnResult,
    beforeCatCount,
    afterCatCount,

    diceResults:
        gameState.getDiceResults(),

    currentDiceCount,

    passed:
        test1Passed &&
        test2Passed &&
        test4Passed &&
        test5Passed &&
        test6Passed &&
        test7Passed &&
        test8Passed
};

}