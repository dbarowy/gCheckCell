Int32 = s:[+-]?number: (d:[0-9]+ {return d.join("");} / h:("0"[xX][0-9a-fA-F]+) {return h.join("");} / o:("0"[oO][0-7]+) {return o.join("");}/ b:("0"[bB][01]+) {return b.join("");}) {return parseInt(s+number);} 
AsciiUpper = [A-Z];
character = [^\ufffe-\uffff] ;
letter = [a-z] / [A-Z];
digit = [0-9];
AddrR = "R" r:Int32 { return r;};
AddrC = "C" r:Int32 {return r;};
AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);};
AddrA = r: (AsciiUpper + ) {return r.join("");};
AddrAAbs = ("$" / "") r:AddrA {return r;};
Addr1 = r:Int32 {return r;};
Addr1Abs = ("$" / "") r:Addr1 {return r;};

AddrA1 = l:AddrAAbs r:Addr1Abs {return new AST.Address(r, l, null, null);};
AnyAddr = AddrR1C1 / AddrA1;

MoreAddrR1C1 = ":" r:AddrR1C1 { return r;};
RangeR1C1 = r:AddrR1C1 l:MoreAddrR1C1 {return new AST.Range(r, l);};
MoreAddrA1 = ":" r:AddrA1 {return r;};
RangeA1 = r:AddrA1 l:MoreAddrA1 {return new AST.Range(r, l);};
RangeAny = RangeR1C1 / RangeA1;

WorksheetNameQuoted = "'" r:((! ['] character )+) "'" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");};
WorksheetNameUnquoted = r:((digit / letter) + ) {return r.join("");};
WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted;

WorkbookName = "[" r:((! [ \[ \] ] character )+) "]" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");};
//This should return null but null is already used to show an error parsing, I need to modify the AST accordingly.
Workbook = WorkbookName / "" {return 0;};

RangeReferenceWorksheet =  (wsname:WorksheetName "!") rng:RangeAny {return new AST.ReferenceRange(wsname, rng);}
RangeReferenceNoWorksheet = rng:RangeAny {return new AST.ReferenceRange(null, rng);}
RangeReference = RangeReferenceWorksheet / RangeReferenceNoWorksheet;

AddressReferenceWorksheet = wsname:WorksheetName "!" addr:AnyAddr {return new AST.ReferenceAddress(wsname, addr);}
AddressReferenceNoWorksheet = addr:AnyAddr {return new AST.ReferenceAddress(null, addr);}
AddressReference = AddressReferenceWorksheet / AddressReferenceNoWorksheet

NamedReferenceFirstChar = "_" / letter;
NamedReferenceLastChars = r:(("_" / letter / digit) *){return r.join("");};
NamedReference = c:NamedReferenceFirstChar s:NamedReferenceLastChars {return new AST.ReferenceNamed(null, c+s);}
StringReference = ["] r:(!["] character) + ["] { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return new AST.ReferenceString(null, res.join(""));};
ConstantReference = r:Int32 {return new AST.ReferenceConstant(null, r);}

ReferenceKinds = RangeReference / AddressReference / ConstantReference / StringReference / NamedReference
Reference = w:Workbook ref:ReferenceKinds {ref.WorkbookName = w; return ref;}
FunctionName = r:((letter / ".") +) {return r.join("");}
Function =  f:FunctionName "(" args:ArgumentList ")" {return new AST.ReferenceFunction(null, f, args);} 
ArgumentList = (ExpressionDecl (ExpressionDecl ",") *) ?	/*No idea what to return here*/

BinOpChar = "+" / "-" / "*" / "<" / ">"
BinOp2Char = "<="
BinOpLong = op:BinOp2Char exp:ExpressionDecl {return {operator:op, expression:exp};}	//Check if this is right
BinOpShort = BinOpChar ExpressionDecl {return {operator:op, expression:exp};}
BinOp = BinOpLong / BinOpShort

UnaryOpChar = "+" / "-"
Formula = "=" ExpressionDecl;
ExpressionDecl = "(" ExpressionDecl ")" aux
				/ "(" ExpressionDecl ")"
				/ Function aux
				/ Function 
				/ Reference aux
				/ Reference 
				/ UnaryOpChar ExpressionDecl aux
				/ UnaryOpChar ExpressionDecl;
aux = BinOp ExpressionDecl
	 / BinOp ExpressionDecl aux;

Formula = "=" ExpressionDecl
 


