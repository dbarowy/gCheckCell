/**
 This file is part of CheckCell for Google Spreadsheets and Office 2013.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with GCC; see the file COPYING3.  If not see
 <http://www.gnu.org/licenses/>.
 */
define(["Parser/AST/AST", "FSharp/FSharp", "XClasses/XTypes" , "Parser/Parser", "XClasses/XTypedValue"], function (AST, FSharp, XTypes, Parser, XTypedValue) {

    describe('Address test', function () {
        var address;
        beforeEach(function () {
            address = new AST.Address(2, 3, "sheetName", "workbookName");
        });
        it("charColToInt", function () {
            expect(AST.Address.charColToInt("A")).toEqual(1);
            expect(AST.Address.charColToInt("z")).toEqual(26);
            expect(AST.Address.charColToInt("Aa")).toEqual(27);
            expect(AST.Address.charColToInt("AB")).toEqual(28);
            expect(function () {
                AST.Address.charColToInt("A4");
            }).toThrow();
            expect(function () {
                AST.Address.charColToInt("");
            }).toThrow();
            expect(function () {
                AST.Address.charColToInt("%");
            }).toThrow();
        });
        it("IntToCharCol", function () {
            expect(AST.Address.intToColChars(1)).toEqual("A");
            expect(AST.Address.intToColChars(26)).toEqual("Z");
            expect(AST.Address.intToColChars(27)).toEqual("AA");
            expect(AST.Address.intToColChars(28)).toEqual("AB");
            expect(function () {
                AST.Address.intToColChars(-23);
            }).toThrow();
            expect(function () {
                AST.Address.intToColChars(0);
            }).toThrow();
            expect(function () {
                AST.Address.intToColChars();
            }).toThrow();
            expect(function () {
                AST.Address.intToColChars("as");
            }).toThrow();
        });

        it("AddressConstructor", function () {
            var a = new AST.Address(2, 3, "sheetName", "workbookName");
            expect(a.X).toEqual(3);
            expect(a.Y).toEqual(2);
            expect(a.WorksheetName).toEqual("sheetName");
            expect(a.WorkbookName).toEqual("workbookName");
            var b = new AST.Address(2, "C", "sheetName", "workbookName");
            expect(b.X).toEqual(3);
            expect(b.Y).toEqual(2);
            expect(b.WorksheetName).toEqual("sheetName");
            expect(b.WorkbookName).toEqual("workbookName");
        });

        it("getA1Local", function () {
            expect(address.getA1Local()).toEqual("C2");
        });

        it("getA1Worksheet", function () {
            var a = new AST.Address(2, 3, null, "book");
            expect(function () {
                a.getA1Worksheet();
            }).toThrow();
            expect(address.getA1Worksheet()).toEqual("sheetName");
        });
        it("getA1Workbook", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            expect(function () {
                a.getA1Workbook();
            }).toThrow();
            expect(address.getA1Workbook()).toEqual("workbookName");
        });
        it("getA1FullyQualified", function () {
            expect(address.getA1FullyQualified()).toEqual("[workbookName]sheetName!C2");
        });
        it("getR1C1", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            var b = new AST.Address(2, 3, null, "book");
            expect(address.getR1C1()).toEqual("[workbookName]sheetName!R2C3");
            expect(a.getR1C1()).toEqual("sheet!R2C3");
            expect(b.getR1C1()).toEqual("[book]R2C3");
        });
        it("getHashCode", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            var b = new AST.Address(2, 3, null, "book");
            expect(address.getHashCode()).toEqual("workbookName_sheetName_3_2");
            expect(function () {
                a.getHashCode();
            }).toThrow();
            expect(function () {
                b.getHashCode();
            }).toThrow();
        });

        it("insideRange", function () {
            var rng = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            var rng2 = new AST.Range(new AST.Address(4, 4, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            expect(address.insideRange(rng)).toEqual(true);
            expect(address.insideRange(rng2)).toEqual(false);
        });
        it("InsideAddress", function () {
            var a = new AST.Address(1, 1, "sheet", "book");
            var b = new AST.Address(2, 3, "sheet", "book");
            expect(address.insideAddr(a)).toEqual(false);
            expect(address.insideAddr(b)).toEqual(true);
        });
        it("toString", function () {
            expect(address.toString()).toEqual("(2,3)");
        });
    });

    describe("ConstantError", function () {
        var err;
        beforeEach(function () {
            err = new AST.ConstantError("sheet", "#VALUE!");
        });
        it("toString", function () {
            expect(err.toString()).toEqual("Error(#VALUE!)");
        });
    });
    describe("ConstantLogical", function () {
        var log;
        beforeEach(function () {
            log = new AST.ConstantLogical("sheet", "TRUE");
        });
        it("toString", function () {
            expect(log.toString()).toEqual("Logical(true)");
        });
        it("compute", function () {
            var alog = new AST.ConstantLogical("sheet", "FALSE");
            expect(log.compute({}, {})).toEqual({value: true, type: XTypes.Boolean});
            expect(alog.compute({}, {})).toEqual({value: false, type: XTypes.Boolean});

        });
    });

    describe("ConstantNumber", function () {
        var number;
        beforeEach(function () {
            number = new AST.ConstantNumber(null, 233);
        });
        it("toString", function () {
            expect(number.toString()).toEqual("Constant(233)");
        });
        it("compute", function () {
            expect(number.compute({}, {})).toEqual({value: 233, type: XTypes.Number});
        })

    });

    describe("ConstantString", function () {
        var str;
        beforeEach(function () {
            str = new AST.ConstantString(null, "dsa");
        });
        it("toString", function () {
            expect(str.toString()).toEqual("String(dsa)");
        });
        it("compute", function () {
            expect(str.compute({}, {})).toEqual({value: "dsa", type: XTypes.String});
        })
    });
    describe("ParensExpr", function () {
        var parens;
        var parexpr;
        beforeEach(function () {
            var expr = jasmine.createSpyObj('expr', ['resolve', 'fixAssoc', 'compute']);
            parens = new AST.ParensExpr("test");
            parexpr = new AST.ParensExpr(expr);
        });
        it("toString", function () {
            expect(parens.toString()).toEqual("ParensExpr(test)")
        });
        it("resolve", function () {
            parexpr.resolve({Name: "book"}, {Name: "sheet"});
            expect(parexpr.Expr.resolve).toHaveBeenCalled();
        });
        it("fixAssoc", function () {
            parexpr.fixAssoc();
            expect(parexpr.Expr.fixAssoc).toHaveBeenCalled();
        });
        it("compute", function () {
            parexpr.compute();
            expect(parexpr.Expr.compute).toHaveBeenCalled();
        });
    });

    describe("PostfixOpExpr", function () {
        var postfix;
        var postfix2;
        beforeEach(function () {
            var expr = jasmine.createSpyObj('expr', ['resolve', 'fixAssoc', 'compute']);
            postfix = new AST.PostfixOpExpr("%", new AST.ConstantNumber(null, 123));
            postfix2 = new AST.PostfixOpExpr("%", expr);
        });
        it("toString", function () {
            expect(postfix.toString()).toEqual("PostfixOpExpr(\"%\",Constant(123))");
        });
        it("resolve", function () {
            postfix2.resolve({Name: "book"}, {Name: "sheet"});
            expect(postfix2.Expr.resolve).toHaveBeenCalled();
        });
        it("fixAssoc", function () {
            postfix2.fixAssoc();
            expect(postfix2.Expr.fixAssoc).toHaveBeenCalled();
        });
        it("compute", function () {
            expect(postfix.compute({}, {}, false, false, false)).toEqual({value: 1.23, type: XTypes.Number});
        });
    });

    describe("Range", function () {
        var range;
        beforeEach(function () {
            range = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
        });
        it("toString", function () {
            expect(range.toString()).toEqual((new AST.Address(1, 1, "sheet", "book")).toString() + "," + (new AST.Address(5, 5, "sheet", "book")).toString());
        });
        it("insideRange", function () {
            "use strict";
            var aux = new AST.Range(new AST.Address(2, 2, "sheet", "book"), new AST.Address(3, 3, "sheet", "book"));
            expect(range.insideRange(aux)).toEqual(false);
            expect(aux.insideRange(range)).toEqual(true);
        });

    });

    describe("Reference", function () {
        it("resolve", function () {
            var wb = {};
            wb.Name = "WbName";
            var ws = {};
            ws.Name = "WsName";
            var ref = new AST.Reference(null, null);
            ref.resolve(wb, ws);
            expect(ref.WorksheetName).toEqual("WsName");
            expect(ref.WorkbookName).toEqual("WbName");
        });
    });

    describe("UnaryOpExpr", function () {
        var expr = new AST.UnaryOpExpr("+", new AST.ConstantNumber(null, 2));
        it("Constructor", function () {
            var a = new AST.UnaryOpExpr("+", new AST.ConstantNumber(null, 2));
            expect(a.Expr).toEqual(new AST.ConstantNumber(null, 2));
            expect(a.Operator).toEqual("+");
        });
        it("toString", function () {
            expect(expr.toString()).toEqual("UnaryOpExpr('+',Constant(2))");
        });
        it("compute", function () {
            var b = new AST.UnaryOpExpr("-", new AST.ConstantNumber(null, 2));
            expect(expr.compute({}, {})).toEqual({value: 2, type: XTypes.Number});
            expect(b.compute({}, {})).toEqual({value: -2, type: XTypes.Number});
        });
    });


    describe("BinOpExpr", function () {
        it("Addition", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2+3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(5, XTypes.Number));
            expect(Parser.parseFormula("=2+\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(5, XTypes.Number));
            expect(Parser.parseFormula("=2+TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3, XTypes.Number));
            expect(Parser.parseFormula("=2+DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 2), XTypes.Date));
            expect(Parser.parseFormula("=2+\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2+\"\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2+#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2+#N/A", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));

            expect(Parser.parseFormula("=TRUE+3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=TRUE+\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=TRUE+\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=TRUE+TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=TRUE+FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE+DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 1), XTypes.Date));
            expect(Parser.parseFormula("=TRUE+#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"+3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(5, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"+\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(5, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"+\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"2\"+DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 2), XTypes.Date));
            expect(Parser.parseFormula("=\"2\"+TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"+#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"+3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3, XTypes.Number));
            expect(Parser.parseFormula("=\"das\"+3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"a\"+\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsa\"+\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"das\"+DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fasfa\"+TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsafsa\"+#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)+1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 1), XTypes.Date));
            expect(Parser.parseFormula("=DATE(1900,0,31)+TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 1), XTypes.Date));
            expect(Parser.parseFormula("=DATE(1900,0,31)+\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 1), XTypes.Date));
            expect(Parser.parseFormula("=DATE(1900,0,31)+\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)+#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)+DATE(1900,0,31)+DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 2), XTypes.Date));

            expect(Parser.parseFormula("=#N/A+#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));


        });
        it("Subtraction", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2-3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1, XTypes.Number));
            expect(Parser.parseFormula("=2-\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1, XTypes.Number));
            expect(Parser.parseFormula("=2-TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=2-DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=2-\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2-\"\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2-#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2-#N/A", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));

            expect(Parser.parseFormula("=TRUE-3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-2, XTypes.Number));
            expect(Parser.parseFormula("=TRUE-\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-2, XTypes.Number));
            expect(Parser.parseFormula("=TRUE-\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=TRUE-TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=TRUE-FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE-DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=TRUE-#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"-3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"-\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"-\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"2\"-DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"-TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"-#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"-3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-3, XTypes.Number));
            expect(Parser.parseFormula("=\"das\"-3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"a\"-\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsa\"-\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"das\"-DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fasfa\"-TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsafsa\"-#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)-2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1899, 11, 29), XTypes.Date));
            expect(Parser.parseFormula("=DATE(1900,0,31)-TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1899, 11, 30), XTypes.Date));
            expect(Parser.parseFormula("=DATE(1900,0,31)-\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1899, 11, 30), XTypes.Date));
            expect(Parser.parseFormula("=DATE(1900,0,31)-\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)-#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)-DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));

            expect(Parser.parseFormula("=#N/A-#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));


        });
        it("Multiplication", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2*3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(6, XTypes.Number));
            expect(Parser.parseFormula("=2*\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(6, XTypes.Number));
            expect(Parser.parseFormula("=2*TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2*DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2*\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2*\"\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=2*#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2*#N/A", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));


            expect(Parser.parseFormula("=TRUE*3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3, XTypes.Number));
            expect(Parser.parseFormula("=TRUE*\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3, XTypes.Number));
            expect(Parser.parseFormula("=TRUE*\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=TRUE*TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE*FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=TRUE*DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE*#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"*3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(6, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"*\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(6, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"*\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"2\"*DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"*TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"*#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"*3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=\"das\"*3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"a\"*\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsa\"*\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"das\"*DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fasfa\"*TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsafsa\"*#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)*1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)*TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)*\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)*\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)*#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)*DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));

            expect(Parser.parseFormula("=#N/A+#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));


        });

        it("Division", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2/3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2 / 3, XTypes.Number));
            expect(Parser.parseFormula("=2/\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2 / 3, XTypes.Number));
            expect(Parser.parseFormula("=2/TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2/DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2/\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2/\"\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=2/#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2/#N/A", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));


            expect(Parser.parseFormula("=TRUE/3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1 / 3, XTypes.Number));
            expect(Parser.parseFormula("=TRUE/\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1 / 3, XTypes.Number));
            expect(Parser.parseFormula("=TRUE/\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=TRUE/TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE/FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=TRUE/DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE/#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"/3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2 / 3, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"/\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2 / 3, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"/\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"2\"/DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"/TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"/#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"/3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=\"das\"/3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"a\"/\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsa\"/\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"das\"/DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fasfa\"/TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsafsa\"/#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)/1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)/TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)/\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)/\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)/#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)/DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));

            expect(Parser.parseFormula("=#N/A/#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("Power", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2^3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(8, XTypes.Number));
            expect(Parser.parseFormula("=2^\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(8, XTypes.Number));
            expect(Parser.parseFormula("=2^TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2^DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=2^\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2^\"\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=2^#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2^#N/A", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));


            expect(Parser.parseFormula("=TRUE^3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE^\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE^\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=TRUE^TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE^FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE^DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=TRUE^#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"^3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(8, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"^\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(8, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"^\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"2\"^DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"^TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=\"2\"^#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"^3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=\"das\"^3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"a\"^\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsa\"^\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"das\"^DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fasfa\"^TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"fsafsa\"^#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)^1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)^TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)^\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=DATE(1900,0,31)^\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)^#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)^DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));

            expect(Parser.parseFormula("=#N/A^#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("Concatenation", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2&3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("23", XTypes.String));
            expect(Parser.parseFormula("=2&\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("23", XTypes.String));
            expect(Parser.parseFormula("=2&TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("2TRUE", XTypes.String));
            expect(Parser.parseFormula("=2&DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2 + (new Date(1899, 11, 31)).toLocaleString(), XTypes.String));
            expect(Parser.parseFormula("=2&\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("2dsa", XTypes.String));
            expect(Parser.parseFormula("=2&\"\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("2", XTypes.String));
            expect(Parser.parseFormula("=2&#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=2&#N/A", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));


            expect(Parser.parseFormula("=TRUE&3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("TRUE3", XTypes.String));
            expect(Parser.parseFormula("=TRUE&\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("TRUE3", XTypes.String));
            expect(Parser.parseFormula("=TRUE&\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("TRUEdsa", XTypes.String));
            expect(Parser.parseFormula("=TRUE&TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("TRUETRUE", XTypes.String));
            expect(Parser.parseFormula("=TRUE&FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("TRUEFALSE", XTypes.String));
            expect(Parser.parseFormula("=TRUE&DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("TRUE" + (new Date(1899, 11, 31)).toLocaleString(), XTypes.String));
            expect(Parser.parseFormula("=TRUE&#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"&3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("23", XTypes.String));
            expect(Parser.parseFormula("=\"2\"&\"3\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("23", XTypes.String));
            expect(Parser.parseFormula("=\"2\"&\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("2dsa", XTypes.String));
            expect(Parser.parseFormula("=\"2\"&DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("2" + (new Date(1899, 11, 31)).toLocaleString(), XTypes.String));
            expect(Parser.parseFormula("=\"2\"&TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("2TRUE", XTypes.String));
            expect(Parser.parseFormula("=\"2\"&#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"&3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("3", XTypes.String));
            expect(Parser.parseFormula("=\"das\"&3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("das3", XTypes.String));
            expect(Parser.parseFormula("=\"a\"&\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("a2", XTypes.String));
            expect(Parser.parseFormula("=\"fsa\"&\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("fsadsa", XTypes.String));
            expect(Parser.parseFormula("=\"das\"&DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("das" + (new Date(1899, 11, 31)).toLocaleString(), XTypes.String));
            expect(Parser.parseFormula("=\"fasfa\"&TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("fasfaTRUE", XTypes.String));
            expect(Parser.parseFormula("=\"fsafsa\"&#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)&1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue((new Date(1899, 11, 31)).toLocaleString() + 1, XTypes.String));
            expect(Parser.parseFormula("=DATE(1900,0,31)&TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue((new Date(1899, 11, 31)).toLocaleString() + "TRUE", XTypes.String));
            expect(Parser.parseFormula("=DATE(1900,0,31)&\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue((new Date(1899, 11, 31)).toLocaleString() + "1", XTypes.String));
            expect(Parser.parseFormula("=DATE(1900,0,31)&\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue((new Date(1899, 11, 31)).toLocaleString() + "dsa", XTypes.String));
            expect(Parser.parseFormula("=DATE(1900,0,31)&#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)&DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue((new Date(1899, 11, 31)).toLocaleString() + (new Date(1899, 11, 31)).toLocaleString(), XTypes.String));

            expect(Parser.parseFormula("=#N/A&#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("Equal", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2=3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2=2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2=\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=1=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=0=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2=\"sda\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=TRUE=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=FALSE=0", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"=2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"=\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"=3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"das\"=3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"a\"=\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"fsa\"=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"das\"=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"fasfa\"=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"fsafsa\"=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));

            expect(Parser.parseFormula("=#N/A=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("Different", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2<>3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<>2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2<>\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=1<>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=0<>FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<>\"sda\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=TRUE<>1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=FALSE<>0", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<>\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<>\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<>TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<>FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"<>2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<>\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<>\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"<>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"<>TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"\"<>3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"das\"<>3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"a\"<>\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"fsa\"<>\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"das\"<>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"fasfa\"<>TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"fsafsa\"<>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=DATE(1900,0,31)<>1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<>TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<>\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<>\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)<>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));

            expect(Parser.parseFormula("=#N/A<>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("LessOrEqual", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2<=3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<=2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2<=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=1<=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=3<=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=0<=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=1<=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<=\"sda\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=TRUE<=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=FALSE<=0", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"<=2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<=\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"3\"<=\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"<=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"<=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"\"<=3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));

            expect(Parser.parseFormula("=DATE(1900,0,31)<=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)<=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));

            expect(Parser.parseFormula("=#N/A<=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("GreaterOrEqual", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2>=3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2>=2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2>=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2>=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=1>=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=3>=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=0>=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=1>=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2>=\"sda\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2>=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=TRUE>=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=FALSE>=0", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>=FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\">=2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\">=\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"3\">=\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\">=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\">=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\">=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\">=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"\">=3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));

            expect(Parser.parseFormula("=DATE(1900,0,31)>=1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>=TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>=\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>=\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)>=DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));

            expect(Parser.parseFormula("=#N/A<=#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("Less", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2<3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2<1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2<\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=0<DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=3<DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=0<FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=1<FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<\"sda\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2<#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=TRUE<1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=FALSE<0", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE<#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\"<2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"3\"<\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"<DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\"<TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\"<#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"\"<3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));

            expect(Parser.parseFormula("=DATE(1900,0,31)<1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)<#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)<DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));

            expect(Parser.parseFormula("=#N/A<#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

        it("Greater", function () {
            var wb = {Name: "book"};
            var ws = {Name: "sheet"};
            expect(Parser.parseFormula("=2>3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2>2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2>1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=2>\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=0>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=3>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=0>FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=1>FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2>\"sda\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=2>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=TRUE>1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=FALSE>0", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>FALSE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=TRUE>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=\"2\">2", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\">\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"3\">\"2\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\">\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\">DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=\"1\">TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=\"2\">#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=\"\">3", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));

            expect(Parser.parseFormula("=DATE(1900,0,31)>1", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>TRUE", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>\"1\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>\"dsa\"", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=DATE(1900,0,31)>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=DATE(1900,0,31)>DATE(1900,0,31)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));

            expect(Parser.parseFormula("=#N/A>#VALUE!", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
        });

    });


});
