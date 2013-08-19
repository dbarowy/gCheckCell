/**
 * This file contains a simple interface for the PEGParser.
 *
 */

define("Parser/Parser", ["Parser/AST/AST", "FSharp/FSharp", "Parser/PEGParser", "XClasses/XLogger"], function (AST, FSharp, PEGParser, XLogger) {
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
            XLogger.log("getAddressReference\n"+e);
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


    Parser._extractNamedRanges = function (formula) {
        var res = [], i;
        if (formula instanceof AST.Address || formula instanceof AST.ConstantArray || formula instanceof AST.ConstantError || formula instanceof AST.ConstantLogical || formula instanceof AST.ConstantNumber || formula instanceof AST.ConstantString || formula instanceof AST.Range || formula instanceof AST.ReferenceAddress || formula instanceof AST.ReferenceRange) {
            return [];
        } else if (formula instanceof AST.ReferenceNamed) {
            return [formula];
        } else if (formula instanceof AST.BinOpExpr) {
            return this._extractNamedRanges(formula.Left).concat(this._extractNamedRanges(formula.Right));
        } else if (formula instanceof AST.ParensExpr) {
            return this._extractNamedRanges(formula.Expr);
        } else if (formula instanceof AST.PostfixOpExpr) {
            return this._extractNamedRanges(formula.Expr);
        } else if (formula instanceof AST.ReferenceExpr) {
            return this._extractNamedRanges(formula.Ref);
        } else if (formula instanceof AST.ReferenceFunction) {
            for (i = 0; i < formula.ArgumentList.length; i++) {
                res = res.concat(this._extractNamedRanges(formula.ArgumentList[i]));
            }
            return res;
        } else if (formula instanceof AST.UnaryOpExpr) {
            return this._extractNamedRanges(formula.Expr);
        } else {
            throw Error("Unsupported type");
        }
    };
    Parser._extractImportRange = function (formula) {
        var res = [], i;
        if (formula instanceof AST.Address || formula instanceof AST.ConstantArray || formula instanceof AST.ConstantError || formula instanceof AST.ConstantLogical || formula instanceof AST.ConstantNumber || formula instanceof AST.ConstantString || formula instanceof AST.Range || formula instanceof AST.ReferenceAddress || formula instanceof AST.ReferenceNamed || formula instanceof AST.ReferenceRange) {
            return [];
        } else if (formula instanceof AST.BinOpExpr) {
            return this._extractImportRange(formula.Left).concat(this._extractImportRange(formula.Right));
        } else if (formula instanceof AST.ParensExpr) {
            return this._extractImportRange(formula.Expr);
        } else if (formula instanceof AST.PostfixOpExpr) {
            return this._extractImportRange(formula.Expr);
        } else if (formula instanceof AST.ReferenceExpr) {
            return this._extractImportRange(formula.Ref);
        } else if (formula instanceof AST.ReferenceFunction) {
            if (formula.FunctionName == "ImportRange") {
                return [formula];
            } else {
                for (i = 0; i < formula.ArgumentList.length; i++) {
                    res = res.concat(this._extractImportRange(formula.ArgumentList[i]));
                }
            }
            return res;
        } else if (formula instanceof AST.UnaryOpExpr) {
            return this._extractImportRange(formula.Expr);
        } else {
            throw Error("Unsupported type");
        }
    };

    return Parser;

})
;
