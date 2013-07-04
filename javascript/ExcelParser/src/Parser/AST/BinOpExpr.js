define(function () {
    "use strict";
    function BinOpExpr(/*string*/op, /*Expression*/expr1, /*Expression*/expr2) {
        this.Operator = op;
        this.Expr1 = expr1;
        this.Expr2 = expr2;
    }

    BinOpExpr.prototype.toString = function () {
        return "BinOpExpr(\"" + this.Operator + "\"," + this.Expr1.toString() + "," + this.Expr2.toString() + ")";
    };

    BinOpExpr.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        this.Expr1.Resolve(wb, ws);
        this.Expr2.Resolve(wb, ws);
    };
    return BinOpExpr;
});