define(["Utilities/Function","Parser/Parser"], function (Function, Parser) {
    describe('Functions test', function () {
       it("SUM tests", function(){
           wb={Name:"book"};
           ws={Name:"sheet"};
           expect(Parser.parseFormula("=SUM({1})",wb,ws).compute({},{},false,false)).toEqual(1);
           expect(Parser.parseFormula("=SUM({TRUE})",wb,ws).compute({},{},false,false)).toEqual(1);
           expect(Parser.parseFormula("=SUM({\"1\"})",wb,ws).compute({},{},false,false)).toEqual(1);
           expect(Parser.parseFormula("=SUM({#VALUE!})",wb,ws).compute({},{},false,false)).toEqual("#VALUE!");
           expect(Parser.parseFormula("=SUM(1,2)",wb,ws).compute({},{},false,false)).toEqual(3);
           expect(Parser.parseFormula("=SUM(TRUE)",wb,ws).compute({},{},false,false)).toEqual(1);
           expect(Parser.parseFormula("=SUM(\"2\")",wb,ws).compute({},{},false,false)).toEqual(2);
           expect(Parser.parseFormula("=SUM(1,TRUE,\"2\")",wb,ws).compute({},{},false,false)).toEqual(4);
           expect(Parser.parseFormula("=SUM(\"2asd\")",wb,ws).compute({},{},false,false)).toEqual("#VALUE!");
           expect(Parser.parseFormula("=SUM({3,\"2asd\"})",wb,ws).compute({},{},false,false)).toEqual("#VALUE!");

       });

        it("SQRT tests", function(){
            wb={Name:"book"};
            ws={Name:"sheet"};
            expect(Parser.parseFormula("=SQRT({1})",wb,ws).compute({},{},false,false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT({TRUE})",wb,ws).compute({},{},false,false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT({\"1\"})",wb,ws).compute({},{},false,false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT({#VALUE!})",wb,ws).compute({},{},false,false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=SQRT(1,2)",wb,ws).compute({},{},false,false)).toEqual("#N/A");
            expect(Parser.parseFormula("=SQRT(TRUE)",wb,ws).compute({},{},false,false)).toEqual(1);
            expect(Parser.parseFormula("=SQRT(\"4\")",wb,ws).compute({},{},false,false)).toEqual(2);
            expect(Parser.parseFormula("=SQRT()",wb,ws).compute({},{},false,false)).toEqual("#N/A");
            expect(Parser.parseFormula("=SQRT(\"2asd\")",wb,ws).compute({},{},false,false)).toEqual("#VALUE!");
            //expect(Parser.parseFormula("=SUM({3,\"2asd\"})",wb,ws).compute({},{},false,false)).toEqual("#VALUE!");
        });
    });

});