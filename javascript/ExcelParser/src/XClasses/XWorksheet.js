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
define("XClasses/XWorksheet", ["XClasses/XRange", "Parser/PEGParser"], function (XRange) {
    "use strict";
    function XWorksheet(/*Worksheet*/ws, /*XWorkbook*/wb) {
        this.Workbook = wb;
        this.Name = ws.name;
        this._values = ws.values;
        this._formulas = ws.formulas;
        this._lastRow = ws.values.length;
        this._lastColumn = ws.values[0].length;

    }

    /**
     * Export the data in this book, to compare it with the Google Spreadsheet data.
     * @returns {{name: *, values: *, formulas: *}}
     */
    XWorksheet.prototype.exportData = function () {
        return{
            name: this.Name,
            values: this._values,
            formulas: this._formulas
        };
    };


    /**
     * Get a matrix of Cells (XRange) representing the range in the sheet that has data.
     * @returns {Array}
     */
    XWorksheet.prototype.getUsedRange = function () {
        var i, j, len1, len2, range = [], row;
        for (i = 1, len1 = this._values.length; i <= len1; i++) {
            row = [];
            for (j = 1, len2 = this._values[i-1].length; j <= len2; j++) {
                row.push(new XRange(this.Workbook, this, i, j, i, j));
            }
            range.push(row);
        }
        return range;
    };
    /**
     * TODO What should I do when the requested range is outside of the used data range?
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

    return XWorksheet;
});