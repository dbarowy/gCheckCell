/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */
var counter = 0;
define("XClasses/XApplication", ["XClasses/XLogger", "XClasses/XWorkbook", "XClasses/XWorksheet", "Utilities/HashMap", "Parser/AST/AST", "Parser/Parser", "FSharp/FSharp"], function (XLogger, XWorkbook, XWorksheet, HashMap, AST, Parser, FSharp) {
    "use strict";
    var XApplication = {
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
        n_ranges: [],
        e_ranges: [],
        named_ranges: {},
        external_ranges: {},
        /**
         * Parse the formulas in the workbook add the pair Address->Formula to the formulaMap
         * This will help to determine if a cell has to be computed or the we have to retrieve the value
         * @param xBook
         * @private
         */
        _extractFormulas: function (/*XWorkbook*/ xBook) {
            var i, j, k, address, formula, res = [];
            var xSheets = xBook.getWorksheets();
            for (k = 0; k < xSheets.length; k++) {
                for (i = 0; i < xSheets[k]._formulas.length; i++) {
                    for (j = 0; j < xSheets[k]._formulas[i].length; j++) {
                        if (xSheets[k]._formulas[i][j] !== "") {
                            address = new AST.Address(i + 1, j + 1, xSheets[k].Name, xBook.Name);
                            formula = Parser.parseFormula(xSheets[k]._formulas[i][j], xBook, xSheets[k]);
                            //Get all the functions used in this document
                            res = res.concat(Parser.extractFunctionName(formula));
                            if (formula instanceof FSharp.None) {
                                XLogger.log("Something went wrong" + xSheets[k]._formulas[i][j]);
                            } else {
                                this.formulaMap.put(address, formula);
                                this._computed[address] = 0;
                                this.n_ranges = this.n_ranges.concat(Parser.extractNamedRanges(formula));
                                this.e_ranges = this.e_ranges.concat(Parser.extractImportRange(formula));
                            }
                        }
                    }
                }
            }
            //Too see what functions we need to implement
            var funcs = [];
            res.sort();
            if (res.length) {
                var aux = res[0];

                for (i = 1; i < res.length; i++) {
                    if (res[i] !== aux) {
                        funcs.push(aux);
                        aux = res[i];
                    }
                }
                funcs.push(aux);
            }

            console.log(res.toString());

        },

        compute: function (/*Address*/source, /*Boolean*/array, /*Boolean*/full_range) {
            var formula = this.formulaMap.get(source);
            if (formula) {
                if (this._computed[source]) {
                    return source.GetCOMObject(this).getValue();
                } else {
                    this._computed[source] = 1;
                    return formula.compute(this, source, array, false, full_range);
                }
            }
            else {
                return source.GetCOMObject(this).getValue();
            }
        },

        recompute_book: function () {
            counter++;
            var i, set = this.formulaMap.getEntrySet();
            for (i = 0; i < set.length; i++) {
                this.recompute(set[i].key);
            }
            for (var a in this._computed) {
                if (this._computed.hasOwnProperty(a)) {
                    this._computed[a] = 0;
                }
            }
        },
        recompute: function (/*Address*/source) {
            var val;
            try {
                val = this.compute(source, false, true);
            } catch (err) {
                console.log(err);
                val = "#UNKNOWN?"
            }
            if (val instanceof Array) {
                source.GetCOMObject(this).setValue(val[0][0]);
            } else {
                source.GetCOMObject(this).setValue(val);
            }
        },
        /**
         * Initialize the XApplication data.
         * XApplication is designed as a global entry point to the information of the sheet.
         * @param data
         */
        setBookData: function (/*Data*/ data) {
            var i, len;
            this._workbooks.push(new XWorkbook(data.active_book, this));
            this._active = this._workbooks[0];
            for (i = 0, len = data.external_books.length; i < len; i++) {
                this._workbooks.push(new XWorkbook(data.external_books[i], this));
            }
            for (i = 0, len = this._workbooks.length; i < len; i++) {
                this._extractFormulas(this._workbooks[i]);
            }

        },
        setRangeData: function (named, external) {
            var bk, res, rng, wb;
            for (bk in named) {
                wb = this.getWorkbookByName(bk);
                if (!this.named_ranges[bk]) {
                    this.named_ranges[bk] = {};
                }
                for (rng in named[bk]) {
                    res = Parser.getAddressReference(named[bk][rng], wb, {});
                    if (!(res instanceof FSharp.None)) {
                        this.named_ranges[bk][rng] = res;
                    }
                }
            }
            for (bk in external) {
                if (!this.external_ranges[bk]) {
                    this.external_ranges[bk] = {};
                }
                for (rng in external[bk]) {
                    this.external_ranges[bk][rng] = external[bk][rng];
                }
            }
        },
        exportData: function () {
            var ext = [], j;
            for (j = 1; j < this._workbooks.length; j++) {
                ext.push(this._workbooks[j].exportData())
            }
            return {
                active_book: this._workbooks[0].exportData(),
                external_books: ext
            };
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
        },
        getNamedRange: function (referenceNamed) {
            var res;
            if (this.named_ranges[referenceNamed.WorkbookName] && (res = this.named_ranges[referenceNamed.WorkbookName][referenceNamed._varname])) {
                return res;
            }
            throw new Error("Could not find the given range");
        },
        getExternalRange: function (bookId, range) {
            var res;
            if (this.external_ranges[bookId] && (res = this.external_ranges[bookId][range])) {
                return res;
            }
            throw new Error("Could not find the given range");
        }
    };

    return XApplication;


})
;