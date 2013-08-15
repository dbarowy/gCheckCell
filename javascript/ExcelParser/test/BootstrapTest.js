define(["XClasses/XApplication", "Parser/AST/AST", "Utilities/Profiler", "DataDebugMethods/ConstructTree", "DataDebugMethods/AnalysisData", "DataDebugMethods/Analysis", "DataDebugMethods/InputSample", "DataDebugMethods/FunctionOutput"], function (XApplication, AST, Profiler, ConstructTree, AnalysisData, Analysis, InputSample, FunctionOutput) {
    "use strict";
    describe('BootTest', function () {
        var data = {"external_books": [], "active_book": {"sheets": [ {"values": [ ["Profit and Loss Statement", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["(in Millions)", "Actual", "", "", "Projected", "", "", "", "", "", "", ""], ["", 1984, 1985, 1986, 1987, 1988, "", "", "", "", "", ""], ["", "", "", "", "", "", "", "Original Winograd Values", "", "", "Needed Temp. Values", ""], ["Revenues", 3.865, 4.992, 5.803, 6.022, 6.481, "", 6.022, 6.481, "", 1.2323328785811734, 1.2534571124649452], ["", "", "", "", "", "", "", "", "", "", "", ""], ["Expenses", "", "", "", "", "", "", "", "", "", "", ""], ["Salaries", 0.285, 0.337, 0.506, 0.617, 0.705, "", 0.617, 0.705, "", 1.6409574468085104, 1.6160458452722062], ["Utilities", 0.178, 0.303, 0.384, 0.419, 0.551, "", 0.419, 0.551, "", 1.453179190751445, 1.7165109034267914], ["Materials", 1.004, 1.782, 2.046, 2.273, 2.119, "", 2.273, 2.119, "", 1.4112168874172188, 1.1929627023223084], ["Administration", 0.281, 0.288, 0.315, 0.368, 0.415, "", 0.368, 0.415, "", 1.2488687782805432, 1.3258785942492015], ["Other", 0.455, 0.541, 0.674, 0.772, 0.7830000000000001, "", 0.772, 0.783, "", 1.3868263473053892, 1.2825552825552826], ["", "", "", "", "", "", "", "", "", "", "", ""], ["Total Expenses", 2.2030000000000003, 3.251, 3.925, 4.449, 4.573, "", 4.449, 4.573, "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["Profit (Loss)", 1.662, 1.741, 1.8780000000000001, 1.5730000000000004, 1.9079999999999995, "", 1.5730000000000004, 1.9079999999999995, "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "{    \"$Profits.$B$4\": \"timeinterval/timeinterval\",    \"$Profits.$C$4\": \"timeinterval/timeinterval\",    \"$Profits.$D$4\": \"timeinterval/timeinterval\",    \"$Profits.$E$4\": \"timeinterval/timeinterval\",    \"$Profits.$F$4\": \"timeinterval/timeinterval\",    \"$Profits.$B$6\": \"sax-revenues-actual/sax-revenuesperti-actual\",    \"$Profits.$C$6\": \"sax-revenues-actual/sax-revenuesperti-actual\",    \"$Profits.$D$6\": \"sax-revenues-actual/sax-revenuesperti-actual\",    \"$Profits.$E$6\": \"sax-revenues-projected/sax-revenuesperti-projected\",    \"$Profits.$F$6\": \"sax-revenues-projected/sax-revenuesperti-projected\",    \"$Profits.$B$9\": \"sax-salarycosts-actual/sax-salarycostsperti-actual\",    \"$Profits.$C$9\": \"sax-salarycosts-actual/sax-salarycostsperti-actual\",    \"$Profits.$D$9\": \"sax-salarycosts-actual/sax-salarycostsperti-actual\",    \"$Profits.$E$9\": \"sax-salarycosts-projected/sax-salarycostsperti-projected\",    \"$Profits.$F$9\": \"sax-salarycosts-projected/sax-salarycostsperti-projected\",    \"$Profits.$B$10\": \"sax-utilitycosts-actual/sax-utilitycostsperti-actual\",    \"$Profits.$C$10\": \"sax-utilitycosts-actual/sax-utilitycostsperti-actual\",    \"$Profits.$D$10\": \"sax-utilitycosts-actual/sax-utilitycostsperti-actual\",    \"$Profits.$E$10\": \"sax-utilitycosts-projected/sax-utilitycostsperti-projected\",    \"$Profits.$F$10\": \"sax-utilitycosts-projected/sax-utilitycostsperti-projected\",    \"$Profits.$B$11\": \"sax-materialcosts-actual/sax-materialcostsperti-actual\",    \"$Profits.$C$11\": \"sax-materialcosts-actual/sax-materialcostsperti-actual\",    \"$Profits.$D$11\": \"sax-materialcosts-actual/sax-materialcostsperti-actual\",    \"$Profits.$E$11\": \"sax-materialcosts-projected/sax-materialcostsperti-projected\",    \"$Profits.$F$11\": \"sax-materialcosts-projected/sax-materialcostsperti-projected\",    \"$Profits.$B$12\": \"sax-admincosts-actual/sax-admincostsperti-actual\",    \"$Profits.$C$12\": \"sax-admincosts-actual/sax-admincostsperti-actual\",    \"$Profits.$D$12\": \"sax-admincosts-actual/sax-admincostsperti-actual\",    \"$Profits.$E$12\": \"sax-admincosts-projected/sax-admincostsperti-projected\",    \"$Profits.$F$12\": \"sax-admincosts-projected/sax-admincostsperti-projected\",    \"$Profits.$B$13\": \"sax-othercosts-actual/sax-othercostsperti-actual\",    \"$Profits.$C$13\": \"sax-othercosts-actual/sax-othercostsperti-actual\",    \"$Profits.$E$13\": \"sax-othercosts-actual/sax-othercostsperti-actual\",    \"$Profits.$D$13\": \"sax-othercosts-projected/sax-othercostsperti-projected\",    \"$Profits.$F$13\": \"sax-othercosts-projected/sax-othercostsperti-projected\",    \"$Profits.$B$15\": \"sax-expenses-actual/sax-expensesperti-actual\",    \"$Profits.$C$15\": \"sax-expenses-actual/sax-expensesperti-actual\",    \"$Profits.$D$15\": \"sax-expenses-actual/sax-expensesperti-actual\",    \"$Profits.$E$15\": \"sax-expenses-projected/sax-expensesperti-projected\",    \"$Profits.$F$15\": \"sax-expenses-projected/sax-expensesperti-projected\",    \"$Profits.$B$17\": \"sax-profits-actual/sax-profitsperti-actual\",    \"$Profits.$C$17\": \"sax-profits-actual/sax-profitsperti-actual\",    \"$Profits.$D$17\": \"sax-profits-actual/sax-profitsperti-actual\",    \"$Profits.$E$17\": \"sax-profits-projected/sax-profitsperti-projected\",    \"$Profits.$F$17\": \"sax-profits-projected/sax-profitsperti-projected\",    \"$Salaries.$B$3\": \"sax-salarycosts-actual/sax-salaryperti-actual\",    \"$Salaries.$C$3\": \"sax-salarycosts-actual/sax-salaryperti-actual\",    \"$Salaries.$D$3\": \"sax-salarycosts-actual/sax-salaryperti-actual\",    \"$Salaries.$E$3\": \"sax-salarycosts-projected/sax-salaryperti-projected\",    \"$Salaries.$F$3\": \"sax-salarycosts-projected/sax-salaryperti-projected\",    \"$Salaries.$B$4\": \"sax-salarycosts-actual/sax-salaryperti-actual\",    \"$Salaries.$C$4\": \"sax-salarycosts-actual/sax-salaryperti-actual\",    \"$Salaries.$D$4\": \"sax-salarycosts-actual/sax-salaryperti-actual\",    \"$Salaries.$E$4\": \"sax-salarycosts-projected/sax-salaryperti-projected\",    \"$Salaries.$F$4\": \"sax-salarycosts-projected/sax-salaryperti-projected\"}", "", ""] ], "formulas": [ ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "\u003d(SUM(B6:E6)*L6)/4", "", "", "", "", "\u003d((3*H6)/SUM(B6:D6))", "\u003d((4*I6)/SUM(B6:E6))"], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "\u003d(SUM(B9:E9)*L9)/4", "", "", "", "", "\u003d((3*H9)/SUM(B9:D9))", "\u003d((4*I9)/SUM(B9:E9))"], ["", "", "", "", "", "\u003d(SUM(B10:E10)*L10)/4", "", "", "", "", "\u003d((3*H10)/SUM(B10:D10))", "\u003d((4*I10)/SUM(B10:E10))"], ["", "", "", "", "", "\u003d(SUM(B11:E11)*L11)/4", "", "", "", "", "\u003d((3*H11)/SUM(B11:D11))", "\u003d((4*I11)/SUM(B11:E11))"], ["", "", "", "", "", "\u003d(SUM(B12:E12)*L12)/4", "", "", "", "", "\u003d((3*H12)/SUM(B12:D12))", "\u003d((4*I12)/SUM(B12:E12))"], ["", "", "", "", "", "\u003d(SUM(B13:E13)*L13)/4", "", "", "", "", "\u003d((3*H13)/SUM(B13:D13))", "\u003d((4*I13)/SUM(B13:E13))"], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "\u003dSUM(B9:B13)", "\u003dSUM(C9:C13)", "\u003dSUM(D9:D13)", "\u003dSUM(E9:E13)", "\u003dSUM(F9:F13)", "", "\u003dSUM(H9:H13)", "\u003dSUM(I9:I13)", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "\u003dSUM(B6,-B15)", "\u003dSUM(C6,-C15)", "\u003dSUM(D6,-D15)", "\u003dSUM(E6,-E15)", "\u003dSUM(F6,-F15)", "", "\u003dSUM(H6,-H15)", "\u003dSUM(I6,-I15)", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""] ], "name": "Profits"}, {"values": [ ["Profit and Loss Statement", "", "", "", "", ""], ["", "", "", "", "", ""], ["(in Millions)", "Actual", "", "", "Projected", ""], ["", 1984, 1985, 1986, 1987, 1988], ["", "", "", "", "", ""], ["Revenues", 3.865, 4.992, 5.803, 6.022, 6.481], ["", "", "", "", "", ""], ["Expenses", "", "", "", "", ""], ["Salaries", 0.285, 0.337, 0.506, 0.617, 0.705], ["Utilities", 0.178, 0.303, 0.384, 0.419, 0.551], ["Materials", 1.004, 1.782, 2.046, 2.273, 2.119], ["Administration", 0.281, 0.288, 0.315, 0.368, 0.415], ["Other", 0.455, 0.541, 0.674, 0.772, 0.783], ["", "", "", "", "", ""], ["Total Expenses", 2.2030000000000003, 3.251, 3.925, 4.449, 4.573], ["", "", "", "", "", ""], ["Profit (Loss)", 1.662, 1.741, 1.8780000000000001, 1.5730000000000004, 1.9079999999999995] ], "formulas": [ ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "", "", "", "", ""], ["", "\u003dSUM(B9:B13)", "\u003dSUM(C9:C13)", "\u003dSUM(D9:D13)", "\u003dSUM(E9:E13)", "\u003dSUM(F9:F13)"], ["", "", "", "", "", ""], ["", "\u003dB6 - B15", "\u003dC6 - C15", "\u003dD6 - D15", "\u003dE6 - E15", "\u003dF6 - F15"] ], "name": "FormelnEinfach"}, {"values": [ ["{\"type\":\"abstractspreadsheet\", \"interpretationMap\":{\"$Profits.$B$4\":\"timeinterval/timeinterval\", \"$Profits.$C$4\":\"timeinterval/timeinterval\", \"$Profits.$D$4\":\"timeinterval/timeinterval\", \"$Profits.$E$4\":\"timeinterval/timeinterval\", \"$Profits.$F$4\":\"timeinterval/timeinterval\", \"$Profits.$B$6\":\"sax-revenues-actual/sax-revenuesperti-actual\", \"$Profits.$C$6\":\"sax-revenues-actual/sax-revenuesperti-actual\", \"$Profits.$D$6\":\"sax-revenues-actual/sax-revenuesperti-actual\", \"$Profits.$E$6\":\"sax-revenues-projected/sax-revenuesperti-projected\", \"$Profits.$F$6\":\"sax-revenues-projected/sax-revenuesperti-projected\", \"$Profits.$B$9\":\"sax-salarycosts-actual/sax-salarycostsperti-actual\", \"$Profits.$C$9\":\"sax-salarycosts-actual/sax-salarycostsperti-actual\", \"$Profits.$D$9\":\"sax-salarycosts-actual/sax-salarycostsperti-actual\", \"$Profits.$E$9\":\"sax-salarycosts-projected/sax-salarycostsperti-projected\", \"$Profits.$F$9\":\"sax-salarycosts-projected/sax-salarycostsperti-projected\", \"$Profits.$B$10\":\"sax-utilitycosts-actual/sax-utilitycostsperti-actual\", \"$Profits.$C$10\":\"sax-utilitycosts-actual/sax-utilitycostsperti-actual\", \"$Profits.$D$10\":\"sax-utilitycosts-actual/sax-utilitycostsperti-actual\", \"$Profits.$E$10\":\"sax-utilitycosts-projected/sax-utilitycostsperti-projected\", \"$Profits.$F$10\":\"sax-utilitycosts-projected/sax-utilitycostsperti-projected\", \"$Profits.$B$11\":\"sax-materialcosts-actual/sax-materialcostsperti-actual\", \"$Profits.$C$11\":\"sax-materialcosts-actual/sax-materialcostsperti-actual\", \"$Profits.$D$11\":\"sax-materialcosts-actual/sax-materialcostsperti-actual\", \"$Profits.$E$11\":\"sax-materialcosts-projected/sax-materialcostsperti-projected\", \"$Profits.$F$11\":\"sax-materialcosts-projected/sax-materialcostsperti-projected\", \"$Profits.$B$12\":\"sax-admincosts-actual/sax-admincostsperti-actual\", \"$Profits.$C$12\":\"sax-admincosts-actual/sax-admincostsperti-actual\", \"$Profits.$D$12\":\"sax-admincosts-actual/sax-admincostsperti-actual\", \"$Profits.$E$12\":\"sax-admincosts-projected/sax-admincostsperti-projected\", \"$Profits.$F$12\":\"sax-admincosts-projected/sax-admincostsperti-projected\", \"$Profits.$B$13\":\"sax-expenses-actual/sax-othercostsperti-actual\", \"$Profits.$C$13\":\"sax-expenses-actual/sax-othercostsperti-actual\", \"$Profits.$E$13\":\"sax-expenses-actual/sax-othercostsperti-actual\", \"$Profits.$D$13\":\"sax-expenses-projected/sax-othercostsperti-projected\", \"$Profits.$F$13\":\"sax-expenses-projected/sax-othercostsperti-projected\", \"$Profits.$B$15\":\"sax-expenses-actual/sax-expensesperti-actual\", \"$Profits.$C$15\":\"sax-expenses-actual/sax-expensesperti-actual\", \"$Profits.$D$15\":\"sax-expenses-actual/sax-expensesperti-actual\", \"$Profits.$E$15\":\"sax-expenses-projected/sax-expensesperti-projected\", \"$Profits.$F$15\":\"sax-expenses-projected/sax-expensesperti-projected\", \"$Profits.$B$17\":\"sax-profits-actual/sax-profitsperti-actual\", \"$Profits.$C$17\":\"sax-profits-actual/sax-profitsperti-actual\", \"$Profits.$D$17\":\"sax-profits-actual/sax-profitsperti-actual\", \"$Profits.$E$17\":\"sax-profits-projected/sax-profitsperti-projected\", \"$Profits.$F$17\":\"sax-profits-projected/sax-profitsperti-projected\", \"$Salaries.$B$3\":\"sax-salarycosts-actual/sax-salaryperti-actual\", \"$Salaries.$C$3\":\"sax-salarycosts-actual/sax-salaryperti-actual\", \"$Salaries.$D$3\":\"sax-salarycosts-actual/sax-salaryperti-actual\", \"$Salaries.$E$3\":\"sax-salarycosts-projected/sax-salaryperti-projected\", \"$Salaries.$F$3\":\"sax-salarycosts-projected/sax-salaryperti-projected\", \"$Salaries.$B$4\":\"sax-salarycosts-actual/sax-salaryperti-actual\", \"$Salaries.$C$4\":\"sax-salarycosts-actual/sax-salaryperti-actual\", \"$Salaries.$D$4\":\"sax-salarycosts-actual/sax-salaryperti-actual\", \"$Salaries.$E$4\":\"sax-salarycosts-projected/sax-salaryperti-projected\", \"$Salaries.$F$4\":\"sax-salarycosts-projected/sax-salaryperti-projected\"}}"] ], "formulas": [ [""] ], "name": "Hidden"} ], "name": "TestSheet", "named_ranges": []}};
        //var data={"external_books":[],"active_book":{"sheets":[{"values":[[1,""],[2,""],[3,""],[4,""],[10000,10010]],"formulas":[["",""],["",""],["",""],["",""],["","\u003dSUM(A1:A5)"]],"name":"Sheet1"},{"values":[[""]],"formulas":[[""]],"name":"Sheet2"},{"values":[[""]],"formulas":[[""]],"name":"Sheet3"}],"name":"TestSheet","named_ranges":[]}} ;
           it("GeneralTest", function () {
         var start = new Date();
         Profiler.start("init");
         XApplication.init(data);

         Profiler.end("init");
         Profiler.start("tree");
         var dat = new AnalysisData();
         ConstructTree.constructTree(dat, XApplication);
         var NBOOTS = Math.ceil(1000 * Math.exp(1.0));
         var scores = Analysis.Bootstrap(NBOOTS, dat, XApplication, false);
         Analysis.ColorOutliers(scores);
         Profiler.end("tree");

         Profiler.report();
         console.log("Counter " + counter);
         console.log("done");
         });
    });

    describe("storeOutputs", function () {
        var node = {getHashCode: function () {
            return 3;
        }, com: {getValue: function () {
            return 2;
        }}};
        var d = Analysis.storeOutputs([node]);
        expect(d.getEntrySet().length).toEqual(1);
        expect(d.get(node)).toEqual('2');
    });

    describe("storeInputs", function () {
        var node = {rows: 2, columns: 3, getHashCode: function () {
            return 3;
        }, com: {getValues: function () {
            return [
                [1, 2, 3],
                [4, 5, 6]
            ];
        }, getValue: function () {
            return 2;
        }}};
        var d = Analysis.storeInputs([node]);
        var input = new InputSample(2, 3);
        input.addArray([
            [1, 2, 3],
            [4, 5, 6]
        ]);

        expect(d.getEntrySet().length).toEqual(1);
        expect(d.get(node)).toEqual(input);
    });

    describe("resample", function () {
        var i, input = new InputSample(2, 3);
        input.addArray([
            [1, 2, 3],
            [4, 5, 6]
        ]);
        var resamples = Analysis.resample(50, input);
        for (i = 0; i < resamples.length; i++) {
            var sum = 0;
            for (var j = 0; j < resamples[i].includes.length; j++) {
                sum += resamples[i].includes[j];
                if (resamples[i].includes[j] === 0) {
                    expect(resamples[i].excludes[i] === i);
                }
            }
            expect(sum).toEqual(6);
        }
    });

    describe("init3DArray", function () {
        //Test if the array is properly initialized
        var array = Analysis.init3DArray(2, 2, 2);
        var a;//a is undefined
        expect(array).toEqual([
            [
                [a, a],
                [a, a]
            ],
            [
                [a, a],
                [a, a]
            ]
        ]);
    });

    describe("functionOutputsAreNumeric", function () {
        var functions = [new FunctionOutput(2, {"1": 1})];
        expect(Analysis.functionOutputsAreNumeric(functions)).toEqual(true);
        functions = [new FunctionOutput("2", {"1": 1})];
        expect(Analysis.functionOutputsAreNumeric(functions)).toEqual(true);
        functions = [new FunctionOutput("sad", {"1": 1})];
        expect(Analysis.functionOutputsAreNumeric(functions)).toEqual(false);
        functions = [new FunctionOutput("", {"1": 1})];
        expect(Analysis.functionOutputsAreNumeric(functions)).toEqual(false);
        functions = [new FunctionOutput(null, {"1": 1})];
        expect(Analysis.functionOutputsAreNumeric(functions)).toEqual(false);
        functions = [new FunctionOutput(true, {"1": 1})];
        expect(Analysis.functionOutputsAreNumeric(functions)).toEqual(true);
        functions = [new FunctionOutput("sad", {"1": 1}), new FunctionOutput("3", {"1": 1})];
        expect(Analysis.functionOutputsAreNumeric(functions)).toEqual(false);
    });

    describe("convertToNumericOutput", function () {
        var functions = [new FunctionOutput("2", {"1": 1})];
        expect(Analysis.convertToNumericOutput(functions)).toEqual([new FunctionOutput(2, {"1": 1})]);
        functions = [new FunctionOutput(2, {"1": 1})];
        expect(Analysis.convertToNumericOutput(functions)).toEqual([new FunctionOutput(2, {"1": 1})]);
        functions = [new FunctionOutput("sad", {"1": 1})];
        expect(Analysis.convertToNumericOutput(functions)).not.toEqual([new FunctionOutput(NaN, {"1": 1})]);
        functions = [new FunctionOutput("", {"1": 1})];
        expect(Analysis.convertToNumericOutput(functions)).toEqual([new FunctionOutput(0, {"1": 1})]);
        functions = [new FunctionOutput(null, {"1": 1})];
        expect(Analysis.convertToNumericOutput(functions)).toEqual([new FunctionOutput(0, {"1": 1})]);
        functions = [new FunctionOutput(true, {"1": 1})];
        expect(Analysis.convertToNumericOutput(functions)).toEqual([new FunctionOutput(1, {"1": 1})]);
        functions = [new FunctionOutput("sad", {"1": 1}), new FunctionOutput("3", {"1": 1})];
        expect(Analysis.convertToNumericOutput(functions)).not.toEqual([new FunctionOutput(NaN, {"1": 1}), new FunctionOutput(3, {"1": 1})]);
    });

});