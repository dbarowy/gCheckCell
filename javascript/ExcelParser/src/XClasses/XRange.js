define("XClasses/XRange", ["Parser/AST/AST"], function (AST) {
    "use strict";

    /***
     * Generic wrapper for domain specific objects.
     * @param wb XWorkbook object that provides a link back to the context
     * @param ws XWorksheet object that provides a link back to the context
     * @param startRow
     * @param startCol
     * @param endRow
     * @param endCol
     * @constructor
     */
    function XRange(/*XWorkbook*/wb, /*XWorksheet*/ws, /*int*/startRow, /*int*/startCol, /*int*/endRow, /*int*/endCol) {
        this.Workbook = wb;
        this.Worksheet = ws;
        this.startRow = startRow;
        this.startCol = startCol;
        this.endRow = endRow;
        this.endCol = endCol;
    }

    /**
     * Return the value in the upper left corner of the range;
     * @returns {*}
     */
    XRange.prototype.getValue = function () {
        return this.Worksheet._values[this.startRow - 1][this.startCol - 1];
    };
    /**
     * Return the values in this range as a matrix
     * @returns {Array}
     */
    XRange.prototype.getValues = function () {
        var i, j, row, res = [];
        for (i = this.startRow - 1; i <= this.endRow - 1; i++) {
            row = [];
            for (j = this.startCol - 1; j <= this.endCol - 1; j++) {
                row.push(this.Worksheet._values[i][j])
            }
            res.push(row);
        }
        return res;
    };
    /**
     *
     * @param value
     */
    XRange.prototype.setValue = function (value) {
        var i, j;
        for (i = this.startRow - 1; i < this.endRow; i++) {
            for (j = this.startCol - 1; j < this.endCol; j++) {
                this.Worksheet._values[i][j] = value;
            }
        }
    };

    XRange.prototype.setValues = function (values) {
        var i, j, k, l;
        if (values.length !== this.endRow - this.startRow + 1 || values[0].length !== this.endCol - this.startCol + 1) {
            throw new Error("Values matrix must have the same size as the range.");
        } else {
            for (i = this.startRow - 1, k = 0; i < this.endRow; i++, k++) {
                for (j = this.startCol - 1, l = 0; j < this.endCol; j++, l++) {
                    this.Worksheet._values[i][j] = values[k][l];
                }
            }
        }

    };

    XRange.prototype.setFormula = function (formula) {
        var i, j;
        for (i = this.startRow - 1; i < this.endRow; i++) {
            for (j = this.startCol - 1; j < this.endCol; j++) {
                this.Worksheet._formulas[i][j] = formula;
            }
        }
    };

    /**
     * Check if a cell in the range contains a formula
     * @returns {boolean}
     */
    XRange.prototype.containsFormula = function () {
        var i, j;
        for (i = this.startRow - 1; i < this.endRow; i++) {
            for (j = this.startCol - 1; j < this.endCol; j++) {
                if (this.Worksheet._formulas[i][j] !== "") {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Check if the top left cell contains a formula;
     * @returns {boolean}
     */
    XRange.prototype.hasFormula = function () {
        return this.Worksheet._formulas[this.startRow - 1][this.startCol - 1] !== "";
    };

    /**
     * Get the formula in the top-left cell of the range.
     * @returns {*}
     */
    XRange.prototype.getFormula = function () {
        return this.Worksheet._formulas[this.startRow - 1][this.startCol - 1];
    };

    /**
     * Return a bidimensional array of the cells that compose the range
     * @returns {Array}
     */
    XRange.prototype.getCellMatrix = function () {
        var i, j, row = [], range = [];
        for (i = this.startRow; i <= this.endRow; i++) {
            row = [];
            for (j = this.startCol; j <= this.endCol; j++) {
                row.push(this.Worksheet.getRange(i, j, i, j));
            }
            range.push(row);
        }

        return range;

    };


    /**
     * Get the number of rows in the range
     * @returns {number}
     */
    XRange.prototype.getRowCount = function () {
        return this.endRow - this.startRow + 1;
    };
    /**
     * Get the number of columns in the range
     * @returns {number}
     */
    XRange.prototype.getColumnCount = function () {
        return this.endCol - this.startCol + 1;

    };

    XRange.prototype.getR1C1Address = function () {
        if (this.startRow === this.endRow && this.startCol === this.endCol) {
            return "R" + this.startRow + "C" + this.startCol;
        } else {
            return "R" + this.startRow + "C" + this.startCol + ":R" + this.endRow + "C" + this.endCol;
        }

    };

    XRange.prototype.getA1Address = function () {
        if (this.startRow === this.endRow && this.startCol === this.endCol) {
            return AST.Address.IntToColChars(this.startCol) + this.startRow;
        } else {
            return AST.Address.IntToColChars(this.startCol) + this.startRow + ":" + AST.Address.IntToColChars(this.endCol) + this.endRow;
        }
    };

    XRange.prototype.toString = function () {
        var res = "[", row = "", values = this.Worksheet._values, i, j;
        if (this.startRow === this.endRow && this.startCol === this.endCol) {
            return this.Worksheet._values[this.startRow - 1][this.startCol - 1].toString();
        } else {
            for (i = this.startRow - 1; i <= this.endRow - 1; i++) {
                row = "[";
                for (j = this.startCol - 1; j <= this.endCol - 1; j++) {
                    row += values[i][j] + ", ";
                }
                res += row + "],";
            }
            return res + "]";
        }
    };

    return XRange;

});