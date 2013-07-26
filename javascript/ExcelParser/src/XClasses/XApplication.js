/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */

define("XClasses/XApplication", ["XClasses/XWorkbook", "XClasses/XWorksheet", "Utilities/HashMap", "Parser/AST/AST", "Parser/Parser"], function (XWorkbook, XWorksheet, HashMap, AST, Parser) {
    "use strict";
    if (typeof SpreadsheetApp !== "undefined") {
        return{

            _workbooks: {},
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
                if (!(book = this._workbooks[name])) {
                    book = this._workbooks[name] = new XWorkbook(SpreadsheetApp.getActiveSpreadsheet(), this);
                }
                return book;
            }

        };
    } else {
        return {
            //All the known workbooks
            _workbooks: [],
            //Active workbook
            _active: null,
            // Keep a simple mapping between addresses and a binary value that determines
            // whether the formula has already been computed for the respective cell.
            // It must be reset after each recompute call.
            _computed: {},
            // Mapping between Addresses and the parsed formula contained in the cell.
            formulaMap: new HashMap(),
            /**
             * Parse the formulas in the worbook add the pair Address->Formula to the formulaMap
             * @param xBook
             * @private
             */
            _extractFormulas: function (/*XWorkbook*/ xBook) {
                var i, j, k, address;
                var xSheets = xBook.getWorksheets();
                for (k = 0; k < xSheets.length; k++) {
                    for (i = 0; i < xSheets[k]._formulas.length; i++) {
                        for (j = 0; j < xSheets[k]._formulas[i].length; j++) {
                            if (xSheets[k]._formulas[i][j] !== "") {
                                address = new AST.Address(i + 1, j + 1, xSheets[k].Name, xBook.Name); //TODO Check if result of parsing is none
                                this.formulaMap.put(address, Parser.parseFormula(xSheets[k]._formulas[i][j], xBook, xSheets[k]));
                                this._computed[address] = 0;
                            }
                        }
                    }
                }
            },
            compute: function (/*Address*/source) {
                var formula = this.formulaMap.get(source);
                if (formula) {
                    if (this._computed[source]) {
                        return source.GetCOMObject(this).getValue();
                    } else {
                        this._computed[source] = 1;
                        return formula.compute(this,source);
                    }
                }
                else {
                    throw new Error("This cell doesn't contain a formula.");
                }
            },
            recompute: function (/*Address*/source) {
                var val;
                try {
                    val = this.compute(source);
                } catch (err) {
                    //TODO a better idea when you have thought of this.
                    val = err.toString();
                }
                source.GetCOMObject(this).setValue(val);
                for (var a in this._computed) {
                    if (this._computed.hasOwnProperty(a)) {
                        this._computed[a] = 0;
                    }
                }
            },
            /**
             * Initialize the XApplication data.
             * XApplication is designed as a global entry point to the information of the sheet.
             * TODO Is this better than a constructor?
             * @param data
             */
            init: function (/*Data*/ data) {
                var i, len;
                this._workbooks.push(new XWorkbook(data.active_book, this));
                for (i = 0, len = data.external_books.length; i < len; i++) {
                    this._workbooks.push(new XWorkbook(data.external_books[i], this));
                }
                for (i = 0, len = this._workbooks; i < len; i++) {
                    this._extractFormulas(this._workbooks[i]);
                }
            },

            /**
             * Get the spreadsheets in the active workbook
             * @returns {Array} an array of XSpreadsheet objects.
             */
            getWorksheets: function () {
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
                for (i = 0, len = this._workbooks.length; i < len; i++) {
                    if (this._workbooks[i].Name === name) {
                        return this._workbooks[i];
                    }
                }
                //If we don't have the workbook, we have a big problem.
                throw new Error("Workbook with name " + name + " cannot be found");
            }

        };
    }

});