/**
 * This file contains the ReferenceNamed class.
 * This class is used to represent named references in the sheet.
 * TODO Implement named references
 */
define("Parser/AST/ReferenceNamed", ["Parser/AST/Reference", "FSharp/FSharp"], function (Reference, FSharp) {
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
    return ReferenceNamed;
});

