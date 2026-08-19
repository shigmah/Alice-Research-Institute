import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { CollectionManager } from "../manager/CollectionManager.js";
import { EventManager } from "../manager/EventManager.js";
import { TurnManager } from "../manager/TurnManager.js";
import { AliceModifier } from "../rule/AliceModifier.js";
import { CollectorRule } from "../rule/CollectorRule.js";


// ============================================================
// 共通テスト環境
// ============================================================

function createTestEnvironment() {

    const gameState = new GameState();

    const catManager =
        new CatManager(gameState);

    const collectionManager =
        new CollectionManager();

    const eventManager =
        new EventManager(gameState);

    const aliceModifier =
        new AliceModifier(
            gameState,
            catManager
        );

    const collectorRule =
        new CollectorRule(
            gameState,
            catManager,
            collectionManager,
            eventManager
        );

    collectorRule.addModifier(aliceModifier);

    collectorRule.initialize();

    const turnManager =
        new TurnManager(
            gameState,
            eventManager,
            collectorRule
        );

    return {
        gameState,
        catManager,
        collectionManager,
        eventManager,
        aliceModifier,
        collectorRule,
        turnManager
    };
}


// ============================================================
// TEST 1
// CollectorRule + TurnManager 初期化
// ============================================================

function testInitialization() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 1 : COLLECTOR + TURN MANAGER INITIALIZATION");
    console.log("========================================");

    const {
        gameState,
        catManager,
        collectionManager,
        eventManager,
        aliceModifier,
        collectorRule,
        turnManager
    } = createTestEnvironment();


    console.log(
        "GameState:",
        gameState
    );

    console.log(
        "CatManager:",
        catManager
    );

    console.log(
        "CollectionManager:",
        collectionManager
    );

    console.log(
        "EventManager:",
        eventManager
    );

    console.log(
        "AliceModifier:",
        aliceModifier
    );

    console.log(
        "CollectorRule:",
        collectorRule
    );

    console.log(
        "TurnManager:",
        turnManager
    );


    const passed =
        turnManager.gameState === gameState &&
        turnManager.eventManager === eventManager &&
        turnManager.currentMode === collectorRule &&
        collectorRule.gameState === gameState &&
        collectorRule.catManager === catManager &&
        collectorRule.collectionManager === collectionManager &&
        collectorRule.eventManager === eventManager;


    console.log(
        "TurnManager current mode:",
        turnManager.currentMode
    );

    console.log(
        "CollectorRule modifiers:",
        collectorRule.modifiers
    );

    console.log(
        'CollectorTurnManager TEST 1:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 2
// CollectorRule + TurnManager CONTINUE
// ============================================================

function testContinueTurn() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 2 : COLLECTOR TURN - CONTINUE");
    console.log("========================================");

    const {
        gameState,
        catManager,
        collectionManager,
        turnManager
    } = createTestEnvironment();


    catManager.clear();
    collectionManager.clear();


    // CollectorRuleTest と同じく、
    // PRIME 結果を設定する。
    gameState.setDiceResults([3]);


    const turnBefore =
        gameState.getTurn();


    console.log(
        "Turn before execute:",
        turnBefore
    );

    console.log(
        "Dice results:",
        gameState.getDiceResults()
    );


    const result =
        turnManager.executeTurn();


    const turnAfter =
        gameState.getTurn();


    console.log(
        "Result:",
        result
    );

    console.log(
        "Turn after execute:",
        turnAfter
    );

    console.log(
        "Cat count:",
        catManager.getCats().length
    );

    console.log(
        "Collection data:",
        collectionManager.getCollectionData()
    );


    const passed =
        result === "CONTINUE" &&
        turnAfter === turnBefore + 1;


    console.log(
        'CollectorTurnManager TEST 2:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 3
// TurnManager DEFEAT
//
// CollectorRuleそのものではなく、
// TurnManagerのDEFEAT制御を確認する。
// ============================================================

function testDefeatTurn() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 3 : TURN MANAGER - DEFEAT");
    console.log("========================================");


    const {
        gameState,
        eventManager
    } = createTestEnvironment();


    let executeCount = 0;


    const defeatMode = {

        executeTurn() {

            executeCount++;

            console.log(
                "Mock CollectorRule executeTurn."
            );

            return "DEFEAT";
        }

    };


    const turnManager =
        new TurnManager(
            gameState,
            eventManager,
            defeatMode
        );


    const turnBefore =
        gameState.getTurn();


    const result =
        turnManager.executeTurn();


    const turnAfter =
        gameState.getTurn();


    console.log(
        "Result:",
        result
    );

    console.log(
        "Execute count:",
        executeCount
    );

    console.log(
        "Turn before defeat:",
        turnBefore
    );

    console.log(
        "Turn after defeat:",
        turnAfter
    );


    const passed =
        result === "DEFEAT" &&
        executeCount === 1 &&
        turnAfter === turnBefore;


    console.log(
        'CollectorTurnManager TEST 3:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 4
// CollectorRule + AliceModifier lifecycle
// ============================================================

function testAliceLifecycle() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 4 : COLLECTOR + ALICE LIFECYCLE");
    console.log("========================================");


    const {
        gameState,
        catManager,
        collectionManager,
        collectorRule,
        turnManager
    } = createTestEnvironment();


    catManager.clear();
    collectionManager.clear();


    // 現在ターンに作成された猫。
    // AliceModifier.beforeTurn() では生成ターンの猫を
    // lifetime減少対象から除外する仕様。
    const currentTurn =
        gameState.getTurn();


    const testCat =
        catManager.createCat(
            "white",
            2,
            currentTurn
        );


    console.log(
        "Test cat:",
        testCat
    );

    console.log(
        "Initial lifetime:",
        testCat.lifetime
    );

    console.log(
        "Initial turn:",
        currentTurn
    );


    gameState.setDiceResults([3]);


    const result =
        turnManager.executeTurn();


    console.log(
        "Result:",
        result
    );

    console.log(
        "Turn after execute:",
        gameState.getTurn()
    );

    console.log(
        "Cat exists after execute:",
        catManager.getCats().includes(testCat)
    );

    console.log(
        "Test cat lifetime after execute:",
        testCat.lifetime
    );


    const passed =
        result === "CONTINUE" &&
        gameState.getTurn() === currentTurn + 1 &&
        catManager.getCats().includes(testCat);


    console.log(
        'CollectorTurnManager TEST 4:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 5
// 複数ターン連続実行
// ============================================================

function testMultipleTurns() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 5 : MULTIPLE COLLECTOR TURNS");
    console.log("========================================");


    const {
        gameState,
        catManager,
        collectionManager,
        turnManager
    } = createTestEnvironment();


    catManager.clear();
    collectionManager.clear();


    const initialTurn =
        gameState.getTurn();


    const results = [];


    // --------------------------------------------------------
    // TURN 1
    // --------------------------------------------------------

    gameState.setDiceResults([3]);


    console.log("");
    console.log("=== INTEGRATION TURN 1 ===");


    const result1 =
        turnManager.executeTurn();


    results.push(result1);


    console.log(
        "Turn 1 result:",
        result1
    );

    console.log(
        "Current turn:",
        gameState.getTurn()
    );

    console.log(
        "Cat count:",
        catManager.getCats().length
    );


    // --------------------------------------------------------
    // TURN 2
    // --------------------------------------------------------

    gameState.setDiceResults([3]);


    console.log("");
    console.log("=== INTEGRATION TURN 2 ===");


    const result2 =
        turnManager.executeTurn();


    results.push(result2);


    console.log(
        "Turn 2 result:",
        result2
    );

    console.log(
        "Current turn:",
        gameState.getTurn()
    );

    console.log(
        "Cat count:",
        catManager.getCats().length
    );


    // --------------------------------------------------------
    // TURN 3
    // --------------------------------------------------------

    gameState.setDiceResults([3]);


    console.log("");
    console.log("=== INTEGRATION TURN 3 ===");


    const result3 =
        turnManager.executeTurn();


    results.push(result3);


    console.log(
        "Turn 3 result:",
        result3
    );

    console.log(
        "Current turn:",
        gameState.getTurn()
    );

    console.log(
        "Cat count:",
        catManager.getCats().length
    );


    console.log(
        "Results:",
        results
    );

    console.log(
        "Initial turn:",
        initialTurn
    );

    console.log(
        "Final turn:",
        gameState.getTurn()
    );

    console.log(
        "Final collection:",
        collectionManager.getCollectionData()
    );


    const passed =
        results.every(
            result => result === "CONTINUE"
        ) &&
        gameState.getTurn() === initialTurn + 3;


    console.log(
        'CollectorTurnManager TEST 5:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST EXECUTION
// ============================================================

export function testCollectorTurnManagerIntegration() {

    const results = {
        test1: false,
        test2: false,
        test3: false,
        test4: false,
        test5: false
    };


    results.test1 =
        testInitialization();

    results.test2 =
        testContinueTurn();

    results.test3 =
        testDefeatTurn();

    results.test4 =
        testAliceLifecycle();

    results.test5 =
        testMultipleTurns();


    const passed =
        Object.values(results)
            .every(result => result === true);


    console.log("");
    console.log("========================================");
    console.log("COLLECTOR TURN MANAGER TEST RESULT");
    console.log("========================================");

    console.log(
        "Result:",
        results
    );

    console.log(
        "Passed:",
        passed
    );

    console.log("========================================");


    return {
        results,
        passed
    };
}