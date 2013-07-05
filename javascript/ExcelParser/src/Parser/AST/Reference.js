define("Parser/AST/Reference", ["FSharp/FSharp"], function (FSharp) {
    "use strict";
    function Reference(/*string*/ wsname) {
        this.WorkbookName = null;
        this.WorksheetName = wsname;
    }

    /**
     *
     * @param ref
     * @returns {boolean}
     * @constructor
     */
    Reference.prototype.InsideRef = function (/*Reference*/ ref) {
        return false;
    };

    Reference.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        // we assume that missing workbook and worksheet
        // names mean that the address is local to the current
        // workbook and worksheet
        if (this.WorkbookName === null || typeof(this.WorkbookName) === "undefined" || (this.WorksheetName instanceof  FSharp.None)) {
            this.WorkbookName = wb.Name;
        }
        if (this.WorksheetName === null || typeof(this.WorksheetName) === "undefined" && (this.WorksheetName instanceof  FSharp.None)) {
            this.WorksheetName = ws.Name;
        }
    };
    return Reference;
});
