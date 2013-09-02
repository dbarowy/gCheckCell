/**
 * This file contains the ConstantNumber class.
 * This represents numerical constants in the formulas.
 * The value is a double number.
 */
define("Parser/AST/ConstantNumber", ["Parser/AST/Reference", "XClasses/XTypedValue", "XClasses/XTypes"], function (Reference, XTypedValue, XTypes) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ConstantNumber(/*string */wsname, /*int*/ value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ConstantNumber, Reference);

    ConstantNumber.prototype.toString = function () {
        return "Constant(" + this._value + ")";
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
    ConstantNumber.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        var val = new XTypedValue(this._value, XTypes.Number);
        if (array) {
            return [
                [val]
            ];
        } else {
            return val;
        }
    };
    return ConstantNumber;
});
