/**
 * This file contains the ReferenceFunction class.
 * This class is used to represent function calls in the formulas.
 */
define("Parser/AST/ReferenceFunction", ["Parser/AST/Reference"], function (Reference, Function) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceFunction(/*string*/wsname, /*string*/ fnname, /*Expression[]*/ arglist) {
        Reference.call(this, wsname);
        this.ArgumentList = arglist;
        this.FunctionName = fnname;
    }

    inheritPrototype(ReferenceFunction, Reference);

    ReferenceFunction.prototype.toString = function () {
        return this.FunctionName + "(" + this.ArgumentList.join(",") + ")";
    };
    ReferenceFunction.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        var i, len;
        for (i = 0, len = this.ArgumentList.length; i < len; i++) {
            this.ArgumentList[i].Resolve(wb, ws);
        }
    };
    ReferenceFunction.prototype.fixAssoc = function () {
        var i, len;
        for (i = 0, len = this.ArgumentList.length; i < len; i++) {
            this.ArgumentList[i].fixAssoc();
        }
    };


    ReferenceFunction.prototype._containsError = function (matrix) {
        var err = new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        var i, j;
        for (i = 0; i < matrix.length; i++) {
            for (j = 0; j < matrix[0].length; j++) {
                if (err.test(matrix[i][j])) {
                    return matrix[i][j];
                }
            }
        }
        return false;
    };

    /**
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @param range True if this is a range parameter to a function.
     * @returns {*}
     */
    ReferenceFunction.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range) {
        var func = Function[this.FunctionName];
        if (typeof func === "undefined") {
            throw new Error("Unimplemented function " + this.FunctionName);
        } else {
            return func(app, source, array, range, this.ArgumentList);
        }

    };
    return ReferenceFunction;

});