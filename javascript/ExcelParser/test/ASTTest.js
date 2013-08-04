define(["Parser/AST/AST", "FSharp/FSharp" ], function (AST, FSharp) {
    describe('Address test', function () {
        var address;
        beforeEach(function () {
            address = new AST.Address(2, 3, "sheetName", "workbookName");
        });
        it("CharColToInt", function () {
            expect(AST.Address.CharColToInt("A")).toEqual(1);
            expect(AST.Address.CharColToInt("z")).toEqual(26);
            expect(AST.Address.CharColToInt("Aa")).toEqual(27);
            expect(AST.Address.CharColToInt("AB")).toEqual(28);
            expect(function () {
                AST.Address.CharColToInt("A4");
            }).toThrow();
            expect(function () {
                AST.Address.CharColToInt("");
            }).toThrow();
            expect(function () {
                AST.Address.CharColToInt("%");
            }).toThrow();
        });
        it("IntToCharCol", function () {
            expect(AST.Address.IntToColChars(1)).toEqual("A");
            expect(AST.Address.IntToColChars(26)).toEqual("Z");
            expect(AST.Address.IntToColChars(27)).toEqual("AA");
            expect(AST.Address.IntToColChars(28)).toEqual("AB");
            expect(function () {
                AST.Address.IntToColChars(-23);
            }).toThrow();
            expect(function () {
                AST.Address.IntToColChars(0);
            }).toThrow();
            expect(function () {
                AST.Address.IntToColChars();
            }).toThrow();
            expect(function () {
                AST.Address.IntToColChars("as");
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

        it("A1Local", function () {
            expect(address.A1Local()).toEqual("C2");
        });

        it("A1Worksheet", function () {
            var a = new AST.Address(2, 3, null, "book");
            expect(function () {
                a.A1Worksheet();
            }).toThrow();
            expect(address.A1Worksheet()).toEqual("sheetName");
        });
        it("A1Workbook", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            expect(function () {
                a.A1Workbook();
            }).toThrow();
            expect(address.A1Workbook()).toEqual("workbookName");
        });
        it("A1FullyQualified", function () {
            expect(address.A1FullyQualified()).toEqual("[workbookName]sheetName!C2");
        });
        it("R1C1", function () {
            var a = new AST.Address(2, 3, "sheet", null);
            var b = new AST.Address(2, 3, null, "book");
            expect(address.R1C1()).toEqual("[workbookName]sheetName!R2C3");
            expect(a.R1C1()).toEqual("sheet!R2C3");
            expect(b.R1C1()).toEqual("[book]R2C3");
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

        it("InsideRange", function () {
            var rng = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            var rng2 = new AST.Range(new AST.Address(4, 4, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            expect(address.InsideRange(rng)).toEqual(true);
            expect(address.InsideRange(rng2)).toEqual(false);
        });
        it("InsideAddress", function () {
            var a = new AST.Address(1, 1, "sheet", "book");
            var b = new AST.Address(2, 3, "sheet", "book");
            expect(address.InsideAddr(a)).toEqual(false);
            expect(address.InsideAddr(b)).toEqual(true);
        });
        it("toString", function () {
            expect(address.toString()).toEqual("(2,3)");
        });
        //TODO
        xit("GetCOMObject", function () {

        });
        //TODO
        xit("compute", function () {

        });
    });

    //TODO
    xdescribe("ConstantArray", function () {
        it("Constructor", function () {
            var a = new AST.ConstantArray("sheet", [
                [new AST.ConstantNumber("sheet", 123)]
            ]);
            console.log(a.toString());
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
            expect(log.compute({}, {})).toEqual(true);
            expect(alog.compute({}, {})).toEqual(false);

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
            expect(number.compute({}, {})).toEqual(233);
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
            expect(str.compute({}, {})).toEqual("dsa");
        })
    });
    describe("ParensExpr", function () {
        var parens;
        var parexpr;
        beforeEach(function () {
            var expr = jasmine.createSpyObj('expr', ['Resolve', 'fixAssoc', 'compute']);
            parens = new AST.ParensExpr("test");
            parexpr = new AST.ParensExpr(expr);
        });
        it("toString", function () {
            expect(parens.toString()).toEqual("ParensExpr(test)")
        });
        it("Resolve", function () {
            parexpr.Resolve({Name: "book"}, {Name: "sheet"});
            expect(parexpr.Expr.Resolve).toHaveBeenCalled();
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
            var expr = jasmine.createSpyObj('expr', ['Resolve', 'fixAssoc', 'compute']);
            postfix = new AST.PostfixOpExpr("%", new AST.ConstantNumber(null, 123));
            postfix2 = new AST.PostfixOpExpr("%", expr);
        });
        it("toString", function () {
            expect(postfix.toString()).toEqual("PostfixOpExpr(\"%\",Constant(123))");
        });
        it("Resolve", function () {
            postfix2.Resolve({Name: "book"}, {Name: "sheet"});
            expect(postfix2.Expr.Resolve).toHaveBeenCalled();
        });
        it("fixAssoc", function () {
            postfix2.fixAssoc();
            expect(postfix2.Expr.fixAssoc).toHaveBeenCalled();
        });
        it("compute", function () {
            expect(postfix.compute({}, {})).toEqual(1.23);
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
        it("InsideRange", function () {
            "use strict";
            var aux = new AST.Range(new AST.Address(2, 2, "sheet", "book"), new AST.Address(3, 3, "sheet", "book"));
            expect(range.InsideRange(aux)).toEqual(false);
            expect(aux.InsideRange(range)).toEqual(true);
        });
        //TODO
        xit("InsideAddr", function () {

        });

    });

    describe("Reference", function () {
        it("Resolve", function () {
            var wb = {};
            wb.Name = "WbName";
            var ws = {};
            ws.Name = "WsName";
            var ref = new AST.Reference(null, null);
            ref.Resolve(wb, ws);
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
            expect(expr.compute({}, {})).toEqual(2);
            expect(b.compute({}, {})).toEqual(-2);
        });
    });

    //TODO
    describe("BinOpExpr", function(){

    });


});