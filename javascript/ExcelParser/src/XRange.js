function XRange(/*XWorkbook*/wb, /*XWorksheet*/ws, /*int*/startRow, /*int*/startCol, /*int*/endRow, /*int*/endCol, /*string*/value, /*string*/formula) {
    "use strict";
    this.Workbook = wb;
    this.Worksheet = ws;
    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;
    this._values = value;
    this._formulas = formula;
}
XRange.prototype.hasFormula = function () {
    "use strict";
    if (this.startRow === this.endRow && this.startCol === this.endCol) {
        return (this._formulas !== "" && this._formulas !== null);
    }
    else {
        var ok = true, i, j;
        for (i = 0; i < this.endRow - this.startRow + 1 && ok; i++) {
            for (j = 0; j < this.endCol - this.startCol + 1 && ok; j++) {
                if (this._formulas[i][j] === null || this._formulas[i][j] === "") {
                    ok = false;
                }
            }
        }
        return ok;
    }

};
XRange.prototype.getFormula = function () {
    "use strict";
    return this._formulas[0][0];
};
XRange.prototype.getFormulas = function () {
    "use strict";
    return this._formulas;
};
XRange.prototype.getRowCount = function () {
    "use strict";
    return this.endRow - this.startRow + 1;
};
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
XRange.prototype.getWorksheet = function () {
    "use strict";
    return this._ws;
};
XRange.prototype.getWorkbook = function () {
    "use strict";
    return this._wb;

};