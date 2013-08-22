/**
 * This file contains the class PostfixOpExpr used to represent expressions that involve a postfix operator
 * Example: A3%
 */
define("Parser/AST/PostfixOpExpr", function () {
    "use strict";
    function PostfixOpExpr(/*string*/op, /*Expression*/expr) {
        this.Operator = op;
        this.Expr = expr;
    }

    PostfixOpExpr.prototype.toString = function () {
        return "PostfixOpExpr(\"" + this.Operator + "\"," + this.Expr.toString() + ")";
    };

    PostfixOpExpr.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        this.Expr.Resolve(wb, ws);
    };
    PostfixOpExpr.prototype.fixAssoc = function () {
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
    PostfixOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range,/*Boolean*/full_range) {
        var val = this.Expr.compute(app, source, array, false,false), i, j;
        var err = new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (array) {
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    if (isFinite(val[i][j])) {
                        val[i][j] = (+val[i][j]) / 100;
                    } else if (err.test(val[i][j])) {
                        break;
                    } else {
                        val[i][j] = "#VALUE!";
                    }
                }
            }
        } else {
            return val / 100;
        }
    };

    return PostfixOpExpr;
});