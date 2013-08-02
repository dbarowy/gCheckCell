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
     * @param range True if this is a range parameter to a function.
     * @returns {*}
     */
    UnaryOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range) {
        var val = this.Expr.compute(app, source, array, false), i, j;
        if (array) {
            switch (this.Operator) {
                case "+":
                    return val;
                case "-":
                {
                    for (i = 0; i < val.length; i++) {
                        for (j = 0; j < val[i].length; j++) {
                            val[i][j] = -val[i][j];
                        }
                    }
                    return val;
                }
                default:
                    throw new Error("Unknown operator");
            }
        } else {
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

        }

    };

    return UnaryOpExpr;

});