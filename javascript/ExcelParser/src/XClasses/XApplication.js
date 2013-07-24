/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */

define("XClasses/XApplication", ["XClasses/XWorkbook", "XClasses/XWorksheet"], function (XWorkbook, XWorksheet) {
    "use strict";
    if (typeof SpreadsheetApp !== "undefined") {
        return{

            _workbooks:{},
            /**
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
                var book;
                if(!(book=this._workbooks[name])){
                    book = this._workbooks[name] = new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
                }
                return book;
            }

        };
    } else {
        return {
            _workbooks:[],
            _active:null,
            init:function(/*Data*/ data){
               var i, len;
                this._workbooks.push(new XWorkbook(data.active_book, this));
                for(i=0, len=data.external_books.length; i<len; i++){
                   this._workbooks.push(new XWorkbook(data.external_books[i], this));
                }
            },

            /**
             * Get the spreadsheets in the active workbook
             * @returns {Array} an array of XSpreadsheet objects.
             */
            getWorksheets:function(){
                return this._active.getWorksheets();
            },
            /**
             * Return the active workbook.
             * @returns {XWorkbook}
             */
            getActiveWorkbook: function () {
                return this._active;
            },

            getWorkbookByName: function (name) {
                var i, len;
                for(i=0, len=this._workbooks.length; i<len; i++){
                    if(this._workbooks[i].Name===name){
                        return this._workbooks[i];
                    }
                }
                //If we don't have the workbook, we have a big problem.
                throw new Error("This workbook cannot be found");
            }

        };
    }

});