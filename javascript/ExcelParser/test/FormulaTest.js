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
            expect(Parser.parseFormula("=SUM(DATE(1900,0,31))", wb, ws).compute({}, {}, false, false, false)).toEqual(new XTypedValue(0, XTypes.Number));


            expect(Parser.parseFormula("=SUM({1})", wb, ws).compute({}, {}, false, false, false)).toEqual({value: 1, type: XTypes.Number});
            expect(Parser.parseFormula("=SUM({TRUE})", wb, ws).compute({}, {}, false, false, false)).toEqual({value: 1, type: XTypes.Number});
            expect(Parser.parseFormula("=SUM({\"1\"})", wb, ws).compute({}, {}, false, false, false)).toEqual({value: 1, type: XTypes.Number});
            expect(Parser.parseFormula("=SUM({#VALUE!})", wb, ws).compute({}, {}, false, false, false)).toEqual({value: "#VALUE!", type: XTypes.Error});
            expect(Parser.parseFormula("=SUM(1,2)", wb, ws).compute({}, {}, false, false, false)).toEqual({value: 3, type: XTypes.Number});
            expect(Parser.parseFormula("=SUM(TRUE)", wb, ws).compute({}, {}, false, false, false)).toEqual({value: 1, type: XTypes.Number});
            expect(Parser.parseFormula("=SUM(\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual({value: 2, type: XTypes.Number});
            expect(Parser.parseFormula("=SUM(1,TRUE,\"2\")", wb, ws).compute({}, {}, false, false, false)).toEqual({value: 4, type: XTypes.Number});
            expect(Parser.parseFormula("=SUM(\"2asd\")", wb, ws).compute({}, {}, false, false, false)).toEqual({value: "#VALUE!", type: XTypes.Error});
            expect(Parser.parseFormula("=SUM({3,\"2asd\"})", wb, ws).compute({}, {}, false, false, false)).toEqual({value: "#VALUE!", type: XTypes.Error});
            expect(Parser.parseFormula("=SUM()", wb, ws).compute({}, {}, false, false, false)).toEqual({value: "#N/A", type: XTypes.Error});

        });


        xit("AVERAGE tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=AVERAGE({1,2,3})", wb, ws).compute({}, {}, false, false)).toEqual({value: 2, type: XTypes.Number});
            expect(Parser.parseFormula("=AVERAGE({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual({value: "#DIV/0!", type: XTypes.Error});
            expect(Parser.parseFormula("=AVERAGE({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: "#DIV/0!", type: XTypes.Error});
            expect(Parser.parseFormula("=AVERAGE({#VALUE!})", wb, ws).compute({}, {}, false, false)).toEqual({value: "#VALUE!", type: XTypes.Error});
            expect(Parser.parseFormula("=AVERAGE(1,2,3)", wb, ws).compute({}, {}, false, false)).toEqual({value: 2, type: XTypes.Number});
            expect(Parser.parseFormula("=AVERAGE(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual({value: "#DIV/0!", type: XTypes.Error});
            expect(Parser.parseFormula("=AVERAGE(\"1\")", wb, ws).compute({}, {}, false, false)).toEqual({value: "#DIV/0!", type: XTypes.Error});
            expect(Parser.parseFormula("=AVERAGE(#VALUE!)", wb, ws).compute({}, {}, false, false)).toEqual({value: "#VALUE!", type: XTypes.Error});

            expect(Parser.parseFormula("=AVERAGE({1,2,3})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 2, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=AVERAGE({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#DIV/0!", type: XTypes.Error}
                ]
            ]);
            expect(Parser.parseFormula("=AVERAGE({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#DIV/0!", type: XTypes.Error}
                ]
            ]);
            expect(Parser.parseFormula("=AVERAGE({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#VALUE!", type: XTypes.Error}
                ]
            ]);
        });


        it("MAX tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MAX({1,2,3})", wb, ws).compute({}, {}, false, false)).toEqual({value: 3, type: XTypes.Number});
            expect(Parser.parseFormula("=MAX({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=MAX({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=MAX({\"asd\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=MAX({\"asd\",1,2,3,TRUE,\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: 3, type: XTypes.Number});
            expect(Parser.parseFormula("=MAX({\"asd\",1,2,3,TRUE,\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 3, type: XTypes.Number}
                ]
            ]);

            expect(Parser.parseFormula("=MAX({1,2,3})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 3, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=MAX({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=MAX({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=MAX({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#VALUE!", type: XTypes.Error}
                ]
            ]);
        });

        it("SUMPRODUCT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=SUMPRODUCT({1,2,3},{1,2,\"sda\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: 5, type: XTypes.Number});
            expect(Parser.parseFormula("=SUMPRODUCT(1,2,3)", wb, ws).compute({}, {}, false, false)).toEqual({value: 6, type: XTypes.Number});
            expect(Parser.parseFormula("=SUMPRODUCT()", wb, ws).compute({}, {}, false, false)).toEqual({value: "#N/A", type: XTypes.Error});
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{\"sad\",4})", wb, ws).compute({}, {}, false, false)).toEqual({value: 8, type: XTypes.Number});
            expect(Parser.parseFormula("=SUMPRODUCT(\"13\",\"3\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 39, type: XTypes.Number});
            expect(Parser.parseFormula("=SUMPRODUCT(TRUE,4)", wb, ws).compute({}, {}, false, false)).toEqual({value: 4, type: XTypes.Number});
            expect(Parser.parseFormula("=SUMPRODUCT(\"24\",\"dsad\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=SUMPRODUCT(\"dsa\",\"dsad\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{1})", wb, ws).compute({}, {}, false, false)).toEqual({value: "#VALUE!", type: XTypes.Error});
            expect(Parser.parseFormula("=SUMPRODUCT({1,2;3,4},{1,2;3,4})", wb, ws).compute({}, {}, false, false)).toEqual({value: 30, type: XTypes.Number});


            expect(Parser.parseFormula("=SUMPRODUCT({1,2,3},{1,2,\"sda\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 5, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(1,2,3)", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 6, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT()", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#N/A", type: XTypes.Error}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{\"sad\",4})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 8, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(\"13\",\"3\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 39, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(TRUE,4)", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 4, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(\"24\",\"dsad\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT(\"dsa\",\"dsad\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT({1,2},{1})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#VALUE!", type: XTypes.Error}
                ]
            ]);
            expect(Parser.parseFormula("=SUMPRODUCT({1,2;3,4},{1,2;3,4})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 30, type: XTypes.Number}
                ]
            ]);
        });


        it("PRODUCT tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=PRODUCT({1})", wb, ws).compute({}, {}, false, false)).toEqual({value: 1, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT({TRUE})", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT({\"1\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT({#VALUE!})", wb, ws).compute({}, {}, false, false)).toEqual({value: "#VALUE!", type: XTypes.Error});
            expect(Parser.parseFormula("=PRODUCT(1,2)", wb, ws).compute({}, {}, false, false)).toEqual({value: 2, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT(\"2\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT(1,TRUE,\"2\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 1, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT(\"2asd\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT({3,\"2asd\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: 3, type: XTypes.Number});
            expect(Parser.parseFormula("=PRODUCT()", wb, ws).compute({}, {}, false, false)).toEqual({value: "#N/A", type: XTypes.Error});

            expect(Parser.parseFormula("=PRODUCT({1})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 1, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT({TRUE})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT({\"1\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT({#VALUE!})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#VALUE!", type: XTypes.Error}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT(1,2)", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 2, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT(TRUE)", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT(\"2\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT(1,TRUE,\"2\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 1, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT(\"2asd\")", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 0, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT({3,\"2asd\"})", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: 3, type: XTypes.Number}
                ]
            ]);
            expect(Parser.parseFormula("=PRODUCT()", wb, ws).compute({}, {}, true, false)).toEqual([
                [
                    {value: "#N/A", type: XTypes.Error}
                ]
            ]);

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

        it("MEDIAN tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            expect(Parser.parseFormula("=MEDIAN(1,2)", wb, ws).compute({}, {}, false, false)).toEqual({value: 1.5, type: XTypes.Number});
            expect(Parser.parseFormula("=MEDIAN(1)", wb, ws).compute({}, {}, false, false)).toEqual({value: 1, type: XTypes.Number});
            expect(Parser.parseFormula("=MEDIAN(TRUE)", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=MEDIAN(FALSE)", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=MEDIAN(\"2\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=MEDIAN(\"sada\")", wb, ws).compute({}, {}, false, false)).toEqual({value: 0, type: XTypes.Number});
            expect(Parser.parseFormula("=MEDIAN({1,2,3})", wb, ws).compute({}, {}, false, false)).toEqual({value: 2, type: XTypes.Number});
            expect(Parser.parseFormula("=MEDIAN({1,2,\"3\"})", wb, ws).compute({}, {}, false, false)).toEqual({value: 1.5, type: XTypes.Number});
        });


        //TODO Properly test this
        xit("RANK tests", function () {
            wb = {Name: "book"};
            ws = {Name: "sheet"};
            console.log(Parser.parseFormula("=RANK({\"sda\",1,2,1},{1,2},{1,1,1,1,1,0, 1})", wb, ws).toString());
            console.log(Parser.parseFormula("=RANK({\"sda\",1,2,1},{1,2},{1,1,1,1,1,0, 1})", wb, ws).compute({}, {}, false, false, true));
            //  console.log(Parser.parseFormula("=HYPERLINK(\"http://gecici.bcc.bilkent.edu.tr/cgi-bin/stars/web_sinifkimlik?iKSoSrieAA\",\"TÖREYİN BEHÇET UĞUR \")",wb,ws).compute({},{},false,false));
            //   expect(Parser.parseFormula("=RANK(4,{3,3,4,5,6},1)", wb, ws).compute({}, {}, false, false)).toEqual(3);
        });
    });

});
