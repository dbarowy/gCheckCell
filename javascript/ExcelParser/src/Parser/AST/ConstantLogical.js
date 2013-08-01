/**
 * This file contains the ReferenceLogical class.
 * This class is used to represent logical constants in the formulas: TRUE/FALSE
 */
define("Parser/AST/ConstantLogical", ["Parser/AST/Reference"], function (Reference) {
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
     * @returns {*}
     */
    ConstantLogical.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array) {
        return this._value;
    };

    return ConstantLogical;
});