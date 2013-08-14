define("DataDebugMethods/AnalysisData", ["Utilities/HashMap"], function (HashMap) {
    "use strict";
    function AnalysisData() {
        this.input_ranges = [];//holds all the input ranges of TreeNodes in the Excel file.
        this.formula_nodes = new HashMap();
    }

    AnalysisData.prototype.getTerminalFormulaNodes = function () {
        var res = [], i, len, entrySet;
        // return only the formula nodes which do not provide
        // input to any other cell and which are also not
        // in our list of excluded functions
        entrySet = this.formula_nodes.getEntrySet();
        for (i = 0, len = entrySet.length; i < len; i++) {
            if (entrySet.value.parents.length===0)
                res.push(entrySet.value);
        }
        return res;
    };
    AnalysisData.prototype.getTerminalInputNodes = function () {
        // this should filter out the following two cases:
        // 1. input range is intermediate (acts as input to a formula
        //    and also contains a formula which consumes input from
        //    another range).
        // 2. the range is actually a formula cell
        var i, len, res = [];
        for (i = 0, len = this.input_ranges.length; i < len; i++) {
            if (this.input_ranges[i].dont_perturb === false) {
                res.push(this.input_ranges[i]);
            }
        }
        return res;
    };

    return AnalysisData;
});
