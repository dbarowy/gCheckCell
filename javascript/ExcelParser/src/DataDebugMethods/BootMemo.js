/**
 * The BootMemo class is used to optimize the recomputation.
 * The chances are that for small ranges, the same pattern of excluded elements will appear multimple times
 * There is no point in recomputing these ranges as we can just cache the results.
 */
define("DataDebugMethods/BootMemo", ["Utilities/HashMap", "DataDebugMethods/FunctionOutput", "XClasses/XApplication"], function (HashMap, FunctionOutput, XApplication) {
    "use strict";
    function BootMemo() {
        /*HashMap<InputSample, FunctionOutput<string>[]>*/
        this._d = new HashMap();
    }

    /**
     * Try to replace the values in the given range by the input sample.
     * If this sample has already been used, just take the result from the cache
     * @param com The range we want to modify
     * @param orig The original InputSample
     * @param sample The input sample we want to use
     * @param outputs
     * @param replace_original
     * @returns {*}
     */
    BootMemo.prototype.fastReplace = function (/*XRange*/com, /*InputSample*/orig, /*InputSample*/sample, /*TreeNode[]*/outputs, /*bool*/replace_original) {
        var fo_arr, k;
        if (typeof(fo_arr = this._d.get(sample)) === "undefined") {
            //replace the COM value
            BootMemo.replaceExcelRange(com, sample);
            //initialize array;
            fo_arr = new Array(outputs.length);
            for (k = 0; k < outputs.length; k++) {
                fo_arr[k] = new FunctionOutput(outputs[k].com.getValue() + "", sample.excludes);
            }
            this._d.put(sample, fo_arr);
            if (replace_original) {
                BootMemo.replaceExcelRange(com, orig);
            }
        }
        return fo_arr;
    };
    /**
     * Replace the values of the XRange with the input sample. And start the recomputation.
     * @param com
     * @param input
     */
    BootMemo.replaceExcelRange = function (/*XRange*/com, /*InputSample*/input) {
        com.setValues(input.input_array);
        XApplication.recompute_book();
    };
    return BootMemo;
});