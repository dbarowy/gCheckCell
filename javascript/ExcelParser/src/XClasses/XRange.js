/**
 This file is part of CheckCell for Google Spreadsheets and Office 2013.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with GCC; see the file COPYING3.  If not see
 <http://www.gnu.org/licenses/>.
 */


/**
 * @Author Alexandru Toader, alexandru.v.toader@gmail.com
 * @Description Contains the implementation of a generic range object.
 */
define("XClasses/XRange", ["Parser/AST/AST", "Parser/Parser"], function (AST, Parser) {
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
     * Return the typed value in the upper left corner of the range
     * @returns {*}
     */
    XRange.prototype.getTypedValue = function () {
        return Parser.parseValue(this.Worksheet._values[this.startRow - 1][this.startCol - 1], this.Workbook.Application.locale);
    };
    /**
     * Return a bi-dimensional array of typed values representing the values in the range.
     * @returns {Array}
     */
    XRange.prototype.getTypedValues = function () {
        var i, j, row, res = [];
        var locale = this.Workbook.Application.locale;
        for (i = this.startRow - 1; i <= this.endRow - 1; i++) {
            row = [];
            for (j = this.startCol - 1; j <= this.endCol - 1; j++) {
                row.push(Parser.parseValue(this.Worksheet._values[i][j]), locale);
            }
            res.push(row);
        }
        return res;
    };

    /**
     * Sets all the values in the range to the value passed as a parameter
     * @param value an XTypedValue
     */
    XRange.prototype.setTypedValue = function (value) {
        var i, j, k, hash, node, bookName = this.Workbook.Name, sheetName = this.Worksheet.Name;
        for (i = this.startRow - 1; i < this.endRow; i++) {
            for (j = this.startCol - 1; j < this.endCol; j++) {
                this.Worksheet._values[i][j] = value.value;
                hash = "" + bookName + "_" + sheetName + "_" + (i + 1) + "_" + (j + 1);
                if (node = this.Workbook.Application.leaves[hash]) {
                    for (k = 0; k < node.length; k++) {
                        node[k].enableCompute();
                    }
                }
            }
        }

    };

    /**
     * Set the values in the range to the values passed as a parameter
     * @param values Matrix of XTypedValues
     */
    XRange.prototype.setTypedValues = function (values) {
        var i, j, k, l, m;
        var node, hash, bookName = this.Workbook.Name, sheetName = this.Worksheet.Name;
        if (values.length !== this.endRow - this.startRow + 1 || values[0].length !== this.endCol - this.startCol + 1) {
            throw new Error("Values matrix must have the same size as the range.");
        } else {
            for (i = this.startRow - 1, k = 0; i < this.endRow; i++, k++) {
                for (j = this.startCol - 1, l = 0; j < this.endCol; j++, l++) {
                    this.Worksheet._values[i][j] = values[k][l].value;
                    hash = "" + bookName + "_" + sheetName + "_" + (i + 1) + "_" + (j + 1);
                    if (node = this.Workbook.Application.leaves[hash]) {
                        for (m = 0; m < node.length; m++) {
                            node[m].enableCompute();
                        }
                    }

                }
            }
        }
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
     * Set all the values in the range to the value passed as a parameter
     * @param value primitive value: number, string
     */
    XRange.prototype.setValue = function (value) {
        var i, j, k, hash, node, bookName = this.Workbook.Name, sheetName = this.Worksheet.Name;
        for (i = this.startRow - 1; i < this.endRow; i++) {
            for (j = this.startCol - 1; j < this.endCol; j++) {
                this.Worksheet._values[i][j] = value;
                hash = "" + bookName + "_" + sheetName + "_" + (i + 1) + "_" + (j + 1);
                if (node = this.Workbook.Application.leaves[hash]) {
                    for (k = 0; k < node.length; k++) {
                        node[k].enableCompute();
                    }
                }
            }
        }
    };

    /**
     * Set the values in the range to the values passed as a parameter
     * @param values
     */
    XRange.prototype.setValues = function (values) {
        var i, j, k, l, m;
        var node, hash, bookName = this.Workbook.Name, sheetName = this.Worksheet.Name;
        if (values.length !== this.endRow - this.startRow + 1 || values[0].length !== this.endCol - this.startCol + 1) {
            throw new Error("Values matrix must have the same size as the range.");
        } else {
            for (i = this.startRow - 1, k = 0; i < this.endRow; i++, k++) {
                for (j = this.startCol - 1, l = 0; j < this.endCol; j++, l++) {
                    this.Worksheet._values[i][j] = values[k][l];
                    hash = "" + bookName + "_" + sheetName + "_" + (i + 1) + "_" + (j + 1);
                    if (node = this.Workbook.Application.leaves[hash]) {
                        for (m = 0; m < node.length; m++) {
                            node[m].enableCompute();
                        }
                    }

                }
            }
        }

    };

    /**
     * Set all the formulas in the range to the formula passed as a parameter
     * @param formula
     */
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
    /**
     * Get the R1C1 string representation of the address.
     * @returns {string}
     */
    XRange.prototype.getR1C1Address = function () {
        if (this.startRow === this.endRow && this.startCol === this.endCol) {
            return "R" + this.startRow + "C" + this.startCol;
        } else {
            return "R" + this.startRow + "C" + this.startCol + ":R" + this.endRow + "C" + this.endCol;
        }

    };
    /**
     * Get the A1 string representation of the address.
     * @returns {string}
     */
    XRange.prototype.getA1Address = function () {
        if (this.startRow === this.endRow && this.startCol === this.endCol) {
            return AST.Address.intToColChars(this.startCol) + this.startRow;
        } else {
            return AST.Address.intToColChars(this.startCol) + this.startRow + ":" + AST.Address.intToColChars(this.endCol) + this.endRow;
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