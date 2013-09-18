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
 * @Description This file contains the ReferenceAddress class, used to wrap single cell references
 */

define("Parser/AST/ReferenceAddress", ["FSharp/FSharp", "Parser/AST/Reference"], function (FSharp, Reference) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceAddress(/*string*/ wsname, /*Address*/ addr) {
        Reference.call(this, wsname);
        this.Address = addr;
        this.Address.WorksheetName = wsname;
    }

    inheritPrototype(ReferenceAddress, Reference);

    ReferenceAddress.prototype.toString = function () {
        if (this.WorksheetName !== null && typeof(this.WorksheetName) !== "undefined" && !(this.WorksheetName instanceof FSharp.None)) {
            return "ReferenceAddress(" + this.WorksheetName.toString() + ", " + this.Address.toString() + ")";
        }
        else {
            return "ReferenceAddress(None, " + this.Address.toString() + ")";
        }
    };

    ReferenceAddress.prototype.resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
        // always resolve the workbook name when it is missing
        // but only resolve the worksheet name when the
        // workbook name is not set
        if (this.WorkbookName !== null && typeof(this.WorkbookName) !== "undefined" && !(this.WorkbookName instanceof FSharp.None)) {
            this.Address.WorkbookName = this.WorkbookName;
        }
        else {
            this.Address.WorkbookName = wb.Name;
            this.WorkbookName = wb.Name;
        }
        if (this.WorksheetName !== null && typeof(this.WorksheetName) !== "undefined" && !(this.WorksheetName instanceof  FSharp.None)) {
            this.Address.WorksheetName = this.WorksheetName;
        }
        else {
            this.WorksheetName = ws.Name;
            this.Address.WorksheetName = ws.Name;
        }
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
    ReferenceAddress.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
        //There is no point to pass around the original values of range and full_range
        //as those are irrelevant for the result of an Address. This enforces the rules for computing the values of individual cells
        return this.Address.compute(app, source, array, false, false);
    };

    return ReferenceAddress;
});
