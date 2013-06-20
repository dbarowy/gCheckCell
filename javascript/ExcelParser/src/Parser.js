var Parser;
Parser = (function () {
    var __hasProp = {}.hasOwnProperty,
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
    var grammar = 'Int32 = s:[+-]?number: ( oct:("0"[oO][0-7]+) { var res=[]; for(var i=0; i<oct.length; i++) if(oct[i] instanceof Array) res.push(oct[i].join("")); else res.push(oct[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 8);} / b:("0"[bB][01]+) { var res=[]; for(var i=0; i<b.length; i++) if(b[i] instanceof Array) res.push(b[i].join("")); else res.push(b[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 2);} / h:("0"[xX][0-9a-fA-F]+) { var res=[]; for(var i=0; i<h.length; i++) if(h[i] instanceof Array) res.push(h[i].join("")); else res.push(h[i]); var a = res.join(""); return parseInt(a, 16);} / d:[0-9]+ {return d.join("");}  ) {return parseInt(s+number);}; AsciiUpper = [A-Z]; character = [^\ufffe-\uffff] ; letter = [a-z] / [A-Z]; digit = [0-9]; AddrR = "R" r:Int32 { return r;}; AddrC = "C" r:Int32 {return r;}; AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);}; AddrA = r: (AsciiUpper + ) {return r.join("");}; AddrAAbs = ("$" / "") r:AddrA {return r;}; Addr1 = r:Int32 {return r;}; Addr1Abs = ("$" / "") r:Addr1 {return r;}; AddrA1 = l:AddrAAbs r:Addr1Abs {return new AST.Address(r, l, null, null);}; AnyAddr = AddrR1C1 / AddrA1; MoreAddrR1C1 = ":" r:AddrR1C1 { return r;}; RangeR1C1 = r:AddrR1C1 l:MoreAddrR1C1 {return new AST.Range(r, l);}; MoreAddrA1 = ":" r:AddrA1 {return r;}; RangeA1 = r:AddrA1 l:MoreAddrA1 {return new AST.Range(r, l);}; RangeAny = RangeR1C1 / RangeA1; WorksheetNameQuoted = "\'" r:((! "\'" character )+) "\'" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; WorksheetNameUnquoted = r:((digit / letter) + ) {return r.join("");}; WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted; WorkbookName = "[" r:((! ("["/"]") character )+) "]" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; Workbook = WorkbookName / "" {return new FSharp.None();}; RangeReferenceWorksheet =  (wsname:WorksheetName "!") rng:RangeAny {return new AST.ReferenceRange(wsname, rng);}; RangeReferenceNoWorksheet = rng:RangeAny {return new AST.ReferenceRange(null, rng);}; RangeReference = RangeReferenceWorksheet / RangeReferenceNoWorksheet; AddressReferenceWorksheet = wsname:WorksheetName "!" addr:AnyAddr {return new AST.ReferenceAddress(wsname, addr);}; AddressReferenceNoWorksheet = addr:AnyAddr {return new AST.ReferenceAddress(null, addr);}; AddressReference = AddressReferenceWorksheet / AddressReferenceNoWorksheet; NamedReferenceFirstChar = "_" / letter; NamedReferenceLastChars = r:(("_" / letter / digit) *){return r.join("");}; NamedReference = c:NamedReferenceFirstChar s:NamedReferenceLastChars {return new AST.ReferenceNamed(null, c+s);}; StringReference = ["] r:(!["] character) + ["] { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return new AST.ReferenceString(null, res.join(""));}; ConstantReference = r:Int32 {return new AST.ReferenceConstant(null, r);}; ReferenceKinds = RangeReference / AddressReference / ConstantReference / StringReference / NamedReference; Reference = w:Workbook ref:ReferenceKinds {ref.WorkbookName = w; return ref;}; BinOpChar = "+" / "-" / "*" / "<" / ">"; BinOp2Char = "<="; BinOpLong = op:BinOp2Char exp:ExpressionDecl {return {operator:op, expression:exp};}; BinOpShort = op:BinOpChar exp:ExpressionDecl {return {operator:op, expression:exp};}; BinOp = BinOpLong / BinOpShort; UnaryOpChar = "+" / "-"; ParensExpr = "(" exp:ExpressionDecl ")" {return new AST.ParensExpr(exp);}; ExpressionAtom = fn:Function {return new AST.ReferenceExpr(fn);} / ref:Reference{return new AST.ReferenceExpr(ref);}; ExpressionSimple = ExpressionAtom /  ParensExpr; UnaryOpExpr = op:UnaryOpChar exp:ExpressionDecl {return new AST.UnaryOpExpr(op,exp);}; BinOpExpr = exp:ExpressionSimple lhs:BinOp {return new AST.BinOpExpr(lhs.operator, exp, lhs.expression);} ExpressionDecl =  UnaryOpExpr / BinOpExpr / ExpressionSimple; FunctionName = r:((letter / ".") +) {return r.join("");}; Function =  f:FunctionName "(" args:ArgumentList ")" {return new AST.ReferenceFunction(null, f, args);} ; ArgumentList = res:((hd:ExpressionDecl tl:("," ExpressionDecl) * {var a=[hd]; for(i=0; i< tl.length; i++) a.push(tl[i][1]); return a; }) ?) {return res==""?[]:res;} Formula = "=" res:ExpressionDecl{return res;}; ';
    var AddrR1C1 = PEG.buildParser("start=AddrR1C1;" + grammar);
    var RangeR1C1 = PEG.buildParser("start=RangeR1C1;" + grammar);
    var Reference = PEG.buildParser("start=Reference;" + grammar);
    var Formula = PEG.buildParser("start=Formula;" + grammar);

    function Parser() {
    }

    //Take another look at the following 2 methods
    Parser.prototype.RefAddrResolve = function (/*Reference*/ref, /*Workbook*/wb, /*Worksheet*/ws) {
        return ref.Resolve(wb, ws);
    };

    Parser.prototype.ExprAddrResolve = function (/*Expression*/expr, /*Workbook*/wb, /*Worksheet*/ws) {
        if (expr instanceof AST.ReferenceExpr){
            this.RefAddrResolve(expr.Ref, wb, ws);
        }
        if (expr instanceof  AST.BinOpExpr) {
            this.ExprAddrResolve(expr.Expr1, wb, ws);
            this.ExprAddrResolve(expr.Expr2, wb, ws);
        }
        if(expr instanceof AST.UnaryOpExpr){
            this.ExprAddrResolve(expr.Expr, wb,ws);
        }
        if(expr instanceof AST.ParensExpr){
            this.ExprAddrResolve(expr.Expr);
        }
    };

    Parser.prototype.no_ws = function (/*string*/str) {
        return str.replace(" ", "");
    };
    Parser.prototype.GetAddress = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var address;
        try {
            address = AddrR1C1.parse(this.no_ws(str));
            address.WorkbookName = wb.Name;
            address.WorksheetName = ws.Name;
            return address;
        } catch (e) {
            return new FSharp.None();
        }
    };
    Parser.prototype.GetRange = function (/*string*/str) {
        var range;
        try {
            range = RangeR1C1.parse(this.no_ws(str));
            return range;
        } catch (e) {
            return new FSharp.None();
        }
    };
    Parser.prototype.GetReference = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var reference;
        try {
            reference = Reference.parse(this.no_ws(str));
            this.RefAddrResolve(reference, wb, ws);
            return reference;
        } catch (e) {
            return new FSharp.None();
        }
    };
    Parser.prototype.ParseFormula = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var formula;
        try {
            formula = Formula.parse(this.no_ws(str));
            this.ExprAddrResolve(formula, wb, ws);
            return formula;
        } catch (e) {
            return new FSharp.None();
        }
    };
    //TODO this seems inefficient
    Parser.prototype.isNumeric = function (/*string*/str) {
        return !isNaN(str);
    };

    return Parser;
})();