Int32 = s:[+-]?number: (d:[0-9]+ {return d.join("");} / h:("0"[xX][0-9a-fA-F]+) {return h.join("");} / o:("0"[oO][0-7]+) {return o.join("");}/ b:("0"[bB][01]+) {return b.join("");}) {return parseInt(s+number);} 
AsciiUpper = [A-Z];
character = [^\ufffe-\uffff] ;
letter = [a-z] / [A-Z];
digit = [0-9];
AddrR = "R" r:Int32 { return r;};
AddrC = "C" r:Int32 {return r;};
AddrR1C1 = r:AddrR c:AddrC {return r+" "+ c;};
AddrA = r: (AsciiUpper + ) {return r;};
AddrAAbs = ("$" / "") r:AddrA {return r;};
Addr1 = Int32;
Addr1Abs = ("$" / "") r:Addr1 {return r;};
AddrA1 = l:AddrAAbs r:Addr1Abs {return l +" " + r;};
AnyAddr = AddrR1C1 / AddrA1;
MoreAddrR1C1 = ":" r:AddrR1C1 { return r;};
RangeR1CC1 = r:AddrR1C1 l:MoreAddrR1C1 {return "Range"+ r+ c;};
MoreAddrA1 = ":" r:AddrA1 {return "MoreAddrA1"+ r};
RangeA1 = r:AddrA1 l:MoreAddrA1 {return r+l;};
RangeAny = RangeR1CC1 / RangeA1;
WorksheetNameQuoted = "'" r:((! ['] character )+) "'" {return r.join("");};
WorksheetNameUnquoted = r:((digit / letter) + ) {return r.join("");};
WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted;
WorkbookName = "[" r:((! [ \[ \] ] character )+) "]";
Workbook = WorkbookName / "";

RangeReferenceWorksheet =  (l:WorksheetName "!") r:RangeAny /*Do something with these*/
RangeReferenceNoWorksheet = RangeAny /*---*/
RangeReference = RangeReferenceWorksheet / RangeReferenceNoWorksheet;
AddressReferenceWorksheet = WorksheetName "!" AnyAddr /**/
AddressReferenceNoWorksheet = AnyAddr /**/
AddressReference = AddressReferenceWorksheet / AddressReferenceNoWorksheet
NamedReferenceFirstChar = [_] / letter;
NamedReferenceLastChars = ([_] / letter / digit) *;
NamedReference = NamedReferenceFirstChar NamedReferenceLastChars /**/
StringReference = ["] (!["] character) + ["]
ConstantReference = Int32 
ReferenceKinds = RangeReference / AddressReference / ConstantReference / StringReference / NamedReference
Reference = Workbook ReferenceKinds /**/
FunctionName = (letter / ".") +
Function =  FunctionName "(" ArgumentList ")" 
ArgumentListImpl = (ExpressionDecl (ExpressionDecl ",") *) ?
BinOpChar = "+" / "-" / "*" / "<" / ">"
BinOp2Char = "<="
BinOpLong = BinOp2Char ExpressionDecl
BinOpShort = BinOpChar ExpressionDecl
BinOp = BinOpLong / BinOpShort
UnaryOpChar = "+" / "-"
ParensExpr = "(" ExpressionDecl ")"

/*let ParensExpr: Parser<Expression,unit> = (between (pstring "(") (pstring ")") ExpressionDecl) |>> ParensExpr
    let ExpressionAtom: Parser<Expression,unit> = ((attempt Function) <|> Reference) |>> ReferenceExpr
    do ExpressionSimpleImpl := ExpressionAtom <|> ParensExpr
    let UnaryOpExpr: Parser<Expression,unit> = pipe2 UnaryOpChar ExpressionDecl (fun op rhs -> UnaryOpExpr(op, rhs))
    let BinOpExpr: Parser<Expression,unit> = pipe2 ExpressionSimple BinOp (fun lhs (op, rhs) -> BinOpExpr(op, lhs, rhs))
    do ExpressionDeclImpl := (attempt UnaryOpExpr) <|> (attempt BinOpExpr) <|> (attempt ExpressionSimple)
    */
Formula = "=" ExpressionDecl
 


