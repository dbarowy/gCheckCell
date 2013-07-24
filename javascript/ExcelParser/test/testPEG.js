/**
 * This file tries to test the PEG grammar rules derived from ExcelParser.Parser.fs
 * The only way I find to test the rules is to write create a parser from the rules in each test case
 * Everytime a new rule is added/modified the respective test should be modified. This is not ideal as I have two
 * instances of the same code.
 *
 */
require({
    baseUrl : "/test/src/"
},["Parser/PEGParser", "Parser/AST/AST", "FSharp/FSharp"], function(PEGParser,AST,FSharp) {
TestCase("TestPEG",
    {
        "testInt32": function () {
            "use strict";
            assertEquals(-123, PEGParser.parse("-123", "Int32"));
            assertEquals(+21, PEGParser.parse("+21", "Int32"));
            assertEquals(9, PEGParser.parse("0x9", "Int32"));
            assertEquals(16, PEGParser.parse("0x10", "Int32"));
            assertEquals(3, PEGParser.parse("0b11", "Int32"));
            assertException(function () {
                PEGParser.parse("-xx", "Int32");
            });
        },
        "test AddrR": function () {
            "use strict";
            assertEquals(-123, PEGParser.parse("R-123", "AddrR"));
            assertException(function () {
                PEGParser.parse("", "AddrR");
            });
            assertException(function () {
                PEGParser.parse("R", "AddrR");
            });
            assertException(function () {
                PEGParser.parse("Rrr", "AddrR");
            });
        },
        "test AddrR1C1": function () {
            "use strict";
            var a = PEGParser.parse("R1C2", "AddrR1C1");
            assertInstanceOf(AST.Address, a);
            assert(a.X === 2 && a.Y === 1 && a.WorkbookName === null && a.WorksheetName === null);
            assertException(function () {
                PEGParser.parse("R1", "AddrR1C1");
            });
        },
        "test AddrA": function () {
            "use strict";
            assertEquals("ABCD", PEGParser.parse("ABCD", "AddrA"));
            assertException(function () {
                PEGParser.parse("", "AddrA");
            });
            assertException(function () {
                PEGParser.parse("1", "AddrA");
            });
        },
        "test AddrAAbs": function () {
            "use strict";
            assertEquals("ABCD", PEGParser.parse("$ABCD", "AddrAAbs"));
            assertEquals("ABCD", PEGParser.parse("ABCD", "AddrAAbs"));
            assertEquals("abcd", PEGParser.parse("abcd", "AddrAAbs"));
            assertException(function () {
                PEGParser.parse("21", "AddrAAbs");
            });
            assertException(function () {
                PEGParser.parse("", "AddrAAbs");
            });
        },
        "test Addr1Abs": function () {
            "use strict";
            assertEquals("123", PEGParser.parse("$123", "Addr1Abs"));
            assertEquals("123", PEGParser.parse("123", "Addr1Abs"));
            assertException(function () {
                PEGParser.parse("A", "Addr1Abs");
            });
            assertException(function () {
                PEGParser.parse("", "Addr1Abs");
            });
            assertException(function () {
                PEGParser.parse("a", "Addr1Abs");
            });
        },
        "test AddrA1": function () {
            "use strict";
            var a = PEGParser.parse("$A$2", "AddrA1");
            assertInstanceOf(AST.Address, a);
            assertInstanceOf(AST.Address, PEGParser.parse("RZ34", "AddrA1"));
            assertEquals(1, a.X);
            assertEquals(2, a.Y);
            assertEquals(null, a.WorkbookName);
            assertEquals(null, a.WorksheetName);
        },
        "test AnyAddr": function () {
            "use strict";
            var a = PEGParser.parse("R2", "AnyAddr");
            var b = PEGParser.parse("R2C3", "AnyAddr");
            assertInstanceOf(AST.Address, PEGParser.parse("$A$2", "AnyAddr"));
            assertInstanceOf(AST.Address, b);
            assertInstanceOf(AST.Address, PEGParser.parse("R2", "AnyAddr"));
            assertException(function () {
                PEGParser.parse("$A$2:$B$3", "AnyAddr");
            });
            assertEquals(18, a.X);
            assertEquals(2, a.Y);
            assertEquals(null, a.WorkbookName);
            assertEquals(null, a.WorksheetName);
            assertEquals(3, b.X);
            assertEquals(2, b.Y);
            assertEquals(null, b.WorkbookName);
            assertEquals(null, b.WorksheetName);
        },
        "test MoreAddrR1C1": function () {
            "use strict";
            var a = PEGParser.parse(":R2C3", "MoreAddrR1C1");
            assertInstanceOf(AST.Address, a);
            assertEquals(2, a.Y);
            assertEquals(3, a.X);
            assertEquals(null, a.WorksheetName);
            assertEquals(null, a.WorkbookName);
            assertException(function () {
                PEGParser.parse("a", "MoreAddrR1C1");
            });
            assertException(function () {
                PEGParser.parse(":23", "MoreAddrR1C1");
            });
        },
        "test RangeR1C1": function () {
            "use strict";
            var a = PEGParser.parse("R1C1:R4C4", "RangeR1C1");
            assertInstanceOf(AST.Range, a);
            assert(a.getXLeft() === 1 && a.getYTop() === 1 && a.getXRight() === 4 && a.getYBottom() === 4);

        },
        "test MoreAddrA1": function () {
            "use strict";
            var a = PEGParser.parse(":A5", "MoreAddrA1");
            assertInstanceOf(AST.Address, a);
            assertEquals(1, a.X);
            assertEquals(5, a.Y);
            assertInstanceOf(AST.Address, PEGParser.parse(":a5", "MoreAddrA1"));
            assertException(function () {
                PEGParser.parse("a", "MoreAddrA1");
            });
            assertException(function () {
                PEGParser.parse(":23", "MoreAddrA1");
            });
        },
        "test RangeA1": function () {
            "use strict";
            var a = PEGParser.parse("A5:A6", "RangeA1");
            assertInstanceOf(AST.Range, a);
            assertEquals(1, a.getXLeft());
            assertEquals(5, a.getYTop());
            assertEquals(1, a.getXRight());
            assertEquals(6, a.getYBottom());
            assertInstanceOf(AST.Range, PEGParser.parse("$A5:$A6", "RangeA1"));
            assertException(function () {
                PEGParser.parse("a", "RangeA1");
            });
            assertException(function () {
                PEGParser.parse(":23", "RangeA1");
            });
        },
        "test RangeAny": function () {
            "use strict";
            assertInstanceOf(AST.Range, PEGParser.parse("A5:A6", "RangeAny"));
            assertInstanceOf(AST.Range, PEGParser.parse("$A5:$A6", "RangeAny"));
            assertInstanceOf(AST.Range, PEGParser.parse("R1:C4", "RangeAny"));
        },
        "test WorksheetNameQuoted": function () {
            "use strict";
            assertEquals("Sheet", PEGParser.parse("'Sheet'", "WorksheetNameQuoted"));
            assertException(function () {
                PEGParser.parse("'Sheet", "WorksheetNameQuoted");
            });
            //TODO This should not be allowed. Fix the grammar
    /*        assertException(function () {
                PEGParser.parse("'sheet'''", "WorksheetNameQuoted");
            });*/
            assertException(function () {
                PEGParser.parse("''", "WorksheetNameQuoted");
            });
        },
        "test WorksheetNameUnquoted": function () {
            "use strict";
            assertEquals("Sheet", PEGParser.parse("Sheet", "WorksheetNameUnquoted"));
            assertException(function () {
                PEGParser.parse("'Sheet", "WorksheetNameUnquoted");
            });
            assertException(function () {
                PEGParser.parse("'sheet'''", "WorksheetNameUnquoted");
            });
        },
        "test WorksheetName": function () {
            "use strict";
            assertEquals("Sheet", PEGParser.parse("Sheet", "WorksheetName"));
            assertEquals("Sheet", PEGParser.parse("'Sheet'", "WorksheetName"));
            assertException(function () {
                PEGParser.parse("'Sheet", "WorksheetName");
            });
        },
        "test WorkbookName": function () {
            "use strict";
            assertEquals("Book", PEGParser.parse("[Book]", "WorkbookName"));
            assertException(function () {
                PEGParser.parse("[]", "WorkbookName");
            });
            assertException(function () {
                PEGParser.parse("", "WorkbookName");
            });
        },
        "test Workbook": function () {
            "use strict";
            assertEquals("Book", PEGParser.parse("[Book]", "Workbook"));
            assertInstanceOf(FSharp.None, PEGParser.parse("", "Workbook"));
        },
        "test RangeReferenceWorksheet": function () {
            "use strict";
            var a = PEGParser.parse("'Worksheet'!$A$2:$A3", "RangeReferenceWorksheet");
            assertInstanceOf(AST.ReferenceRange, a);
            assertEquals(1, a.Range.getXLeft());
            assertEquals(1, a.Range.getXRight());
            assertEquals(2, a.Range.getYTop());
            assertEquals(3, a.Range.getYBottom());
            assertEquals("ReferenceRange(Worksheet,(2,1),(3,1))", a.toString());
            var b = PEGParser.parse("'Worksheet'!$A$2:$A3", "RangeReferenceWorksheet");
            assertInstanceOf(AST.ReferenceRange, b);
            assertEquals(1, b.Range.getXLeft());
            assertEquals(1, b.Range.getXRight());
            assertEquals(2, b.Range.getYTop());
            assertEquals(3, b.Range.getYBottom());
            assertEquals("ReferenceRange(Worksheet,(2,1),(3,1))", a.toString());
            assertException(function () {
                PEGParser.parse("$A$2", "RangeReferenceWorksheet");
            });
            assertException(function () {
                PEGParser.parse("'$A$2'", "RangeReferenceWorksheet");
            });
        },
        "test RangeReferenceNoWorksheet": function () {
            "use strict";
            var a = PEGParser.parse("$A2:$B3", "RangeReferenceNoWorksheet");
            assertInstanceOf(AST.ReferenceRange, a);
            assertEquals(1, a.Range.getXLeft());
            assertEquals(2, a.Range.getXRight());
            assertEquals(2, a.Range.getYTop());
            assertEquals(3, a.Range.getYBottom());
            assertException(function () {
                PEGParser.parse("'Worksheet'!$A$2:$A3", "RangeReferenceNoWorksheet");
            });
        },
        "test AddressReferenceWorksheet": function () {
            "use strict";
            var a = PEGParser.parse("'Worksheet'!$A$2", "AddressReferenceWorksheet");
            assertEquals("ReferenceAddress(Worksheet, (2,1))", a);
            assertInstanceOf(AST.ReferenceAddress, a);
            assertException(function () {
                PEGParser.parse("'Worksheet'!$A$2:$A3", "AddressReferenceWorksheet");
            });
        },

        "test AddressReferenceNoWorksheet": function () {
            "use strict";
            var a = PEGParser.parse("$A$2", "AddressReferenceNoWorksheet");
            assertInstanceOf(AST.ReferenceAddress, a);
            assertEquals("ReferenceAddress(None, (2,1))", a.toString());
            assertInstanceOf(AST.ReferenceAddress, PEGParser.parse("R2C3", "AddressReferenceNoWorksheet"));
            assertException(function () {
                PEGParser.parse("'Worksheet'!$A3", "AddressReferenceNoWorksheet");
            });
        },
        "test NamedReference": function () {
            "use strict";
            var a = PEGParser.parse("_lala", "NamedReference");
            var b = PEGParser.parse("Workbook!lala", "NamedReference");
            assertInstanceOf(AST.ReferenceNamed, b);
            assertEquals("Workbook", b.WorkbookName);
            assertInstanceOf(AST.ReferenceNamed, a);
            assertInstanceOf(AST.ReferenceNamed, PEGParser.parse("_", "NamedReference"));
            assertEquals("ReferenceName(None, _lala)", a.toString());
            assertException(function () {
                PEGParser.parse("23", "NamedReference");
            });
            assertException(function () {
                PEGParser.parse("", "NamedReference");
            });


        },
        "test StringReference": function () {
            "use strict";
            var a = PEGParser.parse('"test"', "StringConstant");
            assertInstanceOf(AST.ReferenceString, PEGParser.parse("\"asd\"", "StringConstant"));
            assertEquals("String(test)", a.toString());
            assertException(function () {
                PEGParser.parse('"', "StringConstant");
            });
            assertEquals("String(bla\")", PEGParser.parse("\"bla\"\"\"", "StringConstant").toString());
        },
        "test ConstantReference": function () {
            "use strict";
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            var a = PEGParser.parse("23", "NumericalConstant");
            assertEquals("Constant(23)", a.toString());
            assertEquals("Constant(130)", PEGParser.parse("1.3e2", "NumericalConstant"));
            a.Resolve(wb, ws);
            assertEquals(a.WorkbookName, "book");
            assertEquals(a.WorksheetName, "sheet");

        },
        "test LogicalConstant":function(){
            "use strict";
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            var a = PEGParser.parse("TRUE", "LogicalConstant");
            assertEquals("Logical(TRUE)", a.toString());
            a.Resolve(wb,ws);
            assertEquals(a.WorkbookName, "book");
            assertEquals(a.WorksheetName, "sheet");
            assertException(function(){
                PEGParser.parse("\"True\"", "LogicalConstant");
            });
        },
        "test ErrorConstant":function(){
            "use strict";
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            var a = PEGParser.parse("#DIV/0!", "ErrorConstant");
            assertEquals("Error(#DIV/0!)", a.toString());
            a.Resolve(wb,ws);
            assertEquals(a.WorkbookName, "book");
            assertEquals(a.WorksheetName, "sheet");
            assertException(function(){
                PEGParser.parse("DIV", "ErrorConstant");
            });
        },
        "test Reference": function () {
            "use strict";
            //String reference
            assertInstanceOf(AST.ReferenceRange, PEGParser.parse("'Worksheet'!$A$2:$A3", "Reference"));
            assertInstanceOf(AST.ReferenceRange, PEGParser.parse("[Workbook]'Worksheet'!$A$2:$A3", "Reference"));
            assertInstanceOf(AST.ReferenceAddress, PEGParser.parse("'Worksheet'!$A$2", "Reference"));
            assertInstanceOf(AST.ReferenceAddress, PEGParser.parse("[Workbook]'Worksheet'!$A$2", "Reference"));
            assertException(function () {
                PEGParser.parse("$232", "Reference");
            });
            assertException(function () {
                PEGParser.parse("", "Reference");
            });
        },
        "test ExpressionAtom": function () {
            "use strict";
            var a = PEGParser.parse("la()", "ExpressionAtom");
            assertInstanceOf(AST.ReferenceExpr, a);
            assertInstanceOf(AST.ReferenceFunction, a.Ref);
            assertEquals("la()", a.Ref.toString());
            a = PEGParser.parse("ABS($A2)", "ExpressionAtom");
            assertInstanceOf(AST.ReferenceExpr, a);
            assertInstanceOf(AST.ReferenceFunction, a.Ref);
            assertEquals("ABS(ReferenceExpr.ReferenceAddress(None, (2,1)))", a.Ref.toString());
            a = PEGParser.parse("$A$2", "ExpressionAtom");
            assertInstanceOf(AST.ReferenceAddress, a.Ref);
            assertEquals("ReferenceAddress(None, (2,1))", a.Ref.toString());
            assertException(function () {
                PEGParser.parse("($A2)", "ExpressionAtom");
            });
            assertException(function () {
                PEGParser.parse("", "ExpressionAtom");
            });
        },
        "test ParensExpr": function () {
            "use strict";
            var a = PEGParser.parse("(B4)", "ParensExpr");
            assertInstanceOf(AST.ParensExpr, a);
            assertInstanceOf(AST.ReferenceExpr, a.Expr);
            assertInstanceOf(AST.ReferenceAddress, a.Expr.Ref);
            assertEquals("(4,2)", a.Expr.Ref.Address.toString());
            assertEquals("ParensExpr(ReferenceExpr.ReferenceAddress(None, (4,2)))", a.toString());
            assertException(function () {
                PEGParser.parse("()", "ParensExpr");
            });
        },

        "test Function": function () {
            "use strict";
            var a = PEGParser.parse("ABS()", "Function");
            assertInstanceOf(AST.ReferenceFunction, a);
            assertEquals("ABS()", a.toString());
            a = PEGParser.parse("ABS($A2:$A5,$A5,R2C5)", "Function");
            assertInstanceOf(AST.ReferenceFunction, a);
            assertEquals("ABS(ReferenceExpr.ReferenceRange(None, (2,1),(5,1)),ReferenceExpr.ReferenceAddress(None, (5,1)),ReferenceExpr.ReferenceAddress(None, (2,5)))", a.toString());

            assertException(function () {
                PEGParser.parse("", "Function");
            });
        },
        "test Formula": function () {
            "use strict";
            //TODO the bulk of the test cases should go here
            assertEquals("ReferenceExpr.ABS()", PEGParser.parse("=ABS()", "Formula").toString());
            console.log(PEGParser.parse("=SUM(A1*B1%)", "Formula"));
/*            assertEquals("ReferenceExpr.ReferenceAddress(None, (23,1))", PEGParser.parse("=A23", "Formula").toString());
            assertEquals("ReferenceExpr.ReferenceRange(None, (23,1),(45,1))", PEGParser.parse("=A23:A45", "Formula").toString());
            assertEquals("ReferenceExpr.ReferenceRange(Sheet2,(4,1),(20,1))", PEGParser.parse("=Sheet2!A4:A20", "Formula").toString());
            assertEquals("ReferenceExpr.ReferenceAddress(Sheet3, (1,1))", PEGParser.parse("=[workbook2.xls]Sheet3!A1", "Formula").toString());
            assertEquals("workbook2.xls", PEGParser.parse("=[workbook2.xls]Sheet3!A1", "Formula").Ref.WorkbookName);
            assertEquals("ReferenceExpr.ReferenceRange(None, (3,4),(20,4))", PEGParser.parse("=R3C4:R20C4", "Formula").toString());
            assertEquals("ReferenceExpr.ReferenceName(None, SardineExports)", PEGParser.parse("=SardineExports", "Formula").toString());
            assertEquals("ReferenceExpr.ABS(ReferenceExpr.ReferenceAddress(None, (23,1)))", PEGParser.parse("=ABS(A23)", "Formula"));
            assertEquals("ReferenceExpr.SUM(ReferenceExpr.ReferenceRange(Sheet2,(4,1),(20,1)))", PEGParser.parse("=SUM(Sheet2!A4:A20)", "Formula"));
            assertEquals("ReferenceExpr.SUM(ReferenceExpr.ReferenceAddress(Sheet3, (1,1)))", (PEGParser.parse("=SUM([workbook2.xls]Sheet3!A1)", "Formula")));*/
           /* assertEquals("ReferenceExpr.SUM(ReferenceExpr.ReferenceName(None, SardineExports))", PEGParser.parse("=SUM(SardineExports)", "Formula"));
            assertEquals("ReferenceExpr.INDEX(ReferenceExpr.ReferenceName(None, SardineExports),ReferenceExpr.Constant(5))", PEGParser.parse("=INDEX(SardineExports,5)", "Formula"));*/
        }
    });

});