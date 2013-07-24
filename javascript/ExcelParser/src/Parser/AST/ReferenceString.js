/**
 * This file contains the ReferenceString class.
 * This class is used to represent string constants in the formulas
 */
define("Parser/AST/ReferenceString", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceString(/*string*/ wsname, /*string*/value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ReferenceString, Reference);

    ReferenceString.prototype.toString = function () {
        return "String(" + this._value + ")";
    };
    return ReferenceString;
});