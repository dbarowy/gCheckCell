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
comma = ",";
space = " ";
/*
The comma and space operators introduce problems with functions.
The space operator can't be handled because we remove spaces.
The comma operator represents the union of ranges, but in some cases,it separates arguments.
*/
operator = ">=" / "<=" / "<>" / ":" / "^" / "*" / "/" / "+" / "-"/ "&" / "=" / "<"  / ">" ;
infix_operator = ">=" / "<=" / "<>" / ":" / "^" / "*" / "/" / "+" / "-"/ "&" / "=" / "<"  / ">" ;
postfix_operator = "%";
prefix_operator = "-" / "+"
/*
The R1C1-style address parsing is incomplete.
 For GoogleSpreadsheets we can bypass this by requesting the A1-style formulas
 Column only and row only referencing are not implemented. One way to do that would be to make the missing column -1 
 and resolve it to the maximum of the used range. I don't know if this is good because I don't know if computations can expand the used data range
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

/*
The current setup allows sheet names of the sort Sheet'' which are not allowed
TODO: Fix this
*/
WorksheetNameQuoted = apostrophe r:sheet_name_special apostrophe { return r; };
sheet_name_special = hd:sheet_name_start_character_special tl:(sheet_name_characters_special ?) {return hd+tl;};
sheet_name_start_character_special = !("\\" / apostrophe / "*" / "[" / "]" /  ":" / "/" / "?") c:character {return c;};
sheet_name_characters_special = res:(sheet_name_character_special +) {return res.join("");} ;
sheet_name_character_special =! ("\\" / apostrophe / "*" / "[" / "]"  / ":" / "/" / "?") c:character {return c;}
								/ a1:apostrophe a2:apostrophe {return a1+a2;};


WorksheetNameUnquoted = r:(sheet_name) {return r;};
sheet_name = res:(sheet_name_character +) {return res.join("");} ;
sheet_name_character = !(operator / apostrophe / "[" / "]" / "?" / "\\" / "!" ) c:character {return c;};

WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted;

WorkbookName = "[" book:workbook_name "]" { return book;};
workbook_name = res:(book_name_character +){return res.join("");} ;
book_name_character = ! (operator / apostrophe / "[" / "]" / "?" / "!") c:character{return c;};
Workbook = WorkbookName / "" {return new FSharp.None();};

RangeReferenceWorksheet =  (wsname:WorksheetName "!") rng:RangeAny {return new AST.ReferenceRange(wsname, rng);};
RangeReferenceNoWorksheet = rng:RangeAny {return new AST.ReferenceRange(null, rng);};
RangeReference = RangeReferenceWorksheet / RangeReferenceNoWorksheet;

AddressReferenceWorksheet = wsname:WorksheetName "!" addr:AnyAddr {return new AST.ReferenceAddress(wsname, addr);};
AddressReferenceNoWorksheet = addr:AnyAddr {return new AST.ReferenceAddress(null, addr);};
AddressReference = AddressReferenceWorksheet / AddressReferenceNoWorksheet;

NamedReference =wb:NamedReferenceBook? c:NamedReferenceFirstChar s:NamedReferenceLastChars {var ref = new AST.ReferenceNamed(null, c+s); if(wb!=="") ref.WorkbookName = wb; return ref;};
NamedReferenceBook = wb:workbook_name "!" {return wb;};
NamedReferenceFirstChar = letter / underscore / backslash;
NamedReferenceLastChars = r:(NamedReferenceCharacters *) {return r.join("");};
NamedReferenceCharacters = letter / digit / underscore / full_stop ; 

StringConstant = double_quote str:StringChars ? double_quote {return new AST.ReferenceString(null, str);};
StringChars = res:(StringChar +){return res.join("");};
StringChar=! double_quote c:character{return c;} / '""' {return '"';}; 
/*
TODO Maybe I can optimize this when I have time
*/
NumericalConstant = num:numerical_constant {return new AST.ReferenceConstant(null, num);};
numerical_constant = whole:digit_sequence st:full_stop frac:digit_sequence exp:(exponent_part ?) {return parseFloat(whole+st+frac+exp);}
					/ whole:digit_sequence st:(full_stop ?) exp:(exponent_part ?) {return parseFloat(whole+st+exp);}
					/ st:full_stop frac:digit_sequence exp:(exponent_part ?) {return parseFloat(st+frac+exp);};
exponent_part = exp:("e"/"E") s:sign ? dig:digit_sequence {return exp+s+dig;};
sign = "+"/ "-";
digit_sequence = digs:(digit + ){return digs.join("");};

LogicalConstant = bool:("FALSE" / "TRUE") {return new AST.ReferenceLogical(null, bool);};

ErrorConstant = err:("#DIV/0!" 
		/ "#N/A"
		/ "#NAME?"
		/ "#NULL!"
		/ "#NUM!"
		/ "#REF!"
		/ "#VALUE!"
		/ "#GETTING_DATA") {return new AST.ReferenceError(null, err);};
Constant = ErrorConstant / LogicalConstant / NumericalConstant / StringConstant;

/*
There is a conflict between named references and AddressReferences. 
In Excel there is a runtime check to distinguish between the two
*/
ReferenceKinds = RangeReference / AddressReference;
Reference = (w:Workbook ref:ReferenceKinds {ref.WorkbookName = w; return ref;}); /*/ NamedReference */
ParensExpr = "(" exp:Expression ")" {return new AST.ParensExpr(exp);};

FunctionName = r:((letter / ".") +) {return r.join("");};
Function =  f:FunctionName "(" args:ArgumentList ")" {return new AST.ReferenceFunction(null, f, args);} ;
ArgumentList = res:((hd:Expression tl:("," Expression) * {var a=[hd]; for(i=0; i< tl.length; i++) a.push(tl[i][1]); return a; }) ?) {return res==""?[]:res;}

Formula = "=" exp:Expression {return exp.toString();};
ExpressionAtom = fn:Function {return new AST.ReferenceExpr(fn);} / ref:Reference{return new AST.ReferenceExpr(ref);} / c:Constant {return new AST.ReferenceExpr(c);};
ExpressionSimple = ExpressionAtom / ParensExpr;
Expression = exp:ExpressionSimple a:aux {console.log("exp1_"+count); 
				count++;
				 var z=null, i, len=a.postfix.length;
				if(len>0){z=new AST.PostfixOpExpr(a.postfix[len-1], exp); len--;
					for(i=len-1; i>=0; i--){
					z=new AST.PostfixOpExpr(a.postfix[i], z);
				}}else{
		  		z = exp;
		  	   }
		  	if(typeof(a.infix)!=="undefined")
		  	  z = new AST.BinOpExpr(a.infix, z, a.expression);
		  	return z;
				}
			/ exp:ExpressionSimple  {console.log("exp2_"+count);count++; console.log(exp.toString());return exp;}
			
			/ op:prefix_operator exp:Expression a:aux {console.log("exp3_"+count);count++; 
		        var z=null, i, len=a.postfix.length;
				if(len>0){z=new AST.PostfixOpExpr(a.postfix[len-1], exp); len--;
					for(i=len-1; i>=0; i--){
					z=new AST.PostfixOpExpr(a.postfix[i], z);
				}}else{
		  		z = exp;
		  	}
		  	z = new AST.UnaryOpExpr(op, z);
		  	if(typeof(a.infix)!=="undefined")
		  	  z = new AST.BinOpExpr(a.infix, z, a.expression);
		  	return z;
		  }
			/ op:prefix_operator exp:Expression {console.log("exp4_"+count);count++; return new AST.UnaryOpExpr(op, exp);};

aux = o:postfix_operator a:aux {console.log("postfix1_"+count);count++; 
		if(a.opt===2){
			a.postfix.push(o);
		}else if(a.opt===4){
			a.postfix[0]=o;
		}else if(a.opt===3){
			a.postfix.push(o);
		}else if(a.opt===1){
			a.postfix.push(o);
		} 
		 a.opt=1; return a;
			}
	 /o:postfix_operator { console.log("postfix2_"+count);count++; return {opt:2,postfix:[o]}}
	/ o:infix_operator exp:Expression a:aux { console.log("postfix3_"+count);count++;
		if(a.opt===2){
			a.expression = new AST.PostfixOpExpr(a.postfix[0], exp);
			a.infix=o;
			a.postfix=[];
		}else if(a.opt==4){
			a.expression = new AST.BinOpExpr(a.infix, exp, a.expression);
			a.infix=o;
			a.postfix=[];
		}else if(a.opt==3){
			a.expression = new AST.BinOpExpr(a.infix, exp, a.expression);
			a.infix=o;
			a.postfix=[];
		}else if(a.opt==1){
			var z=null, i, len=a.postfix.length;
			if(len>0){z=new AST.PostfixOpExpr(a.postfix[len-1], exp); len--;
			for(i=len-1; i>=0; i--){
				z=new AST.PostfixOpExpr(a.postfix[i], z);
			}
		  }else{
		  	z = exp;
		  }
		  	if(typeof(a.infix)!=="undefined")
		  	  z = new AST.BinOpExpr(a.infix, z, a.expression);
		  a.expression = z;
		  a.infix= o;
		  a.postfix = [];
		}
		a.opt=3;
		return a;
	}
	/ o:infix_operator exp:Expression {console.log("infix4_"+count); count++; return {opt:4, infix:o,postfix:[], expression:exp}};