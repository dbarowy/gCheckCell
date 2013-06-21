
TestCase("AddressTest", {
    "testCharColToInt": function () {
        assertEquals("Should return the same result!", 1, AST.Address.CharColToInt("A"));
        assertEquals("Should return the same result!", 26, AST.Address.CharColToInt("Z"));
        assertEquals("Should return the same result!", 27, AST.Address.CharColToInt("AA"));
        assertEquals("Should return the same result!", 28, AST.Address.CharColToInt("AB"));
        // TODO Learn how to test for thrown errors
        //assertException( (function(){throw new TypeError();})());
    },
    "testIntToCharCol": function () {
        assertEquals("Should return the same result!", "A", AST.Address.IntToColChars(1));
        assertEquals("Should return the same result!", "Z", AST.Address.IntToColChars(26));
        assertEquals("Should return the same result!", "AA", AST.Address.IntToColChars(27));
        assertEquals("Should return the same result!", "AB", AST.Address.IntToColChars(28));
        // TODO Learn how to test for thrown errors and test if the exception is thrown at the right time
        //assertException( (function(){throw new TypeError();})());
    },
    "testAddressConstructor": function () {
        var a = new AST.Address(2, 3, "sheetName", "workbookName");
        // Getters and setters don't need to be tested.
        assert("These should be true!", a.X == 3 && a.Y == 2 && a.WorksheetName == "sheetName" && a.WorkbookName == "workbookName");
        var b = new AST.Address(2, "C", "sheetName", "workbookName");
        assert("These should be true!", b.X == 3 && b.Y == 2 && b.WorksheetName == "sheetName" && b.WorkbookName == "workbookName");
    },
    "testA1Local": function () {
        assertEquals("The A1Local is not correct", "C2", this.address.A1Local());
    },
    "testA1Worksheet": function () {
        //Test that the exceptions are thrown
        //  var a = new AST.Address(2,3,"sheetName", "workbookName");
        //  a.WorksheetName = new FSharp.None();
        //  a.A1Worksheet();
        // a.WorksheetName = null;
    },
    "testA1Workbook": function () {
        //Test that the exceptions are thrown
        //  var a = new AST.Address(2,3,"sheetName", "workbookName");
        //  a.WorkbookName = new FSharp.None();
        //  a.A1Workbook();
        // a.WorkbookName = null;
    },
    "testA1FullyQualified": function () {
        assertEquals("The returned message is not correct!", "[workbookName]sheetName!C2", this.address.A1FullyQualified());
    },
    "testR1C1": function () {
        var a = new AST.Address(2, 3, "sheetName", "workbookName");
        a.WorkbookName = new FSharp.None();
        a.WorksheetName = new FSharp.None();

        assertEquals("The address format is not correct.", "R2C3", a.R1C1());
        assertEquals("The address format is not correct.", "[workbookName]sheetName!R2C3", this.address.R1C1());

    },
    "testAddressAsInt32": function () {
        assertEquals("Address as Int32 not working", 131073, this.address.AddressAsInt32());
    },
    "testInsideRange": function () {
        var rng = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
        var rng2 = new AST.Range(new AST.Address(4, 4, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
        assertEquals("This should be true.", true, this.address.InsideRange(rng));
        assertEquals("This should be true.", false, this.address.InsideRange(rng2));
    },

    "testAddressToString": function () {
        assertEquals("Whad did you do wrong?!", "(2,3)", this.address.toString());
    },
    "testInsideAddr": function () {
        var a = new AST.Address(1, 1, "sheet", "book");
        var b = new AST.Address(2, 3, "sheet", "book");
        assertEquals("This address is not inside the other address", false, this.address.InsideAddr(a));
        assertEquals("This address is inside the other address", true, this.address.InsideAddr(b));
    },
    setUp: function () {
        this.address = new AST.Address(2, 3, "sheetName", "workbookName");
    },
    tearDown: function () {
        delete this.address;
    }

});

TestCase("RangeTest", {
    setUp: function () {
        this.range = new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book"));
    },
    tearDown: function () {
        delete this.range;
    },
    "testToString": function () {
        //This is just for warming up with JSUnitTesting
        assertEquals("The toString method doesn't work", (new AST.Address(1, 1, "sheet", "book")).toString() + "," + (new AST.Address(5, 5, "sheet", "book")).toString(), this.range.toString());

    },
    "testInsideRng": function () {
        /*var aux = new AST.Range(new AST.Address(2, 2, "sheet", "book"), new AST.Address(3, 3, "sheet", "book"));
         assertEquals("Inside range went wrong.", true, this.range.InsideRange(aux));*/

    },
    "testInsideAddr": function () {
        /*  var aux = new AST.Range(new AST.Address(2, 2, "sheet", "book"), new AST.Address(3, 3, "sheet", "book"));
         assertEquals("Inside range went wrong.", true, this.range.InsideRange(aux));*/

    }

});

TestCase("ReferenceTest", {
    setUp: function () {
        this.ref = new AST.Reference("sheetName");
    },
    tearDown: function () {
        delete this.ref;
    },
    "testWorkbook": function () {
        assertEquals("This can't fail!", null, this.ref.WorkbookName);
        this.ref.WorkbookName = "book";
        assertEquals("This can't fail!", "book", this.ref.WorkbookName);

    },
    "testWorksheet": function () {
        assertEquals("This is to simple to fail", "sheetName", this.ref.WorksheetName);
        this.ref.WorksheetName = "Bla";
        assertEquals("This is to simple to fail", "Bla", this.ref.WorksheetName);
    },

    "testResolve": function () {
        var wb = new Object();
        wb.Name = "WbName";
        var ws = new Object();
        ws.Name = "WsName";
        this.ref.Resolve(wb, ws);
        assert("Resolving didn't work", this.ref.WorkbookName == wb.Name);

    }

});

TestCase("ReferenceRangeTest", {
    setUp: function () {
        this.refRange = new AST.ReferenceRange("sheetName", new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book")));

    },
    tearDown: function () {
        delete this.refRange;
    },
    "testRefRngtoString": function () {
        assertEquals("This should be equal", "ReferenceRange(" + this.refRange.WorksheetName + "," + this.refRange.Range.toString() + ")", this.refRange.toString());
    },
    "testInsideRefRng": function () {
        //TODO Find a good mocking library and implement this test with mocks to assert that the right branch of the if/else statement is followed
        /*
         var a = new AST.ReferenceAddress("sheet",new AST.Address(1, 1, "sheet", "book"));
         var b = new AST.ReferenceRange("sheetName", new AST.Range(new AST.Address(1, 1, "sheet", "book"), new AST.Address(5, 5, "sheet", "book")));
         var c={};
         */

    },
    "testResolve": function () {
        var wb = new Object();
        wb.Name = "WbName";
        var ws = new Object();
        ws.Name = "WsName";
        this.refRange.Resolve(wb, ws);
        assertEquals("Resolve failed1", wb.Name, this.refRange.WorkbookName);
        assertEquals("Resolve failed2", "sheetName", this.refRange.WorksheetName);
    }

});

TestCase("ReferenceAddressTest", {
    setUp: function () {
        this.refAddr = new AST.ReferenceAddress("sheetName", new AST.Address(1, 1, "sheet", "book"));
    },
    tearDown: function () {
        delete this.refAddr;
    },
    "testToString": function () {
        var a = new AST.ReferenceAddress("sheetName", new AST.Address(2, 3, "sheet", "book"));
        a.WorksheetName = new FSharp.None();

        assertEquals("This should be equal", "ReferenceAddress(" + this.refAddr.WorksheetName + ", " + this.refAddr.Address + ")", this.refAddr.toString());
        assertEquals("This should be equal", "ReferenceAddress(None" + ", " + a.Address + ")", a.toString());
    },
    "testInsideRef": function () {
        //TODO Find a good mocking library and implement this test with mocks to assert that the right branch of the if/else statement is followed

    },
    "testResolve": function () {
        var wb = new Object();
        wb.Name = "WbName";
        var ws = new Object();
        ws.Name = "WsName";
        this.refAddr.Resolve(wb, ws);
        assertEquals("Resolve failed1", wb.Name, this.refAddr.WorkbookName);
        assertEquals("Resolve failed2", "sheetName", this.refAddr.WorksheetName);

    }

});

