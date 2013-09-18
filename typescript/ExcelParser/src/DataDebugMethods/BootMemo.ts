/**
 This file is part of CheckCell for Google Spreadsheets and Office 2013.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with GCC; see the file COPYING3.  If not see
 <http://www.gnu.org/licenses/>.
 */
"use strict";
import HashMap = require("../Utilities/HashMap");
import FunctionOutput = require("FunctionOutput");
import XApplication = require("../XClasses/XApplication");

/**
 * @Author Alexandru Toader, alexandru.v.toader@gmail.com
 * @Description The BootMemo class is used to optimize the recomputation.
 * The chances are that for small ranges, the same pattern of excluded elements will appear multimple times
 * There is no point in recomputing these ranges as we can just cache the results.
 */
export class BootMemo {
    /*HashMap<InputSample, FunctionOutput<string>[]>*/
    public _d = new HashMap();
    constructor() {}

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
    public fastReplace(/*XRange*/com, /*InputSample*/orig, /*InputSample*/sample, /*TreeNode[]*/outputs, /*bool*/replace_original) {
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
    }

    /**
     * Replace the values of the XRange with the input sample. And start the recomputation.
     * @param com
     * @param input
     */
    public static replaceExcelRange(/*XRange*/com, /*InputSample*/input) {
        com.setValues(input.input_array);
        XApplication.recompute_book();
    }
}
