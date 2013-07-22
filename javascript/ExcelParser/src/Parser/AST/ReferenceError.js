define("Parser/AST/ReferenceError", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceError(/*string*/ wsname, /*string*/value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ReferenceError, Reference);

    ReferenceError.prototype.toString = function () {
        return "Error(" + this._value + ")";
    };
    return ReferenceError;
});