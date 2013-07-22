Int32 = s:[+-]?number: ( oct:("0"[oO][0-7]+) { var res=[]; for(var i=0; i<oct.length; i++) if(oct[i] instanceof Array) res.push(oct[i].join("")); else res.push(oct[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 8);} / b:("0"[bB][01]+) 
{ var res=[]; for(var i=0; i<b.length; i++) if(b[i] instanceof Array) res.push(b[i].join("")); else res.push(b[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 2);} / h:("0"[xX][0-9a-fA-F]+) { var res=[]; for(var i=0; i<h.length; i++)
if(h[i] instanceof Array) res.push(h[i].join("")); else res.push(h[i]); var a = res.join(""); return parseInt(a, 16);} / d:[0-9]+ {return d.join("");}  ) {return parseInt(s+number);};

AsciiUpper = [A-Z];
character = [^\ufffe-\uffff] ;
letter = [a-z] / [A-Z];
digit = [0-9];
apostrophe = "'";
underscore = "_";
backslash = "\\";
full_stop = ".";
double_quote = '"';
/*
The R1C1-style addresses are incomplete. For GoogleSpreadsheets we can requests 
*/
AddrR = "R" r:Int32 { return r;};
AddrC = "C" r:Int32 {return r;};
AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);};
AddrA = r: (letter + ) {return r.join("");};
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

WorksheetNameQuoted = apostrophe r:sheet_name_special apostrophe { return r; };
sheet_name_special = hd:sheet_name_start_character_special tl:(sheet_name_characters_special ?) {return hd+tl;};
sheet_name_start_character_special = !("\\" / apostrophe / "*" / "[" / "]" /  ":" / "/" / "?") c:character {return c;};
sheet_name_characters_special = res:(sheet_name_character_special +) {return res.join("");} ;
sheet_name_character_special =! ("\\" / apostrophe / "*" / "[" / "]"  / ":" / "/" / "?") c:character {return c;}
								/ a1:apostrophe a2:apostrophe {return a1+a2;};


WorksheetNameUnquoted = r:(sheet_name) {return r.join("");};
sheet_name = sheet_name_characters;
sheet_name_characters = res:(sheet_name_character +) {return res.join("");} ;
sheet_name_character = !(operator / apostrophe / "[" / "]" / "?" / "\\" / "!" ) c:character {return c;};

WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted;

WorkbookName = "[" book:workbook_name "]" { return book;};
workbook_name = book_name_characters ;
book_name_characters = res:(book_name_character +){return res.join("");} ;
book_name_character = ! (operator / apostrophe / "[" / "]" / "?" / "!") c:character{return c;};
Workbook = WorkbookName / "" {return new FSharp.None();};

RangeReferenceWorksheet =  (wsname:WorksheetName "!") rng:RangeAny {return new AST.ReferenceRange(wsname, rng);};
RangeReferenceNoWorksheet = rng:RangeAny {return new AST.ReferenceRange(null, rng);};
RangeReference = RangeReferenceWorksheet / RangeReferenceNoWorksheet;

AddressReferenceWorksheet = wsname:WorksheetName "!" addr:AnyAddr {return new AST.ReferenceAddress(wsname, addr);};
AddressReferenceNoWorksheet = addr:AnyAddr {return new AST.ReferenceAddress(null, addr);};
AddressReference = AddressReferenceWorksheet / AddressReferenceNoWorksheet;


NamedReferenceFirstChar = letter / underscore / backslash;
NamedReferenceLastChars = r:(NamedReferenceCharacters *){return r.join("");};
NamedReferenceCharacters = letter / digit / underscore / full_stop ; 
NamedReference = c:NamedReferenceFirstChar s:NamedReferenceLastChars {return new AST.ReferenceNamed(null, c+s);};

StringReference = double_quote str:StringChars ? double_quote {return new AST.ReferenceString(null, str);};
StringChars = res:(StringChar +){return res.join("");};
StringChar=! double_quote c:character{return c;} / '""'; 

ConstantReference = num:numerical_constant {return AST.ReferenceConstant(null, num);}
numerical_constant = whole:digit_sequence st:full_stop frac:digit_sequence exp:(exponent_part ?) {return parseFloat(whole+st+frac+exp);}
					/ whole:digit_sequence st:(full_stop ?) exp:(exponent_part ?) {return parseFloat(whole+st+exp);}
					/ st:full_stop frac:digit_sequence exp:(exponent_part ?) {return parseFloat(st+frac+exp);}
full_stop = ".";
exponent_part = exp:("e"/"E") s:sign ? dig:digit_sequence {return exp+s+dig;};
sign = "+"/ "-";
digit_sequence = digs:(digit + ){return digs.join("");};

LogicalConstant = bool:("FALSE" / "TRUE") {return AST.ReferenceLogical(null, bool);};

ErrorConstant = err:("#DIV/0!" 
		/ "#N/A"
		/ "#NAME?"
		/ "#NULL!"
		/ "#NUM!"
		/ "#REF!"
		/ "#VALUE!"
		/ "#GETTING_DATA") {return AST.ReferenceError(null, err);};

ReferenceKinds = RangeReference / AddressReference / ErrorConstant / LogicalConstant /ConstantReference/ StringReference / NamedReference;
Reference = w:Workbook ref:ReferenceKinds {ref.WorkbookName = w; return ref;};


infix_operator = ">=" / "<=" / "<>" / ":" / comma / space / "^" / "*" / "/" / "+" / "-"/ "&" / "=" / "<"  / ">" ;
BinOp = op:infix_operator exp:ExpressionDecl {return {operator:op, expression:exp};};	

UnaryOpChar = "-";
ParensExpr = "(" exp:ExpressionDecl ")" {return new AST.ParensExpr(exp);};
ExpressionAtom = fn:Function {return new AST.ReferenceExpr(fn);} / ref:Reference{return new AST.ReferenceExpr(ref);};
ExpressionSimple = ExpressionAtom /  ParensExpr;
UnaryOpExpr = op:UnaryOpChar exp:ExpressionDecl {return new AST.UnaryOpExpr(op,exp);};
BinOpExpr = exp:ExpressionSimple lhs:BinOp {return new AST.BinOpExpr(lhs.operator, exp, lhs.expression);}
ExpressionDecl =  UnaryOpExpr / BinOpExpr / ExpressionSimple;

FunctionName = r:((letter / ".") +) {return r.join("");};
Function =  f:FunctionName "(" args:ArgumentList ")" {return new AST.ReferenceFunction(null, f, args);} ;
ArgumentList = res:((hd:ExpressionDecl tl:("," ExpressionDecl) * {var a=[hd]; for(i=0; i< tl.length; i++) a.push(tl[i][1]); return a; }) ?) {return res==""?[]:res;}

Formula = "=" res:ExpressionDecl{return res;};


