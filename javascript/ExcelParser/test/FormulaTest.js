define(["Utilities/Function", "Parser/Parser", "XClasses/XTypes", "XClasses/XTypedValue"], function (Function, Parser, XTypes, XTypedValue) {
    describe('Functions test', function () {
        it("INT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=INT(1.4)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=INT(-1.4)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-2, XTypes.Number));
            expect(Parser.parseFormula("=INT(0.5)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=INT(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=INT(-0.5)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1, XTypes.Number));
            expect(Parser.parseFormula("=INT(\"DS\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=INT(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=INT(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=INT(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=INT()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=INT(#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=INT(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=INT({1.4,\"ds\",TRUE,FALSE,\"2.3\",#VALUE!})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(1, XTypes.Number), new XTypedValue("#VALUE!", XTypes.Error), new XTypedValue("#VALUE!", XTypes.Error), new XTypedValue("#VALUE!", XTypes.Error), new XTypedValue(2, XTypes.Number), new XTypedValue("#VALUE!", XTypes.Error)]
            ]);

        });

        it("MIN tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MIN()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MIN(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MIN(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MIN(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MIN(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MIN(\"sda\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MIN(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MIN(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MIN(1,2,3,TRUE,FALSE,\"0\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MIN(1,2,3,TRUE,FALSE,\"0\")", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(1, XTypes.Number)]
            ]);
        });

        it("MAX tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MAX()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MAX(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MAX(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MAX(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MAX(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MAX(\"sda\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MAX(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MAX(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MAX(1,2,3,TRUE,FALSE,\"0\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3, XTypes.Number));
            expect(Parser.parseFormula("=MAX(1,2,3,TRUE,FALSE,\"0\")", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(3, XTypes.Number)]
            ]);

        });

        it("SQRT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SQRT(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SQRT(-1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=SQRT(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SQRT(-TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=SQRT(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=SQRT(\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=SQRT(-\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=SQRT(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=SQRT(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SQRT(-DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=SQRT()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=SQRT(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=SQRT({1,TRUE,FALSE,\"4\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(1, XTypes.Number), new XTypedValue(1, XTypes.Number), new XTypedValue(0, XTypes.Number), new XTypedValue(2, XTypes.Number), new XTypedValue(0, XTypes.Number)]
            ]);

        });

        it("HYPERLINK test", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=HYPERLINK(\"das\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("das", XTypes.String));
            expect(Parser.parseFormula("=HYPERLINK(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=HYPERLINK(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=HYPERLINK(#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=HYPERLINK(1,\"a\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("a", XTypes.String));
            expect(Parser.parseFormula("=HYPERLINK(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=HYPERLINK(1,#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=HYPERLINK(2,TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=HYPERLINK({1,2,3},{4,5,6})", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=HYPERLINK({1,2},{3,4,5;1,#VALUE!,3})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    new XTypedValue(3, XTypes.Number),
                    new XTypedValue(4, XTypes.Number),
                    new XTypedValue(5, XTypes.Number)
                ],
                [
                    new XTypedValue(1, XTypes.Number),
                    new XTypedValue("#VALUE!", XTypes.Error),
                    new XTypedValue(3, XTypes.Number)
                ]
            ]);
            expect(Parser.parseFormula("=HYPERLINK({1,2,3},{1,2})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    new XTypedValue(1, XTypes.Number),
                    new XTypedValue(2, XTypes.Number),
                    new XTypedValue("#N/A", XTypes.Error)
                ]
            ]);

        });

        it("COUNT test", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=COUNT(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=COUNT(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=COUNT(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=COUNT(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=COUNT(#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=COUNT()", wb, ws).compute({}, {}, false, false, false)).toEqual({value: "#N/A", type: XTypes.Error});
            expect(Parser.parseFormula("=COUNT(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=COUNT(1,2,\"2\",TRUE,#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=COUNT({1})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [
                    new XTypedValue(1, XTypes.Number)
                ]
            ]);
        });

        it("ABS tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ABS(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=ABS(-1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=ABS(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=ABS(-TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=ABS(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ABS(\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=ABS(-\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=ABS(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ABS(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=ABS(-DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=ABS()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ABS(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ABS({1,TRUE,FALSE,\"4\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(1, XTypes.Number), new XTypedValue(1, XTypes.Number), new XTypedValue(0, XTypes.Number), new XTypedValue(4, XTypes.Number), new XTypedValue(0, XTypes.Number)]
            ]);

        });

        it("ACOS tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ACOS(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ACOS(-1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(Math.PI, XTypes.Number));
            expect(Parser.parseFormula("=ACOS(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ACOS(-TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(Math.PI, XTypes.Number));
            expect(Parser.parseFormula("=ACOS(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ACOS(\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ACOS(-\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ACOS(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ACOS(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=ACOS(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ACOS(-DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(Math.PI, XTypes.Number));
            expect(Parser.parseFormula("=ACOS()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ACOS(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ACOS({1,TRUE,FALSE,\"4\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(0, XTypes.Number), new XTypedValue(0, XTypes.Number), new XTypedValue(1.5707963267948966, XTypes.Number), new XTypedValue("#NUM!", XTypes.Error), new XTypedValue(1.5707963267948966, XTypes.Number)]
            ]);

        });

        it("ACOSH tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ACOSH(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ACOSH(-1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ACOSH(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ACOSH(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ACOSH(\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2.0634370688955608, XTypes.Number));
            expect(Parser.parseFormula("=ACOSH(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ACOSH(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=ACOSH(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ACOSH()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ACOSH(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ACOSH({1,TRUE,FALSE,\"4\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(0, XTypes.Number), new XTypedValue(0, XTypes.Number), new XTypedValue("#NUM!", XTypes.Error), new XTypedValue(2.0634370688955608, XTypes.Number), new XTypedValue("#NUM!", XTypes.Error)]
            ]);

        });

        it("ASIN tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ASIN(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ASIN(-1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ASIN(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ASIN(-TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ASIN(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ASIN(\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ASIN(-\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ASIN(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ASIN(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=ASIN(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ASIN(-DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-1.5707963267948966, XTypes.Number));
            expect(Parser.parseFormula("=ASIN()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ASIN(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ASIN({1,TRUE,FALSE,\"4\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(1.5707963267948966, XTypes.Number), new XTypedValue(1.5707963267948966, XTypes.Number), new XTypedValue(0, XTypes.Number), new XTypedValue("#NUM!", XTypes.Error), new XTypedValue(0, XTypes.Number)]
            ]);

        });

        it("ASINH tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ASINH(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0.8813735870195429, XTypes.Number));
            expect(Parser.parseFormula("=ASINH(-1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-0.8813735870195428, XTypes.Number));
            expect(Parser.parseFormula("=ASINH(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0.8813735870195429, XTypes.Number));
            expect(Parser.parseFormula("=ASINH(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ASINH(\"4\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2.0947125472611012, XTypes.Number));
            expect(Parser.parseFormula("=ASINH(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ASINH(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=ASINH(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0.8813735870195429, XTypes.Number));
            expect(Parser.parseFormula("=ASINH()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ASINH(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ASINH({1,TRUE,FALSE,\"4\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(0.8813735870195429, XTypes.Number), new XTypedValue(0.8813735870195429, XTypes.Number), new XTypedValue(0, XTypes.Number), new XTypedValue(2.0947125472611012, XTypes.Number), new XTypedValue(0, XTypes.Number)]
            ]);

        });

        it("ATAN tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ATAN(0)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ATAN(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ATAN(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0.7853981633974483, XTypes.Number));
            expect(Parser.parseFormula("=ATAN(\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0.7853981633974483, XTypes.Number));
            expect(Parser.parseFormula("=ATAN(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ATAN(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=ATAN(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0.7853981633974483, XTypes.Number));
            expect(Parser.parseFormula("=ATAN()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ATAN(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ATAN({1,TRUE,FALSE,\"1\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(0.7853981633974483, XTypes.Number), new XTypedValue(0.7853981633974483, XTypes.Number), new XTypedValue(0, XTypes.Number), new XTypedValue(0.7853981633974483, XTypes.Number), new XTypedValue(0, XTypes.Number)]
            ]);

        });

        it("ATANH tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ATANH(0)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ATANH(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ATANH(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ATANH(\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ATANH(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=ATANH(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=ATANH(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=ATANH()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ATANH(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=ATANH({1,TRUE,FALSE,\"1\",\"\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue("#NUM!", XTypes.Error), new XTypedValue("#NUM!", XTypes.Error), new XTypedValue(0, XTypes.Number), new XTypedValue("#NUM!", XTypes.Error), new XTypedValue(0, XTypes.Number)]
            ]);

        });

        it("BIN2DEC tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=BIN2DEC(0)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=BIN2DEC(10)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=BIN2DEC(\"10\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=BIN2DEC(\"1000000000\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(-512, XTypes.Number));
            expect(Parser.parseFormula("=BIN2DEC(\"100000000000\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=BIN2DEC(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=BIN2DEC(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=BIN2DEC(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=BIN2DEC(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=BIN2DEC(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=BIN2DEC()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=BIN2DEC(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));

        });

        it("SUM tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SUM(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUM(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUM(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=SUM(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=SUM(\"2asda\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=SUM(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=SUM(DATE(1900,0,31),1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(1900, 0, 1), XTypes.Date));

            expect(Parser.parseFormula("=SUM({1})", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUM({TRUE})", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUM({\"1\"})", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUM({#VALUE!})", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=SUM(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3, XTypes.Number));
            expect(Parser.parseFormula("=SUM(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUM(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=SUM(1,TRUE,\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=SUM(\"2asd\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=SUM({3,\"2asd\"})", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=SUM()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));

        });


        it("AVERAGE tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=AVERAGE(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=AVERAGE(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=AVERAGE(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=AVERAGE(\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=AVERAGE(#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=AVERAGE()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=AVERAGE(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=AVERAGE(1,2,3)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=AVERAGE({1,2,3})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [
                    new XTypedValue(2, XTypes.Number)
                ]
            ]);
        });

        it("PRODUCT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=PRODUCT(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(\"dasa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(DATE(1900,0,31),2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT(DATE(1900,0,31),2,\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=PRODUCT()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));

            expect(Parser.parseFormula("=PRODUCT(DATE(1900,0,31),2,\"dsa\")", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(2, XTypes.Number)]
            ]);

        });

        it("MEDIAN tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MEDIAN(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(\"2\",1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(2,1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.5, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MEDIAN(#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=MEDIAN(2,1)", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(1.5, XTypes.Number)]
            ]);

        });


        it("SUMPRODUCT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SUMPRODUCT(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=SUMPRODUCT(#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=SUMPRODUCT({1,2,3},{1,2,\"sda\"})", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(5, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(1,2,3)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(6, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(\"13\",\"3\")", wb, ws).compute({}, {}, false, false)).toEqual(new XTypedValue(39, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT(TRUE,4)", wb, ws).compute({}, {}, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{1})", wb, ws).compute({}, {}, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=SUMPRODUCT({1,2,3},{1,2,\"sda\"})", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(5, XTypes.Number)]
            ]);
        });

        it("ARRAYFORMULA tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=ARRAYFORMULA(1)", wb, ws).compute({}, {}, false, true, false)).toEqual([
                [new XTypedValue(1, XTypes.Number)]
            ]);
            expect(Parser.parseFormula("=ARRAYFORMULA(1)", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(1, XTypes.Number)]
            ]);
            expect(Parser.parseFormula("=ARRAYFORMULA(1)", wb, ws).compute({}, {}, false, false, true)).toEqual([
                [new XTypedValue(1, XTypes.Number)]
            ]);

            expect(Parser.parseFormula("=ARRAYFORMULA(1)", wb, ws).compute({}, {}, false, true, false)).toEqual([
                [new XTypedValue(1, XTypes.Number)]
            ]);
            expect(Parser.parseFormula("=ARRAYFORMULA(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(
                new XTypedValue(1, XTypes.Number)
            );

            expect(Parser.parseFormula("=ARRAYFORMULA(SUMPRODUCT(\"1\"))", wb, ws).compute({}, {}, false, false, true)).toEqual([
                [new XTypedValue(1, XTypes.Number)]
            ]);
        });

        it("MODE tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MODE(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(\"sd\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=MODE(\"1\", \"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(\"\",\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(\"sd\",\"sd\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(TRUE,TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(FALSE,FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=MODE(DATE(1900,0,31),DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=MODE(2,2,1,\"3\",\"3\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2, XTypes.Number));
            expect(Parser.parseFormula("=MODE(DATE(1900,0,31),1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
        });

        it("QUARTILE tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=QUARTILE({\"1\"},1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=QUARTILE({\"dsa\"},1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=QUARTILE({\"\"},1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=QUARTILE({TRUE},1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=QUARTILE({FALSE},1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=QUARTILE({#VALUE!},1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=QUARTILE(DATE(1900,0,31),1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE(1,1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},0)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.75, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(2.5, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},3)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(3.25, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},4)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(4, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},5)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.75, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.75, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.75, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1, XTypes.Number));
            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},\"dsada\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));

            expect(Parser.parseFormula("=QUARTILE({1,2,3,4},{0,1,2,3,4,5})", wb, ws).compute({}, {}, false, false, true)).toEqual([
                [new XTypedValue(1, XTypes.Number), new XTypedValue(1.75, XTypes.Number), new XTypedValue(2.5, XTypes.Number), new XTypedValue(3.25, XTypes.Number), new XTypedValue(4, XTypes.Number), new XTypedValue("#NUM!", XTypes.Error)]
            ]);
        });

        it("SKEW tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SKEW()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=SKEW(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=SKEW(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=SKEW(1,2,5)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.2933427807333964, XTypes.Number));
            expect(Parser.parseFormula("=SKEW(\"1\",\"2\",\"5\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=SKEW(TRUE,FALSE,FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#DIV/0!", XTypes.Error));
            expect(Parser.parseFormula("=SKEW(DATE(1900,0,31),DATE(1900,0,31),5)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(1.732050807568876, XTypes.Number));
            expect(Parser.parseFormula("=SKEW(#VALUE!,DATE(1900,0,31),5)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=SKEW(1,1,1,1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
        });

        it("STDEV tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=STDEV()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=STDEV(1,1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=STDEV(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=STDEV(\"1\",\"1\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=STDEV(TRUE,TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=STDEV(FALSE,FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=STDEV(\"\",\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#NUM!", XTypes.Error));
            expect(Parser.parseFormula("=STDEV(1,1,#VALUE!)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=STDEV(DATE(1900,0,31),DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));
            expect(Parser.parseFormula("=STDEV(1,\"\",\"2\",DATE(1900,0,31),TRUE,FALSE,10)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(5.196152422706632, XTypes.Number));

            expect(Parser.parseFormula("=STDEV(DATE(1900,0,31),DATE(1900,0,31))", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(0, XTypes.Number)]
            ]);
        });

        it("NOW tests", function () {
            expect(Parser.parseFormula("=NOW()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(new Date(), XTypes.Date));
            expect(Parser.parseFormula("=NOW()", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(new Date(), XTypes.Date)]
            ]);

            expect(Parser.parseFormula("=NOW(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=NOW(1)", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue("#N/A", XTypes.Error)]
            ]);
        });


        it("AND tests", function () {
            expect(Parser.parseFormula("=AND(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(FALSE)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(DATE(1900,0,31)-1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(0)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=AND()", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#N/A", XTypes.Error));
            expect(Parser.parseFormula("=AND(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=AND(\"dsa\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=AND(\"\")", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue("#VALUE!", XTypes.Error));
            expect(Parser.parseFormula("=AND(1,0)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(0,1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(0,0)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(false, XTypes.Boolean));
            expect(Parser.parseFormula("=AND(1,1)", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(true, XTypes.Boolean));

            expect(Parser.parseFormula("=AND(1,1)", wb, ws).compute({}, {}, true, false, false)).toEqual([
                [new XTypedValue(true, XTypes.Boolean)]
            ]);
        });

        it("RANK tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=RANK({\"sda\",1,2,1},{1,2},{1,1,1,1,1,0, 1})", wb, ws).compute({}, {}, false, false, true)).toEqual([[
            new XTypedValue("#VALUE!", XTypes.Error),new XTypedValue(1, XTypes.Number),new XTypedValue(2, XTypes.Number),new XTypedValue(1, XTypes.Number),
                new XTypedValue("#N/A", XTypes.Error),new XTypedValue("#N/A", XTypes.Error),new XTypedValue("#N/A", XTypes.Error)
            ]]);
        });

        xit("IF tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=IF(1,3,4)", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=IF(TRUE,2,3)", wb, ws).compute({}, {}, false, false)).toEqual(2);
            expect(Parser.parseFormula("=IF(0,2,3)", wb, ws).compute({}, {}, false, false)).toEqual(3);
            expect(Parser.parseFormula("=IF(\"2\",3,4)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=IF(\"TRUE\",4,5)", wb, ws).compute({}, {}, false, false)).toEqual(4);
            expect(Parser.parseFormula("=IF(\"FALSE\",4,5)", wb, ws).compute({}, {}, false, false)).toEqual(5);
            expect(Parser.parseFormula("=IF(\"sad\",2,3)", wb, ws).compute({}, {}, false, false)).toEqual("#VALUE!");
            expect(Parser.parseFormula("=IF({1,2,3},\"bla\",\"nbla\")", wb, ws).compute({}, {}, false, false)).toEqual("bla");
            expect(Parser.parseFormula("=IF({0,2,3},\"bla\",\"nbla\")", wb, ws).compute({}, {}, false, false)).toEqual("nbla");
            expect(Parser.parseFormula("=IF()", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=IF(1)", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");
            expect(Parser.parseFormula("=IF(0,4)", wb, ws).compute({}, {}, false, false)).toEqual(false);
            expect(Parser.parseFormula("=IF(#N/A,2,3)", wb, ws).compute({}, {}, false, false)).toEqual("#N/A");

            expect(Parser.parseFormula("=IF({0,1,2},{1,3},{24,5,6})", wb, ws).compute({}, {}, true, false)).toEqual([
                [24, 3, "#N/A"]
            ]);
            expect(Parser.parseFormula("=IF({0,1},{1,3},{24,5,6})", wb, ws).compute({}, {}, true, false)).toEqual([
                [24, 3, "#N/A"]
            ]);
            expect(Parser.parseFormula("=IF(1,3,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                [3]
            ]);
            expect(Parser.parseFormula("=IF(TRUE,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                [2]
            ]);
            expect(Parser.parseFormula("=IF(0,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                [3]
            ]);
            expect(Parser.parseFormula("=IF(\"2\",3,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            expect(Parser.parseFormula("=IF(\"TRUE\",4,5)", wb, ws).compute({}, {}, true, false)).toEqual([
                [4]
            ]);
            expect(Parser.parseFormula("=IF(\"FALSE\",4,5)", wb, ws).compute({}, {}, true, false)).toEqual([
                [5]
            ]);
            expect(Parser.parseFormula("=IF(\"sad\",2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#VALUE!"]
            ]);
            expect(Parser.parseFormula("=IF({0,2,3},\"bla\",\"nbla\")", wb, ws).compute({}, {}, true, false)).toEqual([
                ["nbla", "bla", "bla"]
            ]);
            expect(Parser.parseFormula("=IF()", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=IF(1)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
            expect(Parser.parseFormula("=IF(0,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                [false]
            ]);
            expect(Parser.parseFormula("=IF(#N/A,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                ["#N/A"]
            ]);
        });


    });

});
