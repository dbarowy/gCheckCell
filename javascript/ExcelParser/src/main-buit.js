/*
 * PEG.js 0.7.0
 *
 * http://pegjs.majda.cz/
 *
 * Copyright (c) 2010-2012 David Majda
 * Licensend under the MIT license.
 */

define("FSharp/FSharp", [], function () {
    function e() {
    }

    function t() {
    }

    return t.prototype.toString = function () {
        return"None"
    }, e.None = t, e
}), define("Parser/AST/Address", ["FSharp/FSharp"], function (e) {
    function t(e, n, r, i) {
        this.WorksheetName = r, this.WorkbookName = i, isNaN(n) ? this.X = t.CharColToInt(n) : this.X = n, this.Y = e, this._com = null, this._hash = null
    }

    return t.CharColToInt = function (e) {
        var t, n = 0, r, i = 0;
        t = e.length - 1, e = e.toUpperCase(), r = new RegExp("\\b[A-Z]+\\b");
        if (!r.test(e))throw new Error("The column string doesn't respect the specification");
        do i = e.charCodeAt(t) - 64, n += Math.pow(26, e.length - t - 1) * i, t--; while (t >= 0);
        return n
    }, t.IntToColChars = function (e) {
        var t, n, r = "";
        if (Math.floor(e) !== e || e <= 0)throw new Error("This works only for integers");
        do t = e / 26, n = e % 26, n === 0 && t--, n === 0 ? r = "Z" + r : r = String.fromCharCode(64 + n) + r, e = t; while (t >= 1);
        return r
    }, t.prototype.A1Local = function () {
        return"" + t.IntToColChars(this.X) + this.Y
    }, t.prototype.A1Worksheet = function () {
        if (typeof this.WorksheetName == "undefined" || this.WorksheetName === null || this.WorksheetName instanceof e.None)throw new Error("Worksheet string should never be unset");
        return this.WorksheetName
    }, t.prototype.A1Workbook = function () {
        if (typeof this.WorkbookName == "undefined" || this.WorkbookName === null || this.WorkbookName instanceof e.None)throw new Error("Workbook string should never be unset");
        return this.WorkbookName
    }, t.prototype.A1FullyQualified = function () {
        return"[" + this.A1Workbook() + "]" + this.A1Worksheet() + "!" + this.A1Local()
    }, t.prototype.R1C1 = function () {
        var t, n;
        return typeof this.WorksheetName == "undefined" || this.WorksheetName === null || this.WorksheetName instanceof e.None ? t = "" : t = this.WorksheetName + "!", typeof this.WorkbookName == "undefined" || this.WorkbookName === null || this.WorkbookName instanceof e.None ? n = "" : n = "[" + this.WorkbookName + "]", n + t + "R" + this.Y + "C" + this.X
    }, t.prototype.getHashCode = function () {
        return this._hash === null && (this._hash = "" + this.A1Workbook() + "_" + this.A1Worksheet() + "_" + this.X + "_" + this.Y), this._hash
    }, t.prototype.InsideRange = function (e) {
        return!(this.X < e.getXLeft() || this.Y < e.getYTop() || this.X > e.getXRight() || this.Y > e.getYBottom())
    }, t.prototype.InsideAddr = function (e) {
        return this.X === e.X && this.Y === e.Y
    }, t.prototype.GetCOMObject = function (e) {
        return this._com === null && (this._com = e.getWorkbookByName(this.A1Workbook()).getWorksheetByName(this.A1Worksheet()).getRange(this.Y, this.X)), this._com
    }, t.prototype.toString = function () {
        return"(" + this.Y + "," + this.X + ")"
    }, t.prototype.compute = function (e, t, n, r) {
        return this._com === null && (this._com = e.getWorkbookByName(this.A1Workbook()).getWorksheetByName(this.A1Worksheet()).getRange(this.Y, this.X)), this._com.hasFormula() ? e.compute(this, n) : n ? [
            [this._com.getValue()]
        ] : this._com.getValue()
    }, t
}), define("Parser/AST/Reference", ["FSharp/FSharp"], function (e) {
    function t(e) {
        this.WorkbookName = null, this.WorksheetName = e
    }

    return t.prototype.InsideRef = function (e) {
        return!1
    }, t.prototype.Resolve = function (t, n) {
        if (this.WorksheetName instanceof e.None || this.WorkbookName === null || typeof this.WorkbookName == "undefined")this.WorkbookName = t.Name;
        if (this.WorksheetName instanceof e.None || this.WorksheetName === null || typeof this.WorksheetName == "undefined")this.WorksheetName = n.Name
    }, t
}), define("Parser/AST/ReferenceRange", ["require", "Parser/AST/Reference", "Parser/AST/ReferenceAddress", "FSharp/FSharp"], function (e, t, n, r) {
    function s(e, n) {
        t.call(this, e), this.Range = n, this.Range.SetWorksheetName(e)
    }

    var i = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return i(s, t), s.prototype.toString = function () {
        return this.WorksheetName === null || typeof this.WorksheetName == "undefined" || this.WorksheetName instanceof r.None ? "ReferenceRange(None, " + this.Range.toString() + ")" : "ReferenceRange(" + this.WorksheetName + "," + this.Range.toString() + ")"
    }, s.prototype.InsideRef = function (t) {
        n || (n = e("Parser/AST/ReferenceAddress"));
        if (t instanceof n)return this.Range.InsideAddr(t.Address);
        if (t instanceof s)return this.Range.InsideRange(t.Range);
        throw new Error("Unknown Reference subclass.")
    }, s.prototype.Resolve = function (e, t) {
        this.WorkbookName === null || typeof this.WorkbookName == "undefined" || this.WorkbookName instanceof r.None ? (this.Range.SetWorkbookName(e.Name), this.WorkbookName = e.Name) : this.Range.SetWorkbookName(this.WorkbookName), this.WorksheetName === null || typeof this.WorksheetName == "undefined" || this.WorksheetName instanceof r.None ? (this.Range.SetWorksheetName(t.Name), this.WorksheetName = t.Name) : this.Range.SetWorksheetName(this.WorksheetName)
    }, s.prototype.compute = function (e, t, n, r) {
        return this.Range.compute(e, t, n, r)
    }, s
}), define("Parser/AST/ReferenceAddress", ["FSharp/FSharp", "Parser/AST/Reference", "Parser/AST/ReferenceRange"], function (e, t, n) {
    function i(e, n) {
        t.call(this, e), this.Address = n, this.Address.WorksheetName = e
    }

    var r = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return r(i, t), i.prototype.toString = function () {
        return this.WorksheetName === null || typeof this.WorksheetName == "undefined" || this.WorksheetName instanceof e.None ? "ReferenceAddress(None, " + this.Address.toString() + ")" : "ReferenceAddress(" + this.WorksheetName.toString() + ", " + this.Address.toString() + ")"
    }, i.prototype.InsideRef = function (e) {
        if (e instanceof i)return this.Address.InsideAddr(e.Address);
        if (e instanceof n)return this.Address.InsideRange(e.Range);
        throw new Error("Invalid Reference subclass.")
    }, i.prototype.Resolve = function (t, n) {
        this.WorkbookName === null || typeof this.WorkbookName == "undefined" || this.WorkbookName instanceof e.None ? (this.Address.WorkbookName = t.Name, this.WorkbookName = t.Name) : this.Address.WorkbookName = this.WorkbookName, this.WorksheetName === null || typeof this.WorksheetName == "undefined" || this.WorksheetName instanceof e.None ? (this.WorksheetName = n.Name, this.Address.WorksheetName = n.Name) : this.Address.WorksheetName = this.WorksheetName
    }, i.prototype.compute = function (e, t, n, r) {
        return this.Address.compute(e, t, n, !1)
    }, i
}), define("Parser/AST/BinOpExpr", ["Parser/AST/ReferenceAddress", "Parser/AST/ReferenceRange"], function (e, t) {
    function n(e, t, n) {
        this.Operator = e, this.Left = t, this.Right = n
    }

    return n.prototype._precedence = {":": 6, " ": 6, ",": 6, "^": 5, "*": 4, "/": 4, "+": 3, "-": 3, "&": 2, "=": 1, "<>": 1, "<=": 1, ">=": 1, "<": 1, ">": 1}, n.prototype.toString = function () {
        return'BinOpExpr("' + this.Operator + '",\n	' + this.Left.toString() + ",\n	" + this.Right.toString() + ")"
    }, n.prototype.Resolve = function (e, t) {
        this.Left.Resolve(e, t), this.Right.Resolve(e, t)
    }, n.prototype.fixAssoc = function () {
        this.Left.fixAssoc(), this.Right.fixAssoc(), this.Right instanceof n && this._precedence[this.Operator] >= this._precedence[this.Right.Operator] && (this.Left = new n(this.Operator, this.Left, this.Right.Left), this.Operator = this.Right.Operator, this.Right = this.Right.Right), this.Left.fixAssoc(), this.Right.fixAssoc()
    }, n.prototype._adjustMatrix = function (e, t, n) {
        var r = [], i, s;
        for (i = 0; i < e[0].length; i++)r.push("#N/A");
        if (e.length === 1 && e[0].length == 1)for (s = 0; s < n - 1; s++)e[0].push(e[0][0]);
        if (e.length < t)if (e.length === 1)for (i = 1; i < t; i++)e.push(e[0]); else for (i = e.length; i < t; i++)e.push(r);
        if (e[0].length < n)if (e[0].length === 1)for (i = 0; i < e.length; i++)for (s = 1; s < n; s++)e[i].push(e[i][0]); else for (i = 0; i < e.length; i++)for (s = 1; s < n - e[0].length + 1; s++)e[i].push("#N/A")
    }, n.prototype.compute = function (e, t, n, r) {
        var i, s, o, u, a, f, l, c = new RegExp("(#DIV/0|#N/A|#NAME?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        i = this.Left.compute(e, t, n, !1), s = this.Right.compute(e, t, n, !1);
        if (n) {
            u = i.length > s.length ? i.length : s.length, a = i[0].length > s[0].length ? i[0].length : s[0].length, this._adjustMatrix(i, u, a), this._adjustMatrix(s, u, a);
            switch (this.Operator) {
                case"+":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)if (isFinite(i[f][l]) && isFinite(s[f][l]))i[f][l] = +i[f][l] + +s[f][l]; else {
                        if (c.test(i[f][l]))break;
                        c.test(s[f][l]) ? i[f][l] = s[f][l] : i[f][l] = "#VALUE!"
                    }
                    break;
                case"-":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)if (isFinite(i[f][l]) && isFinite(s[f][l]))i[f][l] = +i[f][l] - +s[f][l]; else {
                        if (c.test(i[f][l]))break;
                        c.test(s[f][l]) ? i[f][l] = s[f][l] : i[f][l] = "#VALUE!"
                    }
                    break;
                case"*":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)if (isFinite(i[f][l]) && isFinite(s[f][l]))i[f][l] = +i[f][l] * +s[f][l]; else {
                        if (c.test(i[f][l]))break;
                        c.test(s[f][l]) ? i[f][l] = s[f][l] : i[f][l] = "#VALUE!"
                    }
                    break;
                case"/":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)if (isFinite(i[f][l]) && isFinite(s[f][l]))i[f][l] = +i[f][l], s[f][l] = +s[f][l], s[f][l] === 0 ? i[f][l] = "#DIV/0" : i[f][l] /= s[f][l]; else {
                        if (c.test(i[f][l]))break;
                        c.test(s[f][l]) ? i[f][l] = s[f][l] : i[f][l] = "#VALUE!"
                    }
                    break;
                case"^":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)if (isFinite(i[f][l]) && isFinite(s[f][l]))i[f][l] = Math.pow(+i[f][l], +s[f][l]); else {
                        if (c.test(i[f][l]))break;
                        c.test(s[f][l]) ? i[f][l] = s[f][l] : i[f][l] = "#VALUE!"
                    }
                    break;
                case"&":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++) {
                        if (c.test(i[f][l]))break;
                        c.test(s[f][l]) ? i[f][l] = s[f][l] : i[f][l] = "" + i[f][l] + s[f][l]
                    }
                    break;
                case"=":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)c.test(i[f][l]) || (c.test(s[f][l]) ? i[f][l] = s[f][l] : isFinite(i[f][l] && isFinite(s[f][l])) ? i[f][l] = i[f][l] == s[f][l] : i[f][l] = i[f][l].toLocaleUpperCase().localeCompare(s[f][l].toLocaleUpperCase()) === 0);
                    break;
                case"<>":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)c.test(i[f][l]) || (c.test(s[f][l]) ? i[f][l] = s[f][l] : isFinite(i[f][l] && isFinite(s[f][l])) ? i[f][l] = i[f][l] != s[f][l] : i[f][l] = i[f][l].toLocaleUpperCase().localeCompare(s[f][l].toLocaleUpperCase()) !== 0);
                    break;
                case"<=":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)c.test(i[f][l]) || (c.test(s[f][l]) ? i[f][l] = s[f][l] : isFinite(i[f][l] && isFinite(s[f][l])) ? i[f][l] = i[f][l] <= s[f][l] : i[f][l] = i[f][l].toLocaleUpperCase().localeCompare(s[f][l].toLocaleUpperCase()) <= 0);
                    break;
                case">=":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)c.test(i[f][l]) || (c.test(s[f][l]) ? i[f][l] = s[f][l] : isFinite(i[f][l] && isFinite(s[f][l])) ? i[f][l] = i[f][l] >= s[f][l] : i[f][l] = i[f][l].toLocaleUpperCase().localeCompare(s[f][l].toLocaleUpperCase()) >= 0);
                    break;
                case"<":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)c.test(i[f][l]) || (c.test(s[f][l]) ? i[f][l] = s[f][l] : isFinite(i[f][l] && isFinite(s[f][l])) ? i[f][l] = i[f][l] < s[f][l] : i[f][l] = i[f][l].toLocaleUpperCase().localeCompare(s[f][l].toLocaleUpperCase()) < 0);
                    break;
                case">":
                    for (f = 0; f < u; f++)for (l = 0; l < a; l++)c.test(i[f][l]) || (c.test(s[f][l]) ? i[f][l] = s[f][l] : isFinite(i[f][l] && isFinite(s[f][l])) ? i[f][l] = i[f][l] > s[f][l] : i[f][l] = i[f][l].toLocaleUpperCase().localeCompare(s[f][l].toLocaleUpperCase()) > 0);
                    break;
                default:
                    throw new Error("Unsupported binary operation." + this.toString())
            }
            return i
        }
        o = !isFinite(i) || !isFinite(s), o && (i = ("" + i).toLocaleUpperCase(), s = ("" + s).toLocaleUpperCase());
        switch (this.Operator) {
            case"+":
                return o ? c.test(i) ? i : c.test(s) ? s : "#VALUE!" : +i + +s;
            case"-":
                return o ? c.test(i) ? i : c.test(s) ? s : "#VALUE!" : +i - +s;
            case"*":
                return o ? c.test(i) ? i : c.test(s) ? s : "#VALUE!" : +i * +s;
            case"/":
                return o ? c.test(i) ? i : c.test(s) ? s : "#VALUE!" : (i = +i, s = +s, s === 0 ? "#DIV/0" : i / s);
            case"^":
                return o ? c.test(i) ? i : c.test(s) ? s : "#VALUE!" : (i = i === "" ? 0 : i, s = s === "" ? 0 : s, Math.pow(+i, +s));
            case"&":
                return c.test(i) ? i : c.test(s) ? s : "" + i + s;
            case"=":
                return c.test(i) ? i : c.test(s) ? s : o ? i.localeCompare(s) == 0 : i == s;
            case"<>":
                return c.test(i) ? i : c.test(s) ? s : o ? i.localeCompare(s) != 0 : i != s;
            case"<=":
                return c.test(i) ? i : c.test(s) ? s : o ? i.localeCompare(s) <= 0 : i <= s;
            case">=":
                return c.test(i) ? i : c.test(s) ? s : o ? i.localeCompare(s) >= 0 : i >= s;
            case"<":
                return c.test(i) ? i : c.test(s) ? s : o ? i.localeCompare(s) < 0 : i < s;
            case">":
                return c.test(i) ? i : c.test(s) ? s : o ? i.localeCompare(s) > 0 : i > s;
            default:
                throw new Error("Unknown operator" + this.toString())
        }
    }, n
}), define("Parser/AST/ParensExpr", [], function () {
    function e(e) {
        this.Expr = e
    }

    return e.prototype.toString = function () {
        return"ParensExpr(" + this.Expr + ")"
    }, e.prototype.Resolve = function (e, t) {
        this.Expr.Resolve(e, t)
    }, e.prototype.fixAssoc = function () {
        this.Expr.fixAssoc()
    }, e.prototype.compute = function (e, t, n, r) {
        return this.Expr.compute(e, t, n, r)
    }, e
}), define("Parser/AST/Range", ["Parser/AST/Address"], function (e) {
    function t(e, t) {
        this._tl = e, this._br = t, this._com = null
    }

    return t.prototype.toString = function () {
        return this._tl.toString() + "," + this._br.toString()
    }, t.prototype.getXLeft = function () {
        return this._tl.X
    }, t.prototype.getXRight = function () {
        return this._br.X
    }, t.prototype.getYTop = function () {
        return this._tl.Y
    }, t.prototype.getYBottom = function () {
        return this._br.Y
    }, t.prototype.InsideRange = function (e) {
        return!(this.getXLeft() < e.getXLeft() || this.getYTop() < e.getYTop() || this.getXRight() > e.getXRight() || this.getYBottom() > e.getYBottom())
    }, t.prototype.InsideAddr = function (e) {
        return!(this.getXLeft() < e.X || this.getYTop() < e.Y || this.getXRight() > e.X || this.getYBottom() > e.Y)
    }, t.prototype.SetWorksheetName = function (e) {
        this._tl.WorksheetName = e, this._br.WorksheetName = e
    }, t.prototype.SetWorkbookName = function (e) {
        this._tl.WorkbookName = e, this._br.WorkbookName = e
    }, t.prototype.GetCOMObject = function (e) {
        return this._com === null && (this._com = e.getWorkbookByName(this._tl.A1Workbook()).getWorksheetByName(this._tl.A1Worksheet()).getRange(this._tl.Y, this._tl.X, this._br.Y, this._br.X)), this._com
    }, t.prototype.compute = function (t, n, r, i) {
        var s, o, u, a, f = [], l;
        this._com === null && (this._com = t.getWorkbookByName(this._tl.A1Workbook()).getWorksheetByName(this._tl.A1Worksheet()).getRange(this._tl.Y, this._tl.X, this._br.Y, this._br.X));
        if (i || r) {
            u = this._com.Worksheet.Name, a = this._com.Workbook.Name;
            for (s = this._com.startRow; s <= this._com.endRow; s++) {
                l = [];
                for (o = this._com.startCol; o <= this._com.endCol; o++)l.push(t.compute(new e(s, o, u, a), r));
                f.push(l)
            }
            return f
        }
        if (this._com.getColumnCount() === 1) {
            if (this._com.startRow <= n.Y && n.Y <= this._com.endRow)return t.compute(new e(this._com.startRow, n.X, this._com.Worksheet.Name, this._com.Workbook.Name), r)
        } else if (this._com.getRowCount() === 1 && this._com.startCol <= n.X && n.X <= this._com.endCol)return t.compute(new e(this._com.startRow, n.X, this._com.Worksheet.Name, this._com.Workbook.Name), r);
        return"#VALUE!"
    }, t
}), define("Parser/AST/ConstantNumber", ["Parser/AST/Reference"], function (e) {
    function n(t, n) {
        e.call(this, t), this._value = n
    }

    var t = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return t(n, e), n.prototype.toString = function () {
        return"Constant(" + this._value + ")"
    }, n.prototype.compute = function (e, t, n, r) {
        return n ? [
            [this._value]
        ] : this._value
    }, n
}), define("Parser/AST/ReferenceFunction", ["Parser/AST/Reference"], function (e, t) {
    function r(t, n, r) {
        e.call(this, t), this.ArgumentList = r, this.FunctionName = n
    }

    var n = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return n(r, e), r.prototype.toString = function () {
        return this.FunctionName + "(" + this.ArgumentList.join(",") + ")"
    }, r.prototype.Resolve = function (e, t) {
        var n, r;
        for (n = 0, r = this.ArgumentList.length; n < r; n++)this.ArgumentList[n].Resolve(e, t)
    }, r.prototype.fixAssoc = function () {
        var e, t;
        for (e = 0, t = this.ArgumentList.length; e < t; e++)this.ArgumentList[e].fixAssoc()
    }, r.prototype.compute = function (e, n, r, i) {
        var s = t[this.FunctionName];
        if (typeof s == "undefined")throw new Error("Unimplemented function " + this.FunctionName);
        return s(e, n, r, i, this.ArgumentList)
    }, r
}), define("Parser/AST/ReferenceExpr", ["Parser/AST/ReferenceFunction"], function (e) {
    function t(e) {
        this.Ref = e
    }

    return t.prototype.toString = function () {
        return"ReferenceExpr." + this.Ref.toString()
    }, t.prototype.Resolve = function (e, t) {
        this.Ref.Resolve(e, t)
    }, t.prototype.fixAssoc = function () {
        this.Ref instanceof e && this.Ref.fixAssoc()
    }, t.prototype.compute = function (e, t, n, r) {
        return this.Ref.compute(e, t, n, r)
    }, t
}), define("Parser/AST/ConstantError", ["Parser/AST/Reference"], function (e) {
    function n(t, n) {
        e.call(this, t), this._value = n
    }

    var t = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return t(n, e), n.prototype.toString = function () {
        return"Error(" + this._value + ")"
    }, n.prototype.compute = function (e, t, n, r) {
        return n ? [
            [this._value]
        ] : this._value
    }, n
}), define("Parser/AST/ReferenceNamed", ["Parser/AST/Reference", "FSharp/FSharp", "Parser/AST/ConstantError"], function (e, t, n) {
    function i(t, n) {
        e.call(this, t), this._varname = n
    }

    var r = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return r(i, e), i.prototype.toString = function () {
        return this.WorksheetName === null || typeof this.WorksheetName == "undefined" || this.WorksheetName instanceof t.None ? "ReferenceName(None, " + this._varname + ")" : "ReferenceName(" + this.WorksheetName + "," + this._varname + ")"
    }, i.prototype.compute = function (e, t, r, i) {
        try {
            var s = e.getNamedRange(this);
            return s.compute(e, t, r, i)
        } catch (o) {
            return(new n(this.WorksheetName, "#NAME?")).compute(e, t, r, i)
        }
    }, i
}), define("Parser/AST/ConstantString", ["Parser/AST/Reference"], function (e) {
    function n(t, n) {
        e.call(this, t), this._value = n
    }

    var t = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return t(n, e), n.prototype.toString = function () {
        return"String(" + this._value + ")"
    }, n.prototype.compute = function (e, t, n, r) {
        return n ? [
            [this._value]
        ] : this._value
    }, n
}), define("Parser/AST/UnaryOpExpr", ["Parser/AST/BinOpExpr"], function (e) {
    function t(e, t) {
        this.Expr = t, this.Operator = e
    }

    return t.prototype.toString = function () {
        return"UnaryOpExpr('" + this.Operator + "'," + this.Expr + ")"
    }, t.prototype.Resolve = function (e, t) {
        this.Expr.Resolve(e, t)
    }, t.prototype.fixAssoc = function () {
        this.Expr.fixAssoc()
    }, t.prototype.compute = function (e, t, n, r) {
        var i = this.Expr.compute(e, t, n, !1), s, o, u = new RegExp("(#DIV/0|#N/A|#NAME?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (n)switch (this.Operator) {
            case"+":
                return i;
            case"-":
                for (s = 0; s < i.length; s++)for (o = 0; o < i[s].length; o++)if (isFinite(i[s][o]))i[s][o] = -i[s][o]; else {
                    if (u.test(i[s][o]))break;
                    i[s][o] = "#VALUE!"
                }
                return i;
            default:
                throw new Error("Unknown operator")
        } else {
            if (!isFinite(i))return"#VALUE!";
            switch (this.Operator) {
                case"+":
                    return i;
                case"-":
                    return-i;
                default:
                    throw new Error("Unknown operator")
            }
        }
    }, t
}), define("Parser/AST/PostfixOpExpr", [], function () {
    function e(e, t) {
        this.Operator = e, this.Expr = t
    }

    return e.prototype.toString = function () {
        return'PostfixOpExpr("' + this.Operator + '",' + this.Expr.toString() + ")"
    }, e.prototype.Resolve = function (e, t) {
        this.Expr.Resolve(e, t)
    }, e.prototype.fixAssoc = function () {
        this.Expr.fixAssoc()
    }, e.prototype.compute = function (e, t, n, r) {
        var i = this.Expr.compute(e, t, n, !1), s, o, u = new RegExp("(#DIV/0|#N/A|#NAME?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (!n)return i / 100;
        for (s = 0; s < i.length; s++)for (o = 0; o < i[s].length; o++)if (isFinite(i[s][o]))i[s][o] = +i[s][o] / 100; else {
            if (u.test(i[s][o]))break;
            i[s][o] = "#VALUE!"
        }
    }, e
}), define("Parser/AST/ConstantLogical", ["Parser/AST/Reference"], function (e) {
    function n(t, n) {
        e.call(this, t), this._value = n === "TRUE"
    }

    var t = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return t(n, e), n.prototype.toString = function () {
        return"Logical(" + this._value + ")"
    }, n.prototype.compute = function (e, t, n, r) {
        return n ? [
            [this._value]
        ] : this._value
    }, n
}), define("Parser/AST/ConstantArray", ["Parser/AST/Reference"], function (e) {
    function n(t, n) {
        e.call(this, t), this._values = n
    }

    var t = function (e, t) {
        var n = Object.create(t.prototype);
        n.constructor = e, e.prototype = n
    };
    return t(n, e), n.prototype.toString = function () {
        var e, t, n, r, i, s = "[";
        for (e = 0, t = this._values.length; e < t; e++) {
            i = "[";
            for (r = 0, n = this._values[e].length; r < n; r++)i += this._values[e][r].toString() + ", ";
            s += i.substring(0, i.length - 2) + "],"
        }
        return s = s.substring(0, s.length - 1) + "]", "Array(" + s + ")"
    }, n.prototype.compute = function (e, t, n, r) {
        var i, s, o, u, a = [], f;
        if (n || r) {
            for (i = 0, o = this._values.length; i < o; i++) {
                f = [];
                for (s = 0, u = this._values[i].length; s < u; s++)f.push(this._values[i][s].compute(e, t, !1, !1));
                a.push(f)
            }
            return a
        }
        return this._values[0][0].compute(e, t, n, !1)
    }, n
}), define("Parser/AST/AST", ["Parser/AST/Address", "Parser/AST/BinOpExpr", "Parser/AST/ParensExpr", "Parser/AST/Range", "Parser/AST/Reference", "Parser/AST/ReferenceAddress", "Parser/AST/ConstantNumber", "Parser/AST/ReferenceExpr", "Parser/AST/ReferenceFunction", "Parser/AST/ReferenceNamed", "Parser/AST/ReferenceRange", "Parser/AST/ConstantString", "Parser/AST/UnaryOpExpr", "Parser/AST/PostfixOpExpr", "Parser/AST/ConstantLogical", "Parser/AST/ConstantError", "Parser/AST/ConstantArray"], function (e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m) {
    return{ReferenceAddress: s, UnaryOpExpr: h, ParensExpr: n, BinOpExpr: t, ReferenceExpr: u, ReferenceRange: l, ReferenceFunction: a, ConstantNumber: o, ReferenceNamed: f, Reference: i, Range: r, Address: e, ConstantLogical: d, ConstantString: c, PostfixOpExpr: p, ConstantError: v, ConstantArray: m}
}), define("Parser/PEG", [], function () {
    var PEG = function (undefined) {
        function range(e, t) {
            t === undefined && (t = e, e = 0);
            var n = new Array(Math.max(0, t - e));
            for (var r = 0, i = e; i < t; r++, i++)n[r] = i;
            return n
        }

        function find(e, t) {
            var n = e.length;
            for (var r = 0; r < n; r++)if (t(e[r]))return e[r]
        }

        function contains(e, t) {
            var n = e.length;
            for (var r = 0; r < n; r++)if (e[r] === t)return!0;
            return!1
        }

        function each(e, t) {
            var n = e.length;
            for (var r = 0; r < n; r++)t(e[r], r)
        }

        function map(e, t) {
            var n = [], r = e.length;
            for (var i = 0; i < r; i++)n[i] = t(e[i], i);
            return n
        }

        function pluck(e, t) {
            return map(e, function (e) {
                return e[t]
            })
        }

        function keys(e) {
            var t = [];
            for (var n in e)t.push(n);
            return t
        }

        function values(e) {
            var t = [];
            for (var n in e)t.push(e[n]);
            return t
        }

        function padLeft(e, t, n) {
            var r = e, i = n - e.length;
            for (var s = 0; s < i; s++)r = t + r;
            return r
        }

        function escape(e) {
            var t = e.charCodeAt(0), n, r;
            return t <= 255 ? (n = "x", r = 2) : (n = "u", r = 4), "\\" + n + padLeft(t.toString(16).toUpperCase(), "0", r)
        }

        function quote(e) {
            return'"' + e.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape) + '"'
        }

        function quoteForRegexpClass(e) {
            return e.replace(/\\/g, "\\\\").replace(/\//g, "\\/").replace(/\]/g, "\\]").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\v/g, "\\x0B").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x01-\x08\x0E-\x1F\x80-\uFFFF]/g, escape)
        }

        function buildNodeVisitor(e) {
            return function (t) {
                return e[t.type].apply(null, arguments)
            }
        }

        function findRuleByName(e, t) {
            return find(e.rules, function (e) {
                return e.name === t
            })
        }

        var PEG = {VERSION: "0.7.0", buildParser: function (e, t) {
            return PEG.compiler.compile(PEG.parser.parse(e), t)
        }};
        return PEG.GrammarError = function (e) {
            this.name = "PEG.GrammarError", this.message = e
        }, PEG.GrammarError.prototype = Error.prototype, PEG.parser = function () {
            function e(e) {
                return'"' + e.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape) + '"'
            }

            var t = {parse: function (t, n) {
                function r(e, t, n) {
                    var r = e, i = n - e.length;
                    for (var s = 0; s < i; s++)r = t + r;
                    return r
                }

                function i(e) {
                    var t = e.charCodeAt(0), n, i;
                    return t <= 255 ? (n = "x", i = 2) : (n = "u", i = 4), "\\" + n + r(t.toString(16).toUpperCase(), "0", i)
                }

                function s(e) {
                    if (ht < dt)return;
                    ht > dt && (dt = ht, vt = []), vt.push(e)
                }

                function o() {
                    var e, t, n, r, i, s;
                    i = ht, s = ht, e = nt();
                    if (e !== null) {
                        t = u(), t = t !== null ? t : "";
                        if (t !== null) {
                            r = f();
                            if (r !== null) {
                                n = [];
                                while (r !== null)n.push(r), r = f()
                            } else n = null;
                            n !== null ? e = [e, t, n] : (e = null, ht = s)
                        } else e = null, ht = s
                    } else e = null, ht = s;
                    return e !== null && (e = function (e, t, n) {
                        return{type: "grammar", initializer: t !== "" ? t : null, rules: n, startRule: n[0].name}
                    }(i, e[1], e[2])), e === null && (ht = i), e
                }

                function u() {
                    var e, t, n, r;
                    return n = ht, r = ht, e = m(), e !== null ? (t = S(), t = t !== null ? t : "", t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "initializer", code: t}
                    }(n, e[0])), e === null && (ht = n), e
                }

                function f() {
                    var e, t, n, r, i, s, o;
                    return s = ht, o = ht, e = _(), e !== null ? (t = P(), t = t !== null ? t : "", t !== null ? (n = w(), n !== null ? (r = l(), r !== null ? (i = S(), i = i !== null ? i : "", i !== null ? e = [e, t, n, r, i] : (e = null, ht = o)) : (e = null, ht = o)) : (e = null, ht = o)) : (e = null, ht = o)) : (e = null, ht = o), e !== null && (e = function (e, t, n, r) {
                        return{type: "rule", name: t, displayName: n !== "" ? n : null, expression: r}
                    }(s, e[0], e[1], e[3])), e === null && (ht = s), e
                }

                function l() {
                    var e, t, n, r, i, s, o;
                    i = ht, s = ht, e = c();
                    if (e !== null) {
                        t = [], o = ht, n = x(), n !== null ? (r = c(), r !== null ? n = [n, r] : (n = null, ht = o)) : (n = null, ht = o);
                        while (n !== null)t.push(n), o = ht, n = x(), n !== null ? (r = c(), r !== null ? n = [n, r] : (n = null, ht = o)) : (n = null, ht = o);
                        t !== null ? e = [e, t] : (e = null, ht = s)
                    } else e = null, ht = s;
                    return e !== null && (e = function (e, t, n) {
                        if (n.length > 0) {
                            var r = [t].concat(map(n, function (e) {
                                return e[1]
                            }));
                            return{type: "choice", alternatives: r}
                        }
                        return t
                    }(i, e[0], e[1])), e === null && (ht = i), e
                }

                function c() {
                    var e, t, n, r;
                    n = ht, r = ht, e = [], t = h();
                    while (t !== null)e.push(t), t = h();
                    e !== null ? (t = m(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t, n) {
                        var r = t.length !== 1 ? {type: "sequence", elements: t} : t[0];
                        return{type: "action", expression: r, code: n}
                    }(n, e[0], e[1])), e === null && (ht = n);
                    if (e === null) {
                        n = ht, e = [], t = h();
                        while (t !== null)e.push(t), t = h();
                        e !== null && (e = function (e, t) {
                            return t.length !== 1 ? {type: "sequence", elements: t} : t[0]
                        }(n, e)), e === null && (ht = n)
                    }
                    return e
                }

                function h() {
                    var e, t, n, r, i;
                    return r = ht, i = ht, e = _(), e !== null ? (t = E(), t !== null ? (n = p(), n !== null ? e = [e, t, n] : (e = null, ht = i)) : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e, t, n) {
                        return{type: "labeled", label: t, expression: n}
                    }(r, e[0], e[2])), e === null && (ht = r), e === null && (e = p()), e
                }

                function p() {
                    var e, t, n, r;
                    return n = ht, r = ht, e = T(), e !== null ? (t = m(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "semantic_and", code: t}
                    }(n, e[1])), e === null && (ht = n), e === null && (n = ht, r = ht, e = T(), e !== null ? (t = d(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "simple_and", expression: t}
                    }(n, e[1])), e === null && (ht = n), e === null && (n = ht, r = ht, e = N(), e !== null ? (t = m(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "semantic_not", code: t}
                    }(n, e[1])), e === null && (ht = n), e === null && (n = ht, r = ht, e = N(), e !== null ? (t = d(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "simple_not", expression: t}
                    }(n, e[1])), e === null && (ht = n), e === null && (e = d())))), e
                }

                function d() {
                    var e, t, n, r;
                    return n = ht, r = ht, e = v(), e !== null ? (t = C(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "optional", expression: t}
                    }(n, e[0])), e === null && (ht = n), e === null && (n = ht, r = ht, e = v(), e !== null ? (t = k(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "zero_or_more", expression: t}
                    }(n, e[0])), e === null && (ht = n), e === null && (n = ht, r = ht, e = v(), e !== null ? (t = L(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return{type: "one_or_more", expression: t}
                    }(n, e[0])), e === null && (ht = n), e === null && (e = v()))), e
                }

                function v() {
                    var e, t, n, r, i, s, o;
                    return r = ht, i = ht, e = _(), e !== null ? (s = ht, pt++, o = ht, t = P(), t = t !== null ? t : "", t !== null ? (n = w(), n !== null ? t = [t, n] : (t = null, ht = o)) : (t = null, ht = o), pt--, t === null ? t = "" : (t = null, ht = s), t !== null ? e = [e, t] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e, t) {
                        return{type: "rule_ref", name: t}
                    }(r, e[0])), e === null && (ht = r), e === null && (e = D(), e === null && (r = ht, e = M(), e !== null && (e = function (e) {
                        return{type: "any"}
                    }(r)), e === null && (ht = r), e === null && (e = R(), e === null && (r = ht, i = ht, e = A(), e !== null ? (t = l(), t !== null ? (n = O(), n !== null ? e = [e, t, n] : (e = null, ht = i)) : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e, t) {
                        return t
                    }(r, e[1])), e === null && (ht = r))))), e
                }

                function m() {
                    var e, t, n, r;
                    return pt++, n = ht, r = ht, e = g(), e !== null ? (t = nt(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return t.substr(1, t.length - 2)
                    }(n, e[0])), e === null && (ht = n), pt--, pt === 0 && e === null && s("action"), e
                }

                function g() {
                    var e, n, r, i, o;
                    i = ht, o = ht, t.charCodeAt(ht) === 123 ? (e = "{", ht++) : (e = null, pt === 0 && s('"{"'));
                    if (e !== null) {
                        n = [], r = g(), r === null && (r = b());
                        while (r !== null)n.push(r), r = g(), r === null && (r = b());
                        n !== null ? (t.charCodeAt(ht) === 125 ? (r = "}", ht++) : (r = null, pt === 0 && s('"}"')), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)
                    } else e = null, ht = o;
                    return e !== null && (e = function (e, t) {
                        return"{" + t.join("") + "}"
                    }(i, e[1])), e === null && (ht = i), e
                }

                function y() {
                    var e, t, n;
                    n = ht, t = b();
                    if (t !== null) {
                        e = [];
                        while (t !== null)e.push(t), t = b()
                    } else e = null;
                    return e !== null && (e = function (e, t) {
                        return t.join("")
                    }(n, e)), e === null && (ht = n), e
                }

                function b() {
                    var e;
                    return/^[^{}]/.test(t.charAt(ht)) ? (e = t.charAt(ht), ht++) : (e = null, pt === 0 && s("[^{}]")), e
                }

                function w() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 61 ? (e = "=", ht++) : (e = null, pt === 0 && s('"="')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"="
                    }(r)), e === null && (ht = r), e
                }

                function E() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 58 ? (e = ":", ht++) : (e = null, pt === 0 && s('":"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return":"
                    }(r)), e === null && (ht = r), e
                }

                function S() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 59 ? (e = ";", ht++) : (e = null, pt === 0 && s('";"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return";"
                    }(r)), e === null && (ht = r), e
                }

                function x() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 47 ? (e = "/", ht++) : (e = null, pt === 0 && s('"/"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"/"
                    }(r)), e === null && (ht = r), e
                }

                function T() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 38 ? (e = "&", ht++) : (e = null, pt === 0 && s('"&"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"&"
                    }(r)), e === null && (ht = r), e
                }

                function N() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 33 ? (e = "!", ht++) : (e = null, pt === 0 && s('"!"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"!"
                    }(r)), e === null && (ht = r), e
                }

                function C() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 63 ? (e = "?", ht++) : (e = null, pt === 0 && s('"?"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"?"
                    }(r)), e === null && (ht = r), e
                }

                function k() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 42 ? (e = "*", ht++) : (e = null, pt === 0 && s('"*"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"*"
                    }(r)), e === null && (ht = r), e
                }

                function L() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 43 ? (e = "+", ht++) : (e = null, pt === 0 && s('"+"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"+"
                    }(r)), e === null && (ht = r), e
                }

                function A() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 40 ? (e = "(", ht++) : (e = null, pt === 0 && s('"("')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"("
                    }(r)), e === null && (ht = r), e
                }

                function O() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 41 ? (e = ")", ht++) : (e = null, pt === 0 && s('")"')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return")"
                    }(r)), e === null && (ht = r), e
                }

                function M() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 46 ? (e = ".", ht++) : (e = null, pt === 0 && s('"."')), e !== null ? (n = nt(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"."
                    }(r)), e === null && (ht = r), e
                }

                function _() {
                    var e, n, r, i, o;
                    pt++, i = ht, o = ht, e = Z(), e === null && (t.charCodeAt(ht) === 95 ? (e = "_", ht++) : (e = null, pt === 0 && s('"_"')), e === null && (t.charCodeAt(ht) === 36 ? (e = "$", ht++) : (e = null, pt === 0 && s('"$"'))));
                    if (e !== null) {
                        n = [], r = Z(), r === null && (r = G(), r === null && (t.charCodeAt(ht) === 95 ? (r = "_", ht++) : (r = null, pt === 0 && s('"_"')), r === null && (t.charCodeAt(ht) === 36 ? (r = "$", ht++) : (r = null, pt === 0 && s('"$"')))));
                        while (r !== null)n.push(r), r = Z(), r === null && (r = G(), r === null && (t.charCodeAt(ht) === 95 ? (r = "_", ht++) : (r = null, pt === 0 && s('"_"')), r === null && (t.charCodeAt(ht) === 36 ? (r = "$", ht++) : (r = null, pt === 0 && s('"$"')))));
                        n !== null ? (r = nt(), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)
                    } else e = null, ht = o;
                    return e !== null && (e = function (e, t, n) {
                        return t + n.join("")
                    }(i, e[0], e[1])), e === null && (ht = i), pt--, pt === 0 && e === null && s("identifier"), e
                }

                function D() {
                    var e, n, r, i, o;
                    return pt++, i = ht, o = ht, e = H(), e === null && (e = F()), e !== null ? (t.charCodeAt(ht) === 105 ? (n = "i", ht++) : (n = null, pt === 0 && s('"i"')), n = n !== null ? n : "", n !== null ? (r = nt(), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)) : (e = null, ht = o), e !== null && (e = function (e, t, n) {
                        return{type: "literal", value: t, ignoreCase: n === "i"}
                    }(i, e[0], e[1])), e === null && (ht = i), pt--, pt === 0 && e === null && s("literal"), e
                }

                function P() {
                    var e, t, n, r;
                    return pt++, n = ht, r = ht, e = H(), e === null && (e = F()), e !== null ? (t = nt(), t !== null ? e = [e, t] : (e = null, ht = r)) : (e = null, ht = r), e !== null && (e = function (e, t) {
                        return t
                    }(n, e[0])), e === null && (ht = n), pt--, pt === 0 && e === null && s("string"), e
                }

                function H() {
                    var e, n, r, i, o;
                    i = ht, o = ht, t.charCodeAt(ht) === 34 ? (e = '"', ht++) : (e = null, pt === 0 && s('"\\""'));
                    if (e !== null) {
                        n = [], r = B();
                        while (r !== null)n.push(r), r = B();
                        n !== null ? (t.charCodeAt(ht) === 34 ? (r = '"', ht++) : (r = null, pt === 0 && s('"\\""')), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)
                    } else e = null, ht = o;
                    return e !== null && (e = function (e, t) {
                        return t.join("")
                    }(i, e[1])), e === null && (ht = i), e
                }

                function B() {
                    var e;
                    return e = j(), e === null && (e = V(), e === null && (e = $(), e === null && (e = J(), e === null && (e = K(), e === null && (e = Q()))))), e
                }

                function j() {
                    var e, n, r, i, o;
                    return r = ht, i = ht, o = ht, pt++, t.charCodeAt(ht) === 34 ? (e = '"', ht++) : (e = null, pt === 0 && s('"\\""')), e === null && (t.charCodeAt(ht) === 92 ? (e = "\\", ht++) : (e = null, pt === 0 && s('"\\\\"')), e === null && (e = ut())), pt--, e === null ? e = "" : (e = null, ht = o), e !== null ? (t.length > ht ? (n = t.charAt(ht), ht++) : (n = null, pt === 0 && s("any character")), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e, t) {
                        return t
                    }(r, e[1])), e === null && (ht = r), e
                }

                function F() {
                    var e, n, r, i, o;
                    i = ht, o = ht, t.charCodeAt(ht) === 39 ? (e = "'", ht++) : (e = null, pt === 0 && s('"\'"'));
                    if (e !== null) {
                        n = [], r = I();
                        while (r !== null)n.push(r), r = I();
                        n !== null ? (t.charCodeAt(ht) === 39 ? (r = "'", ht++) : (r = null, pt === 0 && s('"\'"')), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)
                    } else e = null, ht = o;
                    return e !== null && (e = function (e, t) {
                        return t.join("")
                    }(i, e[1])), e === null && (ht = i), e
                }

                function I() {
                    var e;
                    return e = q(), e === null && (e = V(), e === null && (e = $(), e === null && (e = J(), e === null && (e = K(), e === null && (e = Q()))))), e
                }

                function q() {
                    var e, n, r, i, o;
                    return r = ht, i = ht, o = ht, pt++, t.charCodeAt(ht) === 39 ? (e = "'", ht++) : (e = null, pt === 0 && s('"\'"')), e === null && (t.charCodeAt(ht) === 92 ? (e = "\\", ht++) : (e = null, pt === 0 && s('"\\\\"')), e === null && (e = ut())), pt--, e === null ? e = "" : (e = null, ht = o), e !== null ? (t.length > ht ? (n = t.charAt(ht), ht++) : (n = null, pt === 0 && s("any character")), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e, t) {
                        return t
                    }(r, e[1])), e === null && (ht = r), e
                }

                function R() {
                    var e, n, r, i, o, u, a, f;
                    pt++, a = ht, f = ht, t.charCodeAt(ht) === 91 ? (e = "[", ht++) : (e = null, pt === 0 && s('"["'));
                    if (e !== null) {
                        t.charCodeAt(ht) === 94 ? (n = "^", ht++) : (n = null, pt === 0 && s('"^"')), n = n !== null ? n : "";
                        if (n !== null) {
                            r = [], i = U(), i === null && (i = z());
                            while (i !== null)r.push(i), i = U(), i === null && (i = z());
                            r !== null ? (t.charCodeAt(ht) === 93 ? (i = "]", ht++) : (i = null, pt === 0 && s('"]"')), i !== null ? (t.charCodeAt(ht) === 105 ? (o = "i", ht++) : (o = null, pt === 0 && s('"i"')), o = o !== null ? o : "", o !== null ? (u = nt(), u !== null ? e = [e, n, r, i, o, u] : (e = null, ht = f)) : (e = null, ht = f)) : (e = null, ht = f)) : (e = null, ht = f)
                        } else e = null, ht = f
                    } else e = null, ht = f;
                    return e !== null && (e = function (e, t, n, r) {
                        var i = map(n, function (e) {
                            return e.data
                        }), s = "[" + t + map(n,function (e) {
                            return e.rawText
                        }).join("") + "]" + r;
                        return{type: "class", inverted: t === "^", ignoreCase: r === "i", parts: i, rawText: s}
                    }(a, e[1], e[2], e[4])), e === null && (ht = a), pt--, pt === 0 && e === null && s("character class"), e
                }

                function U() {
                    var e, n, r, i, o;
                    return i = ht, o = ht, e = z(), e !== null ? (t.charCodeAt(ht) === 45 ? (n = "-", ht++) : (n = null, pt === 0 && s('"-"')), n !== null ? (r = z(), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)) : (e = null, ht = o), e !== null && (e = function (e, t, n) {
                        if (t.data.charCodeAt(0) > n.data.charCodeAt(0))throw new this.SyntaxError("Invalid character range: " + t.rawText + "-" + n.rawText + ".");
                        return{data: [t.data, n.data], rawText: t.rawText + "-" + n.rawText}
                    }(i, e[0], e[2])), e === null && (ht = i), e
                }

                function z() {
                    var e, t;
                    return t = ht, e = W(), e !== null && (e = function (e, t) {
                        return{data: t, rawText: quoteForRegexpClass(t)}
                    }(t, e)), e === null && (ht = t), e
                }

                function W() {
                    var e;
                    return e = X(), e === null && (e = V(), e === null && (e = $(), e === null && (e = J(), e === null && (e = K(), e === null && (e = Q()))))), e
                }

                function X() {
                    var e, n, r, i, o;
                    return r = ht, i = ht, o = ht, pt++, t.charCodeAt(ht) === 93 ? (e = "]", ht++) : (e = null, pt === 0 && s('"]"')), e === null && (t.charCodeAt(ht) === 92 ? (e = "\\", ht++) : (e = null, pt === 0 && s('"\\\\"')), e === null && (e = ut())), pt--, e === null ? e = "" : (e = null, ht = o), e !== null ? (t.length > ht ? (n = t.charAt(ht), ht++) : (n = null, pt === 0 && s("any character")), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e, t) {
                        return t
                    }(r, e[1])), e === null && (ht = r), e
                }

                function V() {
                    var e, n, r, i, o, u;
                    return i = ht, o = ht, t.charCodeAt(ht) === 92 ? (e = "\\", ht++) : (e = null, pt === 0 && s('"\\\\"')), e !== null ? (u = ht, pt++, n = G(), n === null && (t.charCodeAt(ht) === 120 ? (n = "x", ht++) : (n = null, pt === 0 && s('"x"')), n === null && (t.charCodeAt(ht) === 117 ? (n = "u", ht++) : (n = null, pt === 0 && s('"u"')), n === null && (n = ut()))), pt--, n === null ? n = "" : (n = null, ht = u), n !== null ? (t.length > ht ? (r = t.charAt(ht), ht++) : (r = null, pt === 0 && s("any character")), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)) : (e = null, ht = o), e !== null && (e = function (e, t) {
                        return t.replace("b", "\b").replace("f", "\f").replace("n", "\n").replace("r", "\r").replace("t", "	").replace("v", "")
                    }(i, e[2])), e === null && (ht = i), e
                }

                function $() {
                    var e, n, r, i, o;
                    return r = ht, i = ht, t.substr(ht, 2) === "\\0" ? (e = "\\0", ht += 2) : (e = null, pt === 0 && s('"\\\\0"')), e !== null ? (o = ht, pt++, n = G(), pt--, n === null ? n = "" : (n = null, ht = o), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e) {
                        return"\0"
                    }(r)), e === null && (ht = r), e
                }

                function J() {
                    var e, n, r, i, o;
                    return i = ht, o = ht, t.substr(ht, 2) === "\\x" ? (e = "\\x", ht += 2) : (e = null, pt === 0 && s('"\\\\x"')), e !== null ? (n = Y(), n !== null ? (r = Y(), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)) : (e = null, ht = o), e !== null && (e = function (e, t, n) {
                        return String.fromCharCode(parseInt(t + n, 16))
                    }(i, e[1], e[2])), e === null && (ht = i), e
                }

                function K() {
                    var e, n, r, i, o, u, a;
                    return u = ht, a = ht, t.substr(ht, 2) === "\\u" ? (e = "\\u", ht += 2) : (e = null, pt === 0 && s('"\\\\u"')), e !== null ? (n = Y(), n !== null ? (r = Y(), r !== null ? (i = Y(), i !== null ? (o = Y(), o !== null ? e = [e, n, r, i, o] : (e = null, ht = a)) : (e = null, ht = a)) : (e = null, ht = a)) : (e = null, ht = a)) : (e = null, ht = a), e !== null && (e = function (e, t, n, r, i) {
                        return String.fromCharCode(parseInt(t + n + r + i, 16))
                    }(u, e[1], e[2], e[3], e[4])), e === null && (ht = u), e
                }

                function Q() {
                    var e, n, r, i;
                    return r = ht, i = ht, t.charCodeAt(ht) === 92 ? (e = "\\", ht++) : (e = null, pt === 0 && s('"\\\\"')), e !== null ? (n = ot(), n !== null ? e = [e, n] : (e = null, ht = i)) : (e = null, ht = i), e !== null && (e = function (e, t) {
                        return t
                    }(r, e[1])), e === null && (ht = r), e
                }

                function G() {
                    var e;
                    return/^[0-9]/.test(t.charAt(ht)) ? (e = t.charAt(ht), ht++) : (e = null, pt === 0 && s("[0-9]")), e
                }

                function Y() {
                    var e;
                    return/^[0-9a-fA-F]/.test(t.charAt(ht)) ? (e = t.charAt(ht), ht++) : (e = null, pt === 0 && s("[0-9a-fA-F]")), e
                }

                function Z() {
                    var e;
                    return e = et(), e === null && (e = tt()), e
                }

                function et() {
                    var e;
                    return/^[a-z]/.test(t.charAt(ht)) ? (e = t.charAt(ht), ht++) : (e = null, pt === 0 && s("[a-z]")), e
                }

                function tt() {
                    var e;
                    return/^[A-Z]/.test(t.charAt(ht)) ? (e = t.charAt(ht), ht++) : (e = null, pt === 0 && s("[A-Z]")), e
                }

                function nt() {
                    var e, t;
                    e = [], t = at(), t === null && (t = ot(), t === null && (t = rt()));
                    while (t !== null)e.push(t), t = at(), t === null && (t = ot(), t === null && (t = rt()));
                    return e
                }

                function rt() {
                    var e;
                    return pt++, e = it(), e === null && (e = st()), pt--, pt === 0 && e === null && s("comment"), e
                }

                function it() {
                    var e, n, r, i, o, u, a;
                    o = ht, t.substr(ht, 2) === "//" ? (e = "//", ht += 2) : (e = null, pt === 0 && s('"//"'));
                    if (e !== null) {
                        n = [], u = ht, a = ht, pt++, r = ut(), pt--, r === null ? r = "" : (r = null, ht = a), r !== null ? (t.length > ht ? (i = t.charAt(ht), ht++) : (i = null, pt === 0 && s("any character")), i !== null ? r = [r, i] : (r = null, ht = u)) : (r = null, ht = u);
                        while (r !== null)n.push(r), u = ht, a = ht, pt++, r = ut(), pt--, r === null ? r = "" : (r = null, ht = a), r !== null ? (t.length > ht ? (i = t.charAt(ht), ht++) : (i = null, pt === 0 && s("any character")), i !== null ? r = [r, i] : (r = null, ht = u)) : (r = null, ht = u);
                        n !== null ? e = [e, n] : (e = null, ht = o)
                    } else e = null, ht = o;
                    return e
                }

                function st() {
                    var e, n, r, i, o, u, a;
                    o = ht, t.substr(ht, 2) === "/*" ? (e = "/*", ht += 2) : (e = null, pt === 0 && s('"/*"'));
                    if (e !== null) {
                        n = [], u = ht, a = ht, pt++, t.substr(ht, 2) === "*/" ? (r = "*/", ht += 2) : (r = null, pt === 0 && s('"*/"')), pt--, r === null ? r = "" : (r = null, ht = a), r !== null ? (t.length > ht ? (i = t.charAt(ht), ht++) : (i = null, pt === 0 && s("any character")), i !== null ? r = [r, i] : (r = null, ht = u)) : (r = null, ht = u);
                        while (r !== null)n.push(r), u = ht, a = ht, pt++, t.substr(ht, 2) === "*/" ? (r = "*/", ht += 2) : (r = null, pt === 0 && s('"*/"')), pt--, r === null ? r = "" : (r = null, ht = a), r !== null ? (t.length > ht ? (i = t.charAt(ht), ht++) : (i = null, pt === 0 && s("any character")), i !== null ? r = [r, i] : (r = null, ht = u)) : (r = null, ht = u);
                        n !== null ? (t.substr(ht, 2) === "*/" ? (r = "*/", ht += 2) : (r = null, pt === 0 && s('"*/"')), r !== null ? e = [e, n, r] : (e = null, ht = o)) : (e = null, ht = o)
                    } else e = null, ht = o;
                    return e
                }

                function ot() {
                    var e;
                    return pt++, t.charCodeAt(ht) === 10 ? (e = "\n", ht++) : (e = null, pt === 0 && s('"\\n"')), e === null && (t.substr(ht, 2) === "\r\n" ? (e = "\r\n", ht += 2) : (e = null, pt === 0 && s('"\\r\\n"')), e === null && (t.charCodeAt(ht) === 13 ? (e = "\r", ht++) : (e = null, pt === 0 && s('"\\r"')), e === null && (t.charCodeAt(ht) === 8232 ? (e = "\u2028", ht++) : (e = null, pt === 0 && s('"\\u2028"')), e === null && (t.charCodeAt(ht) === 8233 ? (e = "\u2029", ht++) : (e = null, pt === 0 && s('"\\u2029"')))))), pt--, pt === 0 && e === null && s("end of line"), e
                }

                function ut() {
                    var e;
                    return/^[\n\r\u2028\u2029]/.test(t.charAt(ht)) ? (e = t.charAt(ht), ht++) : (e = null, pt === 0 && s("[\\n\\r\\u2028\\u2029]")), e
                }

                function at() {
                    var e;
                    return pt++, /^[ \t\x0B\f\xA0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/.test(t.charAt(ht)) ? (e = t.charAt(ht), ht++) : (e = null, pt === 0 && s("[ \\t\\x0B\\f\\xA0\\uFEFF\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000]")), pt--, pt === 0 && e === null && s("whitespace"), e
                }

                function ft(e) {
                    e.sort();
                    var t = null, n = [];
                    for (var r = 0; r < e.length; r++)e[r] !== t && (n.push(e[r]), t = e[r]);
                    return n
                }

                function lt() {
                    var e = 1, n = 1, r = !1;
                    for (var i = 0; i < Math.max(ht, dt); i++) {
                        var s = t.charAt(i);
                        s === "\n" ? (r || e++, n = 1, r = !1) : s === "\r" || s === "\u2028" || s === "\u2029" ? (e++, n = 1, r = !0) : (n++, r = !1)
                    }
                    return{line: e, column: n}
                }

                var ct = {grammar: o, initializer: u, rule: f, choice: l, sequence: c, labeled: h, prefixed: p, suffixed: d, primary: v, action: m, braced: g, nonBraceCharacters: y, nonBraceCharacter: b, equals: w, colon: E, semicolon: S, slash: x, and: T, not: N, question: C, star: k, plus: L, lparen: A, rparen: O, dot: M, identifier: _, literal: D, string: P, doubleQuotedString: H, doubleQuotedCharacter: B, simpleDoubleQuotedCharacter: j, singleQuotedString: F, singleQuotedCharacter: I, simpleSingleQuotedCharacter: q, "class": R, classCharacterRange: U, classCharacter: z, bracketDelimitedCharacter: W, simpleBracketDelimitedCharacter: X, simpleEscapeSequence: V, zeroEscapeSequence: $, hexEscapeSequence: J, unicodeEscapeSequence: K, eolEscapeSequence: Q, digit: G, hexDigit: Y, letter: Z, lowerCaseLetter: et, upperCaseLetter: tt, __: nt, comment: rt, singleLineComment: it, multiLineComment: st, eol: ot, eolChar: ut, whitespace: at};
                if (n !== undefined) {
                    if (ct[n] === undefined)throw new Error("Invalid rule name: " + e(n) + ".")
                } else n = "grammar";
                var ht = 0, pt = 0, dt = 0, vt = [], mt = ct[n]();
                if (mt === null || ht !== t.length) {
                    var gt = Math.max(ht, dt), yt = gt < t.length ? t.charAt(gt) : null, bt = lt();
                    throw new this.SyntaxError(ft(vt), yt, gt, bt.line, bt.column)
                }
                return mt
            }, toSource: function () {
                return this._source
            }};
            return t.SyntaxError = function (t, n, r, i, s) {
                function o(t, n) {
                    var r, i;
                    switch (t.length) {
                        case 0:
                            r = "end of input";
                            break;
                        case 1:
                            r = t[0];
                            break;
                        default:
                            r = t.slice(0, t.length - 1).join(", ") + " or " + t[t.length - 1]
                    }
                    return i = n ? e(n) : "end of input", "Expected " + r + " but " + i + " found."
                }

                this.name = "SyntaxError", this.expected = t, this.found = n, this.message = o(t, n), this.offset = r, this.line = i, this.column = s
            }, t.SyntaxError.prototype = Error.prototype, t
        }(), PEG.compiler = {appliedPassNames: ["reportMissingRules", "reportLeftRecursion", "removeProxyRules", "computeVarNames", "computeParams"], compile: function (ast, options) {
            var that = this;
            each(this.appliedPassNames, function (e) {
                that.passes[e](ast)
            });
            var source = this.emitter(ast, options), result = eval(source);
            return result._source = source, result
        }}, PEG.compiler.passes = {reportMissingRules: function (e) {
            function t() {
            }

            function n(e) {
                i(e.expression)
            }

            function r(e) {
                return function (t) {
                    each(t[e], i)
                }
            }

            var i = buildNodeVisitor({grammar: r("rules"), rule: n, choice: r("alternatives"), sequence: r("elements"), labeled: n, simple_and: n, simple_not: n, semantic_and: t, semantic_not: t, optional: n, zero_or_more: n, one_or_more: n, action: n, rule_ref: function (t) {
                if (!findRuleByName(e, t.name))throw new PEG.GrammarError('Referenced rule "' + t.name + '" does not exist.')
            }, literal: t, any: t, "class": t});
            i(e)
        }, reportLeftRecursion: function (e) {
            function t() {
            }

            function n(e, t) {
                i(e.expression, t)
            }

            function r(e) {
                return function (t, n) {
                    each(t[e], function (e) {
                        i(e, n)
                    })
                }
            }

            var i = buildNodeVisitor({grammar: r("rules"), rule: function (e, t) {
                i(e.expression, t.concat(e.name))
            }, choice: r("alternatives"), sequence: function (e, t) {
                e.elements.length > 0 && i(e.elements[0], t)
            }, labeled: n, simple_and: n, simple_not: n, semantic_and: t, semantic_not: t, optional: n, zero_or_more: n, one_or_more: n, action: n, rule_ref: function (t, n) {
                if (contains(n, t.name))throw new PEG.GrammarError('Left recursion detected for rule "' + t.name + '".');
                i(findRuleByName(e, t.name), n)
            }, literal: t, any: t, "class": t});
            i(e, [])
        }, removeProxyRules: function (e) {
            function t(e) {
                return e.type === "rule" && e.expression.type === "rule_ref"
            }

            function n(e, t, n) {
                function r() {
                }

                function i(e, t, n) {
                    o(e.expression, t, n)
                }

                function s(e) {
                    return function (t, n, r) {
                        each(t[e], function (e) {
                            o(e, n, r)
                        })
                    }
                }

                var o = buildNodeVisitor({grammar: s("rules"), rule: i, choice: s("alternatives"), sequence: s("elements"), labeled: i, simple_and: i, simple_not: i, semantic_and: r, semantic_not: r, optional: i, zero_or_more: i, one_or_more: i, action: i, rule_ref: function (e, t, n) {
                    e.name === t && (e.name = n)
                }, literal: r, any: r, "class": r});
                o(e, t, n)
            }

            var r = [];
            each(e.rules, function (i, s) {
                t(i) && (n(e, i.name, i.expression.name), i.name === e.startRule && (e.startRule = i.expression.name), r.push(s))
            }), r.reverse(), each(r, function (t) {
                e.rules.splice(t, 1)
            })
        }, computeVarNames: function (e) {
            function t(e) {
                return"result" + e
            }

            function n(e) {
                return"pos" + e
            }

            function r(e, n) {
                return e.resultVar = t(n.result), {result: 0, pos: 0}
            }

            function i(e) {
                return function (r, i) {
                    var o = s(r.expression, {result: i.result + e.result, pos: i.pos + e.pos});
                    return r.resultVar = t(i.result), e.pos !== 0 && (r.posVar = n(i.pos)), {result: o.result + e.result, pos: o.pos + e.pos}
                }
            }

            var s = buildNodeVisitor({grammar: function (e, t) {
                each(e.rules, function (e) {
                    s(e, t)
                })
            }, rule: function (e, r) {
                var i = s(e.expression, r);
                e.resultVar = t(r.result), e.resultVars = map(range(i.result + 1), t), e.posVars = map(range(i.pos), n)
            }, choice: function (e, n) {
                var r = map(e.alternatives, function (e) {
                    return s(e, n)
                });
                return e.resultVar = t(n.result), {result: Math.max.apply(null, pluck(r, "result")), pos: Math.max.apply(null, pluck(r, "pos"))}
            }, sequence: function (e, r) {
                var i = map(e.elements, function (e, t) {
                    return s(e, {result: r.result + t, pos: r.pos + 1})
                });
                return e.resultVar = t(r.result), e.posVar = n(r.pos), {result: e.elements.length > 0 ? Math.max.apply(null, map(i, function (e, t) {
                    return t + e.result
                })) : 0, pos: e.elements.length > 0 ? 1 + Math.max.apply(null, pluck(i, "pos")) : 1}
            }, labeled: i({result: 0, pos: 0}), simple_and: i({result: 0, pos: 1}), simple_not: i({result: 0, pos: 1}), semantic_and: r, semantic_not: r, optional: i({result: 0, pos: 0}), zero_or_more: i({result: 1, pos: 0}), one_or_more: i({result: 1, pos: 0}), action: i({result: 0, pos: 1}), rule_ref: r, literal: r, any: r, "class": r});
            s(e, {result: 0, pos: 0})
        }, computeParams: function (e) {
            function t(e) {
                s.push({}), e(), s.pop()
            }

            function n() {
            }

            function r(e) {
                t(function () {
                    o(e.expression)
                })
            }

            function i(e) {
                var t = s[s.length - 1], n = {}, r;
                for (r in t)n[r] = t[r];
                e.params = n
            }

            var s = [], o = buildNodeVisitor({grammar: function (e) {
                each(e.rules, o)
            }, rule: r, choice: function (e) {
                t(function () {
                    each(e.alternatives, o)
                })
            }, sequence: function (e) {
                function t(t) {
                    each(pluck(e.elements, "resultVar"), function (r, i) {
                        (new RegExp("^" + r + "(\\[\\d+\\])*$")).test(n[t]) && (n[t] = e.resultVar + "[" + i + "]" + n[t].substr(r.length))
                    })
                }

                var n = s[s.length - 1], r;
                each(e.elements, o);
                for (r in n)t(r)
            }, labeled: function (e) {
                s[s.length - 1][e.label] = e.resultVar, t(function () {
                    o(e.expression)
                })
            }, simple_and: r, simple_not: r, semantic_and: i, semantic_not: i, optional: r, zero_or_more: r, one_or_more: r, action: function (e) {
                t(function () {
                    o(e.expression), i(e)
                })
            }, rule_ref: n, literal: n, any: n, "class": n});
            o(e)
        }}, PEG.compiler.emitter = function (e, t) {
            function n(e, n) {
                return n.string = quote, n.pluck = pluck, n.keys = keys, n.values = values, n.emit = o, n.options = t, t.trackLineAndColumn ? (n.posInit = function (e) {
                    return"var " + e + " = " + "{ offset: 0, line: 1, column: 1, seenCR: false }"
                }, n.posClone = function (e) {
                    return"clone(" + e + ")"
                }, n.posOffset = function (e) {
                    return e + ".offset"
                }, n.posAdvance = function (e) {
                    return"advance(pos, " + e + ")"
                }) : (n.posInit = function (e) {
                    return"var " + e + " = 0"
                }, n.posClone = function (e) {
                    return e
                }, n.posOffset = function (e) {
                    return e
                }, n.posAdvance = function (e) {
                    return e === 1 ? "pos++" : "pos += " + e
                }), n.posSave = function (e) {
                    return e.posVar + " = " + n.posClone("pos")
                }, n.posRestore = function (e) {
                    return"pos = " + n.posClone(e.posVar)
                }, s[e](n)
            }

            function r(e) {
                return function (t) {
                    return n(e, {node: t})
                }
            }

            t = t || {}, t.cache === undefined && (t.cache = !1), t.trackLineAndColumn === undefined && (t.trackLineAndColumn = !1);
            var i = function (e) {
                function t(e) {
                    function t(e) {
                        return e.charCodeAt(0).toString(16).toUpperCase()
                    }

                    return e.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function (e) {
                        return"\\x0" + t(e)
                    }).replace(/[\x10-\x1F\x80-\xFF]/g,function (e) {
                        return"\\x" + t(e)
                    }).replace(/[\u0180-\u0FFF]/g,function (e) {
                        return"\\u0" + t(e)
                    }).replace(/[\u1080-\uFFFF]/g, function (e) {
                        return"\\u" + t(e)
                    })
                }

                function n(e) {
                    return"__p.push(" + e + ");"
                }

                function r(e, r, i) {
                    function s(e, t, n) {
                        return e.replace(new RegExp("^.{" + t + "}", "gm"), function (e, t) {
                            return t === 0 ? n ? "" : e : ""
                        })
                    }

                    var o = t(s(e.substring(0, r), i.indentLevel(), i.atBOL));
                    return o.length > 0 ? n('"' + o + '"') : ""
                }

                var i = {VERSION: "1.1.0", indentStep: 2, commands: {"if": {params: /^(.*)$/, compile: function (e, t, n) {
                    return["if(" + n[0] + "){", []]
                }, stackOp: "push"}, "else": {params: /^$/, compile: function (e) {
                    var t = e.commandStack, n = t[t.length - 1] === "else", r = t[t.length - 1] === "if";
                    if (n)throw new Error("Multiple #elses.");
                    if (!r)throw new Error("Using #else outside of #if.");
                    return["}else{", []]
                }, stackOp: "replace"}, "for": {params: /^([a-zA-Z_][a-zA-Z0-9_]*)[ \t]+in[ \t]+(.*)$/, init: function (e) {
                    e.forCurrLevel = 0, e.forMaxLevel = 0
                }, compile: function (e, t, n) {
                    var r = "__c" + e.forCurrLevel, i = "__l" + e.forCurrLevel, s = "__i" + e.forCurrLevel;
                    return e.forCurrLevel++, e.forMaxLevel < e.forCurrLevel && (e.forMaxLevel = e.forCurrLevel), [r + "=" + n[1] + ";" + i + "=" + r + ".length;" + "for(" + s + "=0;" + s + "<" + i + ";" + s + "++){" + n[0] + "=" + r + "[" + s + "];", [n[0], r, i, s]]
                }, exit: function (e) {
                    e.forCurrLevel--
                }, stackOp: "push"}, end: {params: /^$/, compile: function (e) {
                    var t = e.commandStack, n;
                    if (t.length === 0)throw new Error("Too many #ends.");
                    return n = i.commands[t[t.length - 1]].exit, n && n(e), ["}", []]
                }, stackOp: "pop"}, block: {params: /^(.*)$/, compile: function (e, r, i) {
                    var s = "__x", o = "__n", u = "__l", a = "__i";
                    return[s + '="' + t(r.substring(e.indentLevel())) + '";' + o + "=(" + i[0] + ').toString().split("\\n");' + u + "=" + o + ".length;" + "for(" + a + "=0;" + a + "<" + u + ";" + a + "++){" + o + "[" + a + "]=" + s + "+" + o + "[" + a + ']+"\\n";' + "}" + n(o + '.join("")'), [s, o, u, a]]
                }, stackOp: "nop"}}, template: function (t) {
                    function s(e, t) {
                        return e.atBOL = !1, [n(t), []]
                    }

                    function o(e, t, n, r) {
                        var s, o, a;
                        s = i.commands[n];
                        if (!s)throw new Error("Unknown command: #" + n + ".");
                        o = s.params.exec(r);
                        if (o === null)throw new Error("Invalid params for command #" + n + ": " + r + ".");
                        return a = s.compile(e, t, o.slice(1)), u[s.stackOp](e.commandStack, n), e.atBOL = !0, a
                    }

                    var u = {push: function (e, t) {
                        e.push(t)
                    }, replace: function (e, t) {
                        e[e.length - 1] = t
                    }, pop: function (e) {
                        e.pop()
                    }, nop: function () {
                    }}, f = {commandStack: [], atBOL: !0, indentLevel: function () {
                        return i.indentStep * this.commandStack.length
                    }}, l = "", h = ["__p=[]"], p, v, m, g;
                    for (p in i.commands)i.commands[p].init && i.commands[p].init(f);
                    while ((v = /^([ \t]*)#([a-zA-Z_][a-zA-Z0-9_]*)(?:[ \t]+([^ \t\n][^\n]*))?[ \t]*(?:\n|$)|#\{([^}]*)\}/m.exec(t)) !== null)l += r(t, v.index, f), m = v[2] !== e && v[2] !== "" ? o(f, v[1], v[2], v[3] || "") : s(f, v[4]), l += m[0], h = h.concat(m[1]), t = t.substring(v.index + v[0].length);
                    l += r(t, t.length, f);
                    if (f.commandStack.length > 0)throw new Error("Missing #end.");
                    h.sort();
                    for (g = 0; g < h.length; g++)h[g] === h[g - 1] && h.splice(g--, 1);
                    return new Function("__v", ["__v=__v||{};", "var " + h.join(",") + ";", "with(__v){", l, 'return __p.join("").replace(/^\\n+|\\n+$/g,"");};'].join(""))
                }};
                return i
            }(), s = function () {
                var e, t = {}, n = {grammar: ["(function(){", "  /*", "   * Generated by PEG.js 0.7.0.", "   *", "   * http://pegjs.majda.cz/", "   */", "  ", "  function quote(s) {", "    /*", "     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a", "     * string literal except for the closing quote character, backslash,", "     * carriage return, line separator, paragraph separator, and line feed.", "     * Any character may appear in the form of an escape sequence.", "     *", "     * For portability, we also escape escape all control and non-ASCII", '     * characters. Note that "\\0" and "\\v" escape sequences are not used', "     * because JSHint does not like the first and IE the second.", "     */", "     return '\"' + s", "      .replace(/\\\\/g, '\\\\\\\\')  // backslash", "      .replace(/\"/g, '\\\\\"')    // closing quote character", "      .replace(/\\x08/g, '\\\\b') // backspace", "      .replace(/\\t/g, '\\\\t')   // horizontal tab", "      .replace(/\\n/g, '\\\\n')   // line feed", "      .replace(/\\f/g, '\\\\f')   // form feed", "      .replace(/\\r/g, '\\\\r')   // carriage return", "      .replace(/[\\x00-\\x07\\x0B\\x0E-\\x1F\\x80-\\uFFFF]/g, escape)", "      + '\"';", "  }", "  ", "  var result = {", "    /*", "     * Parses the input with a generated parser. If the parsing is successfull,", "     * returns a value explicitly or implicitly specified by the grammar from", "     * which the parser was generated (see |PEG.buildParser|). If the parsing is", "     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.", "     */", "    parse: function(input, startRule) {", "      var parseFunctions = {", "        #for rule in node.rules", '          #{string(rule.name) + ": parse_" + rule.name + (rule !== node.rules[node.rules.length - 1] ? "," : "")}', "        #end", "      };", "      ", "      if (startRule !== undefined) {", "        if (parseFunctions[startRule] === undefined) {", '          throw new Error("Invalid rule name: " + quote(startRule) + ".");', "        }", "      } else {", "        startRule = #{string(node.startRule)};", "      }", "      ", '      #{posInit("pos")};', "      var reportFailures = 0;", '      #{posInit("rightmostFailuresPos")};', "      var rightmostFailuresExpected = [];", "      #if options.cache", "        var cache = {};", "      #end", "      ", "      function padLeft(input, padding, length) {", "        var result = input;", "        ", "        var padLength = length - input.length;", "        for (var i = 0; i < padLength; i++) {", "          result = padding + result;", "        }", "        ", "        return result;", "      }", "      ", "      function escape(ch) {", "        var charCode = ch.charCodeAt(0);", "        var escapeChar;", "        var length;", "        ", "        if (charCode <= 0xFF) {", "          escapeChar = 'x';", "          length = 2;", "        } else {", "          escapeChar = 'u';", "          length = 4;", "        }", "        ", "        return '\\\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);", "      }", "      ", "      #if options.trackLineAndColumn", "        function clone(object) {", "          var result = {};", "          for (var key in object) {", "            result[key] = object[key];", "          }", "          return result;", "        }", "        ", "        function advance(pos, n) {", "          var endOffset = pos.offset + n;", "          ", "          for (var offset = pos.offset; offset < endOffset; offset++) {", "            var ch = input.charAt(offset);", '            if (ch === "\\n") {', "              if (!pos.seenCR) { pos.line++; }", "              pos.column = 1;", "              pos.seenCR = false;", '            } else if (ch === "\\r" || ch === "\\u2028" || ch === "\\u2029") {', "              pos.line++;", "              pos.column = 1;", "              pos.seenCR = true;", "            } else {", "              pos.column++;", "              pos.seenCR = false;", "            }", "          }", "          ", "          pos.offset += n;", "        }", "        ", "      #end", "      function matchFailed(failure) {", '        if (#{posOffset("pos")} < #{posOffset("rightmostFailuresPos")}) {', "          return;", "        }", "        ", '        if (#{posOffset("pos")} > #{posOffset("rightmostFailuresPos")}) {', '          rightmostFailuresPos = #{posClone("pos")};', "          rightmostFailuresExpected = [];", "        }", "        ", "        rightmostFailuresExpected.push(failure);", "      }", "      ", "      #for rule in node.rules", "        #block emit(rule)", "        ", "      #end", "      ", "      function cleanupExpected(expected) {", "        expected.sort();", "        ", "        var lastExpected = null;", "        var cleanExpected = [];", "        for (var i = 0; i < expected.length; i++) {", "          if (expected[i] !== lastExpected) {", "            cleanExpected.push(expected[i]);", "            lastExpected = expected[i];", "          }", "        }", "        return cleanExpected;", "      }", "      ", "      #if !options.trackLineAndColumn", "        function computeErrorPosition() {", "          /*", "           * The first idea was to use |String.split| to break the input up to the", "           * error position along newlines and derive the line and column from", "           * there. However IE's |split| implementation is so broken that it was", "           * enough to prevent it.", "           */", "          ", "          var line = 1;", "          var column = 1;", "          var seenCR = false;", "          ", "          for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {", "            var ch = input.charAt(i);", '            if (ch === "\\n") {', "              if (!seenCR) { line++; }", "              column = 1;", "              seenCR = false;", '            } else if (ch === "\\r" || ch === "\\u2028" || ch === "\\u2029") {', "              line++;", "              column = 1;", "              seenCR = true;", "            } else {", "              column++;", "              seenCR = false;", "            }", "          }", "          ", "          return { line: line, column: column };", "        }", "      #end", "      ", "      #if node.initializer", "        #block emit(node.initializer)", "      #end", "      ", "      var result = parseFunctions[startRule]();", "      ", "      /*", "       * The parser is now in one of the following three states:", "       *", "       * 1. The parser successfully parsed the whole input.", "       *", "       *    - |result !== null|", '       *    - |#{posOffset("pos")} === input.length|', "       *    - |rightmostFailuresExpected| may or may not contain something", "       *", "       * 2. The parser successfully parsed only a part of the input.", "       *", "       *    - |result !== null|", '       *    - |#{posOffset("pos")} < input.length|', "       *    - |rightmostFailuresExpected| may or may not contain something", "       *", "       * 3. The parser did not successfully parse any part of the input.", "       *", "       *   - |result === null|", '       *   - |#{posOffset("pos")} === 0|', "       *   - |rightmostFailuresExpected| contains at least one failure", "       *", "       * All code following this comment (including called functions) must", "       * handle these states.", "       */", '      if (result === null || #{posOffset("pos")} !== input.length) {', '        var offset = Math.max(#{posOffset("pos")}, #{posOffset("rightmostFailuresPos")});', "        var found = offset < input.length ? input.charAt(offset) : null;", "        #if options.trackLineAndColumn", '          var errorPosition = #{posOffset("pos")} > #{posOffset("rightmostFailuresPos")} ? pos : rightmostFailuresPos;', "        #else", "          var errorPosition = computeErrorPosition();", "        #end", "        ", "        throw new this.SyntaxError(", "          cleanupExpected(rightmostFailuresExpected),", "          found,", "          offset,", "          errorPosition.line,", "          errorPosition.column", "        );", "      }", "      ", "      return result;", "    },", "    ", "    /* Returns the parser source code. */", "    toSource: function() { return this._source; }", "  };", "  ", "  /* Thrown when a parser encounters a syntax error. */", "  ", "  result.SyntaxError = function(expected, found, offset, line, column) {", "    function buildMessage(expected, found) {", "      var expectedHumanized, foundHumanized;", "      ", "      switch (expected.length) {", "        case 0:", '          expectedHumanized = "end of input";', "          break;", "        case 1:", "          expectedHumanized = expected[0];", "          break;", "        default:", '          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")', '            + " or "', "            + expected[expected.length - 1];", "      }", "      ", '      foundHumanized = found ? quote(found) : "end of input";', "      ", '      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";', "    }", "    ", '    this.name = "SyntaxError";', "    this.expected = expected;", "    this.found = found;", "    this.message = buildMessage(expected, found);", "    this.offset = offset;", "    this.line = line;", "    this.column = column;", "  };", "  ", "  result.SyntaxError.prototype = Error.prototype;", "  ", "  return result;", "})()"], rule: ["function parse_#{node.name}() {", "  #if options.cache", '    var cacheKey = "#{node.name}@" + #{posOffset("pos")};', "    var cachedResult = cache[cacheKey];", "    if (cachedResult) {", '      pos = #{posClone("cachedResult.nextPos")};', "      return cachedResult.result;", "    }", "    ", "  #end", "  #if node.resultVars.length > 0", '    var #{node.resultVars.join(", ")};', "  #end", "  #if node.posVars.length > 0", '    var #{node.posVars.join(", ")};', "  #end", "  ", "  #if node.displayName !== null", "    reportFailures++;", "  #end", "  #block emit(node.expression)", "  #if node.displayName !== null", "    reportFailures--;", "    if (reportFailures === 0 && #{node.resultVar} === null) {", "      matchFailed(#{string(node.displayName)});", "    }", "  #end", "  #if options.cache", "    ", "    cache[cacheKey] = {", '      nextPos: #{posClone("pos")},', "      result:  #{node.resultVar}", "    };", "  #end", "  return #{node.resultVar};", "}"], choice: ["#block emit(alternative)", "#block nextAlternativesCode"], "choice.next": ["if (#{node.resultVar} === null) {", "  #block code", "}"], sequence: ["#{posSave(node)};", "#block code"], "sequence.iteration": ["#block emit(element)", "if (#{element.resultVar} !== null) {", "  #block code", "} else {", "  #{node.resultVar} = null;", "  #{posRestore(node)};", "}"], "sequence.inner": ['#{node.resultVar} = [#{pluck(node.elements, "resultVar").join(", ")}];'], simple_and: ["#{posSave(node)};", "reportFailures++;", "#block emit(node.expression)", "reportFailures--;", "if (#{node.resultVar} !== null) {", '  #{node.resultVar} = "";', "  #{posRestore(node)};", "} else {", "  #{node.resultVar} = null;", "}"], simple_not: ["#{posSave(node)};", "reportFailures++;", "#block emit(node.expression)", "reportFailures--;", "if (#{node.resultVar} === null) {", '  #{node.resultVar} = "";', "} else {", "  #{node.resultVar} = null;", "  #{posRestore(node)};", "}"], semantic_and: ['#{node.resultVar} = (function(#{(options.trackLineAndColumn ? ["offset", "line", "column"] : ["offset"]).concat(keys(node.params)).join(", ")}) {#{node.code}})(#{(options.trackLineAndColumn ? ["pos.offset", "pos.line", "pos.column"] : ["pos"]).concat(values(node.params)).join(", ")}) ? "" : null;'], semantic_not: ['#{node.resultVar} = (function(#{(options.trackLineAndColumn ? ["offset", "line", "column"] : ["offset"]).concat(keys(node.params)).join(", ")}) {#{node.code}})(#{(options.trackLineAndColumn ? ["pos.offset", "pos.line", "pos.column"] : ["pos"]).concat(values(node.params)).join(", ")}) ? null : "";'], optional: ["#block emit(node.expression)", '#{node.resultVar} = #{node.resultVar} !== null ? #{node.resultVar} : "";'], zero_or_more: ["#{node.resultVar} = [];", "#block emit(node.expression)", "while (#{node.expression.resultVar} !== null) {", "  #{node.resultVar}.push(#{node.expression.resultVar});", "  #block emit(node.expression)", "}"], one_or_more: ["#block emit(node.expression)", "if (#{node.expression.resultVar} !== null) {", "  #{node.resultVar} = [];", "  while (#{node.expression.resultVar} !== null) {", "    #{node.resultVar}.push(#{node.expression.resultVar});", "    #block emit(node.expression)", "  }", "} else {", "  #{node.resultVar} = null;", "}"], action: ["#{posSave(node)};", "#block emit(node.expression)", "if (#{node.resultVar} !== null) {", '  #{node.resultVar} = (function(#{(options.trackLineAndColumn ? ["offset", "line", "column"] : ["offset"]).concat(keys(node.params)).join(", ")}) {#{node.code}})(#{(options.trackLineAndColumn ? [node.posVar + ".offset", node.posVar + ".line", node.posVar + ".column"] : [node.posVar]).concat(values(node.params)).join(", ")});', "}", "if (#{node.resultVar} === null) {", "  #{posRestore(node)};", "}"], rule_ref: ["#{node.resultVar} = parse_#{node.name}();"], literal: ["#if node.value.length === 0", '  #{node.resultVar} = "";', "#else", "  #if !node.ignoreCase", "    #if node.value.length === 1", '      if (input.charCodeAt(#{posOffset("pos")}) === #{node.value.charCodeAt(0)}) {', "    #else", '      if (input.substr(#{posOffset("pos")}, #{node.value.length}) === #{string(node.value)}) {', "    #end", "  #else", '    if (input.substr(#{posOffset("pos")}, #{node.value.length}).toLowerCase() === #{string(node.value.toLowerCase())}) {', "  #end", "    #if !node.ignoreCase", "      #{node.resultVar} = #{string(node.value)};", "    #else", '      #{node.resultVar} = input.substr(#{posOffset("pos")}, #{node.value.length});', "    #end", "    #{posAdvance(node.value.length)};", "  } else {", "    #{node.resultVar} = null;", "    if (reportFailures === 0) {", "      matchFailed(#{string(string(node.value))});", "    }", "  }", "#end"], any: ['if (input.length > #{posOffset("pos")}) {', '  #{node.resultVar} = input.charAt(#{posOffset("pos")});', "  #{posAdvance(1)};", "} else {", "  #{node.resultVar} = null;", "  if (reportFailures === 0) {", '    matchFailed("any character");', "  }", "}"], "class": ['if (#{regexp}.test(input.charAt(#{posOffset("pos")}))) {', '  #{node.resultVar} = input.charAt(#{posOffset("pos")});', "  #{posAdvance(1)};", "} else {", "  #{node.resultVar} = null;", "  if (reportFailures === 0) {", "    matchFailed(#{string(node.rawText)});", "  }", "}"]};
                for (e in n)t[e] = i.template(n[e].join("\n"));
                return t
            }(), o = buildNodeVisitor({grammar: r("grammar"), initializer: function (e) {
                return e.code
            }, rule: r("rule"), choice: function (e) {
                var t, r;
                for (var i = e.alternatives.length - 1; i >= 0; i--)r = i !== e.alternatives.length - 1 ? n("choice.next", {node: e, code: t}) : "", t = n("choice", {alternative: e.alternatives[i], nextAlternativesCode: r});
                return t
            }, sequence: function (e) {
                var t = n("sequence.inner", {node: e});
                for (var r = e.elements.length - 1; r >= 0; r--)t = n("sequence.iteration", {node: e, element: e.elements[r], code: t});
                return n("sequence", {node: e, code: t})
            }, labeled: function (e) {
                return o(e.expression)
            }, simple_and: r("simple_and"), simple_not: r("simple_not"), semantic_and: r("semantic_and"), semantic_not: r("semantic_not"), optional: r("optional"), zero_or_more: r("zero_or_more"), one_or_more: r("one_or_more"), action: r("action"), rule_ref: r("rule_ref"), literal: r("literal"), any: r("any"), "class": function (e) {
                var t;
                return e.parts.length > 0 ? t = "/^[" + (e.inverted ? "^" : "") + map(e.parts,function (e) {
                    return e instanceof Array ? quoteForRegexpClass(e[0]) + "-" + quoteForRegexpClass(e[1]) : quoteForRegexpClass(e)
                }).join("") + "]/" + (e.ignoreCase ? "i" : "") : t = e.inverted ? "/^[\\S\\s]/" : "/^(?!)/", n("class", {node: e, regexp: t})
            }});
            return o(e)
        }, PEG
    }();
    return typeof module != "undefined" && (module.exports = PEG), PEG
}), define("Parser/PEGParser", ["Parser/PEG", "Parser/AST/AST", "FSharp/FSharp"], function (e, t, n) {
    var r = function () {
        function e(e) {
            return'"' + e.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape) + '"'
        }

        var r = {parse: function (r, i) {
            function l(e, t, n) {
                var r = e, i = n - e.length;
                for (var s = 0; s < i; s++)r = t + r;
                return r
            }

            function c(e) {
                var t = e.charCodeAt(0), n, r;
                return t <= 255 ? (n = "x", r = 2) : (n = "u", r = 4), "\\" + n + l(t.toString(16).toUpperCase(), "0", r)
            }

            function h(e) {
                if (o < a)return;
                o > a && (a = o, f = []), f.push(e)
            }

            function p() {
                var e, t, n, i;
                return n = o, i = o, /^[+\-]/.test(r.charAt(o)) ? (e = r.charAt(o), o++) : (e = null, u === 0 && h("[+\\-]")), e = e !== null ? e : "", e !== null ? (t = Tt(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t, n) {
                    return parseInt(t + n)
                }(n, e[0], e[1])), e === null && (o = n), e
            }

            function d() {
                var e;
                return/^[A-Z]/.test(r.charAt(o)) ? (e = r.charAt(o), o++) : (e = null, u === 0 && h("[A-Z]")), e
            }

            function v() {
                var e;
                return/^[^\uFFFE-\uFFFF]/.test(r.charAt(o)) ? (e = r.charAt(o), o++) : (e = null, u === 0 && h("[^\\uFFFE-\\uFFFF]")), e
            }

            function m() {
                var e;
                return/^[a-z]/.test(r.charAt(o)) ? (e = r.charAt(o), o++) : (e = null, u === 0 && h("[a-z]")), e === null && (/^[A-Z]/.test(r.charAt(o)) ? (e = r.charAt(o), o++) : (e = null, u === 0 && h("[A-Z]"))), e
            }

            function g() {
                var e;
                return/^[0-9]/.test(r.charAt(o)) ? (e = r.charAt(o), o++) : (e = null, u === 0 && h("[0-9]")), e
            }

            function y() {
                var e;
                return r.charCodeAt(o) === 39 ? (e = "'", o++) : (e = null, u === 0 && h('"\'"')), e
            }

            function b() {
                var e;
                return r.charCodeAt(o) === 95 ? (e = "_", o++) : (e = null, u === 0 && h('"_"')), e
            }

            function w() {
                var e;
                return r.charCodeAt(o) === 92 ? (e = "\\", o++) : (e = null, u === 0 && h('"\\\\"')), e
            }

            function E() {
                var e;
                return r.charCodeAt(o) === 46 ? (e = ".", o++) : (e = null, u === 0 && h('"."')), e
            }

            function S() {
                var e;
                return r.charCodeAt(o) === 34 ? (e = '"', o++) : (e = null, u === 0 && h('"\\""')), e
            }

            function x() {
                var e;
                return r.charCodeAt(o) === 44 ? (e = ",", o++) : (e = null, u === 0 && h('","')), e
            }

            function T() {
                var e;
                return r.charCodeAt(o) === 32 ? (e = " ", o++) : (e = null, u === 0 && h('" "')), e
            }

            function N() {
                var e;
                return r.substr(o, 2) === ">=" ? (e = ">=", o += 2) : (e = null, u === 0 && h('">="')), e === null && (r.substr(o, 2) === "<=" ? (e = "<=", o += 2) : (e = null, u === 0 && h('"<="')), e === null && (r.substr(o, 2) === "<>" ? (e = "<>", o += 2) : (e = null, u === 0 && h('"<>"')), e === null && (r.charCodeAt(o) === 58 ? (e = ":", o++) : (e = null, u === 0 && h('":"')), e === null && (r.charCodeAt(o) === 94 ? (e = "^", o++) : (e = null, u === 0 && h('"^"')), e === null && (r.charCodeAt(o) === 42 ? (e = "*", o++) : (e = null, u === 0 && h('"*"')), e === null && (r.charCodeAt(o) === 47 ? (e = "/", o++) : (e = null, u === 0 && h('"/"')), e === null && (r.charCodeAt(o) === 43 ? (e = "+", o++) : (e = null, u === 0 && h('"+"')), e === null && (r.charCodeAt(o) === 45 ? (e = "-", o++) : (e = null, u === 0 && h('"-"')), e === null && (r.charCodeAt(o) === 38 ? (e = "&", o++) : (e = null, u === 0 && h('"&"')), e === null && (r.charCodeAt(o) === 61 ? (e = "=", o++) : (e = null, u === 0 && h('"="')), e === null && (r.charCodeAt(o) === 60 ? (e = "<", o++) : (e = null, u === 0 && h('"<"')), e === null && (r.charCodeAt(o) === 62 ? (e = ">", o++) : (e = null, u === 0 && h('">"')))))))))))))), e
            }

            function C() {
                var e;
                return r.substr(o, 2) === ">=" ? (e = ">=", o += 2) : (e = null, u === 0 && h('">="')), e === null && (r.substr(o, 2) === "<=" ? (e = "<=", o += 2) : (e = null, u === 0 && h('"<="')), e === null && (r.substr(o, 2) === "<>" ? (e = "<>", o += 2) : (e = null, u === 0 && h('"<>"')), e === null && (r.charCodeAt(o) === 58 ? (e = ":", o++) : (e = null, u === 0 && h('":"')), e === null && (r.charCodeAt(o) === 94 ? (e = "^", o++) : (e = null, u === 0 && h('"^"')), e === null && (r.charCodeAt(o) === 42 ? (e = "*", o++) : (e = null, u === 0 && h('"*"')), e === null && (r.charCodeAt(o) === 47 ? (e = "/", o++) : (e = null, u === 0 && h('"/"')), e === null && (r.charCodeAt(o) === 43 ? (e = "+", o++) : (e = null, u === 0 && h('"+"')), e === null && (r.charCodeAt(o) === 45 ? (e = "-", o++) : (e = null, u === 0 && h('"-"')), e === null && (r.charCodeAt(o) === 38 ? (e = "&", o++) : (e = null, u === 0 && h('"&"')), e === null && (r.charCodeAt(o) === 61 ? (e = "=", o++) : (e = null, u === 0 && h('"="')), e === null && (r.charCodeAt(o) === 60 ? (e = "<", o++) : (e = null, u === 0 && h('"<"')), e === null && (r.charCodeAt(o) === 62 ? (e = ">", o++) : (e = null, u === 0 && h('">"')))))))))))))), e
            }

            function k() {
                var e;
                return r.charCodeAt(o) === 37 ? (e = "%", o++) : (e = null, u === 0 && h('"%"')), e
            }

            function L() {
                var e;
                return r.charCodeAt(o) === 45 ? (e = "-", o++) : (e = null, u === 0 && h('"-"')), e === null && (r.charCodeAt(o) === 43 ? (e = "+", o++) : (e = null, u === 0 && h('"+"'))), e
            }

            function A() {
                var e, t, n, i;
                return n = o, i = o, r.charCodeAt(o) === 82 ? (e = "R", o++) : (e = null, u === 0 && h('"R"')), e !== null ? (t = p(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function O() {
                var e, t, n, i;
                return n = o, i = o, r.charCodeAt(o) === 67 ? (e = "C", o++) : (e = null, u === 0 && h('"C"')), e !== null ? (t = p(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function M() {
                var e, n, r, i;
                return r = o, i = o, e = A(), e !== null ? (n = O(), n !== null ? e = [e, n] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, n, r) {
                    return new t.Address(n, r, null, null)
                }(r, e[0], e[1])), e === null && (o = r), e
            }

            function _() {
                var e, t, n;
                n = o, t = m();
                if (t !== null) {
                    e = [];
                    while (t !== null)e.push(t), t = m()
                } else e = null;
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function D() {
                var e, t, n, i;
                return n = o, i = o, r.charCodeAt(o) === 36 ? (e = "$", o++) : (e = null, u === 0 && h('"$"')), e === null && (e = ""), e !== null ? (t = _(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function P() {
                var e, t;
                return t = o, e = p(), e !== null && (e = function (e, t) {
                    return t
                }(t, e)), e === null && (o = t), e
            }

            function H() {
                var e, t, n, i;
                return n = o, i = o, r.charCodeAt(o) === 36 ? (e = "$", o++) : (e = null, u === 0 && h('"$"')), e === null && (e = ""), e !== null ? (t = P(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function B() {
                var e, n, r, i;
                return r = o, i = o, e = D(), e !== null ? (n = H(), n !== null ? e = [e, n] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, n, r) {
                    return new t.Address(r, n, null, null)
                }(r, e[0], e[1])), e === null && (o = r), e
            }

            function j() {
                var e;
                return e = M(), e === null && (e = B()), e
            }

            function F() {
                var e, t, n, i;
                return n = o, i = o, r.charCodeAt(o) === 58 ? (e = ":", o++) : (e = null, u === 0 && h('":"')), e !== null ? (t = M(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function I() {
                var e, n, r, i;
                return r = o, i = o, e = M(), e !== null ? (n = F(), n !== null ? e = [e, n] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, n, r) {
                    return new t.Range(n, r)
                }(r, e[0], e[1])), e === null && (o = r), e
            }

            function q() {
                var e, t, n, i;
                return n = o, i = o, r.charCodeAt(o) === 58 ? (e = ":", o++) : (e = null, u === 0 && h('":"')), e !== null ? (t = B(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function R() {
                var e, n, r, i;
                return r = o, i = o, e = B(), e !== null ? (n = q(), n !== null ? e = [e, n] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, n, r) {
                    return new t.Range(n, r)
                }(r, e[0], e[1])), e === null && (o = r), e
            }

            function U() {
                var e;
                return e = I(), e === null && (e = R()), e
            }

            function z() {
                var e, t, n, r, i;
                return r = o, i = o, e = y(), e !== null ? (t = W(), t !== null ? (n = y(), n !== null ? e = [e, t, n] : (e = null, o = i)) : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(r, e[1])), e === null && (o = r), e
            }

            function W() {
                var e, t, n, r;
                return n = o, r = o, e = X(), e !== null ? (t = V(), t = t !== null ? t : "", t !== null ? e = [e, t] : (e = null, o = r)) : (e = null, o = r), e !== null && (e = function (e, t, n) {
                    return t + n
                }(n, e[0], e[1])), e === null && (o = n), e
            }

            function X() {
                var e, t, n, i, s;
                return n = o, i = o, s = o, u++, r.charCodeAt(o) === 92 ? (e = "\\", o++) : (e = null, u === 0 && h('"\\\\"')), e === null && (e = y(), e === null && (r.charCodeAt(o) === 42 ? (e = "*", o++) : (e = null, u === 0 && h('"*"')), e === null && (r.charCodeAt(o) === 91 ? (e = "[", o++) : (e = null, u === 0 && h('"["')), e === null && (r.charCodeAt(o) === 93 ? (e = "]", o++) : (e = null, u === 0 && h('"]"')), e === null && (r.charCodeAt(o) === 58 ? (e = ":", o++) : (e = null, u === 0 && h('":"')), e === null && (r.charCodeAt(o) === 47 ? (e = "/", o++) : (e = null, u === 0 && h('"/"')), e === null && (r.charCodeAt(o) === 63 ? (e = "?", o++) : (e = null, u === 0 && h('"?"'))))))))), u--, e === null ? e = "" : (e = null, o = s), e !== null ? (t = v(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function V() {
                var e, t, n;
                n = o, t = $();
                if (t !== null) {
                    e = [];
                    while (t !== null)e.push(t), t = $()
                } else e = null;
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function $() {
                var e, t, n, i, s;
                return n = o, i = o, s = o, u++, r.charCodeAt(o) === 92 ? (e = "\\", o++) : (e = null, u === 0 && h('"\\\\"')), e === null && (e = y(), e === null && (r.charCodeAt(o) === 42 ? (e = "*", o++) : (e = null, u === 0 && h('"*"')), e === null && (r.charCodeAt(o) === 91 ? (e = "[", o++) : (e = null, u === 0 && h('"["')), e === null && (r.charCodeAt(o) === 93 ? (e = "]", o++) : (e = null, u === 0 && h('"]"')), e === null && (r.charCodeAt(o) === 58 ? (e = ":", o++) : (e = null, u === 0 && h('":"')), e === null && (r.charCodeAt(o) === 47 ? (e = "/", o++) : (e = null, u === 0 && h('"/"')), e === null && (r.charCodeAt(o) === 63 ? (e = "?", o++) : (e = null, u === 0 && h('"?"'))))))))), u--, e === null ? e = "" : (e = null, o = s), e !== null ? (t = v(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e === null && (n = o, i = o, e = y(), e !== null ? (t = y(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t, n) {
                    return t + n
                }(n, e[0], e[1])), e === null && (o = n)), e
            }

            function J() {
                var e, t;
                return t = o, e = K(), e !== null && (e = function (e, t) {
                    return t
                }(t, e)), e === null && (o = t), e
            }

            function K() {
                var e, t, n;
                n = o, t = Q();
                if (t !== null) {
                    e = [];
                    while (t !== null)e.push(t), t = Q()
                } else e = null;
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function Q() {
                var e, t, n, i, s;
                return n = o, i = o, s = o, u++, e = N(), e === null && (e = y(), e === null && (r.charCodeAt(o) === 91 ? (e = "[", o++) : (e = null, u === 0 && h('"["')), e === null && (r.charCodeAt(o) === 93 ? (e = "]", o++) : (e = null, u === 0 && h('"]"')), e === null && (r.charCodeAt(o) === 63 ? (e = "?", o++) : (e = null, u === 0 && h('"?"')), e === null && (r.charCodeAt(o) === 92 ? (e = "\\", o++) : (e = null, u === 0 && h('"\\\\"')), e === null && (r.charCodeAt(o) === 33 ? (e = "!", o++) : (e = null, u === 0 && h('"!"')))))))), u--, e === null ? e = "" : (e = null, o = s), e !== null ? (t = v(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function G() {
                var e;
                return e = z(), e === null && (e = J()), e
            }

            function Y() {
                var e, t, n, i, s;
                return i = o, s = o, r.charCodeAt(o) === 91 ? (e = "[", o++) : (e = null, u === 0 && h('"["')), e !== null ? (t = Z(), t !== null ? (r.charCodeAt(o) === 93 ? (n = "]", o++) : (n = null, u === 0 && h('"]"')), n !== null ? e = [e, t, n] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, t) {
                    return t
                }(i, e[1])), e === null && (o = i), e
            }

            function Z() {
                var e, t, n;
                n = o, t = et();
                if (t !== null) {
                    e = [];
                    while (t !== null)e.push(t), t = et()
                } else e = null;
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function et() {
                var e, t, n, i, s;
                return n = o, i = o, s = o, u++, e = N(), e === null && (e = y(), e === null && (r.charCodeAt(o) === 91 ? (e = "[", o++) : (e = null, u === 0 && h('"["')), e === null && (r.charCodeAt(o) === 93 ? (e = "]", o++) : (e = null, u === 0 && h('"]"')), e === null && (r.charCodeAt(o) === 63 ? (e = "?", o++) : (e = null, u === 0 && h('"?"')), e === null && (r.charCodeAt(o) === 33 ? (e = "!", o++) : (e = null, u === 0 && h('"!"'))))))), u--, e === null ? e = "" : (e = null, o = s), e !== null ? (t = v(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function tt() {
                var e, t;
                return e = Y(), e === null && (t = o, e = "", e !== null && (e = function (e) {
                    return new n.None
                }(t)), e === null && (o = t)), e
            }

            function nt() {
                var e, n, i, s, a;
                return i = o, s = o, a = o, e = G(), e !== null ? (r.charCodeAt(o) === 33 ? (n = "!", o++) : (n = null, u === 0 && h('"!"')), n !== null ? e = [e, n] : (e = null, o = a)) : (e = null, o = a), e !== null ? (n = U(), n !== null ? e = [e, n] : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, n, r) {
                    return new t.ReferenceRange(n, r)
                }(i, e[0][0], e[1])), e === null && (o = i), e
            }

            function rt() {
                var e, n;
                return n = o, e = U(), e !== null && (e = function (e, n) {
                    return new t.ReferenceRange(null, n)
                }(n, e)), e === null && (o = n), e
            }

            function it() {
                var e;
                return e = nt(), e === null && (e = rt()), e
            }

            function st() {
                var e, n, i, s, a;
                return s = o, a = o, e = G(), e !== null ? (r.charCodeAt(o) === 33 ? (n = "!", o++) : (n = null, u === 0 && h('"!"')), n !== null ? (i = j(), i !== null ? e = [e, n, i] : (e = null, o = a)) : (e = null, o = a)) : (e = null, o = a), e !== null && (e = function (e, n, r) {
                    return new t.ReferenceAddress(n, r)
                }(s, e[0], e[2])), e === null && (o = s), e
            }

            function ot() {
                var e, n;
                return n = o, e = j(), e !== null && (e = function (e, n) {
                    return new t.ReferenceAddress(null, n)
                }(n, e)), e === null && (o = n), e
            }

            function ut() {
                var e;
                return e = st(), e === null && (e = ot()), e
            }

            function at() {
                var e, n, r, i, s;
                return i = o, s = o, e = ft(), e = e !== null ? e : "", e !== null ? (n = lt(), n !== null ? (r = ct(), r !== null ? e = [e, n, r] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, n, r, i) {
                    var s = new t.ReferenceNamed(null, r + i);
                    return n !== "" && (s.WorkbookName = n), s
                }(i, e[0], e[1], e[2])), e === null && (o = i), e
            }

            function ft() {
                var e, t, n, i;
                return n = o, i = o, e = Z(), e !== null ? (r.charCodeAt(o) === 33 ? (t = "!", o++) : (t = null, u === 0 && h('"!"')), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[0])), e === null && (o = n), e
            }

            function lt() {
                var e;
                return e = m(), e === null && (e = b(), e === null && (e = w())), e
            }

            function ct() {
                var e, t, n;
                n = o, e = [], t = ht();
                while (t !== null)e.push(t), t = ht();
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function ht() {
                var e;
                return e = m(), e === null && (e = g(), e === null && (e = b(), e === null && (e = E()))), e
            }

            function pt() {
                var e, n, i, s, a;
                return s = o, a = o, r.charCodeAt(o) === 123 ? (e = "{", o++) : (e = null, u === 0 && h('"{"')), e !== null ? (n = dt(), n !== null ? (r.charCodeAt(o) === 125 ? (i = "}", o++) : (i = null, u === 0 && h('"}"')), i !== null ? e = [e, n, i] : (e = null, o = a)) : (e = null, o = a)) : (e = null, o = a), e !== null && (e = function (e, n) {
                    if (n.length == 0)return null;
                    var r = n[0].length;
                    for (var i = 1; i < n.length; i++)if (n[i].length !== r)return null;
                    return new t.ConstantArray(null, n)
                }(s, e[1])), e === null && (o = s), e
            }

            function dt() {
                var e, t, n, i, s, a, f, l;
                s = o, a = o, f = o, e = vt();
                if (e !== null) {
                    t = [], l = o, r.charCodeAt(o) === 59 ? (n = ";", o++) : (n = null, u === 0 && h('";"')), n !== null ? (i = vt(), i !== null ? n = [n, i] : (n = null, o = l)) : (n = null, o = l);
                    while (n !== null)t.push(n), l = o, r.charCodeAt(o) === 59 ? (n = ";", o++) : (n = null, u === 0 && h('";"')), n !== null ? (i = vt(), i !== null ? n = [n, i] : (n = null, o = l)) : (n = null, o = l);
                    t !== null ? e = [e, t] : (e = null, o = f)
                } else e = null, o = f;
                return e !== null && (e = function (e, t, n) {
                    var r = [t];
                    for (var i = 0; i < n.length; i++)r.push(n[i][1]);
                    return r
                }(a, e[0], e[1])), e === null && (o = a), e = e !== null ? e : "", e !== null && (e = function (e, t) {
                    return t == "" ? [] : t
                }(s, e)), e === null && (o = s), e
            }

            function vt() {
                var e, t, n, i, s, a, f, l;
                s = o, a = o, f = o, e = mt();
                if (e !== null) {
                    t = [], l = o, r.charCodeAt(o) === 44 ? (n = ",", o++) : (n = null, u === 0 && h('","')), n !== null ? (i = mt(), i !== null ? n = [n, i] : (n = null, o = l)) : (n = null, o = l);
                    while (n !== null)t.push(n), l = o, r.charCodeAt(o) === 44 ? (n = ",", o++) : (n = null, u === 0 && h('","')), n !== null ? (i = mt(), i !== null ? n = [n, i] : (n = null, o = l)) : (n = null, o = l);
                    t !== null ? e = [e, t] : (e = null, o = f)
                } else e = null, o = f;
                return e !== null && (e = function (e, t, n) {
                    var r = [t];
                    for (var i = 0; i < n.length; i++)r.push(n[i][1]);
                    return r
                }(a, e[0], e[1])), e === null && (o = a), e = e !== null ? e : "", e !== null && (e = function (e, t) {
                    return t == "" ? [] : t
                }(s, e)), e === null && (o = s), e
            }

            function mt() {
                var e, n, i, s;
                return i = o, s = o, r.charCodeAt(o) === 43 ? (e = "+", o++) : (e = null, u === 0 && h('"+"')), e === null && (r.charCodeAt(o) === 45 ? (e = "-", o++) : (e = null, u === 0 && h('"-"'))), e = e !== null ? e : "", e !== null ? (n = wt(), n !== null ? e = [e, n] : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, n, r) {
                    return n ? new t.UnaryOpExpr(n, r) : r
                }(i, e[0], e[1])), e === null && (o = i), e === null && (e = Ct(), e === null && (e = Nt(), e === null && (e = gt()))), e
            }

            function gt() {
                var e, n, r, i, s;
                return i = o, s = o, e = S(), e !== null ? (n = yt(), n = n !== null ? n : "", n !== null ? (r = S(), r !== null ? e = [e, n, r] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, n) {
                    return new t.ConstantString(null, n)
                }(i, e[1])), e === null && (o = i), e
            }

            function yt() {
                var e, t, n;
                n = o, t = bt();
                if (t !== null) {
                    e = [];
                    while (t !== null)e.push(t), t = bt()
                } else e = null;
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function bt() {
                var e, t, n, i, s;
                return n = o, i = o, s = o, u++, e = S(), u--, e === null ? e = "" : (e = null, o = s), e !== null ? (t = v(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e === null && (n = o, r.substr(o, 2) === '""' ? (e = '""', o += 2) : (e = null, u === 0 && h('"\\"\\""')), e !== null && (e = function (e) {
                    return'"'
                }(n)), e === null && (o = n)), e
            }

            function wt() {
                var e, n;
                return n = o, e = Et(), e !== null && (e = function (e, n) {
                    return new t.ConstantNumber(null, n)
                }(n, e)), e === null && (o = n), e
            }

            function Et() {
                var e, t, n, r, i, s;
                return i = o, s = o, e = Tt(), e !== null ? (t = E(), t !== null ? (n = Tt(), n !== null ? (r = St(), r = r !== null ? r : "", r !== null ? e = [e, t, n, r] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, t, n, r, i) {
                    return parseFloat(t + n + r + i)
                }(i, e[0], e[1], e[2], e[3])), e === null && (o = i), e === null && (i = o, s = o, e = Tt(), e !== null ? (t = E(), t = t !== null ? t : "", t !== null ? (n = St(), n = n !== null ? n : "", n !== null ? e = [e, t, n] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, t, n, r) {
                    return parseFloat(t + n + r)
                }(i, e[0], e[1], e[2])), e === null && (o = i), e === null && (i = o, s = o, e = E(), e !== null ? (t = Tt(), t !== null ? (n = St(), n = n !== null ? n : "", n !== null ? e = [e, t, n] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, t, n, r) {
                    return parseFloat(t + n + r)
                }(i, e[0], e[1], e[2])), e === null && (o = i))), e
            }

            function St() {
                var e, t, n, i, s;
                return i = o, s = o, r.charCodeAt(o) === 101 ? (e = "e", o++) : (e = null, u === 0 && h('"e"')), e === null && (r.charCodeAt(o) === 69 ? (e = "E", o++) : (e = null, u === 0 && h('"E"'))), e !== null ? (t = xt(), t = t !== null ? t : "", t !== null ? (n = Tt(), n !== null ? e = [e, t, n] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, t, n, r) {
                    return t + n + r
                }(i, e[0], e[1], e[2])), e === null && (o = i), e
            }

            function xt() {
                var e;
                return r.charCodeAt(o) === 43 ? (e = "+", o++) : (e = null, u === 0 && h('"+"')), e === null && (r.charCodeAt(o) === 45 ? (e = "-", o++) : (e = null, u === 0 && h('"-"'))), e
            }

            function Tt() {
                var e, t, n;
                n = o, t = g();
                if (t !== null) {
                    e = [];
                    while (t !== null)e.push(t), t = g()
                } else e = null;
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function Nt() {
                var e, n;
                return n = o, r.substr(o, 5) === "FALSE" ? (e = "FALSE", o += 5) : (e = null, u === 0 && h('"FALSE"')), e === null && (r.substr(o, 4) === "TRUE" ? (e = "TRUE", o += 4) : (e = null, u === 0 && h('"TRUE"'))), e !== null && (e = function (e, n) {
                    return new t.ConstantLogical(null, n)
                }(n, e)), e === null && (o = n), e
            }

            function Ct() {
                var e, n;
                return n = o, r.substr(o, 7) === "#DIV/0!" ? (e = "#DIV/0!", o += 7) : (e = null, u === 0 && h('"#DIV/0!"')), e === null && (r.substr(o, 4) === "#N/A" ? (e = "#N/A", o += 4) : (e = null, u === 0 && h('"#N/A"')), e === null && (r.substr(o, 6) === "#NAME?" ? (e = "#NAME?", o += 6) : (e = null, u === 0 && h('"#NAME?"')), e === null && (r.substr(o, 6) === "#NULL!" ? (e = "#NULL!", o += 6) : (e = null, u === 0 && h('"#NULL!"')), e === null && (r.substr(o, 5) === "#NUM!" ? (e = "#NUM!", o += 5) : (e = null, u === 0 && h('"#NUM!"')), e === null && (r.substr(o, 5) === "#REF!" ? (e = "#REF!", o += 5) : (e = null, u === 0 && h('"#REF!"')), e === null && (r.substr(o, 7) === "#VALUE!" ? (e = "#VALUE!", o += 7) : (e = null, u === 0 && h('"#VALUE!"')), e === null && (r.substr(o, 13) === "#GETTING_DATA" ? (e = "#GETTING_DATA", o += 13) : (e = null, u === 0 && h('"#GETTING_DATA"'))))))))), e !== null && (e = function (e, n) {
                    return new t.ConstantError(null, n)
                }(n, e)), e === null && (o = n), e
            }

            function kt() {
                var e;
                return e = Ct(), e === null && (e = Nt(), e === null && (e = wt(), e === null && (e = gt(), e === null && (e = pt())))), e
            }

            function Lt() {
                var e;
                return e = it(), e === null && (e = ut()), e
            }

            function At() {
                var e, t, n, r;
                return n = o, r = o, e = tt(), e !== null ? (t = Lt(), t !== null ? e = [e, t] : (e = null, o = r)) : (e = null, o = r), e !== null && (e = function (e, t, n) {
                    return n.WorkbookName = t, n
                }(n, e[0], e[1])), e === null && (o = n), e === null && (e = at()), e
            }

            function Ot() {
                var e, n, i, s, a;
                return s = o, a = o, r.charCodeAt(o) === 40 ? (e = "(", o++) : (e = null, u === 0 && h('"("')), e !== null ? (n = Ft(), n !== null ? (r.charCodeAt(o) === 41 ? (i = ")", o++) : (i = null, u === 0 && h('")"')), i !== null ? e = [e, n, i] : (e = null, o = a)) : (e = null, o = a)) : (e = null, o = a), e !== null && (e = function (e, n) {
                    return new t.ParensExpr(n)
                }(s, e[1])), e === null && (o = s), e
            }

            function Mt() {
                var e, t, n;
                n = o, t = m(), t === null && (r.charCodeAt(o) === 46 ? (t = ".", o++) : (t = null, u === 0 && h('"."')));
                if (t !== null) {
                    e = [];
                    while (t !== null)e.push(t), t = m(), t === null && (r.charCodeAt(o) === 46 ? (t = ".", o++) : (t = null, u === 0 && h('"."')))
                } else e = null;
                return e !== null && (e = function (e, t) {
                    return t.join("")
                }(n, e)), e === null && (o = n), e
            }

            function _t() {
                var e, n, i, s, a, f;
                return a = o, f = o, e = Mt(), e !== null ? (r.charCodeAt(o) === 40 ? (n = "(", o++) : (n = null, u === 0 && h('"("')), n !== null ? (i = Dt(), i !== null ? (r.charCodeAt(o) === 41 ? (s = ")", o++) : (s = null, u === 0 && h('")"')), s !== null ? e = [e, n, i, s] : (e = null, o = f)) : (e = null, o = f)) : (e = null, o = f)) : (e = null, o = f), e !== null && (e = function (e, n, r) {
                    return new t.ReferenceFunction(null, n, r)
                }(a, e[0], e[2])), e === null && (o = a), e
            }

            function Dt() {
                var e, t, n, i, s, a, f, l;
                s = o, a = o, f = o, e = Ft();
                if (e !== null) {
                    t = [], l = o, r.charCodeAt(o) === 44 ? (n = ",", o++) : (n = null, u === 0 && h('","')), n === null && (r.charCodeAt(o) === 59 ? (n = ";", o++) : (n = null, u === 0 && h('";"'))), n !== null ? (i = Ft(), i !== null ? n = [n, i] : (n = null, o = l)) : (n = null, o = l);
                    while (n !== null)t.push(n), l = o, r.charCodeAt(o) === 44 ? (n = ",", o++) : (n = null, u === 0 && h('","')), n === null && (r.charCodeAt(o) === 59 ? (n = ";", o++) : (n = null, u === 0 && h('";"'))), n !== null ? (i = Ft(), i !== null ? n = [n, i] : (n = null, o = l)) : (n = null, o = l);
                    t !== null ? e = [e, t] : (e = null, o = f)
                } else e = null, o = f;
                return e !== null && (e = function (e, t, n) {
                    var r = [t];
                    for (var i = 0; i < n.length; i++)r.push(n[i][1]);
                    return r
                }(a, e[0], e[1])), e === null && (o = a), e = e !== null ? e : "", e !== null && (e = function (e, t) {
                    return t == "" ? [] : t
                }(s, e)), e === null && (o = s), e
            }

            function Pt() {
                var e, t, n, i;
                return n = o, i = o, r.charCodeAt(o) === 61 ? (e = "=", o++) : (e = null, u === 0 && h('"="')), e !== null ? (t = Ft(), t !== null ? e = [e, t] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, t) {
                    return t
                }(n, e[1])), e === null && (o = n), e
            }

            function Ht() {
                var e, n;
                return n = o, e = kt(), e !== null && (e = function (e, n) {
                    return new t.ReferenceExpr(n)
                }(n, e)), e === null && (o = n), e === null && (n = o, e = _t(), e !== null && (e = function (e, n) {
                    return new t.ReferenceExpr(n)
                }(n, e)), e === null && (o = n), e === null && (n = o, e = At(), e !== null && (e = function (e, n) {
                    return new t.ReferenceExpr(n)
                }(n, e)), e === null && (o = n))), e
            }

            function Bt() {
                var e, n, r, i;
                return r = o, i = o, e = L(), e !== null ? (n = Ft(), n !== null ? e = [e, n] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, n, r) {
                    var i = function (e) {
                        return e instanceof t.BinOpExpr ? (e.Left = i(e.Left), e) : new t.UnaryOpExpr(n, e)
                    };
                    return r = i(r), r
                }(r, e[0], e[1])), e === null && (o = r), e
            }

            function jt() {
                var e;
                return e = Bt(), e === null && (e = Ht(), e === null && (e = Ot())), e
            }

            function Ft() {
                var e, n, r, i;
                return r = o, i = o, e = jt(), e !== null ? (n = It(), n !== null ? e = [e, n] : (e = null, o = i)) : (e = null, o = i), e !== null && (e = function (e, n, r) {
                    var i = null, s, o = r.postfix.length;
                    if (o > 0) {
                        i = new t.PostfixOpExpr(r.postfix[o - 1], n), o--;
                        for (s = o - 1; s >= 0; s--)i = new t.PostfixOpExpr(r.postfix[s], i)
                    } else i = n;
                    return typeof r.infix != "undefined" && (i = new t.BinOpExpr(r.infix, i, r.expression)), i
                }(r, e[0], e[1])), e === null && (o = r), e === null && (r = o, e = jt(), e !== null && (e = function (e, t) {
                    return t
                }(r, e)), e === null && (o = r)), e
            }

            function It() {
                var e, n, r, i, s;
                return i = o, s = o, e = k(), e !== null ? (n = It(), n !== null ? e = [e, n] : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, t, n) {
                    return n.opt === 2 ? n.postfix.push(t) : n.opt === 4 ? n.postfix[0] = t : n.opt === 3 ? n.postfix.push(t) : n.opt === 1 && n.postfix.push(t), n.opt = 1, n
                }(i, e[0], e[1])), e === null && (o = i), e === null && (i = o, e = k(), e !== null && (e = function (e, t) {
                    return{opt: 2, postfix: [t]}
                }(i, e)), e === null && (o = i), e === null && (i = o, s = o, e = C(), e !== null ? (n = Ft(), n !== null ? e = [e, n] : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, t, n) {
                    return{opt: 4, infix: t, postfix: [], expression: n}
                }(i, e[0], e[1])), e === null && (o = i), e === null && (i = o, s = o, e = C(), e !== null ? (n = Ft(), n !== null ? (r = It(), r !== null ? e = [e, n, r] : (e = null, o = s)) : (e = null, o = s)) : (e = null, o = s), e !== null && (e = function (e, n, r, i) {
                    if (i.opt === 2)i.expression = new t.PostfixOpExpr(i.postfix[0], r), i.infix = n, i.postfix = []; else if (i.opt == 4)i.expression = new t.BinOpExpr(i.infix, r, i.expression), i.infix = n, i.postfix = []; else if (i.opt == 3)i.expression = new t.BinOpExpr(i.infix, r, i.expression), i.infix = n, i.postfix = []; else if (i.opt == 1) {
                        var s = null, o, u = i.postfix.length;
                        if (u > 0) {
                            s = new t.PostfixOpExpr(i.postfix[u - 1], r), u--;
                            for (o = u - 1; o >= 0; o--)s = new t.PostfixOpExpr(i.postfix[o], s)
                        } else s = r;
                        typeof i.infix != "undefined" && (s = new t.BinOpExpr(i.infix, s, i.expression)), i.expression = s, i.infix = n, i.postfix = []
                    }
                    return i.opt = 3, i
                }(i, e[0], e[1], e[2])), e === null && (o = i)))), e
            }

            function qt(e) {
                e.sort();
                var t = null, n = [];
                for (var r = 0; r < e.length; r++)e[r] !== t && (n.push(e[r]), t = e[r]);
                return n
            }

            function Rt() {
                var e = 1, t = 1, n = !1;
                for (var i = 0; i < Math.max(o, a); i++) {
                    var s = r.charAt(i);
                    s === "\n" ? (n || e++, t = 1, n = !1) : s === "\r" || s === "\u2028" || s === "\u2029" ? (e++, t = 1, n = !0) : (t++, n = !1)
                }
                return{line: e, column: t}
            }

            var s = {Int32: p, AsciiUpper: d, character: v, letter: m, digit: g, apostrophe: y, underscore: b, backslash: w, full_stop: E, double_quote: S, comma: x, space: T, operator: N, infix_operator: C, postfix_operator: k, prefix_operator: L, AddrR: A, AddrC: O, AddrR1C1: M, AddrA: _, AddrAAbs: D, Addr1: P, Addr1Abs: H, AddrA1: B, AnyAddr: j, MoreAddrR1C1: F, RangeR1C1: I, MoreAddrA1: q, RangeA1: R, RangeAny: U, WorksheetNameQuoted: z, sheet_name_special: W, sheet_name_start_character_special: X, sheet_name_characters_special: V, sheet_name_character_special: $, WorksheetNameUnquoted: J, sheet_name: K, sheet_name_character: Q, WorksheetName: G, WorkbookName: Y, workbook_name: Z, book_name_character: et, Workbook: tt, RangeReferenceWorksheet: nt, RangeReferenceNoWorksheet: rt, RangeReference: it, AddressReferenceWorksheet: st, AddressReferenceNoWorksheet: ot, AddressReference: ut, NamedReference: at, NamedReferenceBook: ft, NamedReferenceFirstChar: lt, NamedReferenceLastChars: ct, NamedReferenceCharacters: ht, ArrayConstant: pt, constant_list_rows: dt, constant_list_row: vt, array_constant: mt, StringConstant: gt, StringChars: yt, StringChar: bt, NumericalConstant: wt, numerical_constant: Et, exponent_part: St, sign: xt, digit_sequence: Tt, LogicalConstant: Nt, ErrorConstant: Ct, Constant: kt, ReferenceKinds: Lt, Reference: At, ParensExpr: Ot, FunctionName: Mt, Function: _t, ArgumentList: Dt, Formula: Pt, ExpressionAtom: Ht, PrefixExpression: Bt, ExpressionSimple: jt, Expression: Ft, aux: It};
            if (i !== undefined) {
                if (s[i] === undefined)throw new Error("Invalid rule name: " + e(i) + ".")
            } else i = "Int32";
            var o = 0, u = 0, a = 0, f = [], Ut = s[i]();
            if (Ut === null || o !== r.length) {
                var zt = Math.max(o, a), Wt = zt < r.length ? r.charAt(zt) : null, Xt = Rt();
                throw new this.SyntaxError(qt(f), Wt, zt, Xt.line, Xt.column)
            }
            return Ut
        }, toSource: function () {
            return this._source
        }};
        return r.SyntaxError = function (t, n, r, i, s) {
            function o(t, n) {
                var r, i;
                switch (t.length) {
                    case 0:
                        r = "end of input";
                        break;
                    case 1:
                        r = t[0];
                        break;
                    default:
                        r = t.slice(0, t.length - 1).join(", ") + " or " + t[t.length - 1]
                }
                return i = n ? e(n) : "end of input", "Expected " + r + " but " + i + " found."
            }

            this.name = "SyntaxError", this.expected = t, this.found = n, this.message = o(t, n), this.offset = r, this.line = i, this.column = s
        }, r.SyntaxError.prototype = Error.prototype, r
    }();
    return r
}), define("XClasses/XLogger", [], function () {
    return typeof SpreadsheetApp != "undefined" ? Logger : console
}), define("Parser/Parser", ["Parser/AST/AST", "FSharp/FSharp", "Parser/PEGParser", "XClasses/XLogger"], function (e, t, n, r) {
    var i = {};
    return i.no_ws = function (e) {
        return e.replace(/\s+/g, "")
    }, i.getAddress = function (e, r, i) {
        var s;
        try {
            return s = n.parse(this.no_ws(e), "AddrR1C1"), s.WorkbookName = r.Name, s.WorksheetName = i.Name, s
        } catch (o) {
            return new t.None
        }
    }, i.getRange = function (e) {
        try {
            return n.parse(this.no_ws(e), "RangeR1C1")
        } catch (r) {
            return new t.None
        }
    }, i.getAddressReference = function (e, i, s) {
        var o;
        try {
            return o = n.parse(this.no_ws(e), "ReferenceKinds"), o.Resolve(i, s), o
        } catch (u) {
            return r.log("getAddressReference\n" + u), new t.None
        }
    }, i.getReference = function (e, r, i) {
        var s;
        try {
            return s = n.parse(this.no_ws(e), "Reference"), s.Resolve(r, i), s
        } catch (o) {
            return new t.None
        }
    }, i.parseFormula = function (e, i, s) {
        var o;
        try {
            return o = n.parse(this.no_ws(e), "Formula"), o.Resolve(i, s), o.fixAssoc(), o
        } catch (u) {
            return r.log("Parse formula error " + u), new t.None
        }
    }, i.isNumber = function (e) {
        return!isNaN(parseFloat(e)) && isFinite(e)
    }, i._extractNamedRanges = function (t) {
        var n = [], r;
        if (t instanceof e.Address || t instanceof e.ConstantArray || t instanceof e.ConstantError || t instanceof e.ConstantLogical || t instanceof e.ConstantNumber || t instanceof e.ConstantString || t instanceof e.Range || t instanceof e.ReferenceAddress || t instanceof e.ReferenceRange)return[];
        if (t instanceof e.ReferenceNamed)return[t];
        if (t instanceof e.BinOpExpr)return this._extractNamedRanges(t.Left).concat(this._extractNamedRanges(t.Right));
        if (t instanceof e.ParensExpr)return this._extractNamedRanges(t.Expr);
        if (t instanceof e.PostfixOpExpr)return this._extractNamedRanges(t.Expr);
        if (t instanceof e.ReferenceExpr)return this._extractNamedRanges(t.Ref);
        if (t instanceof e.ReferenceFunction) {
            for (r = 0; r < t.ArgumentList.length; r++)n = n.concat(this._extractNamedRanges(t.ArgumentList[r]));
            return n
        }
        if (t instanceof e.UnaryOpExpr)return this._extractNamedRanges(t.Expr);
        throw Error("Unsupported type")
    }, i._extractImportRange = function (t) {
        var n = [], r;
        if (t instanceof e.Address || t instanceof e.ConstantArray || t instanceof e.ConstantError || t instanceof e.ConstantLogical || t instanceof e.ConstantNumber || t instanceof e.ConstantString || t instanceof e.Range || t instanceof e.ReferenceAddress || t instanceof e.ReferenceNamed || t instanceof e.ReferenceRange)return[];
        if (t instanceof e.BinOpExpr)return this._extractImportRange(t.Left).concat(this._extractImportRange(t.Right));
        if (t instanceof e.ParensExpr)return this._extractImportRange(t.Expr);
        if (t instanceof e.PostfixOpExpr)return this._extractImportRange(t.Expr);
        if (t instanceof e.ReferenceExpr)return this._extractImportRange(t.Ref);
        if (t instanceof e.ReferenceFunction) {
            if (t.FunctionName == "ImportRange")return[t];
            for (r = 0; r < t.ArgumentList.length; r++)n = n.concat(this._extractImportRange(t.ArgumentList[r]));
            return n
        }
        if (t instanceof e.UnaryOpExpr)return this._extractImportRange(t.Expr);
        throw Error("Unsupported type")
    }, i
});