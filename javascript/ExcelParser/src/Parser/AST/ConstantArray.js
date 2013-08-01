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

    /**
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @returns {*}
     */
    ConstantArray.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array) {
        var i, j, len, len2, res = [], row;
        if (array) {
            for (i = 0, len = this._values.length; i < len; i++) {
                row = [];
                for (j = 0, len2 = this._values[i].length; j < len2; j++) {
                    row.push(this._values[i][j].compute(app, source, array));
                }
                res.push(row);
            }
            return res;
        } else {
            //TODO is this alright?
            return [
                [this._values[0][0].compute(app, source, array)]
            ];
        }
    };
    return ConstantArray;
});
