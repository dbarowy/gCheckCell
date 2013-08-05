/**
 * This object provide a global access point to Application services.
 * It is designed to be a scaled down equivalent of the SpreadsheetApp object in Google Spreadsheets
 * and Excel.Application in Microsoft Office.
 * @type {{_GDocs: boolean, getWorksheets: Function, getActiveWorkbook: Function}}
 */

define("XClasses/XApplication", ["XClasses/XWorkbook", "XClasses/XWorksheet", "Utilities/HashMap", "Parser/AST/AST", "Parser/Parser", "FSharp/FSharp"], function (XWorkbook, XWorksheet, HashMap, AST, Parser, FSharp) {
    "use strict";
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
            var i, j, k, address, formula;
            var xSheets = xBook.getWorksheets();
            for (k = 0; k < xSheets.length; k++) {
                for (i = 0; i < xSheets[k]._formulas.length; i++) {
                    for (j = 0; j < xSheets[k]._formulas[i].length; j++) {
                        if (xSheets[k]._formulas[i][j] !== "") {
                            address = new AST.Address(i + 1, j + 1, xSheets[k].Name, xBook.Name);
                            formula = Parser.parseFormula(xSheets[k]._formulas[i][j], xBook, xSheets[k]);
                            if(formula instanceof FSharp.None){
                                console.log("Something went wrong"+xSheets[k]._formulas[i][j]);
                            }
                            this.formulaMap.put(address, formula);
                            this._computed[address] = 0;
                        }
                    }
                }
            }
        },
        _getFnName: function (expr) {
            if (expr instanceof AST.Address) {
                return [];
            } else if (expr instanceof AST.BinOpExpr) {
                return this._getFnName(expr.Left).concat(this._getFnName(expr.Right));
            } else if (expr instanceof AST.ConstantArray) {
                return [];
            } else if (expr instanceof AST.ConstantError) {
                return [];
            } else if (expr instanceof AST.ConstantLogical) {
                return [];
            } else if (expr instanceof AST.ConstantNumber) {
                return [];
            } else if (expr instanceof AST.ConstantString) {
                return [];
            } else if (expr instanceof AST.ParensExpr) {
                return this._getFnName(expr.Expr);
            } else if (expr instanceof AST.PostfixOpExpr) {
                return this._getFnName(expr.Expr);
            } else if (expr instanceof AST.Range) {
                return [];
            } else if (expr instanceof AST.ReferenceAddress) {
                return [];
            } else if (expr instanceof AST.ReferenceExpr) {
                return this._getFnName(expr.Ref);
            } else if (expr instanceof AST.ReferenceFunction) {
                var res = [expr.FunctionName];
                for (var i = 0; i < expr.ArgumentList.length; i++) {
                    res = res.concat(this._getFnName(expr.ArgumentList[i]));
                }
                return res;
            } else if (expr instanceof AST.ReferenceNamed) {
                return [];
            } else if (expr instanceof AST.UnaryOpExpr) {
                return this._getFnName(expr.Expr);
            } else if (expr instanceof FSharp.None) {
                return [];
            } else {
                throw new Error("Unknown type");
            }
        },
        _extractFunctionNames: function (/*XWorkbook*/xBook) {
            var i, j, k, formula;
            var res = [];
            var xSheets = xBook.getWorksheets();
            for (k = 0; k < xSheets.length; k++) {
                for (i = 0; i < xSheets[k]._formulas.length; i++) {
                    for (j = 0; j < xSheets[k]._formulas[i].length; j++) {
                        if (xSheets[k]._formulas[i][j] !== "") {
                            formula = Parser.parseFormula(xSheets[k]._formulas[i][j], xBook, xSheets[k]);
                            res = res.concat(this._getFnName(formula));
                        }
                    }
                }
            }
            res.sort();
            console.log(res.toString());
        },
        compute: function (/*Address*/source) {
            var formula = this.formulaMap.get(source);
            if (formula) {
                if (this._computed[source]) {
                    return source.GetCOMObject(this).getValue();
                } else {
                    this._computed[source] = 1;
                    return formula.compute(this, source);
                }
            }
            else {
                return source.GetCOMObject(this).getValue();
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
            console.log(val);
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

            for (i = 0, len = this._workbooks.length; i < len; i++) {
                this._extractFormulas(this._workbooks[i]);
                this._extractFunctionNames(this._workbooks[i]);
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


})
;