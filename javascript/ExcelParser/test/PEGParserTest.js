define(["Parser/PEGParser", "Parser/AST/AST", "FSharp/FSharp"], function (PEGParser, AST, FSharp) {
    describe("Int32", function () {
        it("AllInt32", function () {
            expect(PEGParser.parse("123", "Int32")).toEqual(123);
            expect(PEGParser.parse("-123", "Int32")).toEqual(-123);
            expect(PEGParser.parse("+123", "Int32")).toEqual(+123);
            expect(function () {
                PEGParser.parse("asda", "Int32")
            }).toThrow();
            expect(function () {
                PEGParser.parse("", "Int32")
            }).toThrow();
        });
    });
    describe("AddrR", function () {
        it("AllAddrR", function () {
            expect(PEGParser.parse("R-123", "AddrR")).toEqual(-123);
            expect(PEGParser.parse("R123", "AddrR")).toEqual(123);
            expect(function () {
                PEGParser.parse("R", "AddrR");
            }).toThrow();
            expect(function () {
                PEGParser.parse("Ras", "AddrR");
            }).toThrow();
        });
    });
    describe("AddrR1C1", function () {
        it("AddrR1C1All", function () {
            var a = PEGParser.parse("R1C2", "AddrR1C1");
            expect(a).toEqual(new AST.Address(1, 2, null, null));
            expect(function () {
                PEGParser.parse("R1", "AddrR1C1");
            }).toThrow();
            expect(function () {
                PEGParser.parse("r1c1", "AddrR1C1");
            }).toThrow();
            expect(function () {
                PEGParser.parse("", "AddrR1C1");
            }).toThrow();
        });
    });
    describe("AddrA", function () {
        it("AddrAAll", function () {
            expect(PEGParser.parse("ABCD", "AddrA")).toEqual("ABCD");
            expect(function () {
                PEGParser.parse("", "AddrA");
            }).toThrow();
            expect(function () {
                PEGParser.parse("1", "AddrA");
            }).toThrow();
        });
    });
    describe("AddrAAbs", function () {
        it("AddrAAbs", function () {
            expect(PEGParser.parse("$ABCD", "AddrAAbs")).toEqual("ABCD");
            expect(PEGParser.parse("ABCD", "AddrAAbs")).toEqual("ABCD");
            expect(PEGParser.parse("abcd", "AddrAAbs")).toEqual("abcd");
            expect(function () {
                PEGParser.parse("21", "AddrAAbs");
            }).toThrow();
            expect(function () {
                PEGParser.parse("", "AddrAAbs");
            }).toThrow();
        });
    });

    describe("Addr1Abs", function () {
        it("Addr1AbsAll", function () {
            expect(PEGParser.parse("$123", "Addr1Abs")).toEqual(123);
            expect(PEGParser.parse("123", "Addr1Abs")).toEqual(123);
            expect(function () {
                PEGParser.parse("A", "Addr1Abs");
            }).toThrow();
            expect(function () {
                PEGParser.parse("", "Addr1Abs");
            }).toThrow();
            expect(function () {
                PEGParser.parse("a", "Addr1Abs");
            }).toThrow();
        });

    });

    describe("AddrA1", function () {
        it("AddrA1All", function () {
            expect(PEGParser.parse("$A$2", "AddrA1")).toEqual(new AST.Address(2, 1, null, null));
            expect(PEGParser.parse("B3", "AddrA1")).toEqual(new AST.Address(3, 2, null, null));
            expect(function () {
                PEGParser.parse("BZ", "AddrA1")
            }).toThrow();
            expect(function () {
                PEGParser.parse("43", "AddrA1")
            }).toThrow();
        });

    });

    describe("AnyAddr", function () {
        it("AnyAddrAll", function () {
            expect(PEGParser.parse("R2", "AnyAddr")).toEqual(new AST.Address(2, 18, null, null));
            expect(PEGParser.parse("R2C3", "AnyAddr")).toEqual(new AST.Address(2, 3, null, null));
            expect(PEGParser.parse("$A$2", "AnyAddr")).toEqual(new AST.Address(2, 1, null, null));
            expect(function () {
                PEGParser.parse("$A$2:$B$3", "AnyAddr");
            }).toThrow();
        });
    });
    describe("MoreAddrR1C1", function () {
        it("MoreAddrR1C1All", function () {
            expect(PEGParser.parse(":R2C3", "MoreAddrR1C1")).toEqual(new AST.Address(2, 3, null, null));
            expect(function () {
                PEGParser.parse("a", "MoreAddrR1C1");
            }).toThrow();
            expect(function () {
                PEGParser.parse(":23", "MoreAddrR1C1");
            }).toThrow();
        });
    });

    describe("RangeR1C1", function () {
        it("RangeR1C1", function () {
            expect(PEGParser.parse("R1C1:R4C4", "RangeR1C1")).toEqual(new AST.Range(new AST.Address(1, 1, null, null), new AST.Address(4, 4, null, null)));
            expect(function () {
                PEGParser.parse("R1C1:", "RangeR1C1")
            }).toThrow();
            expect(function () {
                PEGParser.parse("R1C1", "RangeR1C1")
            }).toThrow();

        });
    });
    describe("MoreAddrA1", function () {
        it("MoreAddrA1All", function () {
            expect(PEGParser.parse(":A5", "MoreAddrA1")).toEqual(new AST.Address(5, 1, null, null));
            expect(function () {
                PEGParser.parse("R1C1:", "MoreAddrA1")
            }).toThrow();
            expect(function () {
                PEGParser.parse("R1C1", "MoreAddrA1")
            }).toThrow();
        });
    });
    describe("RangeA1", function () {
        it("RangeA1All", function () {
            expect(PEGParser.parse("A5:A6", "RangeA1")).toEqual(new AST.Range(new AST.Address(5, 1, null, null), new AST.Address(6, 1, null, null)));
            expect(function () {
                PEGParser.parse("A3", "RangeA1")
            }).toThrow();
            expect(function () {
                PEGParser.parse("R1C1", "RangeA1")
            }).toThrow();
        });
    });

    describe("RangeAny", function () {
        it("RangeAnyAll", function () {
            expect(PEGParser.parse("A5:A6", "RangeAny")).toEqual(new AST.Range(new AST.Address(5, 1, null, null), new AST.Address(6, 1, null, null)));
            expect(PEGParser.parse("R1C1:R4C4", "RangeAny")).toEqual(new AST.Range(new AST.Address(1, 1, null, null), new AST.Address(4, 4, null, null)));
            expect(function () {
                PEGParser.parse("R1C1:", "RangeAny")
            }).toThrow();
            expect(function () {
                PEGParser.parse("R1C1", "RangeAny")
            }).toThrow();
        });
    });

    describe("WorksheetNameQuoted", function () {
        it("WorksheetNameQuotedAll", function () {
            expect(PEGParser.parse("'sheet'", "WorksheetNameQuoted")).toEqual("sheet");
            expect(function () {
                PEGParser.parse("'sheet\\'", "WorksheetNameQuoted");
            }).toThrow();
            expect(function () {
                PEGParser.parse("'sheet*'", "WorksheetNameQuoted");
            }).toThrow();
        });
    });
    describe("WorksheetNameUnquoted", function () {
        it("WorksheetNameUnquotedAll", function () {
            expect(PEGParser.parse("sheet", "WorksheetNameUnquoted")).toEqual("sheet");
            expect(PEGParser.parse("sheet_", "WorksheetNameUnquoted")).toEqual("sheet_");
            expect(function () {
                PEGParser.parse("'sheet\\'", "WorksheetNameUnquoted");
            }).toThrow();
            expect(function () {
                PEGParser.parse("'sheet*'", "WorksheetNameUnquoted");
            }).toThrow();
            expect(function () {
                PEGParser.parse("'sheet''", "WorksheetNameUnquoted");
            }).toThrow();
        });
    });

    describe("WorksheetName", function () {
        it("WorksheetNameAll", function () {
            expect(PEGParser.parse("sheet", "WorksheetName")).toEqual("sheet");
            expect(PEGParser.parse("'sheet'", "WorksheetName")).toEqual("sheet");
            expect(PEGParser.parse("'sheet'''", "WorksheetName")).toEqual("sheet''");
            expect(PEGParser.parse("sheet_", "WorksheetName")).toEqual("sheet_");
            expect(function () {
                PEGParser.parse("'sheet\\'", "WorksheetName");
            }).toThrow();
            expect(function () {
                PEGParser.parse("'sheet*'", "WorksheetName");
            }).toThrow();
            expect(function () {
                PEGParser.parse("'sheet''", "WorksheetName");
            }).toThrow();
        });
    });

    describe("Workbook", function () {
        it("WorkbookAll", function () {
            expect(PEGParser.parse("[book]", "Workbook")).toEqual("book");
            expect(PEGParser.parse("", "Workbook")).toEqual(new FSharp.None());
        });
    });

    describe("RangeReferenceWorksheet", function () {
        it("RangeReferenceWorksheetAll", function () {
            expect(PEGParser.parse("'Worksheet'!$A$2:$A3", "RangeReferenceWorksheet")).toEqual(new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(PEGParser.parse("'Worksheet'!R2C1:R3C1", "RangeReferenceWorksheet")).toEqual(new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(function () {
                PEGParser.parse("$A$2", "RangeReferenceWorksheet");
            }).toThrow();
            expect(function () {
                PEGParser.parse("'$A$2'", "RangeReferenceWorksheet");
            }).toThrow();
        });
    });

    describe("RangeReferenceNoWorksheet", function () {
        it("RangeReferenceNoWorksheetAll", function () {
            expect(PEGParser.parse("$A2:$A3", "RangeReferenceNoWorksheet")).toEqual(new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(PEGParser.parse("R2C1:R3C1", "RangeReferenceNoWorksheet")).toEqual(new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(function () {
                PEGParser.parse("'Worksheet'!$A3", "RangeReferenceNoWorksheet");
            }).toThrow();
        });
    });

    describe("RangeReference", function () {
        it("RangeReference", function () {
            expect(PEGParser.parse("$A2:$A3", "RangeReference")).toEqual(new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(PEGParser.parse("R2C1:R3C1", "RangeReference")).toEqual(new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(function () {
                PEGParser.parse("'Worksheet'!$A3", "RangeReference");
            }).toThrow();
            expect(PEGParser.parse("'Worksheet'!$A$2:$A3", "RangeReference")).toEqual(new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(PEGParser.parse("'Worksheet'!R2C1:R3C1", "RangeReference")).toEqual(new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(function () {
                PEGParser.parse("$A$2", "RangeReference");
            }).toThrow();
            expect(function () {
                PEGParser.parse("'$A$2'", "RangeReference");
            }).toThrow();
        });
    });

    describe("AddressReferenceWorksheet", function () {
        it("AddressReferenceWorksheetAll", function () {
            expect(PEGParser.parse("'Worksheet'!$A$2", "AddressReferenceWorksheet")).toEqual(new AST.ReferenceAddress("Worksheet", new AST.Address(2, 1, null, null)));
            expect(function () {
                PEGParser.parse("'Worksheet'!$A$2:$A3", "AddressReferenceWorksheet");
            }).toThrow();
        });
    });

    describe("AddressReferenceNoWorksheet", function () {
        it("AddressREferenceNoWorksheet", function () {
            expect(PEGParser.parse("$A$2", "AddressReferenceNoWorksheet")).toEqual(new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null)));
            expect(PEGParser.parse("R2C1", "AddressReferenceNoWorksheet")).toEqual(new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null)));
            expect(function () {
                PEGParser.parse("'Worksheet'!$A3", "AddressReferenceNoWorksheet");
            }).toThrow();
        });
    });

    describe("AddressReference", function () {
        it("AddressReference", function () {
            expect(PEGParser.parse("'Worksheet'!$A$2", "AddressReference")).toEqual(new AST.ReferenceAddress("Worksheet", new AST.Address(2, 1, null, null)));
            expect(function () {
                PEGParser.parse("'Worksheet'!$A$2:$A3", "AddressReference");
            }).toThrow();
            expect(PEGParser.parse("$A$2", "AddressReference")).toEqual(new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null)));
            expect(PEGParser.parse("R2C1", "AddressReference")).toEqual(new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null)));
        });
    });
    describe("NamedReference", function () {
        it("NamedReference", function () {
            var ref = new AST.ReferenceNamed(null, "ASfsa32");
            ref.WorkbookName = "Book";

            expect(PEGParser.parse("Book!ASfsa32", "NamedReference")).toEqual(ref);
            expect(PEGParser.parse("ASfsa32", "NamedReference")).toEqual(new AST.ReferenceNamed(null, "ASfsa32"));
            expect(function () {
                PEGParser.parse("2324", "NamedReference");
            }).toThrow();

        });
    });

    describe("ArrayConstant", function () {
        it("ArrayConstant", function () {
            expect(function () {
                PEGParser.parse("{}", "ArrayConstant");
            }).toThrow();
            expect(function () {
                PEGParser.parse("{1,3;2}", "ArrayConstant");
            }).toThrow();
            expect(PEGParser.parse("{1}", "ArrayConstant")).toEqual(new AST.ConstantArray(null, [
                [new AST.ConstantNumber(null, 1)]
            ]));
            expect(PEGParser.parse("{1;2}", "ArrayConstant")).toEqual(new AST.ConstantArray(null, [
                [new AST.ConstantNumber(null, 1)],
                [new AST.ConstantNumber(null, 2)]
            ]));
        });
    });

    describe("StringConstant", function () {
        it("StringConstant", function () {
            expect(PEGParser.parse('"test"', "StringConstant")).toEqual(new AST.ConstantString(null, "test"));
            expect(PEGParser.parse("\"bla\"\"\"", "StringConstant")).toEqual(new AST.ConstantString(null, "bla\""));
            expect(PEGParser.parse('"""abcd"""', "StringConstant")).toEqual(new AST.ConstantString(null, '"abcd"'));
            expect(function () {
                PEGParser.parse('"', "StringConstant");
            }).toThrow();
        });
    });

    describe("NumericalConstant", function () {
        it("NumericalConstant", function () {
            expect(PEGParser.parse("232", "NumericalConstant")).toEqual(new AST.ConstantNumber(null, 232));
            expect(PEGParser.parse("2.32", "NumericalConstant")).toEqual(new AST.ConstantNumber(null, 2.32));
            expect(PEGParser.parse("23.e2", "NumericalConstant")).toEqual(new AST.ConstantNumber(null, 2300));
            expect(function () {
                PEGParser.parse("+232", "NumericalConstant");
            }).toThrow();
        });
    });

    describe("LogicalConstant", function () {
        it("LogicalConstant", function () {
            expect(PEGParser.parse("TRUE", "LogicalConstant")).toEqual(new AST.ConstantLogical(null, "TRUE"));
            expect(PEGParser.parse("FALSE", "LogicalConstant")).toEqual(new AST.ConstantLogical(null, "FALSE"));
            expect(function () {
                PEGParser.parse("FALSE!", "LogicalConstant");
            }).toThrow();
        });
    });

    describe("ErrorConstant", function () {
        it("ErrorConstant", function () {
            expect(PEGParser.parse("#DIV/0!", "ErrorConstant")).toEqual(new AST.ConstantError(null, "#DIV/0!"));
            expect(PEGParser.parse("#VALUE!", "ErrorConstant")).toEqual(new AST.ConstantError(null, "#VALUE!"));
            expect(function () {
                PEGParser.parse("#VALUE", "ErrorConstant");
            }).toThrow();
        });
    });

    describe("Constant", function () {
        it("Constant", function () {
            expect(function () {
                PEGParser.parse("{}", "Constant");
            }).toThrow();
            expect(function () {
                PEGParser.parse("{1,3;2}", "Constant");
            }).toThrow();
            expect(PEGParser.parse("{1}", "Constant")).toEqual(new AST.ConstantArray(null, [
                [new AST.ConstantNumber(null, 1)]
            ]));
            expect(PEGParser.parse("{1;2}", "Constant")).toEqual(new AST.ConstantArray(null, [
                [new AST.ConstantNumber(null, 1)],
                [new AST.ConstantNumber(null, 2)]
            ]));
            expect(PEGParser.parse('"test"', "Constant")).toEqual(new AST.ConstantString(null, "test"));
            expect(PEGParser.parse("\"bla\"\"\"", "Constant")).toEqual(new AST.ConstantString(null, "bla\""));
            expect(PEGParser.parse('"""abcd"""', "Constant")).toEqual(new AST.ConstantString(null, '"abcd"'));
            expect(function () {
                PEGParser.parse('"', "Constant");
            }).toThrow();
            expect(PEGParser.parse("232", "Constant")).toEqual(new AST.ConstantNumber(null, 232));
            expect(PEGParser.parse("2.32", "Constant")).toEqual(new AST.ConstantNumber(null, 2.32));
            expect(PEGParser.parse("23.e2", "Constant")).toEqual(new AST.ConstantNumber(null, 2300));
            expect(function () {
                PEGParser.parse("+232", "Constant");
            }).toThrow();
            expect(PEGParser.parse("TRUE", "Constant")).toEqual(new AST.ConstantLogical(null, "TRUE"));
            expect(PEGParser.parse("FALSE", "Constant")).toEqual(new AST.ConstantLogical(null, "FALSE"));
            expect(function () {
                PEGParser.parse("FALSE!", "Constant");
            }).toThrow();
            expect(PEGParser.parse("#DIV/0!", "Constant")).toEqual(new AST.ConstantError(null, "#DIV/0!"));
            expect(PEGParser.parse("#VALUE!", "Constant")).toEqual(new AST.ConstantError(null, "#VALUE!"));
            expect(function () {
                PEGParser.parse("#VALUE", "Constant");
            }).toThrow();
        });
    });

    describe("ReferenceKinds", function () {
        it("ReferenceKinds", function () {
            expect(PEGParser.parse("'Worksheet'!$A$2", "ReferenceKinds")).toEqual(new AST.ReferenceAddress("Worksheet", new AST.Address(2, 1, null, null)));
            expect(PEGParser.parse("$A$2", "ReferenceKinds")).toEqual(new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null)));
            expect(PEGParser.parse("R2C1", "ReferenceKinds")).toEqual(new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null)));
            expect(PEGParser.parse("$A2:$A3", "ReferenceKinds")).toEqual(new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(PEGParser.parse("R2C1:R3C1", "ReferenceKinds")).toEqual(new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(PEGParser.parse("'Worksheet'!$A$2:$A3", "ReferenceKinds")).toEqual(new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(PEGParser.parse("'Worksheet'!R2C1:R3C1", "ReferenceKinds")).toEqual(new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null))));
            expect(function () {
                PEGParser.parse("'$A$2'", "ReferenceKinds");
            }).toThrow();

        });
    });

    describe("Reference", function () {
        it("Reference", function () {
            var ref = new AST.ReferenceAddress("Worksheet", new AST.Address(2, 1, null, null));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("'Worksheet'!$A$2", "Reference")).toEqual(ref);
            ref = new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("$A$2", "Reference")).toEqual(ref);
            ref = new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("R2C1", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("$A2:$A3", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("R2C1:R3C1", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("'Worksheet'!$A$2:$A3", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("'Worksheet'!R2C1:R3C1", "Reference")).toEqual(ref);

            ref = new AST.ReferenceAddress("Worksheet", new AST.Address(2, 1, null, null));
            ref.WorkbookName = "book";
            expect(PEGParser.parse("[book]'Worksheet'!$A$2", "Reference")).toEqual(ref);
            ref = new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null));
            ref.WorkbookName = "book";
            expect(PEGParser.parse("[book]$A$2", "Reference")).toEqual(ref);
            ref = new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null));
            ref.WorkbookName = "book";
            expect(PEGParser.parse("[book]R2C1", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = "book";
            expect(PEGParser.parse("[book]$A2:$A3", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = "book";
            expect(PEGParser.parse("[book]R2C1:R3C1", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = "book";
            expect(PEGParser.parse("[book]'Worksheet'!$A$2:$A3", "Reference")).toEqual(ref);
            ref = new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = "book";
            expect(PEGParser.parse("[book]'Worksheet'!R2C1:R3C1", "Reference")).toEqual(ref);
            expect(function () {
                PEGParser.parse("'$A$2'", "Reference");
            }).toThrow();
        });
    });

    describe("ParensExpr", function () {
        it("ParensExpr", function () {
            expect(PEGParser.parse("(2)", "ParensExpr")).toEqual(new AST.ParensExpr(new AST.ReferenceExpr(new AST.ConstantNumber(null, 2))));
        });
    });

    describe("ExpressionAtom", function () {
        it("ExpressionAtom", function () {
            var ref = new AST.ReferenceAddress("Worksheet", new AST.Address(2, 1, null, null));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("'Worksheet'!$A$2", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(ref));
            ref = new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("$A$2", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(ref));
            ref = new AST.ReferenceAddress(null, new AST.Address(2, 1, null, null));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("R2C1", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(ref));
            ref = new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("$A2:$A3", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(ref));
            ref = new AST.ReferenceRange(null, new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("R2C1:R3C1", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(ref));
            ref = new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("'Worksheet'!$A$2:$A3", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(ref));
            ref = new AST.ReferenceRange("Worksheet", new AST.Range(new AST.Address(2, 1, null, null), new AST.Address(3, 1, null, null)));
            ref.WorkbookName = new FSharp.None();
            expect(PEGParser.parse("'Worksheet'!R2C1:R3C1", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(ref));
            expect(function () {
                PEGParser.parse("{}", "ExpressionAtom");
            }).toThrow();
            expect(function () {
                PEGParser.parse("{1,3;2}", "ExpressionAtom");
            }).toThrow();
            expect(PEGParser.parse("{1}", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantArray(null, [
                [new AST.ConstantNumber(null, 1)]
            ])));
            expect(PEGParser.parse("{1;2}", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantArray(null, [
                [new AST.ConstantNumber(null, 1)],
                [new AST.ConstantNumber(null, 2)]
            ])));
            expect(PEGParser.parse('"test"', "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantString(null, "test")));
            expect(PEGParser.parse("\"bla\"\"\"", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantString(null, "bla\"")));
            expect(PEGParser.parse('"""abcd"""', "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantString(null, '"abcd"')));
            expect(function () {
                PEGParser.parse('"', "ExpressionAtom");
            }).toThrow();
            expect(PEGParser.parse("232", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantNumber(null, 232)));
            expect(PEGParser.parse("2.32", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantNumber(null, 2.32)));
            expect(PEGParser.parse("23.e2", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantNumber(null, 2300)));
            expect(function () {
                PEGParser.parse("+232", "ExpressionAtom");
            }).toThrow();
            expect(PEGParser.parse("TRUE", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantLogical(null, "TRUE")));
            expect(PEGParser.parse("FALSE", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantLogical(null, "FALSE")));
            expect(function () {
                PEGParser.parse("FALSE!", "ExpressionAtom");
            }).toThrow();
            expect(PEGParser.parse("#DIV/0!", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantError(null, "#DIV/0!")));
            expect(PEGParser.parse("#VALUE!", "ExpressionAtom")).toEqual(new AST.ReferenceExpr(new AST.ConstantError(null, "#VALUE!")));
            expect(function () {
                PEGParser.parse("#VALUE", "ExpressionAtom");
            }).toThrow();
        });
    });
    //TODO
    xdescribe("Expression", function(){

    });

});
