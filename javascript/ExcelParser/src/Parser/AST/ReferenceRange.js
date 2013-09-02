/**
 * This file contains the ReferenceRange class. This is used to wrap Range objects.
 */
define("Parser/AST/ReferenceRange", ["Parser/AST/Reference", "FSharp/FSharp"], function ( Reference, FSharp) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceRange(/*string*/wsname, /*Range*/ rng) {
        Reference.call(this, wsname);
        this.Range = rng;
        this.Range.setWorksheetName(wsname);
    }

    inheritPrototype(ReferenceRange, Reference);

    ReferenceRange.prototype.toString = function () {
        if (this.WorksheetName !== null && typeof(this.WorksheetName) !== "undefined" && !(this.WorksheetName instanceof  FSharp.None)) {
            return "ReferenceRange(" + this.WorksheetName + "," + this.Range.toString() + ")";
        }
        else {
            return "ReferenceRange(None, " + this.Range.toString() + ")";
        }
    };

    ReferenceRange.prototype.resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ws) {
        // we assume that missing workbook and worksheet
        // names mean that the address is local to the current
        // workbook and worksheet
        if (this.WorkbookName !== null && typeof(this.WorkbookName) !== "undefined" && !(this.WorkbookName instanceof  FSharp.None)) {
            this.Range.setWorkbookName(this.WorkbookName);
        }
        else {
            this.Range.setWorkbookName(wb.Name);
            this.WorkbookName = wb.Name;
        }
        if (this.WorksheetName !== null && typeof(this.WorksheetName) !== "undefined" && !(this.WorksheetName instanceof  FSharp.None)) {
            this.Range.setWorksheetName(this.WorksheetName);
        }
        else {
            this.Range.setWorksheetName(ws.Name);
            this.WorksheetName = ws.Name;
        }
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
    ReferenceRange.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range,/*Boolean*/full_range) {

        return this.Range.compute(app, source, array, range, false);
    };
    return ReferenceRange;

});