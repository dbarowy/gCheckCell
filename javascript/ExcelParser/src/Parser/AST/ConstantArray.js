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
     * @param range True if this is a range parameter to a function.
     * @param full_range Some functions return an array of values even when they are not in an ARRAYFORMULA.
     * This parameters tells the function if we want the complete range of just the first element
     * @returns {*}
     */
    ConstantArray.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        var i, j, len, len2, res = [], row;
        if (array || range || full_range) {
            for (i = 0, len = this._values.length; i < len; i++) {
                row = [];
                for (j = 0, len2 = this._values[i].length; j < len2; j++) {
                    //The array holds only constant values
                    row.push(this._values[i][j].compute(app, source, false, false, false));
                }
                res.push(row);
            }
            return res;
        } else {
            //The array holds only constant values, we don't care about array results so we set the array parameter to false
            return this._values[0][0].compute(app, source, false, false, false);
        }
    };
    return ConstantArray;
});
