/**
 * Author: Alexandru Toader
 */
//TODO A plain old object is enough for this case but I realized it too late. Refactor it when you understand RequiredJS
var ParserUtility;
ParserUtility = (function () {
    "use strict";

    var ParserUtility = {};


    ParserUtility.PuntedFunction = function (/*string*/fnname) {
        return (fnname === "INDEX" || fnname === "HLOOKUP" || fnname === "VLOOKUP" || fnname === "LOOKUP" || fnname !== "OFFSET");
    };

    ParserUtility.GetRangeReferenceRanges = function (/*AST.ReferenceRange*/ ref) {
        return new Array(ref.Range);
    };

    ParserUtility.GetFunctionRanges = function (/*AST.ReferenceFunction*/ ref) {
        var i = ref.ArgumentList.length, res = [];
        if (this.PuntedFunction(ref.FunctionName)) {
            return [];
        } else {
            while (--i) {
                res.concat(this.GetExprRanges(ref.ArgumentList[i]));
            }
        }
        return res;
    };

    ParserUtility.GetExprRanges = function (/*AST.Expression*/ expr) {
        if (expr instanceof  AST.ReferenceExpr) {
            return this.GetRanges(expr.Ref);
        } else if (expr instanceof AST.BinOpExpr) {
            return (this.GetExprRanges(expr.Expr1)).concat(this.GetExprRanges(expr.Expr2));
        } else if (expr instanceof AST.UnaryOpExpr) {
            return this.GetExprRanges(expr.Expr);
        } else if (expr instanceof AST.ParensExpr) {
            return this.GetExprRanges(expr.Expr);
        } else {
            throw new Error("Unknow reference type.");
        }
    };

    ParserUtility.GetRanges = function (/*AST.Reference*/ ref) {
        if ((ref instanceof AST.ReferenceAddress) || (ref instanceof AST.ReferenceNamed) || (ref instanceof AST.ReferenceConstant) || (ref instanceof AST.ReferenceString)) {
            return [];
        }
        else if (ref instanceof AST.ReferenceRange) {
            return this.GetRangeReferenceRanges(ref);
        } else if (ref instanceof AST.ReferenceFunction) {
            return this.GetFunctionRanges(ref);
        } else {
            throw new Error("Unknow reference type.");
        }
    };

    ParserUtility.GetReferencesFromFormula = function (/*string*/formula, /*Workbook*/wb, /*Worksheet*/ws) {
        throw "Not implemented";
        /* let app = wb.Application
         match ExcelParser.parseFormula(formula, wb, ws) with
         | Some(tree) ->
         let refs = GetExprRanges(tree)
         List.map (fun (r: AST.Range) -> r.GetCOMObject(wb.Application)) refs |> Seq.ofList
         | None -> [] |> Seq.ofList*/
    };

    ParserUtility.GetSCExprRanges = function (/*AST.Expression*/expr) {
        if (expr instanceof AST.ReferenceExpr) {
            return this.GetSCRanges(expr.Ref);
        } else if (expr instanceof AST.BinOpExpr) {
            return (this.GetSCExprRanges(expr.Expr1)).concat(this.GetSCExprRanges(expr.Expr2));
        } else if (expr instanceof AST.UnaryOpExpr) {
            return this.GetSCExprRanges(expr.Expr);
        } else if (expr instanceof AST.ParensExpr) {
            return this.GetSCExprRanges(expr.Expr);
        } else {
            throw new Error("Unknow expression type.");
        }
    };

    ParserUtility.GetSCRanges = function (/*AST.Reference*/ref) {
        if ((ref instanceof AST.ReferenceRange) || (ref instanceof AST.ReferenceNamed) || (ref instanceof AST.ReferenceConstant) || (ref instanceof AST.ReferenceString)) {
            return [];
        } else if (ref instanceof AST.ReferenceAddress) {
            return this.GetSCAddressReferenceRange(ref);
        } else if (ref instanceof AST.ReferenceFunction) {
            return this.GetSCFunctionRanges(ref);
        } else {
            throw new Error("Unknown reference type.");
        }
    };

    ParserUtility.GetSCAddressReferenceRanges = function (/*AST.ReferenceAddress*/ ref) {
        return new Array(ref);
    };

    ParserUtility.GetSCFunctionRanges = function (/*AST.ReferenceFunction*/ ref) {
        var i = ref.ArgumentList.length, res = [];
        if (this.PuntedFunction(ref.FunctionName)) {
            return [];
        } else {
            while (--i) {
                res.concat(this.GetSCExprRanges(ref.ArgumentList[i]));
            }
            return res;
        }
    };

    ParserUtility.GetSingleCellReferencesFromFormula = function (/*string*/formula, /*Workbook*/wb, /*Worksheet*/ws) {
        throw "You must implement this method";
        /* let app = wb.Application
         match ExcelParser.parseFormula(formula, wb, ws) with
         | Some(tree) -> GetSCExprRanges(tree) |> Seq.ofList
         | None -> [] |> Seq.ofList*/
    };

})();