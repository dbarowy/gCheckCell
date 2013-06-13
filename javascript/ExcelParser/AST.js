/**
 * @Author Alexandru Toader
 * @Description This file contains the definition of the Abstract Syntax Tree
 * The class inheritance pattern is based on the one used by CoffeeScript
 */
var AST;
AST = (function () {
    var ReferenceAddress, UnaryOpExpr, ParensExpr, Expression, BinOpExpr, ReferenceExpr, ReferenceRange, ReferenceFunction, ReferenceConstant, ReferenceNamed, Reference, Range, Address, ReferenceString, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, __hasProp = {}.hasOwnProperty,
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
    //TODO Namespace management is bad or, at least, it looks bad
    function AST() {
    }

//TODO Define generic Workbook type and Worksheet type that act like wrappers for the GoogleDocs/ Office types
    Address = (function () {
        //Private:
        var _wsn, _wbn, x, y;
        //Public
        Address.CharColToInt = function (/*string */ col) {
            var idx = col.length - 1;
            var num = 0, ltr = 0;
            do {
                var ltr = col.charCodeAt(idx) - 64;
                var num = num + Math.pow(26.0, (col.length - idx - 1)) * ltr;
                idx--;
            } while (idx >= 0);
            return num;
        };
        //TODO Debug and test
        Address.IntToColChars = function (/*int*/dividend) {
            var quot = Math.floor(dividend / 26);
            var rem = Math.floor(dividend % 26);
            if (rem == 0)
                quot--;
            else;
            if (rem == 0)
                ltr = "Z";
            else {
                console.log(rem);
                ltr = String.fromCharCode(64 + rem);
                console.log(ltr);
            }
            if (quot == 0) {
                console.log(quot);
                return ltr;
            }
            else {
                console.log(quot);
                return Address.IntToColChars(quot) + ltr;
            }
        };

        function Address(/*int*/ R, /*int*/C, /*string*/wsname, /*string*/ wbname) {
            _wsn = wsname;
            _wbn = wbname;
            //If the column is given as a string convert it to the number
            if (isNaN(C)) {
                x = Address.CharColToInt(C);
            }
            else
                x = C;
            y = R;
        }

        Object.defineProperties(Address.prototype, { "X": {"get": function () {
            return x;
        }}});
        Object.defineProperties(Address.prototype, { "Y": {"get": function () {
            return y;
        }}});

        Address.prototype.A1Local = function () {
            return Address.IntToColChars(this.X) + this.Y.toString();
        };
        Address.prototype.A1Worksheet = function () {
            if (typeof(_wsn) != "undefined" && _wsn != null)
                return _wsn;
            else
                throw "Worksheet string should never be unset";
        };
        Address.prototype.A1Workbook = function () {
            if (typeof(_wbn) != "undefined" && _wbn != null)
                return _wbn;
            else
                throw "Workbook string should never be unset";
        };
        Address.prototype.A1FullyQualified = function () {
            return "[" + this.A1Workbook() + "]" + this.A1Worksheet() + "!" + this.A1Local();
        };
        Address.prototype.R1C1 = function () {
            var wsstr, wbstr;
            if (typeof(_wsn) != "undefined" && _wsn != null)
                wsstr = _wsn + "!";
            else
                wsstr = "";
            if (typeof(_wbn) != "undefined" && _wbn != null)
                wbstr = "[" + _wbn + "]";
            else
                wbstr = "";
            return wbstr + wsstr + "R" + this.Y + "C" + this.X;
        };

        Object.defineProperties(Address.prototype, { "WorksheetName": {"get": function () {
            return _wsn;
        }, "set": function (value) {
            _wsn = value;
        }}});
        Object.defineProperties(Address.prototype, { "WorkbookName": {"get": function () {
            return _wbn;
        }, "set": function (value) {
            _wbn = value;
        }}});
        Address.prototype.AddressAsInt32 = function () {
            var col_idx, row_idx;
            col_idx = Math.floor(this.X - 1) % 65536;
            row_idx = Math.floor(this.Y - 1) % 65536;
            return row_idx + (col_idx * Math.pow(2, 16));
        };
        /*
         //TODO Equals, SameAs and GetHashCode have to be implemented
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
        //Private:
        var _tl, _br;

        function Range(/*Address*/ topleft, /*Address*/bottomright) {
            _tl = topleft;
            _br = bottomright;
        }

        Range.prototype.toString = function () {
            return _tl.toString() + "," + _br.toString();
        };
        Range.prototype.getXLeft = function () {
            return _tl.X;
        };
        Range.prototype.getXRight = function () {
            return _br.X;
        };
        Range.prototype.getYTop = function () {
            return _tl.Y;
        };
        Range.prototype.getYBottom = function () {
            return _br.Y;
        };
        Range.prototype.InsideRange = function (/*Range*/ rng) {
            return !(this.getXLeft() < rng.getXLeft() || this.getYTop() < rng.getYTop() || this.getXRight() > rng.getXRight() || this.getYBottom() > rng.getYBottom());
        };
        Range.prototype.InsideAddr = function (/*Address*/ addr) {
            return !(this.getXLeft() < addr.X || this.getYTop() < addr.Y || this.getXRight() > addr.X || this.getYBottom() > addr.Y);
        }
        ;
        Range.prototype.SetWorksheetName = function (/*string*/ wsname) {
            _tl.WorksheetName = wsname;
            _br.WorksheetName = wsname;
        };
        Range.prototype.SetWorkbookName = function (/*string*/ wbname) {
            _tl.WorkbookName = wbname;
            _br.WorkbookName = wbname;
        };
        //TODO Implement GetComObject and find out what it actually does
        return Range;
    })();

    Reference = (function () {
        //Private:
        var _wbn, _wsn;
        //Public:
        function Reference(/*string*/ wsname) {
            _wbn = null;
            _wsn = wsname;
        }

        Object.defineProperties(Reference.prototype, { "WorkbookName": {"get": function () {
            return _wbn;
        }, "set": function (value) {
            _wbn = value;
        }}});
        Object.defineProperties(Reference.prototype, { "WorksheetName": {"get": function () {
            return _wsn;
        }, "set": function (value) {
            _wsn = value;
        }}});
        Reference.prototype.InsideRef = function (/*Reference*/ ref) {
            return false;
        };
        Reference.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            // we assume that missing workbook and worksheet
            // names mean that the address is local to the current
            // workbook and worksheet
            if (this.WorkbookName != null && typeof(this.WorkbookName) != "undefined") {
                _wbn = this.WorkbookName;
            }
            else  {
                _wbn = wb.Name;
            }
            if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
                console.log("set");
                _wsn = this.WorksheetName;
            }
            else {
                console.log("reset");
                _wsn = ws.Name;
            }
        };
        return Reference;
    })();

    ReferenceRange = (function (_super) {
        __extends(ReferenceRange, _super);
        //private:
        var range;

        function ReferenceRange(/*string*/wsname, /*Range*/ rng) {
            _ref = ReferenceRange.__super__.constructor.apply(this, arguments);
            range = rng;
            range.SetWorksheetName(wsname);
            return _ref;
        }

        Object.defineProperties(ReferenceRange.prototype, { "Range": {"get": function () {
            return range;
        }}});

        ReferenceRange.prototype.toString = function () {
            if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
                return "ReferenceRange(" + this.WorksheetName + "," + this.Range.toString() + ")";
            }
            else
                return "ReferenceRange(None, " + this.Range.toString() + ")";
        };
        ReferenceRange.prototype.InsideRef = function (/*Reference*/ ref) {
            if (ref instanceof ReferenceAddress)
                return  this.Range.InsideAddr(ref.Address);
            else if (ref instanceof  ReferenceRange)
                return  this.Range.InsideRange(ref.Range);
            else
                throw "Unknown Reference subclass.";
        };
        //TODO The Workbook and Worksheet types don't exists and I have to rewrite this
        ReferenceRange.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ws) {
            // we assume that missing workbook and worksheet
            // names mean that the address is local to the current
            // workbook and worksheet
            if (this.WorkbookName != null && typeof(this.WorkbookName) != "undefined") {
                this.Range.SetWorkbookName(this.WorkbookName);
            }
            else {
                this.Range.SetWorkbookName(wb.Name);
                this.WorkbookName = wb.Name;
            }
            if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
                this.Range.SetWorksheetName(this.WorksheetName);
            }
            else {
                //ws.Name
                this.Range.SetWorksheetName(ws.Name);
                this.WorksheetName = ws.Name;
            }
        };

        return ReferenceRange;

    })(Reference);

    ReferenceAddress = (function (_super) {
        __extends(ReferenceAddress, _super);
        //private:
        var address;

        function ReferenceAddress(/*string*/ wsname, /*Address*/ addr) {
            _ref9 = ReferenceAddress.__super__.constructor.apply(this, arguments);
            address = addr;
            address.WorksheetName = wsname;
            return _ref9;
        }

        Object.defineProperties(ReferenceAddress.prototype, { "Address": {"get": function () {
            return address;
        }}});

        ReferenceAddress.prototype.toString = function () {
            if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
                return "ReferenceAddress(" + this.WorksheetName.toString() + ", " + this.Address.toString() + ")";
            }
            else
                return "ReferenceAddress(None, " + this.Address.toString() + ")";
        };

        ReferenceAddress.prototype.InsideRef = function (/*Reference*/ref) {
            if (ref instanceof ReferenceAddress) {
                return this.Address.InsideAddr(ref.Address);
            } else if (ref instanceof  ReferenceRange) {
                return this.Address.InsideRange(ref.Range);
            } else throw "Invalid Reference subclass.";
        };

        ReferenceAddress.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            // always resolve the workbook name when it is missing
            // but only resolve the worksheet name when the
            // workbook name is not set
            if (this.WorkbookName != null && typeof(this.WorkbookName) != "undefined") {
                this.Address.WorkbookName = this.WorkbookName;
            }
            else {
                this.Address.WorkbookName = wb.Name;
                this.WorkbookName = wb.Name;
            }
            if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined") {
                this.Address.WorksheetName = this.WorksheetName;
            }
            else {
                this.WorksheetName = ws.Name;
                this.Address.WorksheetName = ws.Name;
            }
        }
        return ReferenceAddress;
    })(Reference);

    ReferenceFunction = (function (_super) {
        __extends(ReferenceFunction, _super);
        //private
        var argumentList, functionName;

        function ReferenceFunction(/*string*/wsname, /*string*/ fnname, /*Expression list*/ arglist) {
            _ref1 = ReferenceFunction.__super__.constructor.apply(this, arguments);
            argumentList = arglist;
            functionName = fnname;
            return _ref1;
        }

        Object.defineProperties(ReferenceFunction.prototype, { "ArgumentList": {"get": function () {
            return argumentList;
        }}});
        Object.defineProperties(ReferenceFunction.prototype, { "FunctionName": {"get": function () {
            return functionName;
        }}});
        ReferenceFunction.prototype.toString = function () {
            return functionName + "(" + argumentList.join(",") + ")";
        };
        ReferenceFunction.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            for (var a in argumentList)
                a.Resolve(wb, ws);
        };
        return ReferenceFunction;

    })(Reference);

    ReferenceConstant = (function (_super) {
        __extends(ReferenceConstant, _super);
        var _value;

        function ReferenceConstant(/*string */wsname, /*int*/ value) {
            _ref2 = ReferenceConstant.__super__.constructor.apply(this, arguments);
            _value = value;
            return _ref2;
        }

        ReferenceConstant.prototype.toString = function () {
            return "Constant(" + _value + ")";
        };
        return ReferenceConstant;
    })(Reference);

    ReferenceString = (function (_super) {
        __extends(ReferenceString, _super);
        var _value;

        function ReferenceString(/*string*/ wsname, /*string*/value) {
            _ref3 = ReferenceString.__super__.constructor.apply(this, arguments);
            _value = value;
            return _ref3;
        }

        ReferenceString.prototype.toString = function () {
            return "String(" + _value + ")";
        };
        return ReferenceString;
    })(Reference);

    ReferenceNamed = (function (_super) {
        __extends(ReferenceNamed, _super);
        var _varname;

        function ReferenceNamed(/*string*/wsname, /*string*/ varname) {
            _ref4 = ReferenceNamed.__super__.constructor.apply(this, arguments);
            _varname = varname;
            return _ref4;
        }

        ReferenceNamed.prototype.toString = function () {
            if (this.WorksheetName != null && typeof(this.WorksheetName) != 'undefined') {
                return "ReferenceName(" + this.WorksheetName + "," + _varname + ")";
            }
            else
                return "ReferenceName(None, " + _varname + ")";
        };
        return ReferenceNamed;
    })(Reference);

    Expression = (function () {
        function Expression() {
        }

        Expression.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            throw "Expression should be an abstract class.";
        };
        return Expression;
    })();

    ReferenceExpr = (function (_super) {
        __extends(ReferenceExpr, _super);
        var reference;

        function ReferenceExpr(/*Reference*/ ref) {
            _ref5 = ReferenceExpr.__super__.constructor.apply(this, arguments);
            reference = ref;
            return _ref5;
        }

        Object.defineProperties(ReferenceExpr.prototype, { "Ref": {"get": function () {
            return reference;
        }}});
        ReferenceExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            reference.Resolve(wb, ws);
        };
        return ReferenceExpr;
    })(Expression);

    BinOpExpr = (function (_super) {
        __extends(BinOpExpr, _super);
        var _expr1, _expr2, _str;

        function BinOpExpr(/*string*/str, /*Expression*/expr1, /*Expression*/expr2) {
            _ref6 = BinOpExpr.__super__.constructor.apply(this, arguments);
            _str = str;
            _expr1 = expr1;
            _expr2 = expr2;
            return _ref6;
        }

        Object.defineProperties(BinOpExpr.prototype, { "Expr1": {"get": function () {
            return _expr1;
        }}});
        Object.defineProperties(BinOpExpr.prototype, { "Expr2": {"get": function () {
            return _expr2;
        }}});
        Object.defineProperties(BinOpExpr.prototype, { "Str": {"get": function () {
            return _str;
        }}});

        BinOpExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            _expr1.Resolve(wb, ws);
            _expr2.Resolve(wb, ws);
        };
        return BinOpExpr;
    })(Expression);

    UnaryOpExpr = (function (_super) {
        __extends(UnaryOpExpr, _super);
        var _expr, _chr;

        function UnaryOpExpr(/*char*/chr, /*Expression*/expr) {
            _ref7 = UnaryOpExpr.__super__.constructor.apply(this, arguments);
            _expr = expr;
            _chr = chr;
            return _ref7;
        }

        Object.defineProperties(UnaryOpExpr.prototype, { "Expr": {"get": function () {
            return _expr;
        }}});
        Object.defineProperties(UnaryOpExpr.prototype, { "Chr": {"get": function () {
            return _chr;
        }}});

        UnaryOpExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            _expr.Resolve(wb, ws);
        };
        return UnaryOpExpr;
    })(Expression);

    ParensExpr = (function (_super) {
        __extends(ParensExpr, _super);
        var expr;

        function ParensExpr(/*Expression*/expr) {
            _ref8 = ParensExpr.__super__.constructor.apply(this, arguments);
            expr = expr;
            return _ref8;
        }

        Object.defineProperties(ParensExpr.prototype, { "Expr": {"get": function () {
            return expr;
        }}});

        ParensExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            expr.Resolve(wb, ws);
        };

        return ParensExpr;
    })(Expression);
    //TODO find a better way for namespace management
    AST.ReferenceAddress = ReferenceAddress;
    AST.UnaryOpExpr = UnaryOpExpr;
    AST.ParensExpr = ParensExpr;
    AST.Expression = Expression;
    AST.BinOpExpr = BinOpExpr;
    AST.ReferenceExpr = ReferenceExpr;
    AST.ReferenceRange = ReferenceRange;
    AST.ReferenceFunction = ReferenceFunction;
    AST.ReferenceConstant = ReferenceConstant;
    AST.ReferenceNamed = ReferenceNamed;
    AST.Reference = Reference;
    AST.Range = Range;
    AST.Address = Address;
    AST.ReferenceString = ReferenceString;
    return AST;


})();

