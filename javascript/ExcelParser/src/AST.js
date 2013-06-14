/**
 * @Author Alexandru Toader
 * @Description This file contains the definition of the Abstract Syntax Tree
 * The class inheritance pattern is based on the one used by CoffeeScript.
 * Any object member named "_*" might be made private and should not be used.
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

//TODO Define generic Workbook type and Worksheet type that act like wrappers for the GoogleDocs/ Office types.
// Find a good place to define them
    Address = (function () {
        /**
         * Converts the string representing a column to an equivalent integer.
         * The counting starts from 1
         * @param col String representing the column. It must be of the form [A-Z]+
         * @returns {number} Column number
         */
        Address.CharColToInt = function (/*string */ col) {
            var idx = col.length - 1;
            var num = 0, ltr = 0;
            var reg = new RegExp("\\b[A-Z]+\\b");
            if (!reg.test(col))
                throw new Error("The column string doesn't respect the specification");
            do {
                var ltr = col.charCodeAt(idx) - 64;
                var num = num + Math.pow(26.0, (col.length - idx - 1)) * ltr;
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
            if (Math.floor(dividend) != dividend)
                throw new Error("This works only for integers");
            do {
                quot = dividend / 26;
                rem = dividend % 26;
                if (rem == 0) {
                    quot--;
                }
                if (rem == 0) {
                    ltr = "Z" + ltr;
                }
                else
                    ltr = String.fromCharCode(64 + rem) + ltr;
                dividend = quot;

            } while (quot >= 1);
            return ltr;
        };

        function Address(/*int*/ R, /*int*/C, /*string*/wsname, /*string*/ wbname) {
            //TODO these variables should be made private, find a pattern that guarantees this otherwise, remove excess code
            this._wsn = wsname;
            this._wbn = wbname;
            //If the column is given as a string convert it to the number
            if (isNaN(C)) {
                this._x = Address.CharColToInt(C);
            }
            else
                this._x = C;
            this._y = R;
        }

        Object.defineProperties(Address.prototype, { "X": {"get": function () {
            return this._x;
        }}});
        Object.defineProperties(Address.prototype, { "Y": {"get": function () {
            return this._y;
        }}});

        /**
         * Returns the string representation in A1 for the current address
         * @returns {string}
         * @constructor
         */
        Address.prototype.A1Local = function () {
            return Address.IntToColChars(this.X) + this.Y.toString();
        };
        /**
         * Get the Worksheet name.
         * @returns {*} Worksheet name associated with this address. If the Worksheet name is not set, it throws an error.
         */
        Address.prototype.A1Worksheet = function () {
            if (typeof(this._wsn) != "undefined" && this._wsn != null && !(this._wsn instanceof  FSharp.None))
                return this._wsn;
            else
                throw "Worksheet string should never be unset";
        };
        /**
         * Get the Workbook name
         * @returns {*} Workbook name associated with this address. If the Workbook name is not set, it throws an error.
         */
        Address.prototype.A1Workbook = function () {
            if (typeof(this._wbn) != "undefined" && this._wbn != null && !(this._wbn instanceof  FSharp.None))
                return this._wbn;
            else
                throw "Workbook string should never be unset";
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
            if (typeof(this._wsn) != "undefined" && this._wsn != null && !(this._wsn instanceof  FSharp.None))
                wsstr = this._wsn + "!";
            else
                wsstr = "";
            if (typeof(this._wbn) != "undefined" && this._wbn != null && !(this._wbn instanceof  FSharp.None))
                wbstr = "[" + this._wbn + "]";
            else
                wbstr = "";
            return wbstr + wsstr + "R" + this.Y + "C" + this.X;
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
            // convert to zero-based indices
            // the modulus catches overflow; collisions are OK because our equality
            // operator does an exact check
            // underflow should throw an exception
            var col_idx, row_idx;
            col_idx = Math.floor(this.X - 1) % 65536;
            row_idx = Math.floor(this.Y - 1) % 65536;
            if (col_idx < 0 || row_idx < 0)
                throw new Error("Underflow occured.");
            return row_idx + (col_idx * Math.pow(2, 16));
        };

        //TODO Equals, SameAs and GetHashCode have to be implemented
        // but it is not exactly clear what they will be used for
        //TODO Maybe this should check if they are on the same sheet
        Address.prototype.InsideRange = function (/*Range*/ rng) {
            return !(this.X < rng.getXLeft() || this.Y < rng.getYTop() || this.X > rng.getXRight() || this.Y > rng.getYBottom());
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
            return this._tl.toString() + "," + this._br.toString();
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
        //TODO The logic behind these two functions seems a bit off. Check with Dan what these are actually supposed to do
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
            if (this.WorkbookName == null || typeof(this.WorkbookName) == "undefined" || (this._wsn instanceof  FSharp.None)) {
                this._wbn = wb.Name;
            }
            if (this.WorksheetName == null || typeof(this.WorksheetName) == "undefined" && (this._wsn instanceof  FSharp.None)) {
                this._wsn = ws.Name;
            }
        };
        return Reference;
    })();
    //Left here!!!
    ReferenceRange = (function (_super) {
        __extends(ReferenceRange, _super);

        function ReferenceRange(/*string*/wsname, /*Range*/ rng) {
            _ref = ReferenceRange.__super__.constructor.apply(this, arguments);
            this._range = rng;
            this._range.SetWorksheetName(wsname);
            return _ref;
        }

        Object.defineProperties(ReferenceRange.prototype, { "Range": {"get": function () {
            return this._range;
        }}});

        ReferenceRange.prototype.toString = function () {
            if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined" && !(this.WorksheetName instanceof  FSharp.None)) {
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
            if (this.WorkbookName != null && typeof(this.WorkbookName) != "undefined"  && !(this.WorksheetName instanceof  FSharp.None)) {
                this.Range.SetWorkbookName(this.WorkbookName);
            }
            else {
                this.Range.SetWorkbookName(wb.Name);
                this.WorkbookName = wb.Name;
            }
            if (this.WorksheetName != null && typeof(this.WorksheetName) != "undefined"  && !(this.WorksheetName instanceof  FSharp.None)) {
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


        function ReferenceAddress(/*string*/ wsname, /*Address*/ addr) {
            _ref9 = ReferenceAddress.__super__.constructor.apply(this, arguments);
            this.address = addr;
            this.address.WorksheetName = wsname;
            return _ref9;
        }

        Object.defineProperties(ReferenceAddress.prototype, { "Address": {"get": function () {
            return  this.address;
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

        function ReferenceFunction(/*string*/wsname, /*string*/ fnname, /*Expression list*/ arglist) {
            _ref1 = ReferenceFunction.__super__.constructor.apply(this, arguments);
            this.argumentList = arglist;
            this.functionName = fnname;
            return _ref1;
        }

        Object.defineProperties(ReferenceFunction.prototype, { "ArgumentList": {"get": function () {
            return this.argumentList;
        }}});
        Object.defineProperties(ReferenceFunction.prototype, { "FunctionName": {"get": function () {
            return this.functionName;
        }}});
        ReferenceFunction.prototype.toString = function () {
            return this.functionName + "(" + this.argumentList.join(",") + ")";
        };
        ReferenceFunction.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            //TODO Maybe this should be considered an array
            for (var a in this.argumentList)
                a.Resolve(wb, ws);
        };
        return ReferenceFunction;

    })(Reference);

    ReferenceConstant = (function (_super) {
        __extends(ReferenceConstant, _super);
        function ReferenceConstant(/*string */wsname, /*int*/ value) {
            _ref2 = ReferenceConstant.__super__.constructor.apply(this, arguments);
            this._value = value;
            return _ref2;
        }

        ReferenceConstant.prototype.toString = function () {
            return "Constant(" + this._value + ")";
        };
        return ReferenceConstant;
    })(Reference);

    ReferenceString = (function (_super) {
        __extends(ReferenceString, _super);

        function ReferenceString(/*string*/ wsname, /*string*/value) {
            _ref3 = ReferenceString.__super__.constructor.apply(this, arguments);
            this._value = value;
            return _ref3;
        }

        ReferenceString.prototype.toString = function () {
            return "String(" + this._value + ")";
        };
        return ReferenceString;
    })(Reference);

    ReferenceNamed = (function (_super) {
        __extends(ReferenceNamed, _super);

        function ReferenceNamed(/*string*/wsname, /*string*/ varname) {
            _ref4 = ReferenceNamed.__super__.constructor.apply(this, arguments);
            this._varname = varname;
            return _ref4;
        }

        ReferenceNamed.prototype.toString = function () {
            if (this.WorksheetName != null && typeof(this.WorksheetName) != 'undefined') {
                return "ReferenceName(" + this.WorksheetName + "," + this._varname + ")";
            }
            else
                return "ReferenceName(None, " + this._varname + ")";
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

        function ReferenceExpr(/*Reference*/ ref) {
            _ref5 = ReferenceExpr.__super__.constructor.apply(this, arguments);
            this.reference = ref;
            return _ref5;
        }

        Object.defineProperties(ReferenceExpr.prototype, { "Ref": {"get": function () {
            return this.reference;
        }}});
        ReferenceExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            this.reference.Resolve(wb, ws);
        };
        return ReferenceExpr;
    })(Expression);

    BinOpExpr = (function (_super) {
        __extends(BinOpExpr, _super);
        function BinOpExpr(/*string*/str, /*Expression*/expr1, /*Expression*/expr2) {
            _ref6 = BinOpExpr.__super__.constructor.apply(this, arguments);
            this._str = str;
            this._expr1 = expr1;
            this._expr2 = expr2;
            return _ref6;
        }

        Object.defineProperties(BinOpExpr.prototype, { "Expr1": {"get": function () {
            return this._expr1;
        }}});
        Object.defineProperties(BinOpExpr.prototype, { "Expr2": {"get": function () {
            return this._expr2;
        }}});
        Object.defineProperties(BinOpExpr.prototype, { "Str": {"get": function () {
            return this._str;
        }}});

        BinOpExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            this._expr1.Resolve(wb, ws);
            this._expr2.Resolve(wb, ws);
        };
        return BinOpExpr;
    })(Expression);

    UnaryOpExpr = (function (_super) {
        __extends(UnaryOpExpr, _super);

        function UnaryOpExpr(/*char*/chr, /*Expression*/expr) {
            _ref7 = UnaryOpExpr.__super__.constructor.apply(this, arguments);
            this._expr = expr;
            this._chr = chr;
            return _ref7;
        }

        Object.defineProperties(UnaryOpExpr.prototype, { "Expr": {"get": function () {
            return this._expr;
        }}});
        Object.defineProperties(UnaryOpExpr.prototype, { "Chr": {"get": function () {
            return this._chr;
        }}});

        UnaryOpExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            this._expr.Resolve(wb, ws);
        };
        return UnaryOpExpr;
    })(Expression);

    ParensExpr = (function (_super) {
        __extends(ParensExpr, _super);


        function ParensExpr(/*Expression*/expr) {
            _ref8 = ParensExpr.__super__.constructor.apply(this, arguments);
            this.expr = expr;
            return _ref8;
        }

        Object.defineProperties(ParensExpr.prototype, { "Expr": {"get": function () {
            return this.expr;
        }}});

        ParensExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
            this.expr.Resolve(wb, ws);
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

