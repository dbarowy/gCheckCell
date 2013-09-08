define("Parser/AST/ReferenceAddress", ["FSharp/FSharp", "Parser/AST/Reference", "Parser/AST/ReferenceRange"], function (FSharp, Reference, ReferenceRange) {
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
        //as those are irrelevant for the result of an Address
        return this.Address.compute(app, source, array, false, false);
    };

    return ReferenceAddress;
});
