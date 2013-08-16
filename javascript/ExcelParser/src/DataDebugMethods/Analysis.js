define("DataDebugMethods/Analysis", ["Utilities/HashMap", "DataDebugMethods/InputSample", "DataDebugMethods/BootMemo", "DataDebugMethods/FunctionOutput", "DataDebugMethods/TreeNode"], function (HashMap, InputSample, BootMemo, FunctionOutput, TreeNode) {
    "use strict";
    var Analysis = {};
    /**
     * Propagate the weights
     * @param data
     */
    Analysis._propagateWeights = function (/*AnalysisData*/data) {
        // starting set of functons; roots in the forest
        var functions = data.getTerminalFormulaNodes(), i, len;
        //for each tree
        for (i = 0, len = functions.length; i < len; i++) {
            functions[i].weight = this._propagateTreeNodeWeight(functions[i]);
        }
    };

    Analysis._propagateTreeNodeWeight = function (/*TreeNode*/t) {
        var children = t.children, weight, i, len;
        // if we have no inputs, then we ARE an input
        if (children.length === 0) {
            t.weight = 1;
            return 1;
        } else {
            // otherwise we have inputs, recursively compute their weights
            // and add to this one
            weight = 0;
            for (i = 0, len = children.length; i < len; i++) {
                weight += this._propagateTreeNodeWeight(children[i]);
            }
            t.weight = weight;
            return weight;
        }
    };
    /**
     *
     * @param inputs
     * @returns <TreeNode, InputSample>
     */
    Analysis.storeInputs = function (/*TreeNode[]*/inputs) {
        var /*HashMap<TreeNode, InputSample>*/ d = new HashMap();
        var i, s, com, len;
        for (i = 0, len = inputs.length; i < len; i++) {
            s = new InputSample(inputs[i].rows, inputs[i].columns);
            com = inputs[i].com;
            s.addArray(com.getValues());
            d.put(inputs[i], s);
            // this is to force excel to recalculate its outputs
            // exactly the same way that it will for our bootstraps
            BootMemo.replaceExcelRange(com, s)
        }
        return d;
    };
    /**
     * Save the actual value of the function.
     * @param outputs
     * @returns A map of TreeNode->String which represents associates each treenode with its output
     */
    Analysis.storeOutputs = function (/*TreeNode[]*/outputs) {
        var i, len;
        var /*HashMap<TreeNode, string>*/ d = new HashMap();
        for (i = 0, len = outputs.length; i < len; i++) {
            // we want to save the actual value of the function
            // since we don't know whether the function is string or numeric
            // until later, leave it as string for now
            d.put(outputs[i], outputs[i].com.getValue() + "");
        }
        return d;
    };

    /**
     * Generate the given number of resamples from the original value
     * @param num_bootstraps The number of resamples to generate
     * @param orig_vals The original value from which to generate the bootstraps
     * @returns {Array}
     */
    Analysis.resample = function (/*int*/num_bootstraps, /*InputSample*/orig_vals) {
        var ss = new Array(num_bootstraps), j, i, s, inc_count, input_idx, size;
        // sample with replacement to get num_bootstraps
        // bootstrapped samples
        for (i = 0; i < num_bootstraps; i++) {
            s = new InputSample(orig_vals.rows, orig_vals.cols);
            size = orig_vals.rows * orig_vals.cols;
            // make a vector of index counters
            inc_count = new Array(size);
            for (j = 0; j < size; j++) {
                inc_count[j] = 0;
            }
            //randomly sample j values, with replacement
            for (j = 0; j < size; j++) {
                input_idx = Math.floor(Math.random() * size) % size;
                inc_count[input_idx]++;
                s.add(orig_vals.getInput(input_idx));
            }
            s.setIncludes(inc_count);
            // add the new InputSample to the output array
            ss[i] = s;
        }
        return ss;
    };

    Analysis.init3DArray = function (/*int*/fn_idx_sz, /*int*/o_idx_sz, /*int*/b_idx_sz) {
        var bs = new Array(fn_idx_sz), i, j;
        for (i = 0; i < fn_idx_sz; i++) {
            bs[i] = new Array(o_idx_sz);
            for (j = 0; j < o_idx_sz; j++) {
                bs[i][j] = new Array(b_idx_sz);
            }
        }
        return bs;
    };

    /**
     * Return a 3D array with FunctionOutputs
     * The first index represents the fth function output
     * The second index represents the ith input
     * The third index represents the bth bootstrap
     * @param num_bootstraps The number of resamples to generate for each bootstrap
     * @param initial_inputs an array of initial inputs
     * @param resamples
     * @param input_arr
     * @param output_arr
     * @param data
     * @returns {*}
     */
    Analysis.computeBootstraps = function (/*int*/num_bootstraps, /*HashMap<TreeNode, InputSample>*/initial_inputs, /*InputSample[][]*/resamples, /*TreeNode[]*/input_arr, /*TreeNode[]*/output_arr) {
        var i, com, fos, b, t;
        var /*BootMemo[]*/bootsaver = new Array(input_arr.length);
        // compute function outputs for each bootstrap
        // inputs[i] is the ith input range
        var bootstraps = this.init3DArray(output_arr.length, input_arr.length, num_bootstraps);
        for (i = 0; i < input_arr.length; i++) {
            t = input_arr[i];
            com = t.com;
            bootsaver[i] = new BootMemo();
            // replace the values of the COM object with the jth bootstrap,
            // save all function outputs, and
            // restore the original input
            for (b = 0; b < num_bootstraps; b++) {
                fos = bootsaver[i].fastReplace(com, initial_inputs.get(t), resamples[i][b], output_arr, false);
                for (var f = 0; f < output_arr.length; f++) {
                    bootstraps[f][i][b] = fos[f];
                }
            }
            BootMemo.replaceExcelRange(com, initial_inputs.get(t));
        }
        return bootstraps;

    };
    /**
     * Merge the two dictionaries and sum the scores for key that are in both dictionaries
     * @param d1
     * @param d2
     * @returns A dictionary that contains a mapping from TreeNodes to integers
     */
    Analysis.dictAdd = function (/*<TreeNode, int>*/d1, /*<TreeNode, int>*/d2) {
        var d3 = new HashMap(), set, i, score;
        if (d1 !== null) {
            set = d1.getEntrySet();
            for (i = 0; i < set.length; i++) {
                d3.put(set[i].key, set[i].value);
            }
        }
        if (d2 !== null) {
            set = d2.getEntrySet();
            for (i = 0; i < set.length; i++) {
                score = d3.get(set[i].key);
                if (score == 0 || score) {
                    d3.put(set[i].key, set[i].value + score);
                } else {
                    d3.put(set[i].key, set[i].value);
                }
            }
        }
        return d3;
    };

    Analysis.stringHypothesisTest = function (/*TreeNode*/ rangeNode, /*TreeNode*/ functionNode, /*FunctionOutput[]*/ boots, /*string*/ initial_output, /*bool*/ weighted) {
        var i, j, weight, xtree, score;
        //this range's input cells
        var input_range = rangeNode.com.getCellMatrix();
        var input_cells = [], aux;
        //Create TreeNodes from the cells that feed into this range
        for (i = 0; i < input_range.length; i++) {
            for (j = 0; j < input_range[i]; j++) {
                aux = input_range[i][j];
                input_cells = new TreeNode(aux, aux.Worksheet, aux.Workbook);
                //TODO Should I establish a parent-child relationship?
            }
        }

        //scores
        var iexc_scores = new HashMap();
        //exclude each index, in turn
        for (i = 0; i < input_cells.length; i++) {
            //default weight
            weight = 1;
            //add weight to score if test fails
            xtree = input_cells[i];
            if (weighted) {
                weight = Math.round(functionNode.weight);
            }
            if (this.rejectNullHypothesis(boots, initial_output, i)) {
                if (score = iexc_scores.get(xtree)) {
                    iexc_scores.put(xtree, score + weight);
                } else {
                    iexc_scores.put(xtree, weight);
                }
            } else {
                if (!iexc_scores.get(xtree)) {
                    iexc_scores.put(xtree, 0);
                }
            }
        }
        return iexc_scores;

    };

    /**
     * Count instances of unique string output values and return an object with the outputs as keys and the frequency as values
     * @param boots
     * @returns An object with the outputs as keys and the frequency as values
     */
    Analysis.BootstrapFrequency = function (/*FunctionOutput<string>[]*/ boots) {
        var counts = {}, entry, i, key, count;
        for (i = 0; i < boots.length; i++) {
            key = boots[i].value;
            if ((count = counts[key])) {
                counts[key] = count + 1;
            } else {
                counts[key] = 1;
            }
        }
        for (entry in counts) {
            if (counts.hasOwnProperty(entry)) {
                counts[entry] = counts[entry] / boots.length
            }
        }
        return counts;
    };

    Analysis.rejectNullHypothesis = function (/*FunctionOutput[]*/ boots, /* string*/ original_output, /*int*/ exclude_index) {
        var boots_exc = [], i, j, p_val;
        if (typeof boots[0].value === "string") {
            // filter bootstraps which include exclude_index
            for (i = 0; i < boots.length; i++) {
                if (boots[i].excludes[exclude_index] != null) {
                    boots_exc.push(boots[i]);
                }
            }
            var freq = this.BootstrapFrequency(boots_exc);
            if (!(p_val = freq[original_output])) {
                p_val = 0.0;
            }
            return p_val < 0.05;
        }
        else {
            for (i = 0; i < boots.length; i++) {
                if (boots[i].excludes[exclude_index] != null) {
                    boots_exc.push(boots[i]);
                }
            }

            var low_index = Math.floor((boots_exc.length - 1) * 0.025);
            var high_index = Math.ceil((boots_exc.length - 1) * 0.975);
            var low_value = boots_exc[low_index].value;
            var high_value = boots_exc[high_index].value;
            var original_output_d = +original_output;
            var low_value_tr = Math.round(low_value * 10000) / 10000;
            var high_value_tr = Math.round(high_value * 10000) / 10000;
            var original_tr = Math.round(original_output_d * 10000) / 10000;

            if (high_value_tr != low_value_tr) {
                if (original_tr < low_value_tr) {
                    return Math.abs((original_tr - low_value_tr) / Math.abs(high_value_tr - low_value_tr)) * 100.0;
                } else if (original_tr > high_value_tr) {
                    return Math.abs((original_tr - high_value_tr) / Math.abs(high_value_tr - low_value_tr)) * 100.0;
                }
            } else if (high_value_tr != original_tr || low_value_tr != original_tr) {
                if (original_tr < low_value_tr) {
                    return Math.abs(original_tr - low_value_tr) * 100.0;
                } else if (original_tr > high_value_tr) {
                    return Math.abs(original_tr - high_value_tr) * 100.0;
                }
            }
            return 0.0;
        }

    };

    Analysis.scoreInputs = function (/*TreeNode[]*/ input_rngs, /*TreeNode[]*/output_fns, /*<TreeNode, string>*/initial_outputs, /*FunctionOutput<string>[][][]*/ boots, /*bool*/ weighted) {
        var i, f, functionNode, rangeNode, s;
        //dict of exclusion scores for each input CELL TreeNode
        var iexc_scores = new HashMap();

        // convert bootstraps to numeric, if possible, sort in ascending order
        // then compute quantiles and test whether an input is an outlier
        // i is the index of the range in the input array; an ARRAY of CELLS
        for (i = 0; i < input_rngs.length; i++) {
            for (f = 0; f < output_fns.length; f++) {
                //this functio outout node
                functionNode = output_fns[f];
                //this function's input range treenode
                rangeNode = input_rngs[i];
                if (this.functionOutputsAreNumeric(boots[f][i])) {
                    s = this.numericHypothesisTest(rangeNode, functionNode, boots[f][i], initial_outputs.get(functionNode), weighted);
                } else {
                    s = this.stringHypothesisTest(rangeNode, functionNode, boots[f][i], initial_outputs.get(functionNode), weighted);
                }
                iexc_scores = this.dictAdd(iexc_scores, s);
            }
        }

        return iexc_scores;
    };

    Analysis.ColorOutliers = function (/*HashMap<TreeNode, int>*/input_exclusion_scores) {
        //find value of the max element. we use this to calibrate our scale
        var len, max_score, min_score, i, entrySet, outlierValue = "", color, outliers = [];
        var componentToHex = function (c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        };
        var rgbToHex = function (r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        };

        entrySet = input_exclusion_scores.getEntrySet();
        if (entrySet.length > 0) {
            max_score = entrySet[0].value;
            min_score = entrySet[0].value;
        }
        for (i = 1, len = entrySet.length; i < len; i++) {
            if (entrySet[i].value > max_score) {
                max_score = entrySet[i].value;
            }
            if (entrySet[i].value < min_score && entrySet[i].value != 0) {
                min_score = entrySet[i].value;
            }
        }
        if (min_score == max_score) {
            min_score = 0;
        }
        min_score = 0.50 * min_score; //this is so that the smallest outlier also gets colored, rather than being white
        for (i = 0, len = entrySet.length; i < len; i++) {
            var cell = entrySet[i].key;
            var cval = 0;
            if (max_score == min_score) {
                cval = 0;
            } else {
                if (entrySet[i].value != 0) {
                    cval = Math.round(255 * (entrySet[i].value - min_score) / (max_score - min_score));
                    // outlierValue += cell.com.getA1Address() + ":" + entrySet[i].value + ";\t" + cval + "\n";
                }
            }
            if (cval != 0) {
                outliers.push({cell: {book: cell.com.Workbook.Name, sheet: cell.com.Worksheet.Name, row: cell.com.startRow, col: cell.com.startCol}, color: rgbToHex(255, 255 - Math.round(cval), 255 - Math.round(cval))});
            }
        }
        return outliers;
    };


    /**
     * Check if all the function outputs in the array are numeric
     * @param boots
     * @returns {boolean}
     */
    Analysis.functionOutputsAreNumeric = function (/*FunctionOutput[]*/boots) {
        var b;
        for (b = 0; b < boots.length; b++) {
            if (!isFinite(boots[b].value) || boots[b].value == "" || boots[b].value == null) {
                return false;
            }
        }
        return true;
    };
    /**
     * Convert each value in the FunctionOutputs to a number
     * @param boots
     * @returns The FunctionOutput array with all the numbers converted to numbers
     */
    Analysis.convertToNumericOutput = function (/*FunctionOutput<string>[]*/boots) {
        var b;
        for (b = 0; b < boots.length; b++) {
            boots[b].value = +boots[b].value;
        }
        return boots;
    };

    Analysis.numericHypothesisTest = function (/*TreeNode*/ rangeNode, /*TreeNode*/ functionNode, /* FunctionOutput[]*/ boots, /*string*/ initial_output, /*bool*/ weighted) {
        var i, j, weight, outlieriness, score, xtree;
        var input_range = rangeNode.com.getCellMatrix();
        var input_cells = [], aux;
        for (i = 0; i < input_range.length; i++) {
            for (j = 0; j < input_range[i].length; j++) {
                aux = input_range[i][j];
                input_cells.push(new TreeNode(aux, aux.Worksheet, aux.Workbook));
            }
        }

        //scores
        var input_exclusion_scores = new HashMap();
        //convert to numeric
        //sort
        var sortOrder = function (a, b) {
            return a.value - b.value;
        };
        var sorted_num_boots = this.convertToNumericOutput(boots).sort(sortOrder);
        //for each excluded index, test whether the original input
        //falls outside our bootstrap confidence bounds
        for (i = 0; i < input_cells.length; i++) {
            //default weight
            weight = 1;
            //add weight to score if test fails
            xtree = input_cells[i];
            if (weighted) {
                weight = Math.floor(functionNode.weight);
            }
            outlieriness = this.rejectNullHypothesis(sorted_num_boots, initial_output, i);
            if (outlieriness != 0.0) {
                //get the xth indexed input in input_rng i
                if ((score = input_exclusion_scores.get(xtree))) {
                    input_exclusion_scores.put(xtree, score + weight * outlieriness);
                } else {
                    input_exclusion_scores.put(xtree, weight * outlieriness);
                }
            } else {
                //we need to at least add the value to the tree
                if (!input_exclusion_scores.get(xtree)) {
                    input_exclusion_scores.put(xtree, 0);
                }
            }

        }
        return input_exclusion_scores;
    };


    /**
     * Perform the the bootstrap operation
     * @param num_bootstraps the number of bootstraps samples to get
     * @param data
     * @param app
     * @param weighted
     * @constructor
     */
    Analysis.Bootstrap = function (/*int*/num_bootstraps, /*AnalysisData*/data, /*XApplication*/app, /*Boolean*/weighted) {
        var output_fns, input_rngs, resamples, initial_inputs, initial_outputs, i, formula_nodes, node;
        //this modifies the weights of each node
        Analysis._propagateWeights(data);
        // filter out non-terminal functions
        output_fns = data.getTerminalFormulaNodes();
        // filter out non-terminal inputs
        input_rngs = data.getTerminalInputNodes();
        //we save initial inputs here
        initial_inputs = this.storeInputs(input_rngs);
        initial_outputs = this.storeOutputs(output_fns);
        resamples = new Array(input_rngs.length);
        // populate bootstrap array
        // for each input range (a TreeNode)
        for (i = 0; i < input_rngs.length; i++) {
            resamples[i] = this.resample(num_bootstraps, initial_inputs.get(input_rngs[i]))
        }
        //first index: the fth function output
        //second index: the ith input
        //third index: the bth bootstrap
        var boots = this.computeBootstraps(num_bootstraps, initial_inputs, resamples, input_rngs, output_fns);
        //restore formulas

        return this.scoreInputs(input_rngs, output_fns, initial_outputs, boots, weighted);

    };

    return Analysis;
})
;