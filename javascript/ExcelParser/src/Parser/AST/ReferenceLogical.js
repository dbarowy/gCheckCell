/**
 * This file contains the ReferenceLogical class.
 * This class is used to represent logical constants in the formulas: TRUE/FALSE
 */
define("Parser/AST/ReferenceLogical", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceLogical(/*string*/ wsname, /*string*/value) {
        Reference.call(this, wsname);
        this._value = (value === "TRUE");
    }

    inheritPrototype(ReferenceLogical, Reference);

    ReferenceLogical.prototype.toString = function () {
        return "Logical(" + this._value + ")";
    };

    ReferenceLogical.prototype.getValue = function (source) {
        return this._value;
    };

    return ReferenceLogical;
});