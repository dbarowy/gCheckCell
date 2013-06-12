var ReferenceRange, ReferenceFunction, ReferenceConstant, ReferenceNamed, Reference, Range, Address, ReferenceString, _ref, _ref1, _ref2, _ref3,, _ref4, __hasProp = {}.hasOwnProperty,
    __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }

        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };


Address = (function () {
    //TODO CharColToInt and IntToColChars must be made static
    Address.CharColToInt = function (/*string */ col) {
        function ccti(/*int */ idx) {
            var ltr = col.charCodeAt(idx) - 64;
            var num = Math.pow(26.0, (col.length - idx - 1)) * ltr;
            if (idx = 0)
                return num;
            else
                num + ccti(idx - 1);
        }

        return ccti(col.length - 1);
    };

    Address.IntToColChars = function (/*int*/dividend) {
        var quot = dividend / 26;
        var rem = dividend % 26;
        if (rem == 0)
            quot = quot - 1;
        var ltr = (rem == 0) ? 'Z' : String.fromCharCode(64 + rem);
        if (quot == 0)
            return ltr.toString();
        else
            Address.IntToColChars(quot) + ltr.toString();
    };

    function Address(/*int*/ R, /*int*/C, /*string*/wsname, /*string*/ wbname) {
        this._wsn = wsname;
        this._wbn = wbname;
        if (isNaN(C)) {
            this.C = Address.IntToColChars(C);
        }
        else
            this.C = C;
        this.R = R;
        this.X = C;
        this.Y = R;
    }

    Address.prototype.A1Local = function () {
        return Address.IntToColChars(this.X) + this.Y;
    };
    Address.prototype.A1Worksheet = function () {
        if (typeof(this._wsn) != "undefined" && this._wsn == null)
            return this._wsn;
        else
            throw "Worksheet string should never be unset";
    };
    Address.prototype.A1Workbook = function () {
        if (typeof(this._wbn) != "undefined" && this._wbn == null)
            return this._wbn;
        else
            throw "Workbook string should nerver be unset";
    };
    Address.prototype.A1FullyQualified = function () {
        return "[" + this.A1Workbook() + "]" + this.A1Worksheet() + "!" + this.A1Local();
    };
    Address.prototype.R1C1 = function () {
        var wsstr, wbstr;
        if (typeof(this._wsn) != "undefined" && this._wsn == null)
            wsstr = this._wsn + "!";
        else
            wsstr = "";
        if (typeof(this._wbn) != "undefined" && this._wbn == null)
            wbstr = "[" + this._wbn + "]";
        else
            wbstr = "";
        return wbstr + wsstr + "R" + this.R + "C" + this.C;
    };

    Object.defineProperties(Address.prototype, { "WorksheetName": {"get": function () {
        return this._wsn;
    }, "set": function (value) {
        this._wsn = value;
    }}});
    Object.defineProperties(Address.prototype, { "WorkbookName": {"get": function () {
        return this._wbn;
    }, "set": function (value) {
        this._wbn = value;
    }}});
    Address.prototype.AddressAsInt32 = function () {
        var col_idx, row_idx;
        col_idx = (this.C - 1) % 65536;
        row_idx = (this.R - 1) % 65536;
        return row_idx + (col_idx << 16);
    };
    /*
     //TODO Equals and GetHashCode have to be implemented
     */
    Address.prototype.InsideRange = function (/*Range*/ rng) {
        return !(this.X < rng.getXLeft() || this.Y < rng.getYTop() || this.X > rng.getXRight() || this.Y > rng.getYBotton());
    };
    //TODO GetComObject method has to be implemented but I don't know what it is needed for

    Address.prototype.toString = function () {
        return "(" + this.Y + "," + this.X + ")";
    };

    return Address;
})();

Range = (function () {
    function Range(/*Address*/ topleft, /*Address*/bottomright) {
        this._tl = topleft;
        this._br = bottomright;
    }

    Range.prototype.toString = function () {
        return this._tl + "," + this._br;
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
    Range.prototype.InsideRange = function (/*Range*/ rng) {
        return !(this.getXLeft() < rng.getXLeft() || this.getYTop() < rng.getYTop() || this.getXRight() > rng.getXRight() || this.getYBottom() > rng.getYBottom());
    };
    Range.prototype.InsideAddr = function (/*Address*/ addr) {
        return !(this.getXLeft() < addr.X || this.getYTop() < addr.Y || this.getXRight() > addr.X || this.getYBottom() > addr.Y);
    }
    ;
    Range.prototype.SetWorksheetName = function (/*string*/ wsname) {
        this._tl.WorksheetName = wsname;
        this._br.WorksheetName = wsname;
    };
    Range.prototype.SetWorkbookName = function (/*string*/ wbname) {
        this._tl.WorkbookName = wbname;
        this._br.WorkbookName = wbname;
    };
    //TODO Implement GetComObject and find out what it actually does
    return Range;
})();

Reference = (function () {
    function Reference(/*string*/ wsname) {
        this._wbn = null;
        this._wsn = wsname;
    }

    Object.defineProperties(Reference.prototype, { "WorkbookName": {"get": function () {
        return this._wbn;
    }, "set": function (value) {
        this._wbn = value;
    }}});
    Object.defineProperties(Reference.prototype, { "WorksheetName": {"get": function () {
        return this._wsn;
    }, "set": function (value) {
        this._wsn = value;
    }}});
    Reference.prototype.InsideRef = function (/*Reference*/ ref) {
        return false;
    };
    Reference.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
        // we assume that missing workbook and worksheet
        // names mean that the address is local to the current
        // workbook and worksheet
        if (this.WorkbookName != null && typeof(this.WorkbookName) != "undefined") {
            this._wbn = this.WorkbookName;
        }
        else
            this._wbn = wb.Name;
        if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
            this._wsn = this.WorksheetName;
        }
        else
            this._wsn = ws.Name;
    };
    return Reference;
})();

ReferenceRange = (function (_super) {
    __extends(ReferenceRange, _super);
    function ReferenceRange(/*string*/wsname, /*Range*/ rng) {
        _ref = ReferenceRange.__super__.constructor.apply(this, arguments);
        this.rng = rng;
        this.Range = rng;
        this.rng.SetWorksheetName(wsname);
        return _ref;
    }

    ReferenceRange.prototype.toString = function () {
        if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
            return "ReferenceRange(" + this.WorksheetName + "," + this.rng.toString() + ")";
        }
        else
            return "ReferenceRange(None, " + rng.toString() + ")";
    };
    ReferenceRange.prototype.InsideRef = function (/*Reference*/ ref) {
        if (ref instanceof ReferenceAddress)
            return this.rng.InsideAddr(ref.Address);
        else if (ref instanceof  ReferenceRange)
            return this.rng.InsideRange(ref.Range);
        else
            throw "Unknown Reference subclass.";
    };
    //TODO The Workbook and Worksheet types don't exists and I have to rewrite this
    ReferenceRange.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ws) {
        // we assume that missing workbook and worksheet
        // names mean that the address is local to the current
        // workbook and worksheet
        if (this.WorkbookName != null && typeof(this.WorkbookName) != "undefined") {
            this.rng.SetWorkbookName(this.WorkbookName);
        }
        else {
            this.rng.SetWorkbookName(wb.Name);
            this.WorkbookName = wb.Name;
        }
        if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
            this.rng.SetWorksheetName(this.WorksheetName);
        }
        else {
            //ws.Name
            this.rng.SetWorksheetName(ws.Name);
            this.WorksheetName = ws.Name;
        }


    };

    return ReferenceRange;

})(Reference);

ReferenceFunction = (function (_super) {
    __extends(ReferenceFunction, _super);
    function ReferenceFunction(/*string*/wsname, /*string*/ fnname, /*Expression list*/ arglist) {
        _ref1 = ReferenceFunction.__super__.constructor.apply(this, arguments);
        this.ArgumentList = arglist;
        this.FunctionName = fnname;
        return _ref1;
    }

    ReferenceFunction.prototype.toString = function () {
        return this.FunctionName + "(" + this.ArgumentList.join(",") + ")";
    };
    ReferenceFunction.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
        for (var a in this.ArgumentList)
            a.Resolve(wb, ws);
    };
    return ReferenceFunction;

})(Reference);

ReferenceConstant = (function (_super) {
    __extends(ReferenceConstant, _super);
    function ReferenceConstant(/*string */wsname, /*int*/ value) {
        _ref2 = ReferenceConstant.__super__.constructor.apply(this, arguments);
        this.value = value;
        return _ref2;
    }

    ReferenceConstant.prototype.toString = function () {
        return "Constant(" + this.value + ")";
    };
    return ReferenceConstant;
})(Reference);

ReferenceString = (function (_super) {
    __extends(ReferenceString, _super);
    function ReferenceString(/*string*/ wsname, /*string*/value) {
        _ref3 = ReferenceString.__super__.constructor.apply(this, arguments);
        this.value = value;
        return _ref3;
    }

    ReferenceString.prototype.toString = function () {
        return "String(" + this.valueOf + ")";
    };
    return ReferenceString;
})(Reference);

ReferenceNamed = (function (_super) {
    __extends(ReferenceNamed, _super);
    function ReferenceNamed(/*string*/wsname, /*string*/ varname) {
        _ref4 = ReferenceNamed.__super__.constructor.apply(this, arguments);
        this.varname = varname;
    }

    ReferenceNamed.prototype.toString = function () {
        if (this.WorksheetName != null && typeof(this.WorksheetName) != 'undefined') {
            return "ReferenceName(" + this.WorksheetName + "," + this.varname + ")";
        }
        else
            return "ReferenceName(None, " + this.varname + ")";
    };
})(Reference);

