/**
 * Author: Alexandru Toader
 */
define("Parser/ParserUtility",["Parser/AST/AST", "Parser/Parser", "FSharp/FSharp"], function (AST, Parser, FSharp) {
    "use strict";
    var ParserUtility = {};
    ParserUtility.puntedFunction = function (/*string*/fnname) {
        return (fnname === "INDEX" || fnname === "HLOOKUP" || fnname === "VLOOKUP" || fnname === "LOOKUP" || fnname === "OFFSET");

    };
    ParserUtility.getRangeReferenceRanges = function (/*AST.ReferenceRange*/ ref) {
        if (ref instanceof AST.ReferenceRange) {
            return new Array(ref.Range);
        } else {
            throw new Error("Unsupported type.");
        }

    };
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
    ParserUtility.getExprRanges = function (/*AST.Expression*/ expr) {
        if (expr instanceof  AST.ReferenceExpr) {
            return this.getRanges(expr.Ref);
        } else if (expr instanceof AST.BinOpExpr) {
            return (this.getExprRanges(expr.Expr1)).concat(this.getExprRanges(expr.Expr2));
        } else if (expr instanceof AST.UnaryOpExpr) {
            return this.getExprRanges(expr.Expr);
        } else if (expr instanceof AST.ParensExpr) {
            return this.getExprRanges(expr.Expr);
        } else {
            throw new Error("Unknown reference type.");
        }
    };
    ParserUtility.getRanges = function (/*AST.Reference*/ ref) {
        if ((ref instanceof AST.ReferenceAddress) || (ref instanceof AST.ReferenceNamed) || (ref instanceof AST.ReferenceConstant) || (ref instanceof AST.ReferenceString)) {
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

    ParserUtility.getReferencesFromFormula = function (/*string*/formula, /*XWorkbook*/wb, /*XWorksheet*/ws) {
        var tree = Parser.parseFormula(formula, wb, ws), res = [];
        var refs, i, len;
        if (tree instanceof FSharp.None) {
            return [];
        }
        else {
            refs = ParserUtility.getExprRanges(tree);
            for (i = 0, len = refs.length; i < len; i++) {
                res.push(refs[i].GetCOMObject(wb.Application));
            }
        }
        return res;
    };


//TODO Test

//Single cell variants
    ParserUtility.getSCExprRanges = function (/*AST.Expression*/expr) {
        if (expr instanceof AST.ReferenceExpr) {
            return this.getSCRanges(expr.Ref);
        } else if (expr instanceof AST.BinOpExpr) {
            return (this.getSCExprRanges(expr.Expr1)).concat(this.getSCExprRanges(expr.Expr2));
        } else if (expr instanceof AST.UnaryOpExpr) {
            return this.getSCExprRanges(expr.Expr);
        } else if (expr instanceof AST.ParensExpr) {
            return this.getSCExprRanges(expr.Expr);
        } else {
            throw new Error("Unknown expression type.");
        }
    };

    ParserUtility.getSCRanges = function (/*AST.Reference*/ref) {
        if ((ref instanceof AST.ReferenceRange) || (ref instanceof AST.ReferenceNamed) || (ref instanceof AST.ReferenceConstant) || (ref instanceof AST.ReferenceString)) {
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






