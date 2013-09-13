/**
 * For each sheet extract all the charts.
 * For each chart get all the ranges that feed into that chart and create a formula string using their addresses.
 * Add the formulas to a temporary sheet in the spreadsheet, one in each cell, extract the sheet data as for any other sheet and return it.
 * If there are no charts, return null.
 * At this point, every computation involving
 * @returns {*}
 * @private
 */
function _getChartData() {
    var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    var formulas = [
        []
    ];
    var sheetName = "_";
    for (i = 0; i < sheets.length; i++) {
        sheetName += sheets[i].getName();
        var charts = sheets[i].getCharts();
        for (j = 0; j < charts.length; j++) {
            var ranges = charts[j].getRanges();
            var formula = "=AVERAGE(";
            for (k = 0; k < ranges.length; k++) {
                formula += "'" + ranges[k].getSheet().getName() + "'" + "!" + ranges[k].getA1Notation() + ",";
            }
            formulas[0].push(formula.substring(0, formula.length - 1) + ")");
        }
    }
    if (formulas[0].length) {
        var chartSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
        chartSheet.getRange(1, 1, 1, formulas[0].length).setFormulas(formulas);
        var values = chartSheet.getDataRange().getValues();
        SpreadsheetApp.getActive().deleteSheet(chartSheet);
        return {
            name: sheetName,
            values: values,
            formulas: formulas
        };
    } else {
        return null;
    }
}
/*
 Cleans up the database of every object that has a spreadsheet_id field with the value of the active book's id
 Each spreadsheet has some data associated with it in ScriptDb to keep track of the colors.
 */
function clean_up() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var db = ScriptDb.getMyDb();
    var res = db.query({spreadsheet_id: spreadsheet.getId()});
    if (res.hasNext()) {
        db.removeById(res.next().getId());
    }
}
/**
 * Save the original backgrounds used for each sheet in this book in ScriptDb.
 */
function saveOriginalBackground() {
    var book=SpreadsheetApp.getActive();
    var primaryKey = book.getId(), cache = {}, secondaryKey = "", i;
    var sheets = book.getSheets();
    var db = ScriptDb.getMyDb();
    for (i = 0; i < sheets.length; i++) {
        secondaryKey += sheets[i].getName();
    }
    var res = db.query({spreadsheet_id: book.getId(), sheet_names: secondaryKey});
    if (!res.hasNext()) {
        //just clean up everything associated with this book to keep the database light
        clean_up();
        for (i = 0; i < sheets.length; i++) {
            cache[sheets[i].getName()] = compressMatrix(sheets[i].getDataRange().getBackgrounds());
        }
        db.save({spreadsheet_id: primaryKey, sheet_names: secondaryKey, backgrounds: cache});
    }
}

/**
 * Compress the color matrix using a very naive algorithm.
 * Go through the matrix row by row and column by column and for each color you encounter,count the number of times it appears in a row
 * red red red blue blue
 * blue green green green green =>[{color:"red",count:3},{color:"blue",count:3},{color:"green",count:4}]
 * We also keep track of the number of rows and columns as we will need these to reconstruct the matrix
 * @param backgrounds
 * @returns {{colors: Array, rows: *, columns: *}}
 */
function compressMatrix(backgrounds) {
    var i, j, aux, counter, res = [];
    aux = backgrounds[0][0];
    counter = 0;
    for (i = 0; i < backgrounds.length; i++) {
        for (j = 0; j < backgrounds[i].length; j++) {
            if (aux != backgrounds[i][j]) {
                res.push({color: aux, count: counter});
                aux = backgrounds[i][j];
                counter = 1;
            } else {
                counter++;
            }
        }
    }
    res.push({color: aux, count: counter});
    return {colors: res, rows: backgrounds.length, columns: backgrounds[0].length};
}

/**
 * Restore the original background of each sheet in the book.
 * The background colors are retrieved from the database.
 */
function restoreOriginalBackgrounds() {
    var book=SpreadsheetApp.getActive();
    var secondaryKey = "", i;
    var sheets = book.getSheets();
    var db = ScriptDb.getMyDb();
    for (i = 0; i < sheets.length; i++) {
        secondaryKey += sheets[i].getName();
    }
    var res = db.query({spreadsheet_id: book.getId(), sheet_names: secondaryKey});
    if (res.hasNext()) {
        var bk  = res.next().backgrounds;
        for (var sheet in bk) {
            if (bk.hasOwnProperty(sheet)) {
                var back = uncompressMatrix(bk[sheet]);
                var sh = book.getSheetByName(sheet);
                if (sh) {
                    var rng = sh.getRange(1, 1, bk[sheet].rows, bk[sheet].columns);
                    rng.setBackgrounds(back);
                }
            }
        }
    } else {
        Logger.log("Empty cache");
    }
    clean_up();
}

/**
 * Do the reverse of compressMatrix
 * @param background
 * @returns {Array}
 */
function uncompressMatrix(background) {
    var i, j, c = 0, cols = background.columns;
    var back = [], row = [];
    var colors = background.colors;
    for (i = 0; i < colors.length; i++) {
        for (j = 0; j < colors[i].count; j++) {
            if (c >= cols) {
                back.push(row);
                c = 0;
                row = [];
            }
            row.push(colors[i].color);
            c++;
        }
    }
    back.push(row);
    return back;
}

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
    var charts = _getChartData();
    if (charts) {
        sheetsdata.push((charts));
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
            named_ranges[named[i].book_name][named[i].range_name] = sh + "!" + rng.getA1Notation();

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
    Logger.log("here");
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
    Logger.log("Result of comparison " + SpreadsheetApp.getActiveSheet().getName());
    var orig, calc;
    orig = Utilities.jsonParse(getData());
    calc = Utilities.jsonParse(data);
    for (var i = 0; i < orig.active_book.sheets.length; i++) {
        var sheetOrig = orig.active_book.sheets[i];
        var sheetCalc = calc.active_book.sheets[i];
        for (k = 0; k < sheetOrig.values.length; k++) {
            for (j = 0; j < sheetOrig.values[k].length; j++) {
                if (sheetCalc.values[k][j] !== sheetOrig.values[k][j]) {
                    Logger.log(sheetCalc.name + (k + 1) + " " + (j + 1) + " " + sheetCalc.values[k][j] + "!=" + sheetOrig.values[k][j] + " " + sheetOrig.formulas[k][j]);
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
        {name: 'Clear coloring', functionName: 'restoreOriginalBackgrounds'}
    ];
    ss.addMenu('CheckCell', menu);
}

function aux() {
    var sheets = SpreadsheetApp.getActive().getSheets();
    for (i = 0; i < sheets.length; i++) {
        sheets[i].getDataRange().setBackground("#FFFFFF");
    }
}
function openDialog() {
    "use strict";
    var html = HtmlService.createTemplateFromFile('index')
        .evaluate().setSandboxMode(HtmlService.SandboxMode.NATIVE);
    saveOriginalBackground();
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