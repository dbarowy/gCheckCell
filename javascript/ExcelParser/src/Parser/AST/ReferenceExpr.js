/**
 * Thic class contains the ReferenceExpr class.
 * This is used to wrap every Expression type.
 */
define("Parser/AST/ReferenceExpr", ["Parser/AST/ReferenceFunction"], function (ReferenceFunction) {
    "use strict";
    function ReferenceExpr(/*Reference*/ ref) {
        this.Ref = ref;
    }

    ReferenceExpr.prototype.toString = function () {
        return "ReferenceExpr." + this.Ref.toString();
    };

    ReferenceExpr.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        this.Ref.Resolve(wb, ws);
    };
    /**
     * Only the ReferenceFunction has arguments that can be fixed.
     * The other type of arguments are constants types, addresses and ranges
     */
    ReferenceExpr.prototype.fixAssoc = function () {
        if (this.Ref instanceof ReferenceFunction) {
            this.Ref.fixAssoc();
        }
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
    ReferenceExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        return this.Ref.compute(app, source, array, range, full_range);
    };
    return ReferenceExpr;
});
