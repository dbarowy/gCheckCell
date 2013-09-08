/**
 * This file contains the UnaryOpExpr class.
 * This class is used to represent expressions with prefix operators.
 * Example: -A2, +a5, -3
 */
define("Parser/AST/UnaryOpExpr", ["XClasses/XTypes", "Utilities/Util"], function (XTypes,Util) {
    "use strict";
    function UnaryOpExpr(/*char*/op, /*Expression*/expr) {
        this.Expr = expr;
        this.Operator = op;
    }

    UnaryOpExpr.prototype.toString = function () {
        return "UnaryOpExpr('" + this.Operator + "'," + this.Expr + ")";
    };

    UnaryOpExpr.prototype.resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        this.Expr.resolve(wb, ws);
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
        if (!(val instanceof Array)) {
            val = [
                [val]
            ];
        }
        switch (this.Operator) {
            case "+":
                //do nothing
                break;
            case "-":
            {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        switch (val[i][j].type) {
                            case XTypes.Date:
                            {
                                val[i][j].value = -Util.getNumberFromDate(val[i][j].value);
                                val[i][j].type = XTypes.Number;
                            }
                                break;
                            case XTypes.Boolean:
                            {
                                val[i][j].value = -val[i][j].value;
                                val[i][j].type = XTypes.Number;
                            }
                                break;
                            case XTypes.Number:
                            {
                                val[i][j].value = -val[i][j].value;
                                val[i][j].type = XTypes.Number;
                            }
                                break;
                            case XTypes.String:
                            {
                                if (isFinite(val[i][j].value)) {
                                    val[i][j].value = -(+val[i][j].value);
                                    val[i][j].type = XTypes.Number;
                                } else {
                                    val[i][j].value = "#VALUE!";
                                    val[i][j].type = XTypes.Error;
                                }

                            }
                                break;

                        }
                    }
                }
            }
                break;
            default:
                throw new Error("Unknown operator");
        }
        if (array) {
            return val;
        } else {
            return val[0][0];
        }
    };
    return UnaryOpExpr;

})
;