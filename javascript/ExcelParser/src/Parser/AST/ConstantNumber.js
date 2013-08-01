/**
 * This file contains the ReferenceConstant class.
 * This represents numerical constants in the formulas.
 * The value is a double number.
 */
define("Parser/AST/ConstantNumber", ["Parser/AST/Reference"], function (Reference) {
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
     * @returns {*}
     */
    ConstantNumber.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array) {
        return this._value;
    };
    return ConstantNumber;
});
