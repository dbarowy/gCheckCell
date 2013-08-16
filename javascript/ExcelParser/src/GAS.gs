function _getSheetData(sheet){
    var dataRange = sheet.getDataRange();
    dataRange.setBackground("#FFFFFF");
    return{
        name:sheet.getSheetName(),
        values:dataRange.getValues(),
        formulas:dataRange.getFormulas()
    };
}

function _getBookData(book){
    var sheets, sheetsdata=[];
    sheets=book.getSheets();
    for(var i=0; i<sheets.length; i++){
        sheetsdata.push(_getSheetData(sheets[i]));
    }
    return {
        name:book.getId(),
        sheets:sheetsdata,
        named_ranges:[]
    };
}

function getData(){
    var res= {
        active_book:_getBookData(SpreadsheetApp.getActive()),
        external_books:[]
    };
    return Utilities.jsonStringify(res);
}

function _getColorBook(book){
    var sheets=book.getSheets();
    var res={};
    var id;
    for(i=0;i<sheets.length; i++){
        res[sheets[i].getSheetName()]=sheets[i].getDataRange().getBackgrounds();
    }
    return res;
}

function _getColorData(){
    var activeSheet = SpreadsheetApp.getActive();
    var res={};
    res[activeSheet.getId()]=_getColorBook(activeSheet);
    return res;
}

function colorCells(outliers){
    var colors = _getColorData();
    for(var i=0; i<outliers.length; i++){
        var range=outliers[i];
        if(colors[range.cell.book] && colors[range.cell.book][range.cell.sheet] && colors[range.cell.book][range.cell.sheet][range.cell.row]&& colors[range.cell.book][range.cell.sheet][range.cell.row][range.cell.col]){
            colors[range.cell.book][range.cell.sheet][range.cell.row][range.cell.col] = range.color;
        }
    }

    _updateColors(colors);
}

function _updateColors(colors){
    Logger.log(colors);
}

function compare(data){
    Logger.log("Result of comparison");
    var orig, calc;
    orig=Utilities.jsonParse(getData());
    calc=Utilities.jsonParse(data);
    for(var i=0; i< orig.active_book.sheets.length; i++){
        var sheetOrig = orig.active_book.sheets[i];
        var sheetCalc = calc.active_book.sheets[i];
        for(k=0; k<sheetOrig.values.length; k++){
            for(j=0; j<sheetOrig.values[k].length; j++){
                if(sheetCalc.values[k][j]!==sheetOrig.values[k][j]){
                    Logger.log(k+" "+ j + " "+sheetCalc.values[k][j] +"!=" +sheetOrig.values[k][j]+" "+ sheetOrig.formulas[k][j] );
                }
            }
        }
    }

};

// Use this version for Google Sheets
var ss = SpreadsheetApp.getActive();

function onOpen() {
    var menu = [{name: 'Open', functionName: 'openDialog'},{name: 'Color', functionName: 'colorCells'}];
    ss.addMenu('Dialog', menu);
}



function openDialog() {
    var html= HtmlService.createTemplateFromFile('index')
        .evaluate().setSandboxMode(HtmlService.SandboxMode.NATIVE);
    ss.show(html);
}


function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).setSandboxMode(HtmlService.SandboxMode.NATIVE)
        .getContent();
}