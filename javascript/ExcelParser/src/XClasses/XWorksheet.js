/**
 * Generic worksheet object. Is a wrapper for the domain specific objects.
 * Due to the nature of Google Docs I had to perform some optimizations:
 * When the XWorksheet object is created, the used range from the spreadsheet is retrieved
 * along with all its relevant data. The Script runs on a machine that is separate from the one where the data is stored
 * so it is more efficient to retrieve all the data at once than to query each time we need a range. From the first trials,
 * this is 10 times more efficient than the approach that required to query each time we wanted a new range.
 * @param ws
 * @param wb
 * @constructor
 */

define("XClasses/XWorksheet", ["XClasses/XRange", "Parser/PEGParser"], function (XRange, PEGParser) {
    "use strict";
    function XWorksheet(/*Worksheet*/ws, /*XWorkbook*/wb) {
        this._ws = ws;
        this.Workbook = wb;
        if (typeof SpreadsheetApp !== "undefined") {
            this._range = this._ws.getDataRange();
            this._lastColumn = this._range.getLastColumn();
            this._lastRow = this._range.getLastRow();
            this._values = this._range.getValues();
            this._formulas = this._range.getFormulas();
            this.Name = this._ws.getName();
        }else{
            this.Name = ws.name;
            this._values = ws.values;
            this._formulas = ws.formulas;
            this._lastRow = ws.values.length;
            this._lastColumn = ws.values[0].length;
            this._computed = [];
            for(var i=0; i<this._lastColumn; i++){
                var row = [];
                for(var j=0; j<this._lastColumn; j++){
                   row.push(0);
                }
                this._computed.push(row);
            }
        }
    }

    if ((typeof SpreadsheetApp !== "undefined")) {
        /**
         * Get a matrix of Cells (XRange) representing the range in the sheet that has data.
         * @returns {Array}
         */
        XWorksheet.prototype.getUsedRange = function () {
            var i, j, len1, len2, range = [], row, aux;
            for (i = 0, len1 = this._values.length; i < len1; i++) {
                row = [];
                for (j = 0, len2 = this._values[i].length; j < len2; j++) {
                    aux = new XRange(this.Workbook, this, i + 1, j + 1, i + 1, j + 1);
                    row.push(aux);
                }
                range.push(row);
            }
            return range;
        };
        /**
         * Get the specified range from the sheet.
         * @param startRow
         * @param startCol
         * @param endRow This parameter is optional. If it is not specified, the cell at (startRow, startCol) will be returned.
         * @param endCol This parameter is optional. If it is not specified, the cell at (startRow, startCol) will be returned.
         * @returns {XRange}
         */
        XWorksheet.prototype.getRange = function (/*int*/startRow, /*int*/startCol, /*optional int*/endRow, /*optional int*/endCol) {
            //Check if this range has the starting position in the used range
            if (typeof(endRow) === "undefined" && typeof(endCol) === "undefined") {
                if (startRow <= this._lastRow && startCol <= this._lastColumn) {
                    return new XRange(this.Workbook, this, startRow, startCol, startRow, startCol);
                } else {
                    return new XRange(this.Workbook, this, startRow, startCol, startRow, startCol, this._ws.getRange(startRow, startCol));
                }
            } else {
                if (endCol <= this._lastColumn && endRow <= this._lastRow) {
                    return new XRange(this.Workbook, this, startRow, startCol, endRow, endCol);
                } else {
                    return new XRange(this.Workbook, this, startRow, startCol, endRow, endCol, this._ws.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1));
                }
            }
        };
        /**
         * Return the range given by the R1C1 or A1 notation. Works for both addresses and ranges.
         * @param range
         * @returns {*}
         */
        XWorksheet.prototype.get_Range = function (/*string*/range) {
            var res;
            try {
                //Try to see if we have an address
                res = PEGParser.parse(range, "AnyAddr");
                return this.getRange(res.Y, res.X, res.Y, res.X);
            } catch (err) {
                //TODO I don't know if it is better to throw the error or to catch it,
                // log it and return null which will throw another error for sure
                res = PEGParser.parse(range, "RangeAny");
                return this.getRange(res.getYTop(), res.getXLeft(), res.getYBottom(), res.getXRight());
            }
        };
    }
    else {
      //  throw new Error("Office methods not implemented.");
        /**
         * Get a matrix of Cells (XRange) representing the range in the sheet that has data.
         * @returns {Array}
         */
        XWorksheet.prototype.getUsedRange = function () {
            var i, j, len1, len2, range = [], row;
            for (i = 0, len1 = this._values.length; i < len1; i++) {
                row = [];
                for (j = 0, len2 = this._values[i].length; j < len2; j++) {
                    row.push(new XRange(this.Workbook, this, i + 1, j + 1, i + 1, j + 1));
                }
                range.push(row);
            }
            return range;
        };
        /**
         * Get the specified range from the sheet.
         * @param startRow
         * @param startCol
         * @param endRow This parameter is optional. If it is not specified, the cell at (startRow, startCol) will be returned.
         * @param endCol This parameter is optional. If it is not specified, the cell at (startRow, startCol) will be returned.
         * @returns {XRange}
         */
        XWorksheet.prototype.getRange = function (/*int*/startRow, /*int*/startCol, /*optional int*/endRow, /*optional int*/endCol) {
            //Check if this range has the starting position in the used range
            if (typeof(endRow) === "undefined" && typeof(endCol) === "undefined") {
                if (startRow <= this._lastRow && startCol <= this._lastColumn) {
                    return new XRange(this.Workbook, this, startRow, startCol, startRow, startCol);
                } else {
                    throw new Error("Requested range is outside the used data range.");
                }
            } else {
                if (endCol <= this._lastColumn && endRow <= this._lastRow) {
                    return new XRange(this.Workbook, this, startRow, startCol, endRow, endCol);
                } else {
                    throw new Error("Requested range is outside the used data range.");
                }
            }
        };
        /**
         * Return the range given by the R1C1 or A1 notation. Works for both addresses and ranges.
         * @param range
         * @returns {*}
         */
        XWorksheet.prototype.get_Range = function (/*string*/range) {
            var res;
            try {
                //Try to see if we have an address
                res = PEGParser.parse(range, "AnyAddr");
                return this.getRange(res.Y, res.X, res.Y, res.X);
            } catch (err) {
                //TODO I don't know if it is better to throw the error or to catch it,
                // log it and return null which will throw another error for sure
                res = PEGParser.parse(range, "RangeAny");
                return this.getRange(res.getYTop(), res.getXLeft(), res.getYBottom(), res.getXRight());
            }
        };
    }

    return XWorksheet;
});