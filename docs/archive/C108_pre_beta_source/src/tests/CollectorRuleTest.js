// ========================================
// CollectorRule Test
// ========================================

export function testCollectorRule({
    gameState,
    catManager,
    collectionManager,
    collectorRule
}) {

    console.log("========================================");
    console.log("COLLECTOR RULE TEST");
    console.log("========================================");


    // ====================================================
    // TEST 1 : CONTINUE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 1 : COLLECTOR CONTINUE");
    console.log("----------------------------------------");

    catManager.clear();

    // 勝利条件未達の白猫1匹
    catManager.createCat(
        "white",
        Infinity,
        gameState.getTurn()
    );

    const continueResult =
        collectorRule.checkResult();

    console.log(
        "CollectorRule result:",
        continueResult
    );


    // ====================================================
    // TEST 2 : DEFEAT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 2 : COLLECTOR DEFEAT");
    console.log("----------------------------------------");

    catManager.clear();

    const defeatResult =
        collectorRule.checkResult();

    console.log(
        "CollectorRule result:",
        defeatResult
    );


    // ====================================================
    // TEST 3 : VICTORY
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 3 : COLLECTOR VICTORY");
    console.log("----------------------------------------");

    catManager.clear();

    // ----------------------------------------
    // 白猫10匹
    // ----------------------------------------

    for (let i = 0; i < 10; i++) {

        catManager.createCat(
            "white",
            Infinity,
            gameState.getTurn()
        );
    }

    // ----------------------------------------
    // 黒猫10匹
    // ----------------------------------------

    for (let i = 0; i < 10; i++) {

        catManager.createCat(
            "black",
            Infinity,
            gameState.getTurn()
        );
    }

    // ----------------------------------------
    // 金猫10匹
    // ----------------------------------------

    for (let i = 0; i < 10; i++) {

        catManager.createCat(
            "gold",
            Infinity,
            gameState.getTurn()
        );
    }

    const victoryResult =
        collectorRule.checkResult();

    console.log(
        "CollectorRule result:",
        victoryResult
    );

    // ====================================================
    // TEST 4 : COLLECTOR isFinished - CONTINUE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 4 : COLLECTOR isFinished - CONTINUE");
    console.log("----------------------------------------");

    catManager.clear();

    catManager.createCat(
        "white",
        Infinity,
        gameState.getTurn()
    );

    const test4Finished =
        collectorRule.isFinished();

    console.log(
        "CollectorRule isFinished:",
        test4Finished
    );


    // ====================================================
    // TEST 5 : COLLECTOR isFinished - DEFEAT
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 5 : COLLECTOR isFinished - DEFEAT");
    console.log("----------------------------------------");

    catManager.clear();

    const test5Finished =
        collectorRule.isFinished();

    console.log(
        "CollectorRule isFinished:",
        test5Finished
    );


    // ====================================================
    // TEST 6 : COLLECTOR isFinished - VICTORY
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 6 : COLLECTOR isFinished - VICTORY");
    console.log("----------------------------------------");

    catManager.clear();


    // ----------------------------------------
    // 白猫10匹
    // ----------------------------------------

    for (let i = 0; i < 10; i++) {

        catManager.createCat(
            "white",
            Infinity,
            gameState.getTurn()
        );
    }


    // ----------------------------------------
    // 黒猫10匹
    // ----------------------------------------

    for (let i = 0; i < 10; i++) {

        catManager.createCat(
            "black",
            Infinity,
            gameState.getTurn()
        );
    }


    // ----------------------------------------
    // 金猫10匹
    // ----------------------------------------

    for (let i = 0; i < 10; i++) {

        catManager.createCat(
            "gold",
            Infinity,
            gameState.getTurn()
        );
    }

    const test6Finished =
        collectorRule.isFinished();

    console.log(
        "CollectorRule isFinished:",
        test6Finished
    );

    // ====================================================
    // TEST 7 : COLLECTOR EXECUTE TURN
    // ====================================================

    console.log(
        "----------------------------------------"
    );

    console.log(
        "TEST 7 : COLLECTOR EXECUTE TURN"
    );

    console.log(
        "----------------------------------------"
    );

    // ----------------------------------------
    // テスト状態を準備
    // ----------------------------------------

    catManager.clear();
    collectionManager.clear();

    gameState.setDiceResults([2, 3]);
    gameState.setDiceTotal(5);
    gameState.setDiceCount(2);

    // ----------------------------------------
    // Execute Turn
    // ----------------------------------------

    const test7BeforeCatCount =
        catManager.getCats().length;

    console.log(
        "Before cat count:",
        test7BeforeCatCount
    );

    const test7TurnResult =
        collectorRule.executeTurn();

    // ----------------------------------------
    // 結果取得
    // ----------------------------------------

    const test7Cats =
        catManager.getCats();

    const test7AfterCatCount =
        test7Cats.length;

    console.log(
        "After cat count:",
        test7AfterCatCount
    );

    console.log(
        "Generated cats:",
        test7Cats
    );

    console.log(
        "ExecuteTurn result:",
        test7TurnResult
    );

    // ----------------------------------------
    // Collection 登録確認
    // ----------------------------------------

    let test7AllCollected = true;

    for (const cat of test7Cats) {

        const collected =
            collectionManager.contains(cat.id);

        console.log(
            "Collection contains cat:",
            cat.id,
            collected
        );

        if (!collected) {
            test7AllCollected = false;
        }
    }

    // ----------------------------------------
    // TEST 7 判定
    // ----------------------------------------

    const test7Passed =
        test7BeforeCatCount === 0 &&
        test7AfterCatCount === 5 &&
        test7Cats.every(
            cat => cat.color === "white"
        ) &&
        test7AllCollected &&
        test7TurnResult === "CONTINUE";

    console.log(
        "CollectorRule TEST 7:",
        test7Passed
            ? "PASS"
            : "FAIL"
    );
    
    // ====================================================
    // TEST 8 : COLLECTOR + ALICE INTEGRATION
    // ====================================================

    console.log(
        "----------------------------------------"
    );

    console.log(
        "TEST 8 : COLLECTOR + ALICE INTEGRATION"
    );

    console.log(
        "----------------------------------------"
    );

    // ----------------------------------------
    // テスト状態を準備
    // ----------------------------------------

    catManager.clear();
    collectionManager.clear();

    gameState.setDiceResults([2, 3]);
    gameState.setDiceTotal(5);
    gameState.setDiceCount(2);

    // ----------------------------------------
    // 寿命切れ猫
    // ----------------------------------------

    const expiredCat =
        catManager.createCat(
            "white",
            0,
            gameState.getTurn() - 1
        );

    // ----------------------------------------
    // 生存猫
    // ----------------------------------------

    const aliveCat =
        catManager.createCat(
            "white",
            Infinity,
            gameState.getTurn() - 1
        );

    const test8BeforeCatCount =
        catManager.getCats().length;

    console.log(
        "Before cat count:",
        test8BeforeCatCount
    );

    console.log(
        "Expired cat id:",
        expiredCat.id
    );

    console.log(
        "Alive cat id:",
        aliveCat.id
    );

    // ----------------------------------------
    // Execute Turn
    // ----------------------------------------

    const test8TurnResult =
        collectorRule.executeTurn();

    // ----------------------------------------
    // 結果取得
    // ----------------------------------------

    const test8Cats =
        catManager.getCats();

    const test8AfterCatCount =
        test8Cats.length;

    console.log(
        "After cat count:",
        test8AfterCatCount
    );

    console.log(
        "Remaining cats:",
        test8Cats
    );

    console.log(
        "ExecuteTurn result:",
        test8TurnResult
    );

    // ----------------------------------------
    // 寿命切れ猫が削除されたことを確認
    // ----------------------------------------

    const test8ExpiredRemoved =
        !test8Cats.some(
            cat => cat.id === expiredCat.id
        );

    console.log(
        "Expired cat removed:",
        test8ExpiredRemoved
    );

    // ----------------------------------------
    // 生存猫が残っていることを確認
    // ----------------------------------------

    const test8AliveRemaining =
        test8Cats.some(
            cat => cat.id === aliveCat.id
        );

    console.log(
        "Alive cat remaining:",
        test8AliveRemaining
    );

    // ----------------------------------------
    // Collection 登録確認
    // ----------------------------------------

    let test8AllCollected = true;

    for (const cat of test8Cats) {

        const collected =
            collectionManager.contains(cat.id);

        console.log(
            "Collection contains cat:",
            cat.id,
            collected
        );

        if (!collected) {
            test8AllCollected = false;
        }
    }

    // ----------------------------------------
    // TEST 8 判定
    // ----------------------------------------

    const test8Passed =
        test8BeforeCatCount === 2 &&
        test8ExpiredRemoved &&
        test8AliveRemaining &&
        test8AfterCatCount === 6 &&
        test8AllCollected &&
        test8TurnResult === "CONTINUE";

    console.log(
        "CollectorRule TEST 8:",
        test8Passed
            ? "PASS"
            : "FAIL"
    );

    // ====================================================
    // TEST RESULT
    // ====================================================

    const test1Passed =
        continueResult === "CONTINUE";

    const test2Passed =
        defeatResult === "DEFEAT";

    const test3Passed =
        victoryResult === "VICTORY";

    const test4Passed =
        test4Finished === false;

    const test5Passed =
        test5Finished === true;

    const test6Passed =
        test6Finished === true;


    console.log("----------------------------------------");

    console.log(
        "CollectorRule TEST 1:",
        test1Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectorRule TEST 2:",
        test2Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectorRule TEST 3:",
        test3Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectorRule TEST 4:",
        test4Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectorRule TEST 5:",
        test5Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectorRule TEST 6:",
        test6Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectorRule TEST 7:",
        test7Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectorRule TEST 8:",
        test8Passed ? "PASS" : "FAIL"
    );

    console.log("----------------------------------------");


    return {

        test1Passed,
        test2Passed,
        test3Passed,
        test4Passed,
        test5Passed,
        test6Passed,
        test7Passed,

        continueResult,
        defeatResult,
        victoryResult,

        test4Finished,
        test5Finished,
        test6Finished,

        passed:
            test1Passed &&
            test2Passed &&
            test3Passed &&
            test4Passed &&
            test5Passed &&
            test6Passed &&
            test7Passed &&
            test8Passed
    };
}