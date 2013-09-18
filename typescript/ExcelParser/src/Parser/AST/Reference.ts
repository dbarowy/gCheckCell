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
 * @Description  This file contains the Reference class.
 * This is used as a base class for the other reference object types.
 */
define("Parser/AST/Reference", ["FSharp/FSharp"], function (FSharp) {
    "use strict";
    function Reference(/*string*/ wsname) {
        this.WorkbookName = null;
        this.WorksheetName = wsname;
    }

    Reference.prototype.resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        // we assume that missing workbook and worksheet
        // names mean that the address is local to the current
        // workbook and worksheet
        if ((this.WorksheetName instanceof  FSharp.None) || this.WorkbookName === null || typeof(this.WorkbookName) === "undefined") {
            this.WorkbookName = wb.Name;
        }
        if ((this.WorksheetName instanceof  FSharp.None) || this.WorksheetName === null || typeof(this.WorksheetName) === "undefined") {
            this.WorksheetName = ws.Name;
        }
    };
    return Reference;
});
