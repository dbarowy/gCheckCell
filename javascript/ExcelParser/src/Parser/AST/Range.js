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
 * @Description This file contains the Range class which is used to represent ranges in the sheet.
 * Example: A2:A3
 */
define("Parser/AST/Range", ["Parser/AST/Address", "XClasses/XTypedValue", "XClasses/XTypes"], function (Address, XTypedValue, XTypes) {
    "use strict";
    function Range(/*Address*/ topleft, /*Address*/bottomright) {
        this._tl = topleft;
        this._br = bottomright;
        this._com = null;
    }

    Range.prototype.toString = function () {
        return this._tl.toString() + "," + this._br.toString();
    };
    Range.prototype.getXLeft = function () {
        return this._tl.X;
    };
    Range.prototype.getXRight = function () {
        return this._br.X;
    };
    Range.prototype.getYTop = function () {
        return this._tl.Y;
    };
    Range.prototype.getYBottom = function () {
        return this._br.Y;
    };
    /**
     * Check if this object is inside the range provided as a parameter
     * @param rng
     * @returns {boolean} true if this object is inside the range, false otherwise
     */
    Range.prototype.insideRange = function (/*Range*/ rng) {
        return !(this.getXLeft() < rng.getXLeft() || this.getYTop() < rng.getYTop() || this.getXRight() > rng.getXRight() || this.getYBottom() > rng.getYBottom());
    };
    /**
     *
     * @param addr
     * @returns {boolean}
     * @constructor
     */
    Range.prototype.insideAddr = function (/*Address*/ addr) {
        return !(this.getXLeft() < addr.X || this.getYTop() < addr.Y || this.getXRight() > addr.X || this.getYBottom() > addr.Y);
    };

    Range.prototype.setWorksheetName = function (/*string*/ wsname) {
        this._tl.WorksheetName = wsname;
        this._br.WorksheetName = wsname;
    };
    Range.prototype.setWorkbookName = function (/*string*/ wbname) {
        this._tl.WorkbookName = wbname;
        this._br.WorkbookName = wbname;
    };
    /**
     * Get the XRange object associated with the cell.
     * @param app XApplication object that represents an entry point to the Spreadsheet methods and values
     * @returns {XRange|*}
     */
    Range.prototype.getCOMObject = function (/*XApplication*/app) {
        // tl and br must share workbook and worksheet
        if (this._com === null) {
            this._com = app.getWorkbookByName(this._tl.getA1Workbook()).getWorksheetByName(this._tl.getA1Worksheet()).getRange(this._tl.Y, this._tl.X, this._br.Y, this._br.X);
        }
        return this._com;
    };

    /**
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @param range True if this is a range parameter to a function.
     * @param full_range Some functions return an array of values even when they are not in an ARRAYFORMULA.
     * This parameters tells the function if we want the complete range of just the first element
     * @returns {*}
     */
    Range.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        var i, j, sheetName, wbName;
        var res = [], row;
        if (this._com === null) {
            this._com = app.getWorkbookByName(this._tl.getA1Workbook()).getWorksheetByName(this._tl.getA1Worksheet()).getRange(this._tl.Y, this._tl.X, this._br.Y, this._br.X);
        }

        if (range || array) {
            //If we need the entire range, compute the value of each cell in the range and add it to a matrix of values
            sheetName = this._com.Worksheet.Name;
            wbName = this._com.Workbook.Name;
            for (i = this._com.startRow; i <= this._com.endRow; i++) {
                row = [];
                for (j = this._com.startCol; j <= this._com.endCol; j++) {
                    row.push(app.compute(new Address(i, j, sheetName, wbName), array, false));
                }
                res.push(row);
            }
            return res;
        } else {
            //otherwise perform implicit intersection
            //N*1 range
            if (this._com.getColumnCount() === 1) {
                if (this._com.startRow <= source.Y && source.Y <= this._com.endRow) {
                    return app.compute(new Address(this._com.startRow, source.X, this._com.Worksheet.Name, this._com.Workbook.Name), array, false);
                }
                //1*N range
            } else if (this._com.getRowCount() === 1) {
                if (this._com.startCol <= source.X && source.X <= this._com.endCol) {
                    return app.compute(new Address(this._com.startRow, source.X, this._com.Worksheet.Name, this._com.Workbook.Name), array, false);
                }
            }
            return new XTypedValue("#VALUE!", XTypes.Error);
        }
    };

    return Range;
});
