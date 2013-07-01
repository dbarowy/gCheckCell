/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */

var XApplication = {
    _GDocs: typeof SpreadsheetApp !== "undefined",//Used to determine the environment
    /**
     * Get the spreadsheets associated with the active document
     * @returns {Array} an array of XSpreadsheet objects.
     */
    getWorksheets: function () {
        "use strict";
        var spread, xspread, res = [], i, len, sheets;
        if (this._GDocs) {
            if ((spread = SpreadsheetApp.getActiveSpreadsheet()) !== null) {
                xspread = new XWorkbook(spread);
                sheets = spread.getSheets();
                for (i = 0, len = sheets.length; i < len; i++) {
                    res.push(new XWorksheet(sheets[i], xspread));
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
    /**
     * Return the active workbook.
     * @returns {XWorkbook}
     */
    getActiveWorkbook: function () {
        "use strict";
        if (this._GDocs) {
            return new XWorkbook(SpreadsheetApp.getActiveSpreadsheet());
        } else {
            throw new Error("Office implementation inexistent.");
        }
    }
};


