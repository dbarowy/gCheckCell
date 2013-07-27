//TODO We might have a case of circular referencing
define("Parser/AST/ReferenceRange", ["require", "Parser/AST/Reference", "Parser/AST/ReferenceAddress", "FSharp/FSharp"], function (require, Reference, ReferenceAddress, FSharp) {
    "use strict";
    var inheritPrototype = function (subType, SuperType) {
        var prototype = Object.create(SuperType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    };

    function ReferenceRange(/*string*/wsname, /*Range*/ rng) {
        Reference.call(this, wsname);
        this.Range = rng;
        this.Range.SetWorksheetName(wsname);
    }

    inheritPrototype(ReferenceRange, Reference);

    ReferenceRange.prototype.toString = function () {
        if (this.WorksheetName !== null && typeof(this.WorksheetName) !== "undefined" && !(this.WorksheetName instanceof  FSharp.None)) {
            return "ReferenceRange(" + this.WorksheetName + "," + this.Range.toString() + ")";
        }
        else {
            return "ReferenceRange(None, " + this.Range.toString() + ")";
        }
    };

    ReferenceRange.prototype.InsideRef = function (/*Reference*/ ref) {
        if (!ReferenceAddress) {
            ReferenceAddress = require("Parser/AST/ReferenceAddress");
        }
        if (ref instanceof ReferenceAddress) {
            return this.Range.InsideAddr(ref.Address);
        }
        else if (ref instanceof  ReferenceRange) {
            return  this.Range.InsideRange(ref.Range);
        }
        else {
            throw new Error("Unknown Reference subclass.");
        }
    };

    ReferenceRange.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ws) {
        // we assume that missing workbook and worksheet
        // names mean that the address is local to the current
        // workbook and worksheet
        if (this.WorkbookName !== null && typeof(this.WorkbookName) !== "undefined" && !(this.WorkbookName instanceof  FSharp.None)) {
            this.Range.SetWorkbookName(this.WorkbookName);
        }
        else {
            this.Range.SetWorkbookName(wb.Name);
            this.WorkbookName = wb.Name;
        }
        if (this.WorksheetName !== null && typeof(this.WorksheetName) !== "undefined" && !(this.WorksheetName instanceof  FSharp.None)) {
            this.Range.SetWorksheetName(this.WorksheetName);
        }
        else {
            this.Range.SetWorksheetName(ws.Name);
            this.WorksheetName = ws.Name;
        }
    };

    ReferenceRange.prototype.compute = function (/*XApplication*/app, /*Address*/source) {
        return this.Range.compute(app, source);
    };
    return ReferenceRange;

});