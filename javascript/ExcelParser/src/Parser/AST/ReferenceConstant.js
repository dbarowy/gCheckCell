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
    return ReferenceConstant;
});
