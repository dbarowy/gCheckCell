define("Parser/AST/ReferenceLogical", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceLogical(/*string*/ wsname, /*string*/value) {
        Reference.call(this, wsname);
        this._value = value;
    }

    inheritPrototype(ReferenceLogical, Reference);

    ReferenceLogical.prototype.toString = function () {
        return "Logical(" + this._value + ")";
    };
    return ReferenceLogical;
});