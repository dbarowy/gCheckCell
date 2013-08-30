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
    return {
        name: book.getId(),
        sheets: sheetsdata
    };
}
/**
 * Get external and named ranges used in the sheet
 *
 */
function getENRanges(named, external) {
    "use strict";
    var i, j, len, named_ranges = {}, external_ranges = {}, rng, sh;
    var books = {};
    for (i = 0, len = named.length; i < len; i++) {
        if (typeof books[named[i].book_name] === "undefined") {
            books[named[i].book_name] = SpreadsheetApp.openById(named[i].book_name);
        }
        //Check if the book was actually opened and that the range exists
        if (books[named[i].book_name] && (rng = books[named[i].book_name].getRangeByName(named[i].range_name))) {
            //If this is the first time we work with this workbook, initialize the object
            if (!named_ranges[named[i].book_name]) {
                named_ranges[named[i].book_name] = {};
            }
            sh = rng.getSheet().getName();
            named_ranges[named[i].book_name][named[i].range_name] = sh+"!"+rng.getA1Notation();

        }
    }

    for (i = 0, len = external.length; i < len; i++) {
        if (typeof books[external[i].book_name] === "undefined") {
            books[external[i].book_name] = SpreadsheetApp.openById(external[i].book_name);
        }
        if (books[external[i].book_name] && (rng = books[external[i].book_name].getRange(external[i].range_address))) {
            if (!external_ranges[external[i].book_name]) {
                external_ranges[external[i].book_name] = {};
            }
            external_ranges[external[i].book_name][external[i].range_address] = rng.getValues();
        }
    }
    return {named: named_ranges, external: external_ranges};
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
    Logger.log(outliers);
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
    Logger.log("Result of comparison "+SpreadsheetApp.getActiveSheet().getName());
    var orig, calc;
    orig = Utilities.jsonParse(getData());
    calc = Utilities.jsonParse(data);
    for (var i = 0; i < orig.active_book.sheets.length; i++) {
        var sheetOrig = orig.active_book.sheets[i];
        var sheetCalc = calc.active_book.sheets[i];
        for (k = 0; k < sheetOrig.values.length; k++) {
            for (j = 0; j < sheetOrig.values[k].length; j++) {
                if (sheetCalc.values[k][j] !== sheetOrig.values[k][j]) {
                    Logger.log((k+1) + " " + (j+1) + " " + sheetCalc.values[k][j] + "!=" + sheetOrig.values[k][j] + " " + sheetOrig.formulas[k][j]);
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