var XApplication = {
    _GDocs: typeof SpreadsheetApp !== "undefined",

    getWorksheets: function () {
        "use strict";
        var spread, res = [], i, len, sheets;
        if (this._GDocs) {
            if ((spread = SpreadsheetApp.getActiveSpreadsheet()) !== null) {
                sheets = spread.getSheets();
                for (i = 0, len = sheets.length; i < len; i++) {
                    res.push(new XWorksheet(sheets[i], spread));
                }
                return res;
            }
            else {
                throw new Error("Fatal error retrieving the active spreadsheet.");
            }
        } else {
            throw new Error("Office implementation inexistent.");
        }

    },
    getActiveWorkbook: function () {
        "use strict";
        if (this._GDocs) {
            return new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
        } else {
            throw new Error("Office implementation inexistent.");
        }

    }
};


