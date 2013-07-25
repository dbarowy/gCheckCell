/**
 * This file contains the ReferenceConstant class.
 * This represents numerical constants in the formulas.
 * The value is a double number.
 */
define("Parser/AST/ReferenceConstant", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceConstant(/*string */wsname, /*int*/ value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ReferenceConstant, Reference);

    ReferenceConstant.prototype.toString = function () {
        return "Constant(" + this._value + ")";
    };
    ReferenceConstant.prototype.getValue = function(source){
        return this._value;
    };
    return ReferenceConstant;
});
