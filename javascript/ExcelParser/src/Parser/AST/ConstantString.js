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

    ConstantString.prototype.compute = function (/*XApplication*/app, /*Address*/source) {
        return this._value;
    };
    return ConstantString;
});