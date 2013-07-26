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

    ConstantLogical.prototype.compute = function (/*XApplication*/app, /*Address*/source) {
        return this._value;
    };

    return ConstantLogical;
});