define(["Parser/Parser", "FSharp/FSharp", "Parser/AST/AST"], function (Parser, FSharp, AST) {
    describe("GetAddress", function () {
        it("GetAddress", function () {
            var wb = {Name: "Workbook"};
            var ws = {Name: "Worksheet"};
            expect(Parser.getAddress("R2C4", wb, ws)).toEqual(new AST.Address(2, 4, ws.Name, wb.Name));
            expect(Parser.getAddress("R3", wb, ws)).toEqual(new FSharp.None());
        });
    });
    describe("GetRange", function () {
        it("GetRange", function () {
            expect(Parser.getRange("R2C3:R5C2")).toEqual(new AST.Range(new AST.Address(2, 3, null, null), new AST.Address(5, 2, null, null)));
            expect(Parser.getRange("R2C3:")).toEqual(new FSharp.None());
        });
    });

    describe("getReference", function () {
        var wb = {Name: "Workbook"};
        var ws = {Name: "Worksheet"};
        var ref = new AST.ReferenceAddress("Worksheet", new AST.Address(2, 1, "Worksheet", "Workbook"));
        ref.WorkbookName = "Workbook";
        expect(Parser.getReference("$A2", wb, ws)).toEqual(ref);
        expect(Parser.getReference("$A", wb, ws)).toEqual(new FSharp.None());
    });

    describe("parseFormula", function () {
        var wb = {Name: "Workbook"};
        var ws = {Name: "Worksheet"};
        var form = Parser.parseFormula("=ABS($A2:$A3)", wb, ws);
        expect("ReferenceExpr.ABS(ReferenceExpr.ReferenceRange(Worksheet,(2,1),(3,1)))").toEqual(form.toString());

    });
});