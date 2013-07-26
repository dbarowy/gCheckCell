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
    ConstantNumber.prototype.compute = function(/*XApplication*/app, /*Address*/source){
        return this._value;
    };
    return ConstantNumber;
});
