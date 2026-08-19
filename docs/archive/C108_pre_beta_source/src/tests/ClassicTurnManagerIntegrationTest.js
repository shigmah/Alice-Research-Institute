import { GameState } from "../core/GameState.js";
import { CatManager } from "../manager/CatManager.js";
import { EventManager } from "../manager/EventManager.js";
import { TurnManager } from "../manager/TurnManager.js";
import { AliceModifier } from "../rule/AliceModifier.js";
import { ClassicRule } from "../rule/ClassicRule.js";


// ============================================================
// 共通テスト環境
// ============================================================

function createTestEnvironment() {

    const gameState =
        new GameState();

    const catManager =
        new CatManager(gameState);

    const eventManager =
        new EventManager(gameState);


    // --------------------------------------------------------
    // テスト用 RandomManager
    // --------------------------------------------------------

    const randomManager = {

        results: [],
        index: 0,

        setResults(results) {

            this.results = [...results];
            this.index = 0;
        },

        rollDice() {

            if (this.index >= this.results.length) {
                throw new Error(
                    "RandomManager test results exhausted."
                );
            }

            const result =
                this.results[this.index];

            this.index++;

            console.log(
                "Test RandomManager roll:",
                result
            );

            return result;
        }

    };


    const aliceModifier =
        new AliceModifier(
            gameState,
            catManager
        );


    const classicRule =
        new ClassicRule(
            gameState,
            catManager,
            randomManager
        );


    classicRule.addModifier(
        aliceModifier
    );

    classicRule.initialize();


    const turnManager =
        new TurnManager(
            gameState,
            eventManager,
            classicRule
        );


    return {
        gameState,
        catManager,
        eventManager,
        randomManager,
        aliceModifier,
        classicRule,
        turnManager
    };
}


// ============================================================
// TEST 1
// ClassicRule + TurnManager 初期化
// ============================================================

function testInitialization() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 1 : CLASSIC + TURN MANAGER INITIALIZATION");
    console.log("========================================");


    const {
        gameState,
        catManager,
        eventManager,
        randomManager,
        aliceModifier,
        classicRule,
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
        "EventManager:",
        eventManager
    );

    console.log(
        "RandomManager:",
        randomManager
    );

    console.log(
        "AliceModifier:",
        aliceModifier
    );

    console.log(
        "ClassicRule:",
        classicRule
    );

    console.log(
        "TurnManager:",
        turnManager
    );


    const passed =
        turnManager.gameState === gameState &&
        turnManager.eventManager === eventManager &&
        turnManager.currentMode === classicRule &&

        classicRule.gameState === gameState &&
        classicRule.catManager === catManager &&
        classicRule.randomManager === randomManager &&

        classicRule.modifiers.includes(
            aliceModifier
        );


    console.log(
        "TurnManager current mode:",
        turnManager.currentMode
    );

    console.log(
        "ClassicRule modifiers:",
        classicRule.modifiers
    );


    console.log(
        'ClassicTurnManager TEST 1:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 2
// ClassicRule + TurnManager
// PHASE 1 CONTINUE
// ============================================================

function testPhase1ContinueTurn() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 2 : CLASSIC TURN - PHASE 1 CONTINUE");
    console.log("========================================");


    const {
        gameState,
        catManager,
        randomManager,
        turnManager
    } = createTestEnvironment();


    catManager.clear();


    // --------------------------------------------------------
    // 初期状態
    //
    // currentDiceCount = 1
    //
    // 1個のサイコロを振る。
    // 結果が3なので白猫を3匹生成。
    // --------------------------------------------------------

    randomManager.setResults([3]);


    const turnBefore =
        gameState.getTurn();

    const diceCountBefore =
        gameState.getCurrentDiceCount();


    console.log(
        "Turn before execute:",
        turnBefore
    );

    console.log(
        "Dice count before execute:",
        diceCountBefore
    );


    const result =
        turnManager.executeTurn();


    const turnAfter =
        gameState.getTurn();

    const diceCountAfter =
        gameState.getCurrentDiceCount();

    const catCountAfter =
        catManager.getCats().length;


    console.log(
        "Result:",
        result
    );

    console.log(
        "Turn after execute:",
        turnAfter
    );

    console.log(
        "Dice count after execute:",
        diceCountAfter
    );

    console.log(
        "Cat count after execute:",
        catCountAfter
    );


    const passed =
        result === "CONTINUE" &&
        turnAfter === turnBefore + 1 &&
        diceCountBefore === 1 &&
        diceCountAfter === 2 &&
        catCountAfter === 3;


    console.log(
        'ClassicTurnManager TEST 2:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 3
// ClassicRule + TurnManager
// PHASE 2 PRIME CONTINUE
// ============================================================

function testPhase2PrimeContinueTurn() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 3 : CLASSIC TURN - PHASE 2 PRIME");
    console.log("========================================");


    const {
        gameState,
        catManager,
        randomManager,
        turnManager
    } = createTestEnvironment();


    catManager.clear();


    // --------------------------------------------------------
    // Phase 2 を直接開始。
    // --------------------------------------------------------

    gameState.setCurrentDiceCount(2);


    // 2 + 3 = 5
    // 5 は素数。
    randomManager.setResults([
        2,
        3
    ]);


    // 猫を3匹用意。
    //
    // diceTotal = 5
    // catCount  = 3
    // difference = 2
    //
    // 2匹削除され、1匹残る。
    //

    const currentTurn =
        gameState.getTurn();


    catManager.createCat(
        "white",
        Infinity,
        currentTurn
    );

    catManager.createCat(
        "white",
        Infinity,
        currentTurn
    );

    catManager.createCat(
        "white",
        Infinity,
        currentTurn
    );


    const turnBefore =
        gameState.getTurn();


    const diceCountBefore =
        gameState.getCurrentDiceCount();


    const catCountBefore =
        catManager.getCats().length;


    console.log(
        "Turn before execute:",
        turnBefore
    );

    console.log(
        "Dice count before execute:",
        diceCountBefore
    );

    console.log(
        "Cat count before execute:",
        catCountBefore
    );


    const result =
        turnManager.executeTurn();


    const turnAfter =
        gameState.getTurn();

    const diceCountAfter =
        gameState.getCurrentDiceCount();

    const catCountAfter =
        catManager.getCats().length;


    console.log(
        "Result:",
        result
    );

    console.log(
        "Turn after execute:",
        turnAfter
    );

    console.log(
        "Dice count after execute:",
        diceCountAfter
    );

    console.log(
        "Cat count after execute:",
        catCountAfter
    );

    console.log(
        "Dice results:",
        gameState.getDiceResults()
    );

    console.log(
        "Dice total:",
        gameState.getDiceTotal()
    );


    const passed =
        result === "CONTINUE" &&
        turnAfter === turnBefore + 1 &&
        diceCountBefore === 2 &&
        diceCountAfter === 3 &&
        catCountBefore === 3 &&
        catCountAfter === 1 &&
        gameState.getDiceTotal() === 5;


    console.log(
        'ClassicTurnManager TEST 3:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 4
// ClassicRule + AliceModifier lifecycle
// ============================================================

function testAliceLifecycle() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 4 : CLASSIC + ALICE LIFECYCLE");
    console.log("========================================");


    const {
        gameState,
        catManager,
        randomManager,
        turnManager
    } = createTestEnvironment();


    catManager.clear();


    const currentTurn =
        gameState.getTurn();


    // --------------------------------------------------------
    // lifetime = 2 の猫を現在ターンに生成。
    //
    // beforeTurn() では、
    // createdAt === currentTurn のため
    // lifetime は減少しない。
    // --------------------------------------------------------

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


    // Phase 1
    randomManager.setResults([2]);


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
        "Cat exists:",
        catManager.getCats().includes(testCat)
    );

    console.log(
        "Lifetime after execute:",
        testCat.lifetime
    );


    const passed =
        result === "CONTINUE" &&
        gameState.getTurn() === currentTurn + 1 &&
        catManager.getCats().includes(testCat) &&
        testCat.lifetime === 2;


    console.log(
        'ClassicTurnManager TEST 4:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 5
// ClassicRule + TurnManager DEFEAT
// ============================================================

function testDefeatTurn() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 5 : CLASSIC TURN - DEFEAT");
    console.log("========================================");


    const {
        gameState,
        catManager,
        randomManager,
        turnManager
    } = createTestEnvironment();


    catManager.clear();


    // --------------------------------------------------------
    // Phase 2 から開始。
    //
    // 猫が0匹なので、
    // ClassicRule.executeTurn() の最後で
    // isFinished() === true
    // となり DEFEAT。
    // --------------------------------------------------------

    gameState.setCurrentDiceCount(2);


    randomManager.setResults([
        1,
        1
    ]);


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
        "Turn before defeat:",
        turnBefore
    );

    console.log(
        "Turn after defeat:",
        turnAfter
    );

    console.log(
        "Cat count:",
        catManager.getCats().length
    );


    const passed =
        result === "DEFEAT" &&
        turnAfter === turnBefore &&
        catManager.getCats().length === 0;


    console.log(
        'ClassicTurnManager TEST 5:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST 6
// 複数ターン連続実行
// ============================================================

function testMultipleTurns() {

    console.log("");
    console.log("========================================");
    console.log(" TEST 6 : MULTIPLE CLASSIC TURNS");
    console.log("========================================");


    const {
        gameState,
        catManager,
        randomManager,
        turnManager
    } = createTestEnvironment();


    catManager.clear();


    const initialTurn =
        gameState.getTurn();


    const results = [];


    // --------------------------------------------------------
    // TURN 1
    // Phase 1
    // --------------------------------------------------------

    randomManager.setResults([
        3
    ]);


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
    // Phase 2
    //
    // 2 + 3 = 5 PRIME
    // --------------------------------------------------------

    randomManager.setResults([
        2,
        3
    ]);


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
    // Phase 3
    //
    // 1 + 2 + 3 = 6
    // 非素数。
    //
    // そのため dice count は
    // 3 -> 2。
    // --------------------------------------------------------

    randomManager.setResults([
        1,
        2,
        3
    ]);


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
        "Current dice count:",
        gameState.getCurrentDiceCount()
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


    const passed =
        results.every(
            result => result === "CONTINUE"
        ) &&
        gameState.getTurn() === initialTurn + 3 &&
        gameState.getCurrentDiceCount() === 2;


    console.log(
        'ClassicTurnManager TEST 6:',
        passed ? "PASS" : "FAIL"
    );

    return passed;
}


// ============================================================
// TEST EXECUTION
// ============================================================

export function testClassicTurnManagerIntegration() {

    const results = {

        test1: false,
        test2: false,
        test3: false,
        test4: false,
        test5: false,
        test6: false

    };


    results.test1 =
        testInitialization();

    results.test2 =
        testPhase1ContinueTurn();

    results.test3 =
        testPhase2PrimeContinueTurn();

    results.test4 =
        testAliceLifecycle();

    results.test5 =
        testDefeatTurn();

    results.test6 =
        testMultipleTurns();


    const passed =
        Object.values(results)
            .every(
                result => result === true
            );


    console.log("");
    console.log("========================================");
    console.log("CLASSIC TURN MANAGER TEST RESULT");
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