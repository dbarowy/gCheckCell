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
    ReferenceExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source) {
        return this.Ref.compute(app, source);
    };
    return ReferenceExpr;
});
