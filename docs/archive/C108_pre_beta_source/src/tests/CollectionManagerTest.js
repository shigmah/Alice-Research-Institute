// ========================================
// CollectionManager Test
// ========================================

export function testCollectionManager({
    collectionManager
}) {

    console.log("========================================");
    console.log("COLLECTION MANAGER TEST");
    console.log("========================================");


    // ====================================================
    // TEST 1 : INITIAL STATE
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 1 : COLLECTION MANAGER INITIAL STATE");
    console.log("----------------------------------------");

    collectionManager.clear();

    const initialData =
        collectionManager.getCollectionData();

    const test1Contains =
        collectionManager.contains(1);

    const test1TotalCollected =
        initialData.totalCollected;

    const test1CompletionRate =
        collectionManager.getCompletionRate();

    console.log(
        "Contains cat 1:",
        test1Contains
    );

    console.log(
        "Total collected:",
        test1TotalCollected
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

    collectionManager.clear();

    collectionManager.addCollection(1);

    const test2Contains =
        collectionManager.contains(1);

    const test2Data =
        collectionManager.getCollectionData();

    const test2TotalCollected =
        test2Data.totalCollected;

    console.log(
        "Contains cat 1:",
        test2Contains
    );

    console.log(
        "Total collected:",
        test2TotalCollected
    );


    // ====================================================
    // TEST 3 : MULTIPLE COLLECTIONS
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 3 : MULTIPLE COLLECTIONS");
    console.log("----------------------------------------");

    collectionManager.clear();

    collectionManager.addCollection(1);
    collectionManager.addCollection(2);
    collectionManager.addCollection(3);

    const test3Contains1 =
        collectionManager.contains(1);

    const test3Contains2 =
        collectionManager.contains(2);

    const test3Contains3 =
        collectionManager.contains(3);

    const test3Data =
        collectionManager.getCollectionData();

    const test3TotalCollected =
        test3Data.totalCollected;

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
        test3TotalCollected
    );


    // ====================================================
    // TEST 4 : DUPLICATE COLLECTION
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 4 : DUPLICATE COLLECTION");
    console.log("----------------------------------------");

    collectionManager.clear();

    collectionManager.addCollection(1);
    collectionManager.addCollection(1);

    const test4Contains =
        collectionManager.contains(1);

    const test4Data =
        collectionManager.getCollectionData();

    const test4TotalCollected =
        test4Data.totalCollected;

    console.log(
        "Contains cat 1:",
        test4Contains
    );

    console.log(
        "Total collected:",
        test4TotalCollected
    );


    // ====================================================
    // TEST 5 : CLEAR
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 5 : CLEAR");
    console.log("----------------------------------------");

    collectionManager.clear();

    collectionManager.addCollection(1);
    collectionManager.addCollection(2);
    collectionManager.addCollection(3);

    const test5BeforeClear =
        collectionManager.getCollectionData().totalCollected;

    collectionManager.clear();

    const test5Contains1 =
        collectionManager.contains(1);

    const test5Contains2 =
        collectionManager.contains(2);

    const test5Contains3 =
        collectionManager.contains(3);

    const test5AfterClear =
        collectionManager.getCollectionData().totalCollected;

    console.log(
        "Before clear:",
        test5BeforeClear
    );

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
        test5AfterClear
    );


    // ====================================================
    // TEST 6 : GET COLLECTION DATA
    // ====================================================

    console.log("----------------------------------------");
    console.log("TEST 6 : GET COLLECTION DATA");
    console.log("----------------------------------------");

    collectionManager.clear();

    collectionManager.addCollection(10);
    collectionManager.addCollection(20);

    const test6Data =
        collectionManager.getCollectionData();

    const test6Contains10 =
        test6Data.contains(10);

    const test6Contains20 =
        test6Data.contains(20);

    const test6TotalCollected =
        test6Data.totalCollected;

    console.log(
        "CollectionData contains cat 10:",
        test6Contains10
    );

    console.log(
        "CollectionData contains cat 20:",
        test6Contains20
    );

    console.log(
        "CollectionData total collected:",
        test6TotalCollected
    );


    // ====================================================
    // TEST RESULT
    // ====================================================

    const test1Passed =
        test1Contains === false &&
        test1TotalCollected === 0 &&
        test1CompletionRate === 0;

    const test2Passed =
        test2Contains === true &&
        test2TotalCollected === 1;

    const test3Passed =
        test3Contains1 === true &&
        test3Contains2 === true &&
        test3Contains3 === true &&
        test3TotalCollected === 3;

    const test4Passed =
        test4Contains === true &&
        test4TotalCollected === 1;

    const test5Passed =
        test5BeforeClear === 3 &&
        test5Contains1 === false &&
        test5Contains2 === false &&
        test5Contains3 === false &&
        test5AfterClear === 0;

    const test6Passed =
        test6Contains10 === true &&
        test6Contains20 === true &&
        test6TotalCollected === 2;


    console.log("----------------------------------------");

    console.log(
        "CollectionManager TEST 1:",
        test1Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionManager TEST 2:",
        test2Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionManager TEST 3:",
        test3Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionManager TEST 4:",
        test4Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionManager TEST 5:",
        test5Passed ? "PASS" : "FAIL"
    );

    console.log(
        "CollectionManager TEST 6:",
        test6Passed ? "PASS" : "FAIL"
    );

    console.log("----------------------------------------");


    return {

        test1Passed,
        test2Passed,
        test3Passed,
        test4Passed,
        test5Passed,
        test6Passed,

        passed:
            test1Passed &&
            test2Passed &&
            test3Passed &&
            test4Passed &&
            test5Passed &&
            test6Passed
    };
}