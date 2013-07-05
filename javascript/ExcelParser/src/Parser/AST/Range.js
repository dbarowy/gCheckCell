define("Parser/AST/Range", function () {
    "use strict";
    function Range(/*Address*/ topleft, /*Address*/bottomright) {
        this._tl = topleft;
        this._br = bottomright;
    }

    Range.prototype.toString = function () {
        return this._tl.toString() + "," + this._br.toString();
    };
    Range.prototype.getXLeft = function () {
        return this._tl.X;
    };
    Range.prototype.getXRight = function () {
        return this._br.X;
    };
    Range.prototype.getYTop = function () {
        return this._tl.Y;
    };
    Range.prototype.getYBottom = function () {
        return this._br.Y;
    };
    /**
     *
     * @param rng
     * @returns {boolean}
     * @constructor
     */
    Range.prototype.InsideRange = function (/*Range*/ rng) {
        return !(this.getXLeft() < rng.getXLeft() || this.getYTop() < rng.getYTop() || this.getXRight() > rng.getXRight() || this.getYBottom() > rng.getYBottom());
    };
    /**
     *
     * @param addr
     * @returns {boolean}
     * @constructor
     */
    Range.prototype.InsideAddr = function (/*Address*/ addr) {
        return !(this.getXLeft() < addr.X || this.getYTop() < addr.Y || this.getXRight() > addr.X || this.getYBottom() > addr.Y);
    };

    Range.prototype.SetWorksheetName = function (/*string*/ wsname) {
        this._tl.WorksheetName = wsname;
        this._br.WorksheetName = wsname;
    };
    Range.prototype.SetWorkbookName = function (/*string*/ wbname) {
        this._tl.WorkbookName = wbname;
        this._br.WorkbookName = wbname;
    };
    Range.prototype.GetCOMObject = function (/*XApplication*/app) {
        // tl and br must share workbook and worksheet
        return app.getWorkbookByName(this._tl.A1Workbook()).getWorksheetByName(this._tl.A1Worksheet()).getRange(this._tl.Y, this._tl.X, this._br.Y, this._br.X);
    };
    return Range;
});
