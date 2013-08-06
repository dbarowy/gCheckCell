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
    XWorkbook.prototype.exportData = function () {
        var sheets = [], named = [],i;
        for (i = 0; i < this._sheets.length; i++) {
            sheets.push(this._sheets[i].exportData());
        }
        return {
            name: this.Name,
            sheets: sheets,
            named_ranges: named
        };
    };

    XWorkbook.prototype.getWorksheets = function () {
        return this._sheets;
    };

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