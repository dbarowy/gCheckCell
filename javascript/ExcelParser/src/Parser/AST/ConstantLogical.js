/**
 * This file contains the ConstantLogical class.
 * This class is used to represent logical constants in the formulas: TRUE/FALSE
 */
define("Parser/AST/ConstantLogical", ["Parser/AST/Reference", "XClasses/XTypedValue", "XClasses/XTypes"], function (Reference, XTypedValue, XTypes) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ConstantLogical(/*string*/ wsname, /*string*/value) {
        Reference.call(this, wsname);
        this._value = (value === "TRUE");
    }

    inheritPrototype(ConstantLogical, Reference);

    ConstantLogical.prototype.toString = function () {
        return "Logical(" + this._value + ")";
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
    ConstantLogical.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        var val = new XTypedValue(this._value, XTypes.Boolean);
        if (array) {
            return [
                [val]
            ];
        } else {
            return val;
        }
    };

    return ConstantLogical;
});