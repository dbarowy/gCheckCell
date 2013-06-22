TestCase("ParserTest", {
    setUp: function () {
        "use strict";
        this.wb = {Name: "Workbook"};
        this.ws = {Name: "Worksheet"};
    },
    tearDown: function () {
        "use strict";
        delete this.wb;
        delete this.ws;
    },
    "test RefAddrResolve": function () {
        "use strict";
        var ref = new AST.ReferenceString(null, "the_string");
        Parser.refAddrResolve(ref, this.wb, this.ws);
        assertEquals("Worksheet", ref.WorksheetName);
        assertEquals(this.wb.Name, ref.WorkbookName);
    },
    "test ExprAddrResolve": function () {
        "use strict";
        //Simple test
        var expr = new AST.ReferenceExpr(new AST.ReferenceAddress(null, new AST.Address(2, 3, null, null)));
        Parser.exprAddrResolve(expr, this.wb, this.ws);
        assertEquals("Worksheet", expr.Ref.WorksheetName);
        assertEquals(this.wb.Name, expr.Ref.WorkbookName);
    },
    "test GetAddress": function () {
        "use strict";
        var address = Parser.getAddress("R2C4", this.wb, this.ws);
        assertEquals(this.wb.Name, address.WorkbookName);
        assertEquals("Worksheet", address.WorksheetName);
        assertInstanceOf(FSharp.None, Parser.getAddress("R3", "book", "sheet"));
    },
    "test getRange": function () {
        "use strict";
        var rng = Parser.getRange("R2C3:R5C2");
        assertEquals(2, rng.getYTop());
        assertEquals(3, rng.getXLeft());
        assertEquals(5, rng.getYBottom());
        assertEquals(2, rng.getXRight());
        assertInstanceOf(FSharp.None, Parser.getRange("A4"));
    },
    "test getReference": function () {
        "use strict";
        var rng = Parser.getReference("$A2", this.wb, this.ws);
        assertEquals(this.wb.Name, rng.WorkbookName);
        assertEquals(this.ws.Name, rng.WorksheetName);
        assertInstanceOf(FSharp.None, Parser.getReference(")("));
    },
    "test parseFormula": function () {
        "use strict";
        //I have already tested the formula parser in the PEG parser. This is a bit redundant
        var form = Parser.parseFormula("=ABS($A2:$A3)", this.wb, this.ws);
        assertEquals("ReferenceExpr ABS(ReferenceExpr ReferenceRange(Worksheet,(2,1),(3,1)))", form.toString());
    }

});