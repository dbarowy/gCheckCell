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

XWorksheet.prototype.getUsedRange = function () {
    "use strict";
    var i, j, len1, len2, range = [], row;
    if (this._GDocs) {
        for (i = 0, len1 = this._values.length; i < len1; i++) {
            row = [];
            for (j = 0, len2 = this._values[i].length; j < len2; j++) {
                row.push(new XRange(this.Workbook, this, i + 1, j + 1, i + 1, j + 1));//, this._values[i][j], this._formulas[i][j])
            }
            range.push(row);
        }
        return range;

    } else {
        throw new Error("Office method not implemented.");
    }
};

XWorksheet.prototype.getRange = function (/*int*/startRow, /*int*/startCol, /*optional int*/endRow, /*optional int*/endCol) {
    "use strict";
    if (this._GDocs) {
        if (startRow < this._lastRow && startCol < this._lastColumn) {
            if (typeof(endRow) === "undefined" || typeof(endCol) === "undefined") {
                return new XRange(this.Workbook, this, startRow, startCol, startRow, startCol);  //, this._values[startRow - 1][startCol - 1], this._formulas[startRow - 1][startCol - 1]
            } else {
                return new XRange(this.Workbook, this, startRow, startCol, endRow, endCol);    //, values, formulas
            }
        } else {
            return this._ws.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1);
        }
    } else {
        throw new Error("Office method not implemented.");
    }

};

Object.defineProperty(XWorksheet.prototype, "Name", {get: function () {
    "use strict";
    if (this._GDocs) {
        return this._ws.getName();
    }
    else {
        throw new Error("Office method not implemented.");
    }
}});
