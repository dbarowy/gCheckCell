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
function XWorksheet(/*Worksheet*/ws, /*XWorkbook*/wb) {
    "use strict";
    this._GDocs = (typeof SpreadsheetApp !== "undefined");
    this._ws = ws;
    this.Workbook = wb;
    if (this._GDocs) {
        this._range = this._ws.getDataRange();
        this._lastColumn = this._range.getLastColumn();
        this._lastRow = this._range.getLastRow();
        this._values = this._range.getValues();
        this._formulas = this._range.getFormulas();
    }
}
/**
 * Get a matrix of Cells (XRange) representing the range in the sheet that has data.
 * @returns {Array}
 */
XWorksheet.prototype.getUsedRange = function () {
    "use strict";
    var i, j, len1, len2, range = [], row;
    if (this._GDocs) {
        for (i = 0, len1 = this._values.length; i < len1; i++) {
            row = [];
            for (j = 0, len2 = this._values[i].length; j < len2; j++) {
                row.push(new XRange(this.Workbook, this, i + 1, j + 1, i + 1, j + 1));
            }
            range.push(row);
        }
        return range;
    } else {
        throw new Error("Office method not implemented.");
    }
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
    "use strict";
    if (this._GDocs) {
        //Check if this range has the starting position in the used range
        if (startRow <= this._lastRow && startCol <= this._lastColumn) {
            if (typeof(endRow) === "undefined" || typeof(endCol) === "undefined") {
                return new XRange(this.Workbook, this, startRow, startCol, startRow, startCol);
            } else {
                //if the range is fully withing the used range
                if (endCol <= this._lastColumn && endRow <= this._lastRow) {
                    return new XRange(this.Workbook, this, startRow, startCol, endRow, endCol);
                } else {
                    //If the range is not entirely inside the used range, retrieve the range using the GDocs specific method
                    return new XRange(this.Workbook, this, startRow, startCol, endRow, endCol, this._ws.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1));
                }
            }
        } else {
            //If the range is not inside the used range, retrieve a google docs specific range and wrap it in an XRange object
            return new XRange(this.Workbook, this, startRow, startCol, endRow, endCol, this._ws.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1));
        }
    } else {
        throw new Error("Office method not implemented.");
    }

};
/**
 * Get the name of the sheet.
 */
Object.defineProperty(XWorksheet.prototype, "Name", {get: function () {
    "use strict";
    if (this._GDocs) {
        return this._ws.getName();
    }
    else {
        throw new Error("Office method not implemented.");
    }
}});
