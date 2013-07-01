/**
 * Generic Workbook interface.
 * @param wb Domain specific workbook object
 * @constructor
 */
function XWorkbook(/*Workbook*/ wb) {
    "use strict";
    this._GDocs = (typeof SpreadsheetApp !== "undefined");  //Determines if this is the GDocs environment
    this._wb = wb;  //Domain specific workbook object
}

/**
 * Getter for the name of the workbook
 */
Object.defineProperty(XWorkbook.prototype, "Name", {get: function () {
    "use strict";
    if (this._GDocs) {
        return this._wb.getName();
    } else {
        throw new Error("Office implementation undefined.");
    }
}});
/**
 * Get the sheets associated with this workbook.
 * @returns {Array}
 */
XWorkbook.prototype.getWorksheets = function () {
    "use strict";
    var res = [], sheets, i, len;
    if (this._GDocs) {
        sheets = this._wb.getSheets();
        for (i = 0, len = sheets.length; i < len; i++) {
            res.push(new XWorksheet(sheets[i], this));
        }
        return res;
    } else {
        throw new Error("Office implementation undefined.");
    }
};



