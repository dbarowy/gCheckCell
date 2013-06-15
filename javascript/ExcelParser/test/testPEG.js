/**
 * This file tries to test the PEG grammar rules derived from ExcelParser.Parser.fs
 * The only way I find to test the rules is to write create a parser from the rules in each test case
 * Everytime a new rule is added/modified the respective test should be modified. This is not ideal as I have two
 * instances of the same code.
 * 
 */
TestCase("TestPEG",
    {
        "testInt32": function () {
            var parser = PEG.buildParser('Int32 = s:[+-]?number: (d:[0-9]+ {return d.join("");} / h:("0"[xX][0-9a-fA-F]+) {return h.join("");} / o:("0"[oO][0-7]+) {return o.join("");}/ b:("0"[bB][01]+) {return b.join("");}) {return parseInt(s+number);}');
            parser.parse("abd");
        }
    });