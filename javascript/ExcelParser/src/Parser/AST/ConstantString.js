/**
 * This file contains the ReferenceString class.
 * This class is used to represent string constants in the formulas
 */
define("Parser/AST/ConstantString", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ConstantString(/*string*/ wsname, /*string*/value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ConstantString, Reference);

    ConstantString.prototype.toString = function () {
        return "String(" + this._value + ")";
    };
    /**
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @returns {*}
     */
    ConstantString.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array) {
        return this._value;
    };
    return ConstantString;
});