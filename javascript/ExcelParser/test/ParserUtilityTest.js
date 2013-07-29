define(["Parser/ParserUtility", "Parser/AST/AST", "Parser/PEGParser"], function (ParserUtility, AST, PEGParser) {
    describe("PuntedFunction", function () {
        it("PuntedFunction", function () {
            var punted = ["ADDRESS", "AREAS", "CHOOSE", "COLUMN", "COLUMNS", "GETPIVOTDATA", "HLOOKUP", "HYPERLINK", "INDEX", "INDIRECT", "LOOKUP", "MATCH", "OFFSET", "ROW", "ROWS", "RTD", "TRANSPOSE", "VLOOKUP"];
            var val = punted[Math.floor(Math.random() % punted.length)];
            expect(ParserUtility.puntedFunction(val)).toEqual(true);
            expect(ParserUtility.puntedFunction("")).toEqual(false);
        });
        it("GetRangeReferenceRanges", function () {
            var rng = new AST.Range(new AST.Address(3, 4, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            var a = new AST.ReferenceRange("Sheet", rng);
            expect(ParserUtility.getRangeReferenceRanges(a)).toEqual([rng]);
            expect(function () {
                ParserUtility.getRangeReferenceRanges({});
            }).toThrow();
        });
        it("GetFunctionRanges", function () {
            var refFunc = PEGParser.parse("INDEX($A2)", "Function");
            expect(ParserUtility.getFunctionRanges(refFunc)).toEqual([]);
            refFunc = PEGParser.parse("ABS($A2)", "Function");
            expect(ParserUtility.getFunctionRanges(refFunc)).toEqual([]);
            var resf = ParserUtility.getFunctionRanges(PEGParser.parse("ABS($A2:B3,$A5:C3)", "Function"));
            expect(resf[0].getXLeft() === 1 && resf[0].getXRight() === 2 && resf[0].getYTop() === 2 && resf[0].getYBottom() === 3).toEqual(true);
            expect(resf[1].getXLeft() === 1 && resf[1].getXRight() === 3 && resf[1].getYTop() === 5 && resf[1].getYBottom() === 3).toEqual(true);

        });
        it("GetExprRanges", function () {
            var res = ParserUtility.getExprRanges(PEGParser.parse("=ABS($A2:$A3)", "Formula"));
            expect(res[0].getXLeft() === 1 && res[0].getXRight() === 1 && res[0].getYTop() === 2 && res[0].getYBottom() === 3).toBeTruthy();
            res = ParserUtility.getExprRanges(PEGParser.parse("$A1:$A2<=$A5:B5", "BinOpExpr"));
            expect(res[0].getXLeft() === 1 && res[0].getXRight() === 1 && res[0].getYTop() === 1 && res[0].getYBottom() === 2).toBeTruthy();
            expect(res[1].getXLeft() === 1 && res[1].getXRight() === 2 && res[1].getYTop() === 5 && res[1].getYBottom() === 5).toBeTruthy();
            res = ParserUtility.getExprRanges(PEGParser.parse("+$A1:A2", "UnaryOpExpr"));
            expect(res[0].getXLeft() === 1 && res[0].getXRight() === 1 && res[0].getYTop() === 1 && res[0].getYBottom() === 2).toBeTruthy();
            res = ParserUtility.getExprRanges(PEGParser.parse("(B1:B2)", "ParensExpr"));
            expect(res[0].getXLeft() === 2 && res[0].getXRight() === 2 && res[0].getYTop() === 1 && res[0].getYBottom() === 2).toBeTruthy()
            expect(function () {
                ParserUtility.getExprRanges({});
            }).toThrow();
        });

    });
});