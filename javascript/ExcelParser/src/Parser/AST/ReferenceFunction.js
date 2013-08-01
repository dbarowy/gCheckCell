/**
 * This file contains the ReferenceFunction class.
 * This class is used to represent function calls in the formulas.
 */
define("Parser/AST/ReferenceFunction",["Parser/AST/Reference"], function (Reference) {
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

    /**
     * TODO
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @returns {*}
     */
    ReferenceFunction.prototype.compute = function (/*XApplication*/app, /*Address*/source) {
      throw new Error("Unimplemented");
    };
    return ReferenceFunction;

});