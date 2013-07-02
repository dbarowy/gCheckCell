/***
 * Generic wrapper for domain specific objects.
 * @param wb XWorkbook object that provides a link back to the context
 * @param ws XWorksheet object that provides a link back to the context
 * @param startRow
 * @param startCol
 * @param endRow
 * @param endCol
 * @param rng This parameter is provided when this range object has to be created from a domain specific Range object, not cached data.
 * @constructor
 */
function XRange(/*XWorkbook*/wb, /*XWorksheet*/ws, /*int*/startRow, /*int*/startCol, /*int*/endRow, /*int*/endCol, /*optional Range*/rng) {
    "use strict";
    this._GDocs = (typeof SpreadsheetApp !== "undefined");//Determines the type of the environment
    this.Workbook = wb;
    this.Worksheet = ws;
    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;
    this._range = rng;  //Domain specific range object
}

XRange.prototype.getValue = function () {
    "use strict";
    if (this._GDocs) {
        if (typeof(this._range) === "undefined") {
            return this.Worksheet._values[this.startRow - 1][this.startCol - 1];

        } else {
            return this._range.getValue();
        }
    } else {
        throw new Error("Office implementation undefined");
    }
};
/**
 * Check if all the cells in the range contain a formula.
 * @returns {boolean}
 */
XRange.prototype.hasFormula = function () {
    "use strict";
    var formulas, i, j;
    if (this._GDocs) {
        if (typeof(this._range) === "undefined") {
            for (i = this.startRow - 1; i < this.endRow; i++) {
                for (j = this.startCol - 1; j < this.endCol; j++) {
                    if (this.Worksheet._formulas[i][j] === "" || this.Worksheet._formulas[i][j] === null) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            formulas = this._range.getFormulas();
            for (i = 0; i < formulas.length; i++) {
                for (j = 0; j < formulas[i].length; j++) {
                    if (formulas[i][j] === "" || formulas[i][j] === null) {
                        return false;
                    }
                }
            }
            return true;
        }
    } else {
        throw new Error("Office implementation undefined");
    }

};
/**
 * Get the formula in the top-left cell of the range.
 * @returns {*}
 */
XRange.prototype.getFormula = function () {
    "use strict";
    if (this._GDocs) {
        if (typeof(this._range) === "undefined") {
            return this.Worksheet._formulas[this.startRow - 1][this.startCol - 1];
        } else {
            return this._range.getFormula();
        }
    } else {
        throw new Error("Office implementation undefined");
    }
};
/**
 * Get the number of rows in the range
 * @returns {number}
 */
XRange.prototype.getRowCount = function () {
    "use strict";
    return this.endRow - this.startRow + 1;
};
/**
 * Get the number of columns in the range
 * @returns {number}
 */
XRange.prototype.getColumnCount = function () {
    "use strict";
    return this.endCol - this.startCol + 1;

};

XRange.prototype.getR1C1Address = function () {
    "use strict";
    if (this.startRow === this.endRow && this.startCol === this.endCol) {
        return "R" + this.startRow + "C" + this.startCol;
    } else {
        return "R" + this.startRow + "C" + this.startCol + ":R" + this.endRow + "C" + this.endCol;
    }

};

XRange.prototype.getA1Address = function () {
    "use strict";
    if (this.startRow === this.endRow && this.startCol === this.endCol) {
        return AST.Address.IntToColChars(this.startCol) + this.startRow;
    } else {
        return AST.Address.IntToColChars(this.startCol) + this.startRow + ":" + AST.Address.IntToColChars(this.endCol) + this.endRow;
    }
};
