define("DataDebugMethods/BootMemo", ["Utilities/HashMap", "DataDebugMethods/FunctionOutput", "XClasses/XApplication"], function (HashMap, FunctionOutput, XApplication) {
    "use strict";
    function BootMemo() {
        /*HashMap<InputSample, FunctionOutput<string>[]>*/
        this._d = new HashMap();
    }

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

    BootMemo.replaceExcelRange = function (/*XRange*/com, /*InputSample*/input) {
        com.setValues(input.input_array);
        XApplication.recompute_book();
    };
    return BootMemo;
});