define(["Parser/AST/AST", "FSharp/FSharp" ], function (AST, FSharp) {
    describe('HashMap test', function () {
        it("CharColToInt", function () {
            expect(AST.Address.CharColToInt("A")).toEqual(1);
            expect(AST.Address.CharColToInt("Z")).toEqual(26);
            expect(AST.Address.CharColToInt("AA")).toEqual(27);
            expect(AST.Address.CharColToInt("AB")).toEqual(28);
            expect(function () {
                AST.Address.CharColToInt("A4");
            }).toThrow();
            expect(function () {
                AST.Address.CharColToInt("");
            }).toThrow();
        });

    });

});