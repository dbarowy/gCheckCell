/**
 * This file tries to test the PEG grammar rules derived from ExcelParser.Parser.fs
 * The only way I find to test the rules is to write create a parser from the rules in each test case
 * Everytime a new rule is added/modified the respective test should be modified. This is not ideal as I have two
 * instances of the same code.
 *
 */
TestCase("TestPEG",
    {
        setUp: function () {
            this.grammar = 'Int32 = s:[+-]?number: ( oct:("0"[oO][0-7]+) { var res=[]; for(var i=0; i<oct.length; i++) if(oct[i] instanceof Array) res.push(oct[i].join("")); else res.push(oct[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 8);} / b:("0"[bB][01]+) { var res=[]; for(var i=0; i<b.length; i++) if(b[i] instanceof Array) res.push(b[i].join("")); else res.push(b[i]); var a = res.join(""); return parseInt(a.slice(0,1)+a.slice(2), 2);} / h:("0"[xX][0-9a-fA-F]+) { var res=[]; for(var i=0; i<h.length; i++) if(h[i] instanceof Array) res.push(h[i].join("")); else res.push(h[i]); var a = res.join(""); return parseInt(a, 16);} / d:[0-9]+ {return d.join("");}  ) {return parseInt(s+number);}; AsciiUpper = [A-Z]; character = [^\ufffe-\uffff] ; letter = [a-z] / [A-Z]; digit = [0-9]; AddrR = "R" r:Int32 { return r;}; AddrC = "C" r:Int32 {return r;}; AddrR1C1 = r:AddrR c:AddrC {return new AST.Address(r, c, null, null);}; AddrA = r: (AsciiUpper + ) {return r.join("");}; AddrAAbs = ("$" / "") r:AddrA {return r;}; Addr1 = r:Int32 {return r;}; Addr1Abs = ("$" / "") r:Addr1 {return r;}; AddrA1 = l:AddrAAbs r:Addr1Abs {return new AST.Address(r, l, null, null);}; AnyAddr = AddrR1C1 / AddrA1; MoreAddrR1C1 = ":" r:AddrR1C1 { return r;}; RangeR1C1 = r:AddrR1C1 l:MoreAddrR1C1 {return new AST.Range(r, l);}; MoreAddrA1 = ":" r:AddrA1 {return r;}; RangeA1 = r:AddrA1 l:MoreAddrA1 {return new AST.Range(r, l);}; RangeAny = RangeR1C1 / RangeA1; WorksheetNameQuoted = "\'" r:((! "\'" character )+) "\'" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; WorksheetNameUnquoted = r:((digit / letter) + ) {return r.join("");}; WorksheetName = WorksheetNameQuoted / WorksheetNameUnquoted; WorkbookName = "[" r:((! ("["/"]") character )+) "]" { var res=[]; for(var i=0; i<r.length; i++) res.push(r[i].join("")); return res.join("");}; Workbook = WorkbookName / "" {return new FSharp.None();};';
        },
        tearDown: function () {
            delete this.grammar;
        },
        "testInt32": function () {
            var parser = PEG.buildParser('start=Int32;' + this.grammar);
            assertEquals(-123, parser.parse("-123"));
            assertEquals(+21, parser.parse("+21"));
            assertEquals(9, parser.parse("0x9"));
            assertEquals(16, parser.parse("0x10"));
            assertEquals(3, parser.parse("0b11"));
            assertException(function () {
                parser.parse("-xx")
            });
        },
        "test AddrR": function () {
            var parser = PEG.buildParser('start=AddrR;' + this.grammar);
            assertEquals(-123, parser.parse("R-123"));
            assertException(function () {
                parser.parse("")
            });
            assertException(function () {
                parser.parse("R")
            });
            assertException(function () {
                parser.parse("Rrr")
            });
        },
        "test AddrR1C1": function () {
            var parser = PEG.buildParser('start = AddrR1C1;' + this.grammar);
            assertInstanceOf(AST.Address, parser.parse("R1C2"));
            assertException(function () {
                AST.Address, parser.parse("R1");
            });
            var a = parser.parse("R1C2");
            assert(a.X == 2 && a.Y == 1 && a.WorkbookName == null && a.WorksheetName == null);
        },
        "test AddrA": function () {
            var parser = PEG.buildParser('start=AddrA;' + this.grammar);
            assertEquals("ABCD", parser.parse("ABCD"));
            assertException(function () {
                parser.parse("a")
            });
            assertException(function () {
                parser.parse("")
            });
        },
        "test AddrAAbs": function () {
            var parser = PEG.buildParser('start=AddrAAbs;' + this.grammar);
            assertEquals("ABCD", parser.parse("$ABCD"));
            assertEquals("ABCD", parser.parse("ABCD"));
            assertException(function () {
                parser.parse("a")
            });
            assertException(function () {
                parser.parse("")
            });
        },
        "test Addr1Abs": function () {
            var parser = PEG.buildParser('start=Addr1Abs;' + this.grammar);
            assertEquals("123", parser.parse("$123"));
            assertEquals("123", parser.parse("123"));
            assertException(function () {
                parser.parse("A")
            });
            assertException(function () {
                parser.parse("")
            });
        },
        "test AddrA1": function () {
            var parser = PEG.buildParser('start=AddrA1;' + this.grammar);
            assertInstanceOf(AST.Address, parser.parse("$A$2"));
            assertInstanceOf(AST.Address, parser.parse("RZ34"));
            var a = parser.parse("$A$2");
            assertEquals(1, a.X);
            assertEquals(2, a.Y);
            assertEquals(null, a.WorkbookName);
            assertEquals(null, a.WorksheetName);
        },
        "test AnyAddr": function () {
            var parser = PEG.buildParser('start=AnyAddr;' + this.grammar);
            assertInstanceOf(AST.Address, parser.parse("$A$2"));
            assertInstanceOf(AST.Address, parser.parse("R2C3"));
            assertInstanceOf(AST.Address, parser.parse("R2"));
            var a = parser.parse("R2");
            assertEquals(18, a.X);
            assertEquals(2, a.Y);
            assertEquals(null, a.WorkbookName);
            assertEquals(null, a.WorksheetName);
        },
        "test MoreAddrR1C1": function () {
            var parser = PEG.buildParser('start=MoreAddrR1C1;' + this.grammar);
            assertInstanceOf(AST.Address, parser.parse(":R2C3"));
            assertException(function () {
                parser.parse("a")
            });
            assertException(function () {
                parser.parse(":23")
            });
        },
        "test RangeR1C1": function () {
            var parser = PEG.buildParser('start=RangeR1C1;' + this.grammar);
            assertInstanceOf(AST.Range, parser.parse("R1C1:R4C4"));
        },
        "test MoreAddrA1": function () {
            var parser = PEG.buildParser('start=MoreAddrA1;' + this.grammar);
            assertInstanceOf(AST.Address, parser.parse(":A5"));
            assertException(function () {
                parser.parse("a")
            });
            assertException(function () {
                parser.parse(":23")
            });
        },
        "test RangeA1": function () {
            var parser = PEG.buildParser('start=RangeA1;' + this.grammar);
            assertInstanceOf(AST.Range, parser.parse("A5:A6"));
            assertInstanceOf(AST.Range, parser.parse("$A5:$A6"));
            assertException(function () {
                parser.parse("a")
            });
            assertException(function () {
                parser.parse(":23")
            });
        },
        "test RangeAny": function () {
            var parser = PEG.buildParser('start=RangeAny;' + this.grammar);
            assertInstanceOf(AST.Range, parser.parse("A5:A6"));
            assertInstanceOf(AST.Range, parser.parse("$A5:$A6"));
            assertInstanceOf(AST.Range, parser.parse("R1:C4"));
        },
        "test WorksheetNameQuoted": function () {
            var parser = PEG.buildParser('start=WorksheetNameQuoted;' + this.grammar);
            assertEquals("Sheet", parser.parse("'Sheet'"));
            assertException(function () {
                parser.parse("'Sheet")
            });
            assertException(function () {
                parser.parse("'sheet'''");
            });
        },
        "test WorksheetNameUnquoted": function () {
            var parser = PEG.buildParser('start=WorksheetNameUnquoted;' + this.grammar);
            assertEquals("Sheet", parser.parse("Sheet"));
            assertException(function () {
                parser.parse("'Sheet")
            });
            assertException(function () {
                parser.parse("'sheet'''");
            });
        },
        "test WorksheetName": function () {
            var parser = PEG.buildParser('start=WorksheetName;' + this.grammar);
            assertEquals("Sheet", parser.parse("Sheet"));
            assertEquals("Sheet", parser.parse("'Sheet'"));
        },
        "test WorkbookName": function () {
            var parser = PEG.buildParser('start=WorkbookName;'+this.grammar);
            assertEquals("Book", parser.parse("[Book]"));
            assertException(function(){
                parser.parse("[]");
            });
            assertException(function(){
                parser.parse("");
            });
        },
        "test Workbook": function () {
            var parser = PEG.buildParser('start=Workbook;'+this.grammar);
            assertEquals("Book", parser.parse("[Book]"));
            assertInstanceOf(FSharp.None, parser.parse(""));
        },
        "test RangeReferenceWorksheet": function () {
            var parser = PEG.buildParser('start=RangeReferenceWorksheet;'+this.grammar );

        }


    });






