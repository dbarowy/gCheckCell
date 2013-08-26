/**
 * This file contains a simple interface for the PEGParser.
 *
 */

define("Parser/Parser", ["Parser/AST/AST", "FSharp/FSharp", "Parser/PEGParser", "XClasses/XLogger", "XClasses/XTypes", "XClasses/XTypedValue"], function (AST, FSharp, PEGParser, XLogger, XTypes, XTypedValue) {
    "use strict";
    var Parser = {};
    /**
     * Strips spaces before parsing. It makes parsing easier but changes the formula semantics
     * @param str
     * @returns {string}
     */
    Parser.no_ws = function (/*string*/str) {
        return str.replace(/\s+/g, "");
    };
    /**
     * Parse the given string and see if it is an R1C1 Address
     * @param str String representing a R1C1 address
     * @param wb Workbook the address is part of
     * @param ws Worksheet the address is part of
     * @returns {*} On success, it return an AST.Address object and on failure it returns FSharp.None()
     */
    Parser.getAddress = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var address;
        try {
            address = PEGParser.parse(this.no_ws(str), "AddrR1C1");
            address.WorkbookName = wb.Name;
            address.WorksheetName = ws.Name;
            return address;
        } catch (e) {
            return new FSharp.None();
        }
    };

    /**
     * Parse the string and see if it is a R1C1 range
     * @param str String representing an R1C1 range
     * @returns {*} On success, it return an AST.Range object, otherwise it returns FSharp.None
     */
    Parser.getRange = function (/*string*/str) {
        try {
            return PEGParser.parse(this.no_ws(str), "RangeR1C1");
        } catch (e) {
            return new FSharp.None();
        }
    };


    Parser.getAddressReference = function (/*string*/str, /*XWorkbook*/wb, /*XWorksheet*/ws) {
        var reference;
        try {
            reference = PEGParser.parse(this.no_ws(str), "ReferenceKinds");
            reference.Resolve(wb, ws);
            return reference
        } catch (e) {
            XLogger.log("getAddressReference\n" + e);
            return new FSharp.None();
        }
    };
    /**
     * Parse the input string checking if it is a Reference
     * @param str String representing a Reference
     * @param wb The workbook to resolve the reference to
     * @param ws The worksheet to resolve the reference to
     * @returns {*} On success it returns an AST.Reference object, on failure it returns FSharp.None()
     * @constructor
     */
    Parser.getReference = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var reference;
        try {
            reference = PEGParser.parse(this.no_ws(str), "Reference");
            reference.Resolve(wb, ws);
            return reference;
        } catch (e) {
            return new FSharp.None();
        }
    };

    /**
     * Parse the given string and check if it is a formula.
     * @param str String representing the formula.
     * @param wb Workbook to resolve the expression to
     * @param ws Worksheet to resolve the expression to
     * @returns {*}Return the Expression generated from parsing the formula or FSharp.None on failure
     * @constructor
     */
    Parser.parseFormula = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var formula;
        try {

            formula = PEGParser.parse(this.no_ws(str), "Formula");
            formula.Resolve(wb, ws);
            formula.fixAssoc();
            return formula;
        } catch (e) {
            XLogger.log("Parse formula error " + e);
            return new FSharp.None();
        }
    };

    Parser.isNumber = function (number) {
        return (!isNaN(parseFloat(number)) && isFinite(number));
    };

    Parser.extractFunctionName = function (expr) {
        if (expr instanceof AST.ReferenceRange || expr instanceof FSharp.None || expr instanceof AST.ReferenceNamed || expr instanceof AST.ReferenceAddress || expr instanceof AST.Address || expr instanceof AST.ConstantArray || expr instanceof AST.ConstantError || expr instanceof AST.ConstantLogical || expr instanceof AST.ConstantNumber || expr instanceof AST.ConstantString || expr instanceof AST.Range) {
            return [];
        } else if (expr instanceof AST.BinOpExpr) {
            return this.extractFunctionName(expr.Left).concat(this.extractFunctionName(expr.Right));
        } else if (expr instanceof AST.ParensExpr) {
            return this.extractFunctionName(expr.Expr);
        } else if (expr instanceof AST.PostfixOpExpr) {
            return this.extractFunctionName(expr.Expr);
        } else if (expr instanceof AST.ReferenceExpr) {
            return this.extractFunctionName(expr.Ref);
        } else if (expr instanceof AST.ReferenceFunction) {
            var res = [expr.FunctionName];
            for (var i = 0; i < expr.ArgumentList.length; i++) {
                res = res.concat(this.extractFunctionName(expr.ArgumentList[i]));
            }
            return res;
        } else if (expr instanceof AST.UnaryOpExpr) {
            return this.extractFunctionName(expr.Expr);
        } else {
            XLogger.log(expr.toString());
            return [];
        }
    };

    Parser.extractNamedRanges = function (formula) {
        var res = [], i;
        if (formula instanceof AST.Address || formula instanceof AST.ConstantArray || formula instanceof AST.ConstantError || formula instanceof AST.ConstantLogical || formula instanceof AST.ConstantNumber || formula instanceof AST.ConstantString || formula instanceof AST.Range || formula instanceof AST.ReferenceAddress || formula instanceof AST.ReferenceRange) {
            return [];
        } else if (formula instanceof AST.ReferenceNamed) {
            return[
                {book_name: formula.WorkbookName, range_name: formula._varname}
            ];
        } else if (formula instanceof AST.BinOpExpr) {
            return this.extractNamedRanges(formula.Left).concat(this.extractNamedRanges(formula.Right));
        } else if (formula instanceof AST.ParensExpr) {
            return this.extractNamedRanges(formula.Expr);
        } else if (formula instanceof AST.PostfixOpExpr) {
            return this.extractNamedRanges(formula.Expr);
        } else if (formula instanceof AST.ReferenceExpr) {
            return this.extractNamedRanges(formula.Ref);
        } else if (formula instanceof AST.ReferenceFunction) {
            for (i = 0; i < formula.ArgumentList.length; i++) {
                res = res.concat(this.extractNamedRanges(formula.ArgumentList[i]));
            }
            return res;
        } else if (formula instanceof AST.UnaryOpExpr) {
            return this.extractNamedRanges(formula.Expr);
        } else {
            XLogger.log(formula.toString());
            throw Error("Unsupported type");
        }
    };

    Parser.extractImportRange = function (formula) {
        var res = [], i;
        if (formula instanceof AST.Address || formula instanceof AST.ConstantArray || formula instanceof AST.ConstantError || formula instanceof AST.ConstantLogical || formula instanceof AST.ConstantNumber || formula instanceof AST.ConstantString || formula instanceof AST.Range || formula instanceof AST.ReferenceAddress || formula instanceof AST.ReferenceNamed || formula instanceof AST.ReferenceRange) {
            return [];
        } else if (formula instanceof AST.BinOpExpr) {
            return this.extractImportRange(formula.Left).concat(this.extractImportRange(formula.Right));
        } else if (formula instanceof AST.ParensExpr) {
            return this.extractImportRange(formula.Expr);
        } else if (formula instanceof AST.PostfixOpExpr) {
            return this.extractImportRange(formula.Expr);
        } else if (formula instanceof AST.ReferenceExpr) {
            return this.extractImportRange(formula.Ref);
        } else if (formula instanceof AST.ReferenceFunction) {
            if (formula.FunctionName == "ImportRange") {
                if (formula.ArgumentList.length === 2 && formula.ArgumentList[0].Ref instanceof AST.ConstantString && formula.ArgumentList[1].Ref instanceof AST.ConstantString) {
                    return [
                        {book_name: formula.ArgumentList[0].Ref._value, range_address: formula.ArgumentList[1].Ref._value}
                    ];
                }
            } else {
                for (i = 0; i < formula.ArgumentList.length; i++) {
                    res = res.concat(this.extractImportRange(formula.ArgumentList[i]));
                }
            }
            return res;
        } else if (formula instanceof AST.UnaryOpExpr) {
            return this.extractImportRange(formula.Expr);
        } else {
            XLogger.log(formula.toString());
            throw Error("Unsupported type");
        }
    };

    Parser.parseDate = function (/*string*/value, /*locale*/locale) {
        if (locale == "en_US") {

        }
        return false;

    };

    Parser.parseValue = function (/*any*/value, /*string*/locale) {
        var err = new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        var ret;
        if (typeof value == "number") {
            ret = new XTypedValue(value, XTypes.Number);
        } else if (err.test(value)) {
            ret = new XTypedValue(value, XTypes.Error);
        } else if (value === "FALSE") {
            ret = new XTypedValue(false, XTypes.Boolean);
        } else if (value === "TRUE") {
            ret = new XTypedValue(true, XTypes.Boolean);
        } else if (ret == Parser.parseDate(value, locale)) {
            ret = new XTypedValue(ret, XTypes.Date);
        } else {
            //Just a string
            ret = new XTypedValue(value, XTypes.String);
        }
        return ret;
    };
    Parser.getNumberFromDate = function (/*Date*/date) {
        if (date instanceof Date) {
            return 0;
        } else {
            throw new Error("This is not a date" + date);
        }

    };

    Parser.getStringFromDate = function (/*Date*/date) {

    };

    Parser.getDateFromNumber = function (/*Number*/nr) {
        return new Date();
    };

    return Parser;

})
;
