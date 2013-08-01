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

    /**
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @returns {*}
     */
    UnaryOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array) {
        var val = this.Expr.compute(app, source, array);
        if (!isNaN(val)) {
            switch (this.Operator) {
                case "+":
                    return val;
                case "-":
                    return -val;
                default:
                    throw new Error("Unknown operator");
            }
        } else {
            throw new Error("#VALUE!");
        }

    };

    return UnaryOpExpr;

});