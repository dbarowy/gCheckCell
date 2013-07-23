start = formula

formula = expression 
expression = "(" expression ")" aux
			/"(" expression ")"
			/ function_call aux
			/ function_call  
			/ prefix_operator expression aux
			/ prefix_operator expression
			/ cell_reference aux
			/ cell_reference 
			/ constant aux
			/ constant
			/ name aux
			/ name ;
aux = postfix_operator
	/ postfix_operator aux
	/infix_operator expression 
	/infix_operator expression aux;

constant =  error_constant
		/ logical_constant
		/ numerical_constant
		/ string_constant
		/ array_constant;
error_constant = "#DIV/0!" 
		/ "#N/A"
		/ "#NAME?"
		/ "#NULL!"
		/ "#NUM!"
		/ "#REF!"
		/ "#VALUE!"
		/ "#GETTING_DATA";
logical_constant = "FALSE" 
			/ "TRUE";
numerical_constant = whole_number_part full_stop fractional_part exponent_part ?
					/ whole_number_part full_stop ? exponent_part ?
					/ full_stop fractional_part exponent_part ?

full_stop = ".";
whole_number_part = digit_sequence;
fractional_part = digit_sequence;
exponent_part = "e" sign ? digit_sequence
				/ "E" sign ? digit_sequence;
sign = "+"
		/ "-";
digit_sequence = decimal_digit + ;
decimal_digit = "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" ;
string_constant = double_quote string_chars ? double_quote;
double_quote = '"';
string_chars = string_char +;
string_char=! double_quote character
			/'""'; 
/*
This should be :
character ::= #x9 
		| #xA 
		| #xD 
		| [#x20 - #xD7FF] 
		| [#xE000 - #xFFFD] 	
		| [#x10000 - #x10FFFF]
		 (* any Unicode character, excluding surrogate blocks, FFFE, and FFFF *)
*/
character = [^\ufffe-\uffff] ;
array_constant = "{" constant_list_rows "}";
constant_list_rows = constant_list_row (semicolon constant_list_row) *;
semicolon = ";";
constant_list_row = constant (comma constant) *;
operator = "<="/ ">=" / "<>" / ":" / comma / space / "^" / "*" / "/" / "+" / "-" / "&" / "="  / "<" / ">" ;
infix_operator = ">=" / "<=" / "<>" / ":" / comma / space / "^" / "*" / "/" / "+" / "-"/ "&" / "=" / "<"  / ">" ;
postfix_operator = "%";
prefix_operator = "-";

cell_reference =  work_sheet_prefix ? A1_reference ":" A1_reference {return "a1a1";}
				/ work_sheet_prefix ? A1_reference {return "a1";}
				/ work_sheet_prefix ? R1C1_reference ":" R1C1_reference {return "r1c1r1x1";}
				/ work_sheet_prefix ? R1C1_reference {return "r1c1";}
				/ name {return "name";};
work_sheet_prefix = work_sheet_prefix_special
					/ sheet_name "!"
					/ sheet_name ":" sheet_name "!"
					/ "[" workbook_name "]" sheet_name ":" sheet_name "!" ;
work_sheet_prefix_special = apostrophe sheet_name_special apostrophe "!"
						/ apostrophe sheet_name_special ":" sheet_name_special apostrophe "!"
						/ apostrophe "[" workbook_name_special "]" sheet_name_special apostrophe "!"
						/ apostrophe "[" workbook_name_special "]" sheet_name_special ":" sheet_name_special apostrophe "!";
workbook_name = book_name_characters ;
book_name_characters = book_name_character + ;
/*The ! character was not part of the specification but was added to prevent conflicts. It must be removed in the final version*/
book_name_character = ! (operator / apostrophe / "[" / "]" / "?" / "!") character;
apostrophe = "'";
sheet_name = sheet_name_characters;
/*The ! character was not part of the specification but was added to prevent conflicts. It must be removed in the final version*/
sheet_name_character = !(operator / apostrophe / "[" / "]" / "?" / "\\" / "!" ) character;
sheet_name_characters = sheet_name_character + ;
workbook_name_special = book_name_start_character_special book_name_characters_special ?;
book_name_start_character_special = !(apostrophe / "*" / "[" / "]" / ":" / "?" ) character;
book_name_characters_special = book_name_character_special +;
book_name_character_special = apostrophe apostrophe 
							/ !(apostrophe / "*" / "[" / "]" / ":" / "?") character;
/*Problem with Greedyness of PEG sheet_name_start_character_special ( sheet_name_characters_special ? sheet_name_end_character_special) ?;*/
sheet_name_special = sheet_name_start_character_special sheet_name_characters_special ?;
sheet_name_start_character_special = !("\\" / apostrophe / "*" / "[" / "]" /  ":" / "/" / "?") character ;
sheet_name_end_character_special = sheet_name_start_character_special;
sheet_name_characters_special = sheet_name_character_special + ;
sheet_name_character_special =! ("\\" / apostrophe / "*" / "[" / "]"  / ":" / "/" / "?") character
								/ apostrophe apostrophe ;
/* The range rule is missing, let's see if this works */								
A1_reference = A1_column ":" A1_column 
			/ A1_row ":" A1_row
			/ A1_column A1_row;
A1_column =A1_absolute_column 
           / A1_relative_column ;
A1_relative_column = letter +;
letter =  [a-z] / [A-Z];
A1_absolute_column = "$" A1_relative_column;
A1_row = A1_relative_row 
		/ A1_absolute_row;
A1_relative_row = digit_sequence ;
A1_absolute_row = "$" A1_relative_row;

R1C1_reference = R1C1_row R1C1_column
				/ R1C1_row_only
				/ R1C1_column_only;
R1C1_row_only = "R" R1C1_absolute_number 
				/ "R[" R1C1_relative_number "]";
R1C1_row = R1C1_relative_row
		/ R1C1_absolute_row ; 
R1C1_relative_row = "R[" R1C1_relative_number "]";
R1C1_absolute_row  = "R" R1C1_absolute_number
					/"R" ;
R1C1_column_only = "C" R1C1_absolute_number
				/ "C[" R1C1_relative_number "]";
R1C1_column = R1C1_relative_column
			/ R1C1_absolute_column;
R1C1_relative_column = "C[" R1C1_relative_number "]";
R1C1_absolute_column = "C" R1C1_absolute_number
                       / "C" ;
R1C1_relative_number = "-" ? digit_sequence ;
R1C1_absolute_number = digit_sequence ; 

function_call = function_name "(" argument_list ? ")" ; 
function_name  = ("ISO."/"ECMA.")? user_defined_function_name;
user_defined_function_name = letter user_defined_name_characters ? ;
user_defined_name_characters = user_defined_name_character + ;
user_defined_name_character = letter 
							/ decimal_digit 
							/ full_stop;
argument_list = argument (comma argument) * ;
comma = ",";
argument = expression;

name = (workbook_name "!") ? name_start_character name_characters ? ;
name_start_character = letter 
						/ underscore
						/ backslash;
underscore = "_";
backslash = "\\";
name_characters = name_character +;
name_character = letter 
				/ decimal_digit
				/ underscore
				/full_stop ; 
/*This was not in the specification*/
space = " ";