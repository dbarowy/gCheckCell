/**
 * This file contains the UnaryOpExpr class.
 * This class is used to represent expressions with prefix operators.
 * Example: -A2, +a5, -3
 */
define("Parser/AST/UnaryOpExpr", ["Parser/AST/BinOpExpr"], function (BinOpExpr) {

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
     * @param full_range Some functions return an array of values even when they are not in an ARRAYFORMULA.
     * This parameters tells the function if we want the complete range of just the first element
     * @returns {*}
     */
    UnaryOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        var val = this.Expr.compute(app, source, array, false, false), i, j;
        var err = new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (array) {
            switch (this.Operator) {
                case "+":
                    return val;
                case "-":
                {
                    for (i = 0; i < val.length; i++) {
                        for (j = 0; j < val[i].length; j++) {
                            if (isFinite(val[i][j])) {
                                val[i][j] = -val[i][j];
                            } else if (err.test(val[i][j])) {
                                break;
                            } else {
                                val[i][j] = "#VALUE!";
                            }
                        }
                    }
                    return val;
                }
                default:
                    throw new Error("Unknown operator");
            }
        } else {
            if (isFinite(val)) {
                switch (this.Operator) {
                    case "+":
                        return val;
                    case "-":
                        return -val;
                    default:
                        throw new Error("Unknown operator");
                }
            } else {
                return "#VALUE!";
            }

        }

    };

    return UnaryOpExpr;

});