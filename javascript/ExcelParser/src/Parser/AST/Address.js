//TODO methods in this block use Range objects but those are not needed at initialization
//Reference the range?
define("Parser/AST/Address", ["FSharp/FSharp"], function (FSharp) {
    "use strict";
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
    }

    /**
     * Converts the string representing a column to an equivalent integer.
     * The counting starts from 1
     * @param col String representing the column. It must be of the form [A-Z]+
     * @returns {number} Column number
     */
    Address.CharColToInt = function (/*string */ col) {
        var idx, num = 0, reg, ltr = 0;
        idx = col.length - 1;
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
        if (Math.floor(dividend) !== dividend) {
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
     * Returns the string representation in A1 for the current address
     * @returns {string}
     * @constructor
     */
    Address.prototype.A1Local = function () {
        return "" + Address.IntToColChars(this.X) + this.Y;
    };

    /**
     * Get the Worksheet name.
     * @returns {*} Worksheet name associated with this address. If the Worksheet name is not set, it throws an error.
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
     * @returns {*} Workbook name associated with this address. If the Workbook name is not set, it throws an error.
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
     *   I use a javascript object to implement a HashMap.
     *   Two objects will be equal only if they have the same workbook, worksheet and coordinates
     * @returns {string}
     */
    Address.prototype.getHashCode = function () {
        return ("" + this.WorkbookName + "_" + this.WorksheetName + "_" + this.X + "_" + this.Y);
    };
    /**
     *
     * @param rng
     * @returns {boolean}
     * @constructor
     */
    Address.prototype.InsideRange = function (/*Range*/ rng) {
        return !(this.X < rng.getXLeft() || this.Y < rng.getYTop() || this.X > rng.getXRight() || this.Y > rng.getYBottom());
    };
    /**
     *
     * @param addr
     * @returns {boolean}
     * @constructor
     */
    Address.prototype.InsideAddr = function (/*Address*/addr) {
        return this.X === addr.X && this.Y === addr.Y;
    };

    Address.prototype.GetCOMObject = function (/*XApplication*/app) {
        return app.getWorkbookByName(this.A1Workbook()).getWorksheetByName(this.A1Worksheet()).getRange(this.Y, this.X);
    };

    Address.prototype.toString = function () {
        return "(" + this.Y + "," + this.X + ")";
    };
    return Address;
});
