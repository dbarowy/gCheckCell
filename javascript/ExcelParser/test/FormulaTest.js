define(["Utilities/Function","Parser/Parser"], function (Function, Parser) {
    describe('MAX test', function () {
       it("Test MAX", function(){
           wb={Name:"book"};
           ws={Name:"sheet"};
           console.log(Parser.parseFormula("=MIN({1,2},-1)",wb,ws).compute({},{},false,false));

       });
    });

});