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
        var start = new Date();
        for(var i=0; i<1; i++){
        expect(Parser.parseFormula("=+AF3+AG3 ",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=(AD3+AE3+AH3-MIN(AD3,AE3,AH3))/2",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=B3+C3+D3+E3+F3+G3+H3+I3+J3+K3+L3+M3+N3+O3+P3+Q3+R3",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=+AK3*100/$AK$24",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=+S3+T3+U3+V3+W3+X3+Y3+Z3+AA3+AB3+AC3",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=+AM3/$AM$24*100 ",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=+(6*AI3+1.5*(AL3+AN3))/9+AP3",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=(AD4+AE4+AH4-MIN(AD4,AE4,AH4))/2",wb,ws)).not.toEqual(new FSharp.None());
        expect(Parser.parseFormula("=+(6*AI4+1.5*(AL4+AN4))/9+AP4",wb,ws)).not.toEqual(new FSharp.None());
        }
        console.log((new Date()-start)/1000);

    });
});