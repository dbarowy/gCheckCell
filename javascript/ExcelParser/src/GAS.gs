/**
 * Get the data we need to compute the results from the given sheet
 * See docs/sheet_export_format.txt for an explanation on the format
 * @param sheet
 * @returns {{name: *, values: *, formulas: *}}
 * @private
 */
function _getSheetData(sheet) {
    "use strict";
    var dataRange = sheet.getDataRange();
    return{
        name: sheet.getSheetName(),
        values: dataRange.getValues(),
        formulas: dataRange.getFormulas()
    };
}

/**
 * Get the data needed to recompute the workbook from the given book
 * See docs/sheet_export_format.txt for an explanation on the format
 * @param book
 * @returns {{name: *, sheets: Array, named_ranges: *, external_ranges: *}}
 * @private
 */
function _getBookData(book) {
    "use strict";
    var sheets, sheetsdata = [];
    sheets = book.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        sheetsdata.push(_getSheetData(sheets[i]));
    }
    var extnamed = _getExternalRanges();
    Logger.log(extnamed);
    return {
        name: book.getId(),
        sheets: sheetsdata,
        named_ranges: extnamed.named,
        external_ranges: extnamed.external
    };
}
/**
 * Get external and named ranges used in the sheet
 * TODO This is not optimal, we have to parse the formulas in the workbook twice, once here and once on the client side.
 * @private
 */
function _getExternalRanges() {
    "use strict";
    var res;
    require(["Parser/PEGParser", "Parser/Parser", "Parser/AST/AST", "XClasses/XLogger", "FSharp/FSharp"], function (PEGParser, Parser, AST, XLogger, FSharp) {
        var external = [], named = [], book_id, book, sheet_name, external_ranges = {}, range, named_ranges = {}, ref;
        var spreadsheet = SpreadsheetApp.getActive();
        var sheets = spreadsheet.getSheets();
        var i, k, j;
        //For each formula in the active spreadsheet
        for (i = 0; i < sheets.length; i++) {
            var formulas = sheets[i].getDataRange().getFormulas();
            for (j = 0; j < formulas.length; j++) {
                for (k = 0; k < formulas[j].length; k++) {
                    if (formulas[j][k] != "") {
                        try {
                            XLogger.log("bka");
                            //Parse the formula and extract the ImportRange function and it's parameters and the named ranges
                            var formula = PEGParser.parse(Parser.no_ws(formulas[j][k]), "Formula");
                            external = external.concat(Parser._extractImportRange(formula));
                            named = named.concat(Parser._extractNamedRanges(formula));
                        } catch (e) {
                            XLogger.log(e);
                        }
                    }
                }
            }
        }
        for (i = 0; i < external.length; i++) {
            //Some checking to see if the function is valid
            if (external[i].ArgumentList.length === 2 && external[i].ArgumentList[0].Ref instanceof AST.ConstantString && external[i].ArgumentList[1].Ref instanceof AST.ConstantString) {
                var id = external[i].ArgumentList[0].Ref._value;
                var rng = external[i].ArgumentList[1].Ref._value;
                if (!external_ranges[id]) {
                    external_ranges[id] = {};
                }
                if (!external_ranges[id][rng]) {
                    if (book = SpreadsheetApp.openById(id)) {
                        try{
                            if (range = book.getRange(rng)) {
                                external_ranges[id][rng] = range.getValues();
                            }
                        }catch(e){XLogger.log(e);}
                    }

                }
            }
        }
        book = SpreadsheetApp.getActive();
        book_id = book.getId();
        for (i = 0; i < named.length; i++) {
            if (range = book.getRangeByName(named[i]._varname)) {
                sheet_name = range.getSheet().getName();
                named_ranges[named[i]._varname] = {range: range.getA1Notation(), book_name: book_id, sheet_name: sheet_name};
            }
        }
        res= {named: named_ranges, external: external_ranges};
    });

    return res;

}

/**
 * Get the data needed to recompute the workbook
 * @returns {*}
 */
function getData() {
    "use strict";
    var res = {
        active_book: _getBookData(SpreadsheetApp.getActive()),
        external_books: []
    };
    //Return a JSON string to get around some limitations imposed by GAS
    return Utilities.jsonStringify(res);
}


/**
 * Get the background colors of the book that is being analyzed
 * @returns {{}}
 * @private
 */
function _getColorData() {
    "use strict";
    var activeSheet = SpreadsheetApp.getActive();
    var res = {};
    res[activeSheet.getId()] = _getColorBook(activeSheet);
    return res;
}

/**
 * Get the colors of each sheet in the book passed as a parameter
 * @param book
 * @returns {{}}
 * @private
 */
function _getColorBook(book) {
    "use strict";
    var res = {}, i, sheets = book.getSheets();
    for (i = 0; i < sheets.length; i++) {
        res[sheets[i].getSheetName()] = sheets[i].getDataRange().getBackgrounds();
    }
    return res;
}

/**
 * Color the outliers passed as a parameter.
 * The objects in the array of outliers contains the coordinates of the cell and color that should be applied
 * @param outliers
 */
function colorCells(outliers) {
    "use strict";
    var colors = _getColorData();
    for (var i = 0; i < outliers.length; i++) {
        var range = outliers[i];
        if (colors[range.cell.book] && colors[range.cell.book][range.cell.sheet] && colors[range.cell.book][range.cell.sheet][range.cell.row] && colors[range.cell.book][range.cell.sheet][range.cell.row][range.cell.col]) {
            colors[range.cell.book][range.cell.sheet][range.cell.row][range.cell.col] = range.color;
        }
    }

    _updateColors(colors);
}

function _updateColors(colors) {
    "use strict";
    var book, sheet;
    for (book in colors) {
        if (colors.hasOwnProperty(book)) {
            var bk = SpreadsheetApp.openById(book);
            var b = colors[book];
            for (sheet in b) {
                if (b.hasOwnProperty(sheet)) {
                    var sh = bk.getSheetByName(sheet);
                    sh.getDataRange().setBackgrounds(b[sheet]);
                }
            }
        }
    }
}

/**
 * Compare the result of the XApplication computation with the result given by Google Spreadsheet
 * This is used to verify the correctness of the computation (to some degree)
 * @param data
 */
function compare(data) {
    "use strict";
    var k, j;
    Logger.log("Result of comparison");
    var orig, calc;
    orig = Utilities.jsonParse(getData());
    calc = Utilities.jsonParse(data);
    for (var i = 0; i < orig.active_book.sheets.length; i++) {
        var sheetOrig = orig.active_book.sheets[i];
        var sheetCalc = calc.active_book.sheets[i];
        for (k = 0; k < sheetOrig.values.length; k++) {
            for (j = 0; j < sheetOrig.values[k].length; j++) {
                if (sheetCalc.values[k][j] !== sheetOrig.values[k][j]) {
                    Logger.log(k + " " + j + " " + sheetCalc.values[k][j] + "!=" + sheetOrig.values[k][j] + " " + sheetOrig.formulas[k][j]);
                }
            }
        }
    }

}

// Use this version for Google Sheets
var ss = SpreadsheetApp.getActive();

function onOpen() {
    "use strict";
    var menu = [
        {name: 'Run', functionName: 'openDialog'},
        {name: 'Aux', functionName: 'aux'}
    ];
    ss.addMenu('CheckCell', menu);
}


function openDialog() {
    "use strict";
    var html = HtmlService.createTemplateFromFile('index')
        .evaluate().setSandboxMode(HtmlService.SandboxMode.NATIVE);
    ss.show(html);
}

/**
 * Includes the HTML file in the main file.
 * @param filename
 * @returns {*}
 */
function include(filename) {
    "use strict";
    return HtmlService.createHtmlOutputFromFile(filename).setSandboxMode(HtmlService.SandboxMode.NATIVE)
        .getContent();
}