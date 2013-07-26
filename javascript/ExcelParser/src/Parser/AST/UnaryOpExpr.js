/**
 * This file contains the UnaryOpExpr class.
 * This class is used to represent expressions with prefix operators.
 * Example: -A2, +a5, -3
 */
define("Parser/AST/UnaryOpExpr", function () {
    "use strict";
    function UnaryOpExpr(/*char*/op, /*Expression*/expr) {
        this.Expr = expr;
        this.Operator = op;
    }

    UnaryOpExpr.prototype.toString = function () {
        return "UnaryOpExpr('" + this.Operator + "'," + this.Expr + ")";
    };

    UnaryOpExpr.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        this.Expr.Resolve(wb, ws);
    };

    UnaryOpExpr.prototype.fixAssoc = function () {
        this.Expr.fixAssoc();
    };

    UnaryOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source) {
        switch (this.Operator) {
            case "+":
                return this.Expr.compute(app, source);
            case "-":
                return -(this.Expr.compute(app, source));
            default:
                throw new Error("Unknown operator");
        }
    };

    return UnaryOpExpr;

});