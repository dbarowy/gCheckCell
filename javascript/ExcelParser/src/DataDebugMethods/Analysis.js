define("DataDebugMethods/Analysis", ["Utilities/HashMap", "DataDebugMethods/InputSample", "DataDebugMethods/BootMemo", "DataDebugMethods/FunctionOutput"], function (HashMap, InputSample, BootMemo, FunctionOutput) {
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
            //TODO WHY?
            //BootMemo.ReplaceExcelRange(com,s)
        }
        return d;
    };

    Analysis.storeOutputs = function (/*TreeNode[]*/outputs) {
        var i, len;
        var /*HashMap<TreeNode, string>*/ d = new HashMap();
        for (i = 0, len = outputs.length; i < len; i++) {
            d.put(outputs[i], outputs[i].com.getValue() + "");
        }
        return d;
    };

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

    Analysis.computeBootstraps = function (/*int*/num_bootstraps, /*HashMap<TreeNode, InputSample>*/initial_inputs, /*InputSample[][]*/resamples, /*TreeNode[]*/input_arr, /*TreeNode[]*/output_arr, /*AnalysisData*/data) {
        var i, bootstraps = [], com, fos, b, t;
        var /*BootMemo[]*/bootsaver = new Array(input_arr.length);
        // compute function outputs for each bootstrap
        // inputs[i] is the ith input range
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
                if (typeof score !== "undefined") {
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
        for (i = 0; i < input_range.length; i++) {
            for (j = 0; j < input_range[i]; j++) {
                aux = input_range[i][j];
                input_cells = new TreeNode(aux, aux.Worksheet, aux.Workbook);
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
                if (typeof(score = iexc_scores.get(xtree)) !== "undefined") {
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

    Analysis.BootstrapFrequency = function (/*FunctionOutput<string>[]*/ boots) {
        var counts = new HashMap(), i, key, count;
        for (i = 0; i < boots.length; i++) {
            key = boots[i].value;
            if ((count = counts.get(key))) {
                counts.put(key, count + 1);
            } else {
                counts.put(key, 1);
            }
        }
        var p_values = new HashMap();
        var entry = counts.getEntrySet();
        for (i = 0; i < entry.length; i++) {
            p_values.put(entry[i].key, entry[i].value / boots.length);
        }
        return p_values;
    };

    Analysis.rejectNullHypothesis = function (/*FunctionOutput[]*/ boots, /* string*/ original_output, /*int*/ exclude_index) {
        var boots_exc = [], i, j, p_val;
        if (typeof boots[0].value === "string") {
            // filter bootstraps which include exclude_index
            for (i = 0; i < boots.length; i++) {
                for (j = 0; j < boots[i].excludes.length; j++) {
                    if (boots[i].excludes[j] === exclude_index) {
                        boots_exc.push(boots[i]);
                        break;
                    }
                }
            }
            var freq = this.BootstrapFrequency(boots_exc);
            if ((p_val = freq.get(original_output))) {
                p_val = 0.0;
            }
            return p_val < 0.05;
        }
        else {
            for (i = 0; i < boots.length; i++) {
                for (j = 0; j < boots[i].excludes.length; j++) {
                    if (boots[i].excludes[j] === exclude_index) {
                        boots_exc.push(boots[i]);
                        break;
                    }
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

    /**
     * Check if all the function outputs in the array are numeric
     * @param boots
     * @returns {boolean}
     */
    Analysis.functionOutputsAreNumeric = function (/*FunctionOutput[]*/boots) {
        var b;
        for (b = 0; b < boots.length; b++) {
            if (!isFinite(boots[b].value)) {
                return false;
            }
        }
        return true;
    };

    Analysis.convertToNumericOutput = function (/*FunctionOutput<string>[]*/boots) {
        var b, fi_boots = new Array(boots.length), value, boot;
        for (b = 0; b < boots.length; b++) {
            boot = boots[b];
            //convert to number
            value = +(boot.value);
            fi_boots[b] = new FunctionOutput(value, boot.excludes);
        }
        return fi_boots;
    };

    Analysis.numericHypothesisTest = function (/*TreeNode*/ rangeNode, /*TreeNode*/ functionNode, /* FunctionOutput[]*/ boots, /*string*/ initial_output, /*bool*/ weighted) {
        var i, j, weight, outlieriness, score, xtree;
        var input_range = rangeNode.com.getCellMatrix();
        var input_cells = [], aux;
        for (i = 0; i < input_range.length; i++) {
            for (j = 0; j < input_range[i]; j++) {
                aux = input_range[i][j];
                input_cells = new TreeNode(aux, aux.Worksheet, aux.Workbook);
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
        var boots = this.computeBootstraps(num_bootstraps, initial_inputs, resamples, input_rngs, output_fns, data);

        //restore formulas
        //TODO DO we really need to do this?
        //Why would we restore formulas. The formulas have never been modified
        formula_nodes = data.formula_nodes.getEntrySet();
        for (i = 0; i < formula_nodes.length; i++) {
            node = formula_nodes[i].value;
            if (node.is_formula) {
                node.com.setFormula(node.formula);
            }
        }

        return this.scoreInputs(input_rngs, output_fns, initial_outputs, boots, weighted);

    };

    return Analysis;
})
;