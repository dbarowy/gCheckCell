/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */

define("XClasses/XApplication", ["XClasses/XWorkbook", "XClasses/XWorksheet"], function (XWorkbook, XWorksheet) {
    "use strict";
    return {
        _GDocs: (typeof SpreadsheetApp !== "undefined"),//Used to determine the environment

        /**
         * Get the spreadsheets in the active workbook
         * @returns {Array} an array of XSpreadsheet objects.
         */
        getWorksheets: function () {
            var spread, xspread, res = [], i, len, sheets;
            if (this._GDocs) {
                if ((spread = SpreadsheetApp.getActiveSpreadsheet()) !== null) {
                    xspread = new XWorkbook(spread, this);
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
            if (this._GDocs) {
                return new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
            } else {
                throw new Error("Office implementation inexistent.");
            }
        },
        getWorkbookByName: function (name) {
            if (this._GDocs) {
                //TODO Figure out how cross workbook references work in GDocs
                return new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
            } else {
                throw new Error("Office implementation not defined.");
            }
        }
    };

});