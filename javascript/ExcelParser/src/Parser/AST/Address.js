/**
 * This file contains the Address module. This class is used to represent addresses(individual cells) in the worksheet.
 */
define("Parser/AST/Address", ["FSharp/FSharp"], function (FSharp) {
    "use strict";
    /**
     *
     * @param R the row of the cell
     * @param C the column of the cell. Column number of column string
     * @param wsname worksheet name
     * @param wbname workbook name
     * @constructor
     */
    function Address(/*int*/ R, /*int*/C, /*string*/wsname, /*string*/ wbname) {
        this.WorksheetName = wsname;
        this.WorkbookName = wbname;
        //If the column is given as a string convert it to the number
        if (isNaN(C)) {
            this.X = Address.CharColToInt(C);
        }
        else {
            this.X = C;
        }
        this.Y = R;
        this._com = null;
        this._hash = null;
    }

    /**
     * Converts the string representing a column into an equivalent integer.
     * The counting starts from 1 i.e A=1, B=2, C=3..AA=27
     * @param col String representing the column. It must be of the form [A-Z a-z]+
     * @returns {number} Column number
     */
    Address.CharColToInt = function (/*string */ col) {
        var idx, num = 0, reg, ltr = 0;
        idx = col.length - 1;
        col = col.toUpperCase();
        reg = new RegExp("\\b[A-Z]+\\b");
        if (!reg.test(col)) {
            throw new Error("The column string doesn't respect the specification");
        }
        do {
            ltr = col.charCodeAt(idx) - 64;
            num = num + Math.pow(26.0, (col.length - idx - 1)) * ltr;
            idx--;
        } while (idx >= 0);
        return num;
    };


    /**
     * Returns the string equivalent for the given column. Column 1 = A, column 2=B etc.
     * @param dividend Integer representing the column number. If an integer is not supplied, an error is thrown
     * @returns {string} String representing the column
     */
    Address.IntToColChars = function (/*int*/dividend) {
        var quot, rem, ltr = "";
        if (Math.floor(dividend) !== dividend || dividend <= 0) {
            throw new Error("This works only for integers");
        }
        do {
            quot = dividend / 26;
            rem = dividend % 26;
            if (rem === 0) {
                quot--;
            }
            if (rem === 0) {
                ltr = "Z" + ltr;
            }
            else {
                ltr = String.fromCharCode(64 + rem) + ltr;
            }
            dividend = quot;
        } while (quot >= 1);
        return ltr;
    };

    /**
     * Returns the string representation in A1 for the address
     * @returns {string}
     * @constructor
     */
    Address.prototype.A1Local = function () {
        return "" + Address.IntToColChars(this.X) + this.Y;
    };

    /**
     * Get the Worksheet name.
     * @returns {*} Worksheet name associated with this address.
     * If the Worksheet name is not set, it throws an error.
     * To avoid this error, all Addresses should be resolved before use.
     */
    Address.prototype.A1Worksheet = function () {
        if (typeof(this.WorksheetName) !== "undefined" && this.WorksheetName !== null && !(this.WorksheetName instanceof  FSharp.None)) {
            return this.WorksheetName;
        }
        else {
            throw new Error("Worksheet string should never be unset");
        }
    };
    /**
     * Get the Workbook name
     * @returns {*} Workbook name associated with this address.
     * If the Workbook name is not set, it throws an error.
     * To avoid this error, all Addresses should be resolved before use.
     */
    Address.prototype.A1Workbook = function () {
        if (typeof(this.WorkbookName) !== "undefined" && this.WorkbookName !== null && !(this.WorkbookName instanceof  FSharp.None)) {
            return this.WorkbookName;
        }
        else {
            throw new Error("Workbook string should never be unset");
        }
    };
    /**
     * String representation of the Address in A1 format with the worksheet and workbook names
     * @returns {string}
     * @constructor
     */
    Address.prototype.A1FullyQualified = function () {
        return "[" + this.A1Workbook() + "]" + this.A1Worksheet() + "!" + this.A1Local();
    };
    /**
     * Return the R1C1 string representation of the address
     * @returns {string}
     * @constructor
     */
    Address.prototype.R1C1 = function () {
        var wsstr, wbstr;
        if (typeof(this.WorksheetName) !== "undefined" && this.WorksheetName !== null && !(this.WorksheetName instanceof  FSharp.None)) {
            wsstr = this.WorksheetName + "!";
        }
        else {
            wsstr = "";
        }
        if (typeof(this.WorkbookName) !== "undefined" && this.WorkbookName !== null && !(this.WorkbookName instanceof  FSharp.None)) {
            wbstr = "[" + this.WorkbookName + "]";
        }
        else {
            wbstr = "";
        }
        return wbstr + wsstr + "R" + this.Y + "C" + this.X;
    };
    /**
     * I use a javascript object to implement a HashMap.
     * Two objects will be equal only if they have the same workbook, worksheet and coordinates
     * @returns {string} Hashcode of the object
     */
    Address.prototype.getHashCode = function () {
        if (this._hash === null) {
            this._hash = ("" + this.A1Workbook() + "_" + this.A1Worksheet() + "_" + this.X + "_" + this.Y);
        }
        return this._hash;
    };

    /**
     *  Check if the object is inside the range.
     * @param rng
     * @returns {boolean} True if the address is inside the range, false otherwise
     * @constructor
     */
    Address.prototype.InsideRange = function (/*Range*/ rng) {
        return !(this.X < rng.getXLeft() || this.Y < rng.getYTop() || this.X > rng.getXRight() || this.Y > rng.getYBottom());
    };
    /**
     *  Check if the current address is inside the address provided as a parameter
     * @param addr
     * @returns {boolean}
     */
    Address.prototype.InsideAddr = function (/*Address*/addr) {
        return this.X === addr.X && this.Y === addr.Y;
    };
    /**
     * Get the XRange object associated with the cell.
     * @param app XApplication object that represents an entry point to the Spreadsheet methods and values
     * @returns {XRange|*}
     */
    Address.prototype.GetCOMObject = function (/*XApplication*/app) {
        if (this._com === null) {
            this._com = app.getWorkbookByName(this.A1Workbook()).getWorksheetByName(this.A1Worksheet()).getRange(this.Y, this.X);
        }
        return this._com;
    };

    Address.prototype.toString = function () {
        return "(" + this.Y + "," + this.X + ")";
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
    Address.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array,  /*Boolean*/range,/*Boolean*/full_range) {
        if (this._com === null) {
            this._com = app.getWorkbookByName(this.A1Workbook()).getWorksheetByName(this.A1Worksheet()).getRange(this.Y, this.X);
        }

        //If the cell contains a formula, we have to compute the result before returning it
        if (this._com.hasFormula()) {
            return app.compute(this, array, false);
            //otherwise, return the value
        } else {
            //If this is an array formula, return a 1x1 matrix
            if (array) {
                return [
                    [this._com.getValue()]
                ];
                //otherwise just return the value
            } else {
                return this._com.getValue();
            }

        }
    };
    return Address;
});
