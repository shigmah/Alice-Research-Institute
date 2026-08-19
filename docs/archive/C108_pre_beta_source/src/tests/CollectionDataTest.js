// ========================================
// CollectionData Test
// ========================================

import { CollectionData } from "../data/CollectionData.js";

export function testCollectionData() {

    console.log("========================================");
    console.log("COLLECTION DATA TEST");
    console.log("========================================");


    // ====================================================
    // TEST 1 : INITIAL STATE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 1 : COLLECTION DATA INITIAL STATE");
    console.log("----------------------------------------");

    const data1 =
        new CollectionData();

    const test1Contains =
        data1.contains(1);

    const test1Total =
        data1.totalCollected;

    const test1CompletionRate =
        data1.getCompletionRate();

    console.log(
        "Contains cat 1:",
        test1Contains
    );

    console.log(
        "Total collected:",
        test1Total
    );

    console.log(
        "Completion rate:",
        test1CompletionRate
    );


    // ====================================================
    // TEST 2 : ADD COLLECTION
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 2 : ADD COLLECTION");
    console.log("----------------------------------------");

    const data2 =
        new CollectionData();

    data2.addCollection(1);

    const test2Contains =
        data2.contains(1);

    const test2Total =
        data2.totalCollected;

    console.log(
        "Contains cat 1:",
        test2Contains
    );

    console.log(
        "Total collected:",
        test2Total
    );


    // ====================================================
    // TEST 3 : ADD MULTIPLE COLLECTIONS
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 3 : ADD MULTIPLE COLLECTIONS");
    console.log("----------------------------------------");

    const data3 =
        new CollectionData();

    data3.addCollection(1);
    data3.addCollection(2);
    data3.addCollection(3);

    const test3Contains1 =
        data3.contains(1);

    const test3Contains2 =
        data3.contains(2);

    const test3Contains3 =
        data3.contains(3);

    const test3Total =
        data3.totalCollected;

    console.log(
        "Contains cat 1:",
        test3Contains1
    );

    console.log(
        "Contains cat 2:",
        test3Contains2
    );

    console.log(
        "Contains cat 3:",
        test3Contains3
    );

    console.log(
        "Total collected:",
        test3Total
    );


    // ====================================================
    // TEST 4 : DUPLICATE COLLECTION
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 4 : DUPLICATE COLLECTION");
    console.log("----------------------------------------");

    const data4 =
        new CollectionData();

    data4.addCollection(1);
    data4.addCollection(1);

    const test4Contains =
        data4.contains(1);

    const test4Total =
        data4.totalCollected;

    console.log(
        "Contains cat 1:",
        test4Contains
    );

    console.log(
        "Total collected:",
        test4Total
    );


    // ====================================================
    // TEST 5 : CLEAR
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 5 : CLEAR");
    console.log("----------------------------------------");

    const data5 =
        new CollectionData();

    data5.addCollection(1);
    data5.addCollection(2);
    data5.addCollection(3);

    console.log(
        "Before clear:",
        data5.totalCollected
    );

    data5.clear();

    const test5Contains1 =
        data5.contains(1);

    const test5Contains2 =
        data5.contains(2);

    const test5Contains3 =
        data5.contains(3);

    const test5Total =
        data5.totalCollected;

    console.log(
        "Contains cat 1 after clear:",
        test5Contains1
    );

    console.log(
        "Contains cat 2 after clear:",
        test5Contains2
    );

    console.log(
        "Contains cat 3 after clear:",
        test5Contains3
    );

    console.log(
        "Total collected after clear:",
        test5Total
    );


    // ====================================================
    // TEST 6 : COMPLETION RATE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 6 : COMPLETION RATE");
    console.log("----------------------------------------");

    const data6 =
        new CollectionData();

    const test6CompletionRate =
        data6.getCompletionRate();

    console.log(
        "Completion rate:",
        test6CompletionRate
    );


    // ====================================================
    // TEST RESULT
    // ====================================================

    const test1Passed =
        test1Contains === false &&
        test1Total === 0 &&
        test1CompletionRate === 0;

    const test2Passed =
        test2Contains === true &&
        test2Total === 1;

    const test3Passed =
        test3Contains1 === true &&
        test3Contains2 === true &&
        test3Contains3 === true &&
        test3Total === 3;

    const test4Passed =
        test4Contains === true &&
        test4Total === 1;

    const test5Passed =
        test5Contains1 === false &&
        test5Contains2 === false &&
        test5Contains3 === false &&
        test5Total === 0;

    const test6Passed =
        test6CompletionRate === 0;


    console.log("----------------------------------------");

    console.log(
        "CollectionData TEST 1:",
        test1Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionData TEST 2:",
        test2Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionData TEST 3:",
        test3Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionData TEST 4:",
        test4Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionData TEST 5:",
        test5Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionData TEST 6:",
        test6Passed ? "PASS" : "FAIL"
    );

    console.log("----------------------------------------");


    const passed =
        test1Passed &&
        test2Passed &&
        test3Passed &&
        test4Passed &&
        test5Passed &&
        test6Passed;


    return {

        test1Passed,
        test2Passed,
        test3Passed,
        test4Passed,
        test5Passed,
        test6Passed,

        passed
    };
}