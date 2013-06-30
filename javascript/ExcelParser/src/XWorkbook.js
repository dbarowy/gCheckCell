function XWorkbook(/*Workbook*/ wb, /*XApplication*/app) {
    "use strict";
    this._GDocs = (typeof SpreadsheetApp !== "undefined");
    this._wb = wb;
    this.Application=app;
}

Object.defineProperty(XWorkbook.prototype, "Name", {get: function () {
    "use strict";
    if (this._GDocs) {
        return this._wb.getName();
    } else {
        throw new Error("Office implementation undefined.");
    }
}});

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



