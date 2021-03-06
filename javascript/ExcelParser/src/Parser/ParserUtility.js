/**
 This file is part of CheckCell for Google Spreadsheets and Office 2013.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with GCC; see the file COPYING3.  If not see
 <http://www.gnu.org/licenses/>.
 */

/**
 * @Author Alexandru Toader, alexandru.v.toader@gmail.com
 * @Description This module contains functions used to extract cell and range references from the AST
 */
define("Parser/ParserUtility", ["Parser/AST/AST", "Parser/Parser", "FSharp/FSharp", "XClasses/XLogger"], function (AST, Parser, FSharp, XLogger) {
    "use strict";
    var ParserUtility = {};
    /**
     * @param fnname
     * @returns {boolean}
     */
    ParserUtility.puntedFunction = function (/*string*/fnname) {
        var punted = ["INDEX", "HLOOKUP", "VLOOKUP", "LOOKUP", "OFFSET"];
        return (punted.indexOf(fnname) > -1);
    };
    ParserUtility.getRangeReferenceRanges = function (/*AST.ReferenceRange*/ ref) {
        if (ref instanceof AST.ReferenceRange) {
            return new Array(ref.Range);
        } else {
            throw new Error("Unsupported type.");
        }

    };
    /**
     * Get Range References from the arguments of a function if the function is not a "puntedFunction"
     * @param ref
     * @returns {Array}
     */
    ParserUtility.getFunctionRanges = function (/*AST.ReferenceFunction*/ ref) {
        var i, len = ref.ArgumentList.length, res = [];
        if (this.puntedFunction(ref.FunctionName)) {
            return [];
        } else {
            for (i = 0; i < len; i++) {
                res = res.concat(this.getExprRanges(ref.ArgumentList[i]));
            }
            return res;
        }

    };
    /**
     * Get ranges from Expression classes.
     * @param expr
     * @returns {*}
     */
    ParserUtility.getExprRanges = function (/*AST.Expression*/ expr) {
        if (expr instanceof  AST.ReferenceExpr) {
            return this.getRanges(expr.Ref);
        } else if (expr instanceof AST.BinOpExpr) {
            return (this.getExprRanges(expr.Left)).concat(this.getExprRanges(expr.Right));
        } else if (expr instanceof AST.UnaryOpExpr) {
            return this.getExprRanges(expr.Expr);
        } else if (expr instanceof AST.ParensExpr) {
            return this.getExprRanges(expr.Expr);
        } else if (expr instanceof AST.PostfixOpExpr) {
            return this.getExprRanges(expr.Expr);
        } else {
            throw new Error("Unknown reference type.");
        }
    };

    ParserUtility.getRanges = function (/*AST.Reference*/ ref) {
        if ((ref instanceof AST.ConstantError) || (ref instanceof AST.ConstantLogical) || (ref instanceof AST.ReferenceAddress) || (ref instanceof AST.ReferenceNamed) || (ref instanceof AST.ConstantNumber) || (ref instanceof AST.ConstantString)) {
            return [];
        }
        else if (ref instanceof AST.ReferenceRange) {
            return this.getRangeReferenceRanges(ref);
        } else if (ref instanceof AST.ReferenceFunction) {
            return this.getFunctionRanges(ref);
        } else {
            throw new Error("Unknow reference type.");
        }
    };

    /**
     * Extract range references from formula.
     * @param formula
     * @param wb XWorkbook where the formulas are located
     * @param ws XWorksheet where the formulas are located
     * @returns {Array} Array of XRange objects representing the spreadsheet objects associated with the range references
     */
    ParserUtility.getReferencesFromFormula = function (/*string*/formula, /*XWorkbook*/wb, /*XWorksheet*/ws) {
        var tree = Parser.parseFormula(formula, wb, ws), res = [];
        var refs, i, len;
        if (tree instanceof FSharp.None) {
            return [];
        }
        else {
            refs = ParserUtility.getExprRanges(tree);
            for (i = 0, len = refs.length; i < len; i++) {
                res.push(refs[i].getCOMObject(wb.Application));
            }
        }
        return res;
    };
    /**
     * Get single cell and range references from the sheet while parsing the formulas only once.
     * @param formula The formula to parse
     * @param wb The workbook to which we resolve the formulas
     * @param ws The worksheet to which we resolve the formulas
     * @param addresses An empty array into which we push the values
     * @param ranges An empty array into which we push the values
     * @returns {*}
     */
    ParserUtility.getAllReferencesFromFormula = function (/*string*/ formula, /*XWorkbook*/wb, /*XWorksheet*/ws, /*Address[]*/addresses, /*XRanges[]*/ranges) {
        var tree = Parser.parseFormula(formula, wb, ws), res = [];
        var refs, i, len;
        if (!(tree instanceof FSharp.None)) {
            refs = ParserUtility.getExprRanges(tree);
            for (i = 0, len = refs.length; i < len; i++) {
                try {
                    ranges.push(refs[i].getCOMObject(wb.Application));
                } catch (e) {
                    XLogger.log(e + "\n" + formula);
                }
            }
            refs = ParserUtility.getSCExprRanges(tree);
            for (i = 0, len = refs.length; i < len; i++) {
                addresses.push(refs[i]);
            }
        }
    };

//Single cell variants
    ParserUtility.getSCExprRanges = function (/*AST.Expression*/expr) {
        if (expr instanceof AST.ReferenceExpr) {
            return this.getSCRanges(expr.Ref);
        } else if (expr instanceof AST.BinOpExpr) {
            return (this.getSCExprRanges(expr.Left)).concat(this.getSCExprRanges(expr.Right));
        } else if (expr instanceof AST.UnaryOpExpr) {
            return this.getSCExprRanges(expr.Expr);
        } else if (expr instanceof AST.ParensExpr) {
            return this.getSCExprRanges(expr.Expr);
        } else if (expr instanceof AST.PostfixOpExpr) {
            return this.getSCExprRanges(expr.Expr);
        } else {
            throw new Error("Unknown expression type.");
        }
    };

    ParserUtility.getSCRanges = function (/*AST.Reference*/ref) {
        if ((ref instanceof AST.ConstantError) || (ref instanceof AST.ConstantLogical) || (ref instanceof AST.ReferenceRange) || (ref instanceof AST.ReferenceNamed) || (ref instanceof AST.ConstantNumber) || (ref instanceof AST.ConstantString)) {
            return [];
        } else if (ref instanceof AST.ReferenceAddress) {
            return this.getSCAddressReferenceRanges(ref);
        } else if (ref instanceof AST.ReferenceFunction) {
            return this.getSCFunctionRanges(ref);
        } else {
            throw new Error("Unknown reference type.");
        }
    };
    ParserUtility.getSCAddressReferenceRanges = function (/*AST.ReferenceAddress*/ ref) {
        if (ref instanceof AST.ReferenceAddress) {
            return new Array(ref.Address);
        }
        else {
            throw new Error("Unsupported type.");
        }
    };

    ParserUtility.getSCFunctionRanges = function (/*AST.ReferenceFunction*/ ref) {
        var i, len, res = [];
        if (this.puntedFunction(ref.FunctionName)) {
            return [];
        } else {
            for (i = 0, len = ref.ArgumentList.length; i < len; i++) {
                res = res.concat(this.getSCExprRanges(ref.ArgumentList[i]));
            }
            return res;
        }
    };

    ParserUtility.getSingleCellReferencesFromFormula = function (/*string*/formula, /*Workbook*/wb, /*Worksheet*/ws) {
        var tree = Parser.parseFormula(formula, wb, ws);
        if (tree instanceof FSharp.None) {
            return [];
        } else {
            return this.getSCExprRanges(tree);
        }
    };
    return ParserUtility;

});





