define("XClasses/XWorkbook", ["XClasses/XWorksheet"], function (XWorksheet) {
    "use strict";
    /**
     * Generic Workbook interface.
     * @param wb Domain specific workbook object
     * @constructor
     */
    var XWorkbook = function (/*Workbook*/ wb, /*XApplication*/app) {
        this._sheets = [];
        this.Application = app;
        this.Name = wb.name;
        for (var i = 0, len = wb.sheets.length; i < len; i++) {
            this._sheets.push(new XWorksheet(wb.sheets[i], this));
        }

    };

    /**
     * Export the data contained in this book to compare it with the values contained by the Google sheet.
     * @returns {{name: *, sheets: Array, n_ranges: Array}}
     */
    XWorkbook.prototype.exportData = function () {
        var sheets = [], named = [], i;
        for (i = 0; i < this._sheets.length; i++) {
            sheets.push(this._sheets[i].exportData());
        }
        return {
            name: this.Name,
            sheets: sheets,
            n_ranges: named
        };
    };

    /**
     * Return all the sheets in the book.
     * @returns {Array}
     */
    XWorkbook.prototype.getWorksheets = function () {
        return this._sheets;
    };

    /**
     * Get the worksheet with the given name.
     * If the sheet does not exist in this book, throw an error
     * @param name
     * @returns {*}
     */
    XWorkbook.prototype.getWorksheetByName = function (/*string*/name) {
        var i, len;
        for (i = 0, len = this._sheets.length; i < len; i++) {
            if (this._sheets[i].Name === name) {
                return this._sheets[i];
            }
        }
        throw new Error("This sheet does not exist");
    };

    return XWorkbook;
});