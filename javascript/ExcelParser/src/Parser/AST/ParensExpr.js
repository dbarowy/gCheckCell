/**
 * This file contains the class ParensExpr which is used to represent expressions inside parentheses
 */
define("Parser/AST/ParensExpr", function () {
    "use strict";
    function ParensExpr(/*Expression*/expr) {
        this.Expr = expr;
    }

    ParensExpr.prototype.toString = function () {
        return "ParensExpr(" + this.Expr + ")";
    };
    ParensExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
        this.Expr.Resolve(wb, ws);
    };
    ParensExpr.prototype.fixAssoc = function () {
        this.Expr.fixAssoc();
    };

    /**
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @param range True if this is a range parameter to a function.
     * @returns {*}
     */
    ParensExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range) {
        return this.Expr.compute(app, source, array, range);
    };

    return ParensExpr;
});