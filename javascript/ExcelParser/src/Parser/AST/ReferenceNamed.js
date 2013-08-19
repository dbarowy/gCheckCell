/**
 * This file contains the ReferenceNamed class.
 * This class is used to represent named references in the sheet.
 * TODO Implement named references
 */
define("Parser/AST/ReferenceNamed", ["Parser/AST/Reference", "FSharp/FSharp", "Parser/AST/ConstantError"], function (Reference, FSharp, ConstantError) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceNamed(/*string*/wsname, /*string*/ varname) {
        Reference.call(this, wsname);
        this._varname = varname;
    }

    inheritPrototype(ReferenceNamed, Reference);

    ReferenceNamed.prototype.toString = function () {
        if (this.WorksheetName !== null && typeof(this.WorksheetName) !== 'undefined' && !(this.WorksheetName instanceof FSharp.None)) {
            return "ReferenceName(" + this.WorksheetName + "," + this._varname + ")";
        }
        else {
            return "ReferenceName(None, " + this._varname + ")";
        }
    };

    /**
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @param range True if this is a range parameter to a function.
     * @returns {*}
     */
    ReferenceNamed.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range) {
        try {
            var rng = app.getNamedRange(this);
            return rng.compute(app, source, array, range);
        } catch (e) {
            return (new ConstantError(this.WorksheetName, "#NAME?")).compute(app, source, array, range);

        }
    };
    return ReferenceNamed;
});

