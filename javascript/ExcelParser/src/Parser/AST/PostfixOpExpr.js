/**
 * This file contains the class PostfixOpExpr used to represent expressions that involve a postfix operator
 * Example: A3%
 */
define("Parser/AST/PostfixOpExpr", ["XClasses/XTypedValue", "XClasses/XTypes"], function (XTypedValue, XTypes) {
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
    PostfixOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        var val = this.Expr.compute(app, source, array, false, false), i, j;

        if (array) {
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            val[i][j].value = val[i][j].value / 100;
                        }
                            break;
                        case XTypes.Date:
                        {
                            val[i][j].value = Parser.getNumberFromDate(val[i][j].value) / 100;
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        //For the rest of the types we don't do anything
                    }
                }
            }
        } else {
            switch (val.type) {
                case XTypes.Number:
                {
                    val.value = val.value / 100;
                }
                    break;
                case XTypes.Date:
                {
                    val.value = Parser.getNumberFromDate(val.value) / 100;
                    val.type = XTypes.Number;
                }
                    break;
                //For the rest of the types we don't do anything
            }
        }
        return val;
    };

    return PostfixOpExpr;
});