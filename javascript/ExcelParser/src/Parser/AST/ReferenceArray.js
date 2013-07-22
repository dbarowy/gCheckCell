//TODO incomplete
define("Parser/AST/ReferenceArray", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceArray(/*string */wsname, /*int*/ value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ReferenceArray, Reference);

    ReferenceArray.prototype.toString = function () {
        return "Array(" + this._value + ")";
    };
    return ReferenceArray;
});
