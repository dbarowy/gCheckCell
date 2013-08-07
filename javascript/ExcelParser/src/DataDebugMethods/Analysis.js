define("DataDebugMethods/Analysis", ["Utilities/HashMap", "DataDebugMethods/InputSample"], function (HashMap, InputSample) {
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
    /**
     * Perform the the bootstrap operation
     * @param num_bootstraps the number of bootstraps samples to get
     * @param data
     * @param app
     * @param weighted
     * @constructor
     */
    Analysis.Bootstrap = function (/*int*/num_bootstraps, /*AnalysisData*/data, /*XApplication*/app, /*Boolean*/weighted) {
        var output_fns, input_rngs, resamples, initial_inputs, initial_outputs, i;
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
    };

    return Analysis;
});