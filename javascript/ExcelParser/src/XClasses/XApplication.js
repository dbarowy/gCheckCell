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
        locale: null,//TODO
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
        leaves: {},
        _terminal_formulas: null,
        /**
         * Parse the formulas in the workbook add the pair Address->Formula to the formulaMap
         * This will help to determine if a cell has to be computed or the we have to retrieve the value
         * @param xBook
         * @private
         */
        _extractFormulas: function (/*XWorkbook*/ xBook, /*AnalysisData*/analysis) {
            var i, j, k, address, formula, res = [], node;
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
                                XLogger.log("Cannot parse formula" + xSheets[k]._formulas[i][j]);
                            } else {
                                node = analysis.formula_nodes.get(address);
                                if (node) {
                                    this.formulaMap.put(address, {node: node, formula: formula});
                                } else {
                                    XLogger.log("The formula node for the formula " + formula.toString() + "was not found.")
                                }
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

            console.log("Required functions " + funcs.toString());

        },

        recompute_book: function () {
            var i, cell, formula, key;
            for (i = 0; i < this._terminal_formulas.length; i++) {
                if (this._terminal_formulas[i].computed == false) {
                    cell = this._terminal_formulas[i].com;
                    key = new AST.Address(cell.startRow, cell.startCol, cell.Worksheet.Name, cell.Workbook.Name);
                    if (formula = this.formulaMap.get(key)) {
                        this.recompute(key);
                    }
                }
            }
        },

        compute: function (/*Address*/source, /*Boolean*/array, /*Boolean*/full_range) {
            //Get the TreeNode and parsed formula associated with this address
            var val = this.formulaMap.get(source);
            if (val) {
                if (val.node.computed === false) {
                    //if the node has not been computed, compute it and disable the computation for this subtree
                    var ret = val.formula.compute(this, source, array, false, full_range);
                    val.node.disableCompute();
                    return ret;
                } else {
                    return source.GetCOMObject(this).getTypedValue();
                }
            } else {
                return source.GetCOMObject(this).getTypedValue();
            }
        },

        recompute: function (/*Address*/source) {
            var val;
            try {
                val = this.compute(source, false, true);
            } catch (err) {
                XLogger.log(err);
                val = "#UNKNOWN?"
            }
            if (val instanceof Array) {
                source.GetCOMObject(this).setTypedValue(val[0][0]);

            } else {
                source.GetCOMObject(this).setTypedValue(val);
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
            //rewrite, to return typed values
            if (this.external_ranges[bookId] && (res = this.external_ranges[bookId][range])) {
                return res;
            }
            throw new Error("Could not find the given range");
        },
        startEngine: function (analysis) {
            var i, j, k, cellMatrix, ranges, hash, len;
            var input_ranges = analysis.input_ranges;
            this._terminal_formulas = analysis.getTerminalFormulaNodes();
            //Extract the formulas
            for (i = 0, len = this._workbooks.length; i < len; i++) {
                this._extractFormulas(this._workbooks[i], analysis);
            }


            for (k = 0; k < input_ranges.length; k++) {
                if (input_ranges[k].dont_perturb == false) {
                    cellMatrix = input_ranges[k].com.getCellMatrix();
                    var bookName = input_ranges[k].workbook.Name;
                    var sheetName = input_ranges[k].worksheet.Name;
                    for (i = 0; i < cellMatrix.length; i++) {
                        for (j = 0; j < cellMatrix[i].length; j++) {
                            hash = "" + bookName + "_" + sheetName + "_" + cellMatrix[i][j].startRow + "_" + cellMatrix[i][j].startCol;
                            if (ranges = this.leaves[hash]) {
                                ranges.push(input_ranges[k]);
                            } else {
                                this.leaves[hash] = [input_ranges[k]];
                            }
                        }
                    }
                }
            }
        }
    };

    return XApplication;


})
;