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
            expect(ParserUtility.getFunctionRanges(PEGParser.parse("ABS($A2:B3,$A5:C3)", "Function"))).toEqual([new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 2, null, null)), new AST.Range(new AST.Address(5, 1, null, null), new AST.Address(3, 3, null, null))]);
        });
        it("GetExprRanges", function () {
            expect(ParserUtility.getExprRanges(PEGParser.parse("=ABS($A2:$A3)", "Formula"))).toEqual([new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))]);
            expect(ParserUtility.getExprRanges(PEGParser.parse("=$A1:$A2<=$A5:B5", "Formula"))).toEqual([new AST.Range(new AST.Address(1, 1, null, null), new AST.Address(2, 1, null, null)), new AST.Range(new AST.Address(5, 1, null, null), new AST.Address(5, 2, null, null))]);
            expect(ParserUtility.getExprRanges(PEGParser.parse("=+$A1:A2", "Formula"))).toEqual([new AST.Range(new AST.Address(1, 1, null, null), new AST.Address(2, 1, null, null))]);
            expect(ParserUtility.getExprRanges(PEGParser.parse("=(B1:B2)", "Formula"))).toEqual([new AST.Range(new AST.Address(1, 2, null, null), new AST.Address(2, 2, null, null))]);
            expect(ParserUtility.getExprRanges(PEGParser.parse("=(B1:B2)%", "Formula"))).toEqual([new AST.Range(new AST.Address(1, 2, null, null), new AST.Address(2, 2, null, null))]);
            expect(function () {
                ParserUtility.getExprRanges({});
            }).toThrow();
        });
        it("GetRanges", function () {
            expect(ParserUtility.getRanges(PEGParser.parse("$A$2:$A3", "Reference"))).toEqual([new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))]);
            expect(ParserUtility.getRanges(PEGParser.parse("ABS($A2)", "Function"))).toEqual([]);
            expect(function () {
                ParserUtility.getRanges({});
            }).toThrow();
            expect(ParserUtility.getRanges(PEGParser.parse("$A2", "Reference"))).toEqual([]);
            //Named reference
            //xexpect(ParserUtility.getRanges(PEGParser.parse("_dsadsa", "Reference"))).toEqual([]);
            expect(ParserUtility.getRanges(PEGParser.parse("ABS($A2)", "Function"))).toEqual([]);
            expect(ParserUtility.getRanges(PEGParser.parse("232", "Constant"))).toEqual([]);
            expect(ParserUtility.getRanges(PEGParser.parse("\"asdsa\"", "Constant"))).toEqual([]);
        });

        it("GetSCAddressReferenceRange", function () {
            var addr = new AST.Address(3, 2, "sheet", "book");
            expect(ParserUtility.getSCAddressReferenceRanges(new AST.ReferenceAddress("sheet", addr))).toEqual([addr]);
        });

        it("GetSCFunctionRanges", function () {
            expect(ParserUtility.getSCFunctionRanges(PEGParser.parse("INDEX($A2)", "Function"))).toEqual([]);
            expect(ParserUtility.getSCFunctionRanges(PEGParser.parse("ABS($A2)", "Function"))).toEqual([new AST.Address(2, 1, null, null)]);
        });

        it("GetSCExprRanges", function () {
            expect(ParserUtility.getSCExprRanges(PEGParser.parse("=ABS($A2)", "Formula"))).toEqual([new AST.Address(2, 1, null, null)]);
            expect(ParserUtility.getSCExprRanges(PEGParser.parse("=$A2+$A3", "Formula"))).toEqual([new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)]);
            expect(ParserUtility.getSCExprRanges(PEGParser.parse("=+$A3", "Formula"))).toEqual([new AST.Address(3, 1, null, null)]);
            expect(ParserUtility.getSCExprRanges(PEGParser.parse("=(+$B3)", "Formula"))).toEqual([new AST.Address(3, 2, null, null)]);

        });

        it("GetSCRanges", function () {
            expect(ParserUtility.getSCRanges(PEGParser.parse("$A$2:$A3", "Reference"))).toEqual([]);
           expect(ParserUtility.getSCRanges(PEGParser.parse("232", "Constant"))).toEqual([]);
            expect(ParserUtility.getSCRanges(PEGParser.parse("\"asdsa\"", "Constant"))).toEqual([]);
            expect(ParserUtility.getSCRanges(PEGParser.parse("$A2", "Reference"))).toEqual([new AST.Address(2, 1, null, null)]);
            expect(function () {
                ParserUtility.getSCRanges({});
            }).toThrow();
        });

    });
});
