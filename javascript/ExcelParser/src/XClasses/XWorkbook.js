define("XClasses/XWorkbook", ["XClasses/XWorksheet"], function (XWorksheet) {
    "use strict";
    /**
     * Generic Workbook interface.
     * @param wb Domain specific workbook object
     * @constructor
     */
    function XWorkbook(/*Workbook*/ wb, /*XApplication*/app) {
        this._wb = wb;  //Domain specific workbook object
        this._sheets = {};
        this.Application = app;
    }

    if (typeof SpreadsheetApp !== "undefined") {
        Object.defineProperty(XWorkbook.prototype, "Name", {get: function () {
            return this._wb.getName();
        }});
        XWorkbook.prototype.getWorksheets = function () {
            var res = [], sheets, i, len;
            Logger.log(this._wb);
            sheets = this._wb.getSheets();
            for (i = 0, len = sheets.length; i < len; i++) {
                res.push(new XWorksheet(sheets[i], this));
            }
            return res;
        };

        XWorkbook.prototype.getWorksheetByName = function (/*string*/name) {
            var sheet;
            if (!(sheet = this._sheets[name])) {
                this._sheets[name]=sheet = new XWorksheet(this._wb.getSheetByName(name), this);
            }
            return sheet;
        };
    } else {
        throw new Error("Office implementation undefined.");
    }
    return XWorkbook;
});