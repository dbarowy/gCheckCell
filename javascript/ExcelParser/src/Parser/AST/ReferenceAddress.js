//TODO Circular dependency
define("Parser/AST/ReferenceAddress",["FSharp/FSharp", "Parser/AST/Reference", "Parser/AST/ReferenceRange"], function (FSharp, Reference, ReferenceRange) {
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

    ReferenceAddress.prototype.InsideRef = function (/*Reference*/ref) {
        if (ref instanceof ReferenceAddress) {
            return this.Address.InsideAddr(ref.Address);
        } else if (ref instanceof  ReferenceRange) {
            return this.Address.InsideRange(ref.Range);
        } else {
            throw new Error("Invalid Reference subclass.");
        }
    };

    ReferenceAddress.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
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

    ReferenceAddress.prototype.getValue = function(source){
      return this.Address.getValue(source);
    };

    return ReferenceAddress;
});
