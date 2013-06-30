TestCase("ParserUtilityTest", {
    "test PuntedFunction": function () {
        "use strict";
        assertEquals(true, ParserUtility.puntedFunction("INDEX"));
        assertEquals(true, ParserUtility.puntedFunction("HLOOKUP"));
        assertEquals(true, ParserUtility.puntedFunction("VLOOKUP"));
        assertEquals(true, ParserUtility.puntedFunction("LOOKUP"));
        assertEquals(true, ParserUtility.puntedFunction("OFFSET"));
        assertEquals(false, ParserUtility.puntedFunction(""));
    },
    "test GetRangeReferenceRanges": function () {
        "use strict";
        var rng = new AST.Range(new AST.Address(3, 4, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"))
        var a = new AST.ReferenceRange("Sheet", rng);
        assertEquals([rng], ParserUtility.getRangeReferenceRanges(a));
        assertException(function () {
            ParserUtility.getRangeReferenceRanges({});
        });
    },
    "test GetFunctionRanges": function () {
        "use strict";
        //Already tested
        var refFunc = PEGParser.parse("INDEX($A2)", "Function");
        assertEquals([], ParserUtility.getFunctionRanges(refFunc));
        refFunc = PEGParser.parse("ABS($A2)", "Function");
        assertEquals([], ParserUtility.getFunctionRanges(refFunc));
        var resf = ParserUtility.getFunctionRanges(PEGParser.parse("ABS($A2:B3,$A5:C3)", "Function"));
        assert(resf[0].getXLeft() === 1 && resf[0].getXRight() === 2 && resf[0].getYTop() === 2 && resf[0].getYBottom() === 3);
        assert(resf[1].getXLeft() === 1 && resf[1].getXRight() === 3 && resf[1].getYTop() === 5 && resf[1].getYBottom() === 3);
    },
    "test GetExprRanges": function () {
        "use strict";
        var res = ParserUtility.getExprRanges(PEGParser.parse("=ABS($A2:$A3)", "Formula"));
        assert(res[0].getXLeft() === 1 && res[0].getXRight() === 1 && res[0].getYTop() === 2 && res[0].getYBottom() === 3);
        res = ParserUtility.getExprRanges(PEGParser.parse("$A1:$A2<=$A5:B5", "BinOpExpr"));
        assert(res[0].getXLeft() === 1 && res[0].getXRight() === 1 && res[0].getYTop() === 1 && res[0].getYBottom() === 2);
        assert(res[1].getXLeft() === 1 && res[1].getXRight() === 2 && res[1].getYTop() === 5 && res[1].getYBottom() === 5);
        res = ParserUtility.getExprRanges(PEGParser.parse("+$A1:A2", "UnaryOpExpr"));
        assert(res[0].getXLeft() === 1 && res[0].getXRight() === 1 && res[0].getYTop() === 1 && res[0].getYBottom() === 2);
        res = ParserUtility.getExprRanges(PEGParser.parse("(B1:B2)", "ParensExpr"));
        assert(res[0].getXLeft() === 2 && res[0].getXRight() === 2 && res[0].getYTop() === 1 && res[0].getYBottom() === 2);
        assertException(function () {
            ParserUtility.getExprRanges({});
        });

    },
    "test GetRanges": function () {
        "use strict";
        var refRng = PEGParser.parse("$A$2:$A3", "Reference");
        var refAddr = PEGParser.parse("$A2", "Reference");
        var refName = PEGParser.parse("_dsadsa", "Reference");
        var refFunc = PEGParser.parse("ABS($A2:$B3)", "Function");
        var refConst = PEGParser.parse("232", "Reference");
        var refString = PEGParser.parse("\"asdsa\"", "Reference");
        var res = ParserUtility.getRanges(refRng);
        var resf = ParserUtility.getRanges(refFunc);
        assert(resf[0].getXLeft() === 1 && resf[0].getXRight() === 2 && resf[0].getYTop() === 2 && resf[0].getYBottom() === 3);
        assertEquals([], ParserUtility.getRanges(refAddr));
        assertEquals([], ParserUtility.getRanges(refName));
        assertEquals([], ParserUtility.getRanges(refConst));
        assertEquals([], ParserUtility.getRanges(refString));
        assertArray(res);
        assertEquals(1, res.length);
        assert(res[0].getXLeft() === 1 && res[0].getXRight() === 1 && res[0].getYTop() === 2 && res[0].getYBottom() === 3);
        assertException(function () {
            ParserUtility.getRanges({});
        });
        assertEquals([], ParserUtility.getRanges(PEGParser.parse("ABS($A2)", "Function")));
    },
    "test getSCAddressReferenceRange": function () {
        "use strict";
        var addr = new AST.Address(3, 2, "sheet", "book");
        assertEquals([addr], ParserUtility.getSCAddressReferenceRanges(new AST.ReferenceAddress("sheet", addr)));
    },
    "test getSCFunctionRanges": function () {
        "use strict";
        var refFunc = PEGParser.parse("INDEX($A2)", "Function");
        assertEquals([], ParserUtility.getSCFunctionRanges(refFunc));
        refFunc = PEGParser.parse("ABS($A2)", "Function");
        var res = ParserUtility.getSCFunctionRanges(refFunc);
        assertEquals(1, res[0].X);
        assertEquals(2, res[0].Y);

    },
    "test getSCExprRanges": function () {
        "use strict";
        var res = ParserUtility.getSCExprRanges(PEGParser.parse("=ABS($A2)", "Formula"));
        assertEquals(1, res[0].X);
        assertEquals(2, res[0].Y);
        res= ParserUtility.getSCExprRanges(PEGParser.parse("$A2+$A3", "BinOpExpr"));
        assertEquals(1, res[0].X);
        assertEquals(2, res[0].Y);
        assertEquals(1, res[1].X);
        assertEquals(3, res[1].Y);
        res = ParserUtility.getSCExprRanges(PEGParser.parse("+$A3", "UnaryOpExpr"));
        assertEquals(1, res[0].X);
        assertEquals(3, res[0].Y);
        res = ParserUtility.getSCExprRanges(PEGParser.parse("=(+$B3)", "Formula"));
        assertEquals(2, res[0].X);
        assertEquals(3, res[0].Y);
    },

    "test getSCRanges": function () {
        "use strict";
        var refRng = PEGParser.parse("$A$2:$A3", "Reference");
        var refAddr = PEGParser.parse("$A2", "Reference");
        var refName = PEGParser.parse("_dsadsa", "Reference");
        var refFunc = PEGParser.parse("ABS($A2)", "Function");
        var refConst = PEGParser.parse("232", "Reference");
        var refString = PEGParser.parse("\"asdsa\"", "Reference");
        assertEquals([], ParserUtility.getSCRanges(refRng));
        assertEquals([], ParserUtility.getSCRanges(refName));
        assertEquals([], ParserUtility.getSCRanges(refConst));
        assertEquals([], ParserUtility.getSCRanges(refString));
        var res = ParserUtility.getSCRanges(refAddr);
        assert(res[0].X===1 && res[0].Y===2);
        res = ParserUtility.getSCRanges(refFunc);
        assert(res[0].X===1 && res[0].Y===2);
        assertException(function(){
           ParserUtility.getSCRanges({});
        });
    }
});
