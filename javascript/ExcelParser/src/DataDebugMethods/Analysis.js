define("DataDebugMethods/Analysis", ["Utilities/HashMap", "DataDebugMethods/InputSample", "DataDebugMethods/BootMemo"], function (HashMap, InputSample, BootMemo) {
    "use strict";
    var Analysis = {};
    /**
     * Propagate the weights
     * @param data
     * @private
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
        if (children.length === 0) {
            t.weight = 1;
            return 1;
        } else {
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
        var i, d = new HashMap(), s, com;
        for (i = 0; i < inputs.length; i++) {
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
        var i, d = new HashMap();
        for (i = 0; i < outputs.length; i++) {
            d.put(outputs[i], outputs[i].getCOMValueAsString());
        }
        return d;
    };

    Analysis.resample = function (/*int*/num_bootstraps, /*InputSample*/orig_vals) {
        var ss = new Array(num_bootstraps), j, i, s, inc_count, input_idx, value, size;
        for (i = 0; i < num_bootstraps; i++) {
            s = new InputSample(orig_vals.rows, orig_vals.cols);
            size = orig_vals.rows * orig_vals.cols;
            // make a vector of index counters
            inc_count = new Array(size);
            for (j = 0; j < size; j++) {
                inc_count[j] = 0;
            }

            for (j = 0; j < size; j++) {
                input_idx = Math.floor(Math.random() * size) % size;
                inc_count[input_idx]++;
                value = orig_vals.getInput(input_idx);
                s.add(value);
            }
            s.setIncludes(inc_count);
            ss[i] = s;
        }
        return ss;
    };

    Analysis.computeBootstraps = function (/*int*/num_bootstraps, /*<TreeNode, InputSample>*/initial_inputs, /*InputSample[][]*/resamples, /*TreeNode[]*/input_arr, /*TreeNode[]*/output_arr, /*AnalysisData*/data) {
        var i, bootstraps = [], bootsaver, hits = 0, com, fos, b, t;
        bootsaver = new Array(input_arr.length);
        for (i = 0; i < input_arr.length; i++) {
            t = input_arr[i];
            com = t.com;
            bootsaver[i] = new BootMemo();
            for (b = 0; b < num_bootstraps; b++) {
                fos = bootsaver[i].fastReplace(com, initial_inputs.get(t), resamples[i][b], output_arr, hits, false);
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
                //TODO check that get returns false on failure
                if (score) {
                    d3.put(set[i].key, set[i].value + score);
                } else {
                    d3.put(set[i].key, set[i].value);
                }
            }
        }
    };

    Analysis.scoreInputs = function (/*TreeNode[]*/ input_rngs, /*TreeNode*/output_fns, /*<TreeNode, string>*/initial_outputs, /*FunctionOutput<string>[][][]*/ boots, /*bool*/ weighted) {
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

    Analysis.functionOutputsAreNumeric = function (/*FunctionOutput[]*/boots) {
        var b;
        for (b = 0; b < boots.length; b++) {
            if (isFinite(!boots[b])) {
                return false;
            }
        }
        return true;
    };

    Analysis.numericHypothesisTest = function (/*TreeNode*/ rangeNode, /*TreeNode*/ functionNode, /* FunctionOutput[]*/ boots, /*string*/ initial_output, /*bool*/ weighted) {
        var i, weight, outlieriness, score, xtree;
        //TODO do rangeNodes have parents? Not in the current setup
        var input_cells = rangeNode.parents;
        //scores
        var input_exclusion_scores = new HashMap();
        //convert to numeric
        var numeric_boots = this.convertToNumericOutput(boots);
        //sort
        var sorted_num_boots = this.sortBootstraps(numeric_boots);
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
            if (outlieriness != 0) {
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
        this._propagateWeights(data);
        // filter out non-terminal functions
        output_fns = data.getTerminalFormulaNodes();
        // filter out non-terminal inputs
        input_rngs = data.getTerminalInputNodes();
        //we save initial inputs here
        initial_inputs = this.storeInputs(input_rngs);
        initial_outputs = this.storeOutputs(output_fns);
        resamples = new Array(input_rngs.length);
        for (i = 0; i < input_rngs.length; i++) {
            resamples[i] = this.resample(num_bootstraps, initial_inputs.get(input_rngs[i]))
        }
        //first index: the fth function output
        //second index: the ith input
        //third index: the bth bootstrap
        var boots = this.computeBootstraps(num_bootstraps, initial_inputs, resamples, input_rngs, output_fns, data);

        //restore formulas
        //TODO DO we really need to do this?
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
});