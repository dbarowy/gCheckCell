define("XClasses/XWorkbook", ["XClasses/XWorksheet"], function (XWorksheet) {
    "use strict";
    /**
     * Generic Workbook interface.
     * @param wb Domain specific workbook object
     * @constructor
     */
    function XWorkbook(/*Workbook*/ wb, /*XApplication*/app) {
        this._GDocs = (typeof SpreadsheetApp !== "undefined");  //Determines if this is the GDocs environment
        this._wb = wb;  //Domain specific workbook object
        this.Application=app;

    }

    /**
     * Getter for the name of the workbook
     */
    Object.defineProperty(XWorkbook.prototype, "Name", {get: function () {
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

    XWorkbook.prototype.getWorksheetByName = function (/*string*/name) {
        if (this._GDocs) {
            return new XWorksheet(this._wb.getSheetByName(name), this);
        } else {
            throw new Error("Office implementation undefined.");
        }
    };
    return XWorkbook;
});