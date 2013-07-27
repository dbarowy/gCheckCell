define("Parser/AST/ConstantArray", ["Parser/AST/Reference"], function (Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ConstantArray(/*string */wsname, /*Constant Array*/ values) {
        Reference.call(this, wsname);
        this._values = values;
    }

    inheritPrototype(ConstantArray, Reference);

    ConstantArray.prototype.toString = function () {
        var i, rows, cols, j;
        var aux, res = "[";
        for (i = 0, rows = this._values.length; i < rows; i++) {
            aux = "[";
            for (j = 0, cols = this._values[i].length; j < cols; j++) {
                aux += this._values[i][j].toString() + ", ";
            }
            res += aux.substring(0, aux.length - 2) + "],";
        }
        res = res.substring(0, res.length - 1) + "]";
        return "Array(" + res + ")";
    };
    return ConstantArray;
});
