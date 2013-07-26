/**
 * This class contains the ReferenceError class.
 * This is used to represents error values in the formulas.
 * For the full list of possible errors, check the Excel documentation
 */
define("Parser/AST/ConstantError", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ConstantError(/*string*/ wsname, /*string*/value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ConstantError, Reference);

    ConstantError.prototype.toString = function () {
        return "Error(" + this._value + ")";
    };

    /**
     * Any computation that involves an error will return an error.
     * The best way I can think to solve this is to throw the error and catch it at the top of the computation chain.
     */
    ConstantError.prototype.compute = function (/*XApplication*/app, /*Address*/source) {
        throw new Error(this._value);
    };

    return ConstantError;
});