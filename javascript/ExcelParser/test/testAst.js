require(["src/Parser/AST/AST"], function(AST){

    TestCase("AddressTest", {

        "testCharColToInt": function () {
            "use strict";
            assertEquals("Should return the same result!", 1, AST.Address.CharColToInt("A"));
            assertEquals("Should return the same result!", 26, AST.Address.CharColToInt("Z"));
            assertEquals("Should return the same result!", 27, AST.Address.CharColToInt("AA"));
            assertEquals("Should return the same result!", 28, AST.Address.CharColToInt("AB"));
            assertException(function () {
                AST.Address.CharColToInt("A4");
            });
            assertException(function () {
                AST.Address.CharColToInt("a");
            });
            assertException(function () {
                AST.Address.CharColToInt("");
            });
        },
        "testIntToCharCol": function () {
            "use strict";
            assertEquals("A", AST.Address.IntToColChars(1));
            assertEquals("Z", AST.Address.IntToColChars(26));
            assertEquals("AA", AST.Address.IntToColChars(27));
            assertEquals("AB", AST.Address.IntToColChars(28));
            assertException(function () {
                AST.IntToColChars(23.43);
            });
            assertException(function () {
                AST.IntToColChars();
            });
            assertException(function () {
                AST.IntToColChars("aa");
            });
        },
        "testAddressConstructor": function () {
            "use strict";
            var a = new AST.Address(2, 3, "sheetName", "workbookName");
            assert(a.X === 3 && a.Y === 2 && a.WorksheetName === "sheetName" && a.WorkbookName === "workbookName");
            var b = new AST.Address(2, "C", "sheetName", "workbookName");
            assert(b.X === 3 && b.Y === 2 && b.WorksheetName === "sheetName" && b.WorkbookName === "workbookName");
        },
        "testA1Local": function () {
            "use strict";
            assertEquals("The A1Local is not correct", "C2", this.address.A1Local());
        },
        "testA1Worksheet": function () {
            "use strict";
            //Test that the exceptions are thrown
            var a = new AST.Address(2, 3, "sheetName", "workbookName");
            a.WorksheetName = new FSharp.None();
            assertException(function () {
                a.A1Worksheet();
            });
        },
        "testA1Workbook": function () {
            "use strict";
            //Test that the exceptions are thrown
            var a = new AST.Address(2, 3, "sheetName", "workbookName");
            a.WorkbookName = new FSharp.None();
            assertException(function () {
                a.A1Workbook();
            });
        },
        "testA1FullyQualified": function () {
            "use strict";
            var a = new AST.Address(2, 3, "sheetName", "workbookName");
            a.WorkbookName = new FSharp.None();
            assertEquals("[workbookName]sheetName!C2", this.address.A1FullyQualified());
            assertException(function () {
                a.A1FullyQualified();
            });
        },
        "testR1C1": function () {
            "use strict";
            var a = new AST.Address(2, 3, "sheetName", "workbookName");
            a.WorkbookName = new FSharp.None();
            a.WorksheetName = new FSharp.None();
            assertEquals("The address format is not correct.", "R2C3", a.R1C1());
            assertEquals("The address format is not correct.", "[workbookName]sheetName!R2C3", this.address.R1C1());

        },
        "testAddressAsInt32": function () {
            "use strict";
            assertEquals("Address as Int32 not working", 131073, this.address.AddressAsInt32());
        },
        "testInsideRange": function () {
            "use strict";
            var rng = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            var rng2 = new AST.Range(new AST.Address(4, 4, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
            assertEquals("This should be true.", true, this.address.InsideRange(rng));
            assertEquals("This should be true.", false, this.address.InsideRange(rng2));
        },

        "testAddressToString": function () {
            "use strict";
            assertEquals("(2,3)", this.address.toString());
        },
        "testInsideAddr": function () {
            "use strict";
            var a = new AST.Address(1, 1, "sheet", "book");
            var b = new AST.Address(2, 3, "sheet", "book");
            assertEquals("This address is not inside the other address", false, this.address.InsideAddr(a));
            assertEquals("This address is inside the other address", true, this.address.InsideAddr(b));
        },
        setUp: function () {
            "use strict";
            this.address = new AST.Address(2, 3, "sheetName", "workbookName");
        },
        tearDown: function () {
            "use strict";
            delete this.address;
        }

    });

    TestCase("RangeTest", {
        setUp: function () {
            "use strict";
            this.range = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
        },
        tearDown: function () {
            "use strict";
            delete this.range;
        },
        "testToString": function () {
            "use strict";
            assertEquals((new AST.Address(1, 1, "sheet", "book")).toString() + "," + (new AST.Address(5, 5, "sheet", "book")).toString(), this.range.toString());

        },
        "testInsideRng": function () {
            "use strict";
            var aux = new AST.Range(new AST.Address(2, 2, "sheet", "book"), new AST.Address(3, 3, "sheet", "book"));
            assertEquals(false, this.range.InsideRange(aux));
            assertEquals(true, aux.InsideRange(this.range));

        },
        "testInsideAddr": function () {
            "use strict";
            //TODO Test this
            /*
             var aux = new AST.Address(2, 2, "sheet", "book");
             var aux1 = new AST.Address(1, 1, "sheet", "book");
             assertEquals(false, this.range.InsideAddr(aux));
             assertEquals(true, this.range.InsideAddr(aux1));*/
        }
    });

    TestCase("ReferenceTest", {
        setUp: function () {
            "use strict";
            this.ref = new AST.Reference("sheetName");
        },
        tearDown: function () {
            "use strict";
            delete this.ref;
        },
        "testWorkbook": function () {
            "use strict";
            assertEquals(null, this.ref.WorkbookName);
            this.ref.WorkbookName = "book";
            assertEquals("book", this.ref.WorkbookName);
        },
        "testWorksheet": function () {
            "use strict";
            assertEquals("sheetName", this.ref.WorksheetName);
            this.ref.WorksheetName = "Bla";
            assertEquals("Bla", this.ref.WorksheetName);
        },
        "testResolve": function () {
            "use strict";
            var wb = {};
            wb.Name = "WbName";
            var ws = {};
            ws.Name = "WsName";
            this.ref.Resolve(wb, ws);
            assertEquals(this.ref.WorkbookName, wb.Name);
        }
    });

    TestCase("ReferenceRangeTest", {
        setUp: function () {
            "use strict";
            this.refRange = new AST.ReferenceRange("sheetName", new AST.Range(new AST.Address(2, 2, "sheet", "book"), new AST.Address(3, 3, "sheet", "book")));

        },
        tearDown: function () {
            "use strict";
            delete this.refRange;
        },
        "testRefRngtoString": function () {
            "use strict";
            assertEquals("This should be equal", "ReferenceRange(" + this.refRange.WorksheetName + "," + this.refRange.Range.toString() + ")", this.refRange.toString());
        },
        "testWorkbook": function () {
            "use strict";
            assertEquals(null, this.refRange.WorkbookName);
            this.refRange.WorkbookName = "book";
            assertEquals("book", this.refRange.WorkbookName);
        },
        "testWorksheet": function () {
            "use strict";
            assertEquals("sheetName", this.refRange.WorksheetName);
            this.refRange.WorksheetName = "Bla";
            assertEquals("Bla", this.refRange.WorksheetName);
        },
        "testInsideRefRng": function () {
            "use strict";
            var a = new AST.ReferenceAddress("sheet", new AST.Address(1, 1, "sheet", "book"));
            var b = new AST.ReferenceRange("sheetName", new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book")));
            var c = {};
            var that = this;
            assertEquals(false, this.refRange.InsideRef(a));
            assertEquals(true, this.refRange.InsideRef(b));
            assertException(function () {
                that.refRange.InsideRef(c);
            });

        },
        "testResolve": function () {
            "use strict";
            var wb = {};
            wb.Name = "WbName";
            var ws = {};
            ws.Name = "WsName";
            this.refRange.Resolve(wb, ws);
            assertEquals("Resolve failed", wb.Name, this.refRange.WorkbookName);
            assertEquals("Resolve failed", "sheetName", this.refRange.WorksheetName);
            wb.Name = "Workbook";
            ws.Name = "worksheet";
            this.refRange.Resolve(wb, ws);
            assertNotEquals("Resolve failed", "Workbook", this.refRange.WorkbookName);
            assertNotEquals("Resolve failed", "worksheet", this.refRange.WorksheetName);
        }

    });

    TestCase("ReferenceAddressTest", {
        setUp: function () {
            "use strict";
            this.refAddr = new AST.ReferenceAddress("sheetName", new AST.Address(1, 1, "sheet", "book"));
        },
        tearDown: function () {
            "use strict";
            delete this.refAddr;
        },
        "testToString": function () {
            "use strict";
            var a = new AST.ReferenceAddress("sheetName", new AST.Address(2, 3, "sheet", "book"));
            a.WorksheetName = new FSharp.None();
            assertEquals("This should be equal", "ReferenceAddress(" + this.refAddr.WorksheetName + ", " + this.refAddr.Address + ")", this.refAddr.toString());
            assertEquals("This should be equal", "ReferenceAddress(None" + ", " + a.Address + ")", a.toString());
        },
        "test AddressGet": function () {
            "use strict";
            var a = new AST.ReferenceAddress("sheetName", new AST.Address(2, 3, "sheet", "book"));
            assertEquals(2, a.Address.Y);
            assertEquals(3, a.Address.X);
            assertEquals("sheetName", a.Address.WorksheetName);
            assertEquals("sheetName", a.WorksheetName);
            assertEquals(null, a.WorkbookName);
        },
        "testInsideRef": function () {
            //TODO Find a good mocking library and implement this test with mocks to assert that the right branch of the if/else statement is followed
        },
        "testResolve": function () {
            "use strict";
            var wb = {};
            wb.Name = "WbName";
            var ws = {};
            ws.Name = "WsName";
            this.refAddr.Resolve(wb, ws);
            assertEquals("Resolve failed1", wb.Name, this.refAddr.WorkbookName);
            assertEquals("Resolve failed2", "sheetName", this.refAddr.WorksheetName);
        }
    });
    TestCase("ReferenceFunctionTest", {
        setUp: function () {
            "use strict";
            this.refFunc = new AST.ReferenceFunction("SheetName", "ABS", []);
            this.refFunc1 = new AST.ReferenceFunction("SheetName", "SUM", [new AST.ReferenceString("sheet", "the string")]);
        },
        "test ArgumentList": function () {
            "use strict";
            assertEquals([], this.refFunc.ArgumentList);
            assertEquals("String(the string)", this.refFunc1.ArgumentList[0].toString());
            assertEquals(1, this.refFunc1.ArgumentList.length);
        },
        "test toString": function () {
            "use strict";
            assertEquals("ABS()", this.refFunc.toString());
            assertEquals("SUM(String(the string))", this.refFunc1.toString());
        },
        "test Resolve": function () {
            "use strict";
            var wb = {};
            wb.Name = "Workbook";
            var ws = {};
            ws.Name = "Worksheet";
            this.refFunc1.Resolve(wb, ws);
            assertEquals("Workbook", this.refFunc1.ArgumentList[0].WorkbookName);
            assertEquals("sheet", this.refFunc1.ArgumentList[0].WorksheetName);

        },
        tearDown: function () {
            "use strict";
            delete  this.refFunc;
            delete this.refFunc1;
        }
    });

    TestCase("ReferenceConstantTest", {
        setUp: function () {
            "use strict";
            this.constant = new AST.ReferenceConstant("sheet", 45);
        },
        tearDown: function () {
            "use strict";
            delete this.constant;
        },
        "test inheritedMethods": function () {
            "use strict";
            assertEquals("sheet", this.constant.WorksheetName);
            assertEquals(null, this.constant.WorkbookName);
        },
        "test toString": function () {
            "use strict";
            assertEquals("Constant(45)", this.constant.toString());
        }

    });

    TestCase("ReferenceString", {
        setUp: function () {
            "use strict";
            this.refStr = new AST.ReferenceString("sheet", "text");
        },
        "test toString": function () {
            "use strict";
            assertEquals("String(text)", this.refStr.toString());
        },
        //Check if the inherited properties work as expected
        "test Worksheet": function () {
            "use strict";
            assertEquals("sheet", this.refStr.WorksheetName);
            assertEquals(null, this.refStr.WorkbookName);
        },
        "test Resolve": function () {
            "use strict";
            var wb={};
            wb.Name="workbook";
            var ws={};
            ws.Name="worksheet";
            this.refStr.Resolve(wb,ws);
            assertEquals("sheet", this.refStr.WorksheetName);
            assertEquals("workbook", this.refStr.WorkbookName);
        },

        tearDown: function () {
            "use strict";
            delete this.refStr;
        }
    });

    TestCase("Test ReferenceNamed",{
        setUp: function () {
            "use strict";
            this.refNamed = new AST.ReferenceNamed("sheet", "variable");
        },
        tearDown: function () {
            "use strict";
            delete this.refNamed;
        },
        "test toString": function () {
            "use strict";
            assertEquals("ReferenceName(sheet,variable)", this.refNamed.toString());
        }

    });

});
