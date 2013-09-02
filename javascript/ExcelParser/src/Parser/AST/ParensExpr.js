/**
 * This file contains the ParensExpr class.
 * This class is used to represent expressions inside parentheses
 */
define("Parser/AST/ParensExpr", function () {
    "use strict";
    function ParensExpr(/*Expression*/expr) {
        this.Expr = expr;
    }

    ParensExpr.prototype.toString = function () {
        return "ParensExpr(" + this.Expr + ")";
    };
    ParensExpr.prototype.resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
        this.Expr.resolve(wb, ws);
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
     * @param full_range Some functions return an array of values even when they are not in an ARRAYFORMULA.
     * This parameters tells the function if we want the complete range of just the first element
     * @returns {*}
     */
    ParensExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range,/*Boolean*/full_range) {
        return this.Expr.compute(app, source, array, range, full_range);
    };

    return ParensExpr;
});