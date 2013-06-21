/**
 * Author: Alexandru Toader
 */

var Parser;
Parser = (function () {
    "use strict";
    var grammar = 'Int32 = s:[+-]?number: ( oct:("0"[oO][0-7]+) { var res=[]; for(var i=0; i<oct.length; i++) if(oct[i] instanceof Array) res.push(oct[i].join("")); else res.push(oct[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 8);} / b:("0"[bB][01]+) { var res=[]; for(var i=0; i<b.length; i++) if(b[i] instanceof Array) res.push(b[i].join("")); else res.push(b[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 2);} / h:("0"[xX][0-9a-fA-F]+) { var res=[]; for(var i=0; i<h.length; i++) if(h[i] instanceof Array) res.push(h[i].join("")); else res.push(h[i]); var a = res.join(""); return parseInt(a, 16);} / d:[0-9]+ {return d.join("");}  ) {return parseInt(s+number);}; AsciiUpper = [A-Z]; character = [^\ufffe-\uffff] ; letter = [a-z] / [A-Z]; digit = [0-9]; AddrR = "R" r:Int32 { return r;}; AddrC = "C" r:Int32 {return r;}; AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);}; AddrA = r: (AsciiUpper + ) {return r.join("");}; AddrAAbs = ("$" / "") r:AddrA {return r;}; Addr1 = r:Int32 {return r;}; Addr1Abs = ("$" / "") r:Addr1 {return r;}; AddrA1 = l:AddrAAbs r:Addr1Abs {return new AST.Address(r, l, null, null);}; AnyAddr = AddrR1C1 / AddrA1; MoreAddrR1C1 = ":" r:AddrR1C1 { return r;}; RangeR1C1 = r:AddrR1C1 l:MoreAddrR1C1 {return new AST.Range(r, l);}; MoreAddrA1 = ":" r:AddrA1 {return r;}; RangeA1 = r:AddrA1 l:MoreAddrA1 {return new AST.Range(r, l);}; RangeAny = RangeR1C1 / RangeA1; WorksheetNameQuoted = "\'" r:((! "\'" character )+) "\'" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; WorksheetNameUnquoted = r:((digit / letter) + ) {return r.join("");}; WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted; WorkbookName = "[" r:((! ("["/"]") character )+) "]" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; Workbook = WorkbookName / "" {return new FSharp.None();}; RangeReferenceWorksheet =  (wsname:WorksheetName "!") rng:RangeAny {return new AST.ReferenceRange(wsname, rng);}; RangeReferenceNoWorksheet = rng:RangeAny {return new AST.ReferenceRange(null, rng);}; RangeReference = RangeReferenceWorksheet / RangeReferenceNoWorksheet; AddressReferenceWorksheet = wsname:WorksheetName "!" addr:AnyAddr {return new AST.ReferenceAddress(wsname, addr);}; AddressReferenceNoWorksheet = addr:AnyAddr {return new AST.ReferenceAddress(null, addr);}; AddressReference = AddressReferenceWorksheet / AddressReferenceNoWorksheet; NamedReferenceFirstChar = "_" / letter; NamedReferenceLastChars = r:(("_" / letter / digit) *){return r.join("");}; NamedReference = c:NamedReferenceFirstChar s:NamedReferenceLastChars {return new AST.ReferenceNamed(null, c+s);}; StringReference = ["] r:(!["] character) + ["] { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return new AST.ReferenceString(null, res.join(""));}; ConstantReference = r:Int32 {return new AST.ReferenceConstant(null, r);}; ReferenceKinds = RangeReference / AddressReference / ConstantReference / StringReference / NamedReference; Reference = w:Workbook ref:ReferenceKinds {ref.WorkbookName = w; return ref;}; BinOpChar = "+" / "-" / "*" / "<" / ">"; BinOp2Char = "<="; BinOpLong = op:BinOp2Char exp:ExpressionDecl {return {operator:op, expression:exp};}; BinOpShort = op:BinOpChar exp:ExpressionDecl {return {operator:op, expression:exp};}; BinOp = BinOpLong / BinOpShort; UnaryOpChar = "+" / "-"; ParensExpr = "(" exp:ExpressionDecl ")" {return new AST.ParensExpr(exp);}; ExpressionAtom = fn:Function {return new AST.ReferenceExpr(fn);} / ref:Reference{return new AST.ReferenceExpr(ref);}; ExpressionSimple = ExpressionAtom /  ParensExpr; UnaryOpExpr = op:UnaryOpChar exp:ExpressionDecl {return new AST.UnaryOpExpr(op,exp);}; BinOpExpr = exp:ExpressionSimple lhs:BinOp {return new AST.BinOpExpr(lhs.operator, exp, lhs.expression);} ExpressionDecl =  UnaryOpExpr / BinOpExpr / ExpressionSimple; FunctionName = r:((letter / ".") +) {return r.join("");}; Function =  f:FunctionName "(" args:ArgumentList ")" {return new AST.ReferenceFunction(null, f, args);} ; ArgumentList = res:((hd:ExpressionDecl tl:("," ExpressionDecl) * {var a=[hd]; for(i=0; i< tl.length; i++) a.push(tl[i][1]); return a; }) ?) {return res==""?[]:res;} Formula = "=" res:ExpressionDecl{return res;}; ';
    var AddrR1C1 = PEG.buildParser('start=AddrR1C1;Int32 = s:[+-]?number: ( oct:("0"[oO][0-7]+) { var res=[]; for(var i=0; i<oct.length; i++) if(oct[i] instanceof Array) res.push(oct[i].join("")); else res.push(oct[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 8);} / b:("0"[bB][01]+) { var res=[]; for(var i=0; i<b.length; i++) if(b[i] instanceof Array) res.push(b[i].join("")); else res.push(b[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 2);} / h:("0"[xX][0-9a-fA-F]+) { var res=[]; for(var i=0; i<h.length; i++) if(h[i] instanceof Array) res.push(h[i].join("")); else res.push(h[i]); var a = res.join(""); return parseInt(a, 16);} / d:[0-9]+ {return d.join("");}  ) {return parseInt(s+number);}; AsciiUpper = [A-Z]; character = [^\ufffe-\uffff] ; letter = [a-z] / [A-Z]; digit = [0-9]; AddrR = "R" r:Int32 { return r;}; AddrC = "C" r:Int32 {return r;}; AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);};');
    var RangeR1C1 = PEG.buildParser('start=RangeR1C1;Int32 = s:[+-]?number: ( oct:("0"[oO][0-7]+) { var res=[]; for(var i=0; i<oct.length; i++) if(oct[i] instanceof Array) res.push(oct[i].join("")); else res.push(oct[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 8);} / b:("0"[bB][01]+) { var res=[]; for(var i=0; i<b.length; i++) if(b[i] instanceof Array) res.push(b[i].join("")); else res.push(b[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 2);} / h:("0"[xX][0-9a-fA-F]+) { var res=[]; for(var i=0; i<h.length; i++) if(h[i] instanceof Array) res.push(h[i].join("")); else res.push(h[i]); var a = res.join(""); return parseInt(a, 16);} / d:[0-9]+ {return d.join("");}  ) {return parseInt(s+number);}; AsciiUpper = [A-Z]; character = [^\ufffe-\uffff] ; letter = [a-z] / [A-Z]; digit = [0-9]; AddrR = "R" r:Int32 { return r;}; AddrC = "C" r:Int32 {return r;}; AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);}; AddrA = r: (AsciiUpper + ) {return r.join("");}; AddrAAbs = ("$" / "") r:AddrA {return r;}; Addr1 = r:Int32 {return r;}; Addr1Abs = ("$" / "") r:Addr1 {return r;}; AddrA1 = l:AddrAAbs r:Addr1Abs {return new AST.Address(r, l, null, null);}; AnyAddr = AddrR1C1 / AddrA1; MoreAddrR1C1 = ":" r:AddrR1C1 { return r;}; RangeR1C1 = r:AddrR1C1 l:MoreAddrR1C1 {return new AST.Range(r, l);};');
    var Reference = PEG.buildParser("start=Reference;" + grammar);
    var Formula = PEG.buildParser("start=Formula;" + grammar);

    function Parser() {
    }

    //Take another look at the following 2 methods
    Parser.RefAddrResolve = function (/*Reference*/ref, /*Workbook*/wb, /*Worksheet*/ws) {
        ref.Resolve(wb, ws);
    };

    /**
     * Resolve all undefined references to the current worksheet and workbook
     * @param expr The expression to resolve
     * @param wb The current workbook
     * @param ws The current worksheet
     */
    Parser.ExprAddrResolve = function (/*Expression*/expr, /*Workbook*/wb, /*Worksheet*/ws) {
        if (expr instanceof AST.ReferenceExpr) {
            this.RefAddrResolve(expr.Ref, wb, ws);
        }
        if (expr instanceof  AST.BinOpExpr) {
            this.ExprAddrResolve(expr.Expr1, wb, ws);
            this.ExprAddrResolve(expr.Expr2, wb, ws);
        }
        if (expr instanceof AST.UnaryOpExpr) {
            this.ExprAddrResolve(expr.Expr, wb, ws);
        }
        if (expr instanceof AST.ParensExpr) {
            this.ExprAddrResolve(expr.Expr);
        }
    };
    /**
     * Strips spaces before parsing. It makes parsing easier but changes the formula semantics
     * //TODO Ask Dan about the space operator as defined in the Excel specification
     * @param str
     * @returns {string}
     */
    Parser.no_ws = function (/*string*/str) {
        return str.replace(" ", "");
    };

    /**
     * Parse the given string and see if it is an R1C1 Address
     * @param str String representing a R1C1 address
     * @param wb Workbook the address is part of
     * @param ws Worksheet the address is part of
     * @returns {*} On success, it return an AST.Address object and on failure it returns FSharp.None()
     */
    Parser.GetAddress = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
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

    /**
     * Parse the string and see if it is a R1C1 range
     * @param str String representing an R1C1 range
     * @returns {*} On success, it return an AST.Range object, otherwise it returns FSharp.None
     */
    Parser.GetRange = function (/*string*/str) {
        try {
            return RangeR1C1.parse(this.no_ws(str));
        } catch (e) {
            return new FSharp.None();
        }
    };
    /**
     * Parse the input string checking if it is a Reference
     * @param str String representing a Reference
     * @param wb The workbook to resolve the reference to
     * @param ws The worksheet to resolve the reference to
     * @returns {*} On success it returns an AST.Reference object, on failure it returns FSharp.None()
     * @constructor
     */
    Parser.GetReference = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var reference;
        try {
            reference = Reference.parse(this.no_ws(str));
            this.RefAddrResolve(reference, wb, ws);
            return reference;
        } catch (e) {
            return new FSharp.None();
        }
    };

    /**
     * Parse the given string and check if it is a formula.
     * @param str String representing the formula.
     * @param wb Workbook to resolve the expression to
     * @param ws Worksheet to resolve the expression to
     * @returns {*}Return the Expression generated from parsing the formula or FSharp.None on failure
     * @constructor
     */
    Parser.ParseFormula = function (/*string*/str, /*Workbook*/wb, /*Worksheet*/ws) {
        var formula;
        try {
            formula = Formula.parse(this.no_ws(str));
            this.ExprAddrResolve(formula, wb, ws);
            return formula;
        } catch (e) {
            return new FSharp.None();
        }
    };
    //TODO this seems inefficient. Extra overhead from calling the function. Could use !isNaN instead
    Parser.isNumeric = function (/*string*/str) {
        return !isNaN(str);
    };

    return Parser;
})();