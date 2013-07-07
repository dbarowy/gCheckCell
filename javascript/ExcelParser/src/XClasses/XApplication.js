/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */

define("XClasses/XApplication", ["XClasses/XWorkbook", "XClasses/XWorksheet"], function (XWorkbook, XWorksheet) {
    "use strict";
    if (typeof SpreadsheetApp !== "undefined") {
        var aux = new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
        return{  /**
         * Get the spreadsheets in the active workbook
         * @returns {Array} an array of XSpreadsheet objects.
         */
        getWorksheets: function () {
            var spread, xspread, res = [], i, len, sheets;
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
        },
            /**
             * Return the active workbook.
             * @returns {XWorkbook}
             */
            getActiveWorkbook: function () {
                return new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
            },
            getWorkbookByName: function (name) {
                //TODO Figure out how cross workbook references work in GDocs
                return aux;
            }

        };
    } else {
        throw new Error("Office implementation inexistent.");
    }

});