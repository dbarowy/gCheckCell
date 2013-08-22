define(["Utilities/Function", "Parser/Parser"], function (Function, Parser) {
    describe('Functions test', function () {
        it("SUM tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SUM({1})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=SUM({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=SUM({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=SUM({#VALUE!})", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=SUM(1,2)", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=SUM(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=SUM(\"2\")", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=SUM(1,TRUE,\"2\")", wb, ws).compute({}, {}, false, false)).toEqual(4);
            expect(Parser.parseFormula("=SUM(\"2asd\")", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=SUM({3,\"2asd\"})", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=SUM()", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");

        });

        it("SQRT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SQRT({1})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT({#VALUE!})", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=SQRT(1,2)", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=SQRT(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT(\"4\")", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=SQRT()", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=SQRT(\"2asd\")", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");

            expect(Parser.parseFormula("=SQRT({1})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=SQRT({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=SQRT({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=SQRT({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            expect(Parser.parseFormula("=SQRT(1,2)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=SQRT(TRUE)", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=SQRT(\"4\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [2]
            ]);
            expect(Parser.parseFormula("=SQRT()", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=SQRT(\"2asd\")", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            //expect(Parser.parseFormula("=SUM({3,\"2asd\"})",wb,ws).compute({},{},false,false)).toEqual("#VALUE!");
        });

        it("AVERAGE tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=AVERAGE({1,2,3})", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=AVERAGE({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual("#DIV/0!");
            expect(Parser.parseFormula("=AVERAGE({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual("#DIV/0!");
            expect(Parser.parseFormula("=AVERAGE({#VALUE!})", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=AVERAGE(1,2,3)", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=AVERAGE(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual("#DIV/0!");
            expect(Parser.parseFormula("=AVERAGE(\"1\")", wb, ws).compute({}, {}, false, false)).toEqual("#DIV/0!");
            expect(Parser.parseFormula("=AVERAGE(#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");

            expect(Parser.parseFormula("=AVERAGE({1,2,3})", wb, ws).compute({}, {}, true, false)).toEqual([
                [2]
            ]);
            expect(Parser.parseFormula("=AVERAGE({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#DIV/0!"]
            ]);
            expect(Parser.parseFormula("=AVERAGE({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#DIV/0!"]
            ]);
            expect(Parser.parseFormula("=AVERAGE({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
        });

        it("MIN tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MIN({1,2,3})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=MIN({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MIN({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MIN({\"asd\"})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MIN({\"asd\",1,2,3,TRUE,\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=MIN({\"asd\",1,2,3,TRUE,\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);

            expect(Parser.parseFormula("=MIN({1,2,3})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=MIN({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=MIN({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=MIN({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
        });

        it("MAX tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MAX({1,2,3})", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=MAX({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MAX({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MAX({\"asd\"})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MAX({\"asd\",1,2,3,TRUE,\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=MAX({\"asd\",1,2,3,TRUE,\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [3]
            ]);

            expect(Parser.parseFormula("=MAX({1,2,3})", wb, ws).compute({}, {}, true, false)).toEqual([
                [3]
            ]);
            expect(Parser.parseFormula("=MAX({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=MAX({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=MAX({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
        });

        it("SUMPRODUCT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SUMPRODUCT({1,2,3},{1,2,\"sda\"})", wb, ws).compute({}, {}, false, false)).toEqual(5);
            expect(Parser.parseFormula("=SUMPRODUCT(1,2,3)", wb, ws).compute({}, {}, false, false)).toEqual(6);
            expect(Parser.parseFormula("=SUMPRODUCT()", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{\"sad\",4})", wb, ws).compute({}, {}, false, false)).toEqual(8);
            expect(Parser.parseFormula("=SUMPRODUCT(\"13\",\"3\")", wb, ws).compute({}, {}, false, false)).toEqual(39);
            expect(Parser.parseFormula("=SUMPRODUCT(TRUE,4)", wb, ws).compute({}, {}, false, false)).toEqual(4);
            expect(Parser.parseFormula("=SUMPRODUCT(\"24\",\"dsad\")", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=SUMPRODUCT(\"dsa\",\"dsad\")", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{1})", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=SUMPRODUCT({1,2;3,4},{1,2;3,4})", wb, ws).compute({}, {}, false, false)).toEqual(30);


            expect(Parser.parseFormula("=SUMPRODUCT({1,2,3},{1,2,\"sda\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [5]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(1,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                [6]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT()", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{\"sad\",4})", wb, ws).compute({}, {}, true, false)).toEqual([
                [8]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(\"13\",\"3\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [39]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(TRUE,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                [4]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(\"24\",\"dsad\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(\"dsa\",\"dsad\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{1})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT({1,2;3,4},{1,2;3,4})", wb, ws).compute({}, {}, true, false)).toEqual([
                [30]
            ]);
        });
        it("COUNT test", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=COUNT({1})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=COUNT({\"2\"})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=COUNT(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=COUNT(#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=COUNT()", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=COUNT({1,2})", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=COUNT(1,2,\"2\",TRUE,#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual(2);

            expect(Parser.parseFormula("=COUNT({1})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=COUNT({\"2\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=COUNT(TRUE)", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=COUNT(#VALUE!)", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=COUNT()", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=COUNT({1,2})", wb, ws).compute({}, {}, true, false)).toEqual([
                [2]
            ]);
            expect(Parser.parseFormula("=COUNT(1,2,\"2\",TRUE,#VALUE!)", wb, ws).compute({}, {}, true, false)).toEqual([
                [2]
            ]);

        });

        it("HYPERLINK test", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=HYPERLINK(\"das\")", wb, ws).compute({}, {}, false, false)).toEqual('das');
            expect(Parser.parseFormula("=HYPERLINK(1)", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=HYPERLINK(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual(true);
            expect(Parser.parseFormula("=HYPERLINK(#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=HYPERLINK(\"das\")", wb, ws).compute({}, {}, false, false)).toEqual("das");
            expect(Parser.parseFormula("=HYPERLINK(1,\"a\")", wb, ws).compute({}, {}, false, false)).toEqual("a");
            expect(Parser.parseFormula("=HYPERLINK(1,2)", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=HYPERLINK(1,#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=HYPERLINK(2,TRUE)", wb, ws).compute({}, {}, false, false)).toEqual(true);
            expect(Parser.parseFormula("=HYPERLINK({1,2,3},{4,5,6})", wb, ws).compute({}, {}, false, false)).toEqual(4);


            expect(Parser.parseFormula("=HYPERLINK({1,2},{3,4,5;1,#VALUE!,3})", wb, ws).compute({}, {}, true, false)).toEqual([
                [3, 4, 5],
                [1, "#VALUE!", 3]
            ]);
            expect(Parser.parseFormula("=HYPERLINK({1,2,3},{1,2})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1, 2, "#N/A"]
            ]);

        });

        it("PRODUCT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=PRODUCT({1})", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=PRODUCT({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=PRODUCT({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=PRODUCT({#VALUE!})", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=PRODUCT(1,2)", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=PRODUCT(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=PRODUCT(\"2\")", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=PRODUCT(1,TRUE,\"2\")", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=PRODUCT(\"2asd\")", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=PRODUCT({3,\"2asd\"})", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=PRODUCT()", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");

            expect(Parser.parseFormula("=PRODUCT({1})", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=PRODUCT({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=PRODUCT({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=PRODUCT({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            expect(Parser.parseFormula("=PRODUCT(1,2)", wb, ws).compute({}, {}, true, false)).toEqual([
                [2]
            ]);
            expect(Parser.parseFormula("=PRODUCT(TRUE)", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=PRODUCT(\"2\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=PRODUCT(1,TRUE,\"2\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [1]
            ]);
            expect(Parser.parseFormula("=PRODUCT(\"2asd\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [0]
            ]);
            expect(Parser.parseFormula("=PRODUCT({3,\"2asd\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [3]
            ]);
            expect(Parser.parseFormula("=PRODUCT()", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);

        });

        it("IF tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=IF(1,3,4)", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=IF(TRUE,2,3)", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=IF(0,2,3)", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=IF(\"2\",3,4)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=IF(\"TRUE\",4,5)", wb, ws).compute({}, {}, false, false)).toEqual(4);
            expect(Parser.parseFormula("=IF(\"FALSE\",4,5)", wb, ws).compute({}, {}, false, false)).toEqual(5);
            expect(Parser.parseFormula("=IF(\"sad\",2,3)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=IF({1,2,3},\"bla\",\"nbla\")", wb, ws).compute({}, {}, false, false)).toEqual("bla");
            expect(Parser.parseFormula("=IF({0,2,3},\"bla\",\"nbla\")", wb, ws).compute({}, {}, false, false)).toEqual("nbla");
            expect(Parser.parseFormula("=IF()", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=IF(1)", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=IF(0,4)", wb, ws).compute({}, {}, false, false)).toEqual(false);
            expect(Parser.parseFormula("=IF(#N/A,2,3)", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");

            expect(Parser.parseFormula("=IF({0,1,2},{1,3},{24,5,6})", wb, ws).compute({}, {}, true, false)).toEqual([
                [24, 3, "#N/A"]
            ]);
            expect(Parser.parseFormula("=IF({0,1},{1,3},{24,5,6})", wb, ws).compute({}, {}, true, false)).toEqual([
                [24, 3, "#N/A"]
            ]);
            expect(Parser.parseFormula("=IF(1,3,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                [3]
            ]);
            expect(Parser.parseFormula("=IF(TRUE,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                [2]
            ]);
            expect(Parser.parseFormula("=IF(0,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                [3]
            ]);
            expect(Parser.parseFormula("=IF(\"2\",3,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            expect(Parser.parseFormula("=IF(\"TRUE\",4,5)", wb, ws).compute({}, {}, true, false)).toEqual([
                [4]
            ]);
            expect(Parser.parseFormula("=IF(\"FALSE\",4,5)", wb, ws).compute({}, {}, true, false)).toEqual([
                [5]
            ]);
            expect(Parser.parseFormula("=IF(\"sad\",2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            expect(Parser.parseFormula("=IF({0,2,3},\"bla\",\"nbla\")", wb, ws).compute({}, {}, true, false)).toEqual([
                ["nbla", "bla", "bla"]
            ]);
            expect(Parser.parseFormula("=IF()", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=IF(1)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=IF(0,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                [false]
            ]);
            expect(Parser.parseFormula("=IF(#N/A,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
        });

        it("MEDIAN tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MEDIAN(1,2)", wb, ws).compute({}, {}, false, false)).toEqual(1.5);
            expect(Parser.parseFormula("=MEDIAN(1)", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=MEDIAN(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MEDIAN(FALSE)", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MEDIAN(\"2\")", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MEDIAN(\"sada\")", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=MEDIAN({1,2,3})", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=MEDIAN({1,2,\"3\"})", wb, ws).compute({}, {}, false, false)).toEqual(1.5);
        });

        it("INT tests", function(){
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=INT(1.4)", wb, ws).compute({}, {}, false, false)).toEqual(1);
            expect(Parser.parseFormula("=INT(-1.4)", wb, ws).compute({}, {}, false, false)).toEqual(-2);
            expect(Parser.parseFormula("=INT(0.5)", wb, ws).compute({}, {}, false, false)).toEqual(0);
            expect(Parser.parseFormula("=INT(-0.5)", wb, ws).compute({}, {}, false, false)).toEqual(-1);
            expect(Parser.parseFormula("=INT(\"DS\")", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=INT(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=INT(FALSE)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=INT(#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=INT(#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");

            expect(Parser.parseFormula("=INT(1.4)", wb, ws).compute({}, {}, true, false)).toEqual([[1]]);
            expect(Parser.parseFormula("=INT(-1.4)", wb, ws).compute({}, {}, true, false)).toEqual([[-2]]);
            expect(Parser.parseFormula("=INT(0.5)", wb, ws).compute({}, {}, true, false)).toEqual([[0]]);
            expect(Parser.parseFormula("=INT(-0.5)", wb, ws).compute({}, {}, true, false)).toEqual([[-1]]);
            expect(Parser.parseFormula("=INT(\"DS\")", wb, ws).compute({}, {}, true, false)).toEqual([["#VALUE!"]]);
            expect(Parser.parseFormula("=INT(TRUE)", wb, ws).compute({}, {}, true, false)).toEqual([["#VALUE!"]]);
            expect(Parser.parseFormula("=INT(FALSE)", wb, ws).compute({}, {}, true, false)).toEqual([["#VALUE!"]]);
            expect(Parser.parseFormula("=INT(#VALUE!)", wb, ws).compute({}, {}, true, false)).toEqual([["#VALUE!"]]);
            expect(Parser.parseFormula("=INT(#VALUE!)", wb, ws).compute({}, {}, true, false)).toEqual([["#VALUE!"]]);
            expect(Parser.parseFormula("=INT({1.4,\"ds\",TRUE,FALSE,\"2.3\",#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([[1,"#VALUE!","#VALUE!","#VALUE!",2,"#VALUE!"]]);

        });

        it("RANK tests", function(){
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            console.log(Parser.parseFormula("=RANK({\"sda\",1,2,1},{1,2},{1,1,1,1,1,0, 1})",wb,ws).toString());
            console.log(Parser.parseFormula("=RANK({\"sda\",1,2,1},{1,2},{1,1,1,1,1,0, 1})",wb,ws).compute({}, {}, false, false,true));
          //  console.log(Parser.parseFormula("=HYPERLINK(\"http://gecici.bcc.bilkent.edu.tr/cgi-bin/stars/web_sinifkimlik?iKSoSrieAA\",\"TÖREYİN BEHÇET UĞUR \")",wb,ws).compute({},{},false,false));
         //   expect(Parser.parseFormula("=RANK(4,{3,3,4,5,6},1)", wb, ws).compute({}, {}, false, false)).toEqual(3);
        });
    });

});