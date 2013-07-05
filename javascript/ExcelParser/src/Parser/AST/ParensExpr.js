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

    return ParensExpr;
});