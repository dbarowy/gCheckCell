define("DataDebugMethods/ConstructTree", ["DataDebugMethods/StartValue", "Parser/ParserUtility", "Utilities/HashMap", "DataDebugMethods/TreeNode", "Parser/Parser"], function (StartValue, ParserUtility, HashMap, TreeNode, Parser) {
    "use strict";
    var ConstructTree = {};
    /**
     * This method constructs the dependency from from the workbook.
     * It analyzes formulas and looks for references to cells or ranges of cells.
     *
     * @param analysisData
     * @param app
     */
    ConstructTree.constructTree = function (/*AnalysisData*/analysisData, /*XApplication*/app) {

        var nodes, i, formula_node, ranges, range_node, j, addresses, tn;
        analysisData.input_cells_in_computation_count = 0;
        analysisData.raw_input_cells_in_computation_count = 0;
        //Get a range representing the formula cells for each worksheet in each workbook
        // XRange[][]
        var formulaRanges = ConstructTree.getFormulaRanges(app);

        analysisData.formula_cells_count = ConstructTree.countFormulaCells(formulaRanges);
        //Create nodes for every cell containing a formula
        analysisData.formula_nodes = ConstructTree.createFormulaNodes(formulaRanges, app);

        //Now we parse the formulas in nodes to extract any range and cell references
        nodes = analysisData.formula_nodes.getEntrySet();
        for (i = 0; i < nodes.length; i++) {
            formula_node = nodes[i].value;
            //For each of the ranges found in the formula by the parser
            //1.Make a TreeNode for the range
            ranges = ParserUtility.getReferencesFromFormula(formula_node.formula, formula_node.workbook, formula_node.worksheet);
            for (j = 0; j < ranges.length; j++) {
                range_node = ConstructTree.makeRangeTreeNode(analysisData.input_ranges, ranges[j], formula_node);
                range_node.addChild(formula_node);
                formula_node.addParent(range_node);
                //I don't create nodes from the ranges. We don't need the children of the range
                //If the range contains formulas, we will come through the nodes in the next loop
            }
            //FOr each single-cell input found in the formula by the parser
            //link to output TreeNode if the input cell is a formula. This allows
            //us to consider functions with single-cell inputs as outputs
            addresses = ParserUtility.getSingleCellReferencesFromFormula(formula_node.formula, formula_node.workbook, formula_node.worksheet);
            for (j = 0; j < addresses.length; j++) {
                if (typeof(tn = analysisData.formula_nodes.get(addresses[j])) !== "undefined") {
                    if (tn.is_formula) {
                        tn.addChild(formula_node);
                        formula_node.addParent(tn);
                    }
                }
            }
        }
        //ConstructTree.storeOutputs(analysisData);
    };

    ConstructTree.generateGraphVizTree = function (/*HashMap*/nodes) {

        var tree = "";
        var i, entrySet = nodes.getEntrySet();
        for (i = 0; i < entrySet.length; i++) {
            tree += entrySet[i].value.toGVString() + "\n";
        }
        return "digraph g{" + tree + "}";
    };

    ConstructTree.storeOutputs = function (/*AnalysisData*/data) {

        var i, j, node, len, average, nodes = data.formula_nodes.getEntrySet(), sv;
        var sum, parent_range, nodeWorksheet, cell, val;
        for (i = 0, len = nodes.length; i < len; i++) {
            node = nodes[i].Value;
            if (!node.hasChildren() && node.hasParents()) {
                data.output_cells.push(node);
            }
        }

        for (i = 0; i < data.output_cells.length; i++) {
            if (data.output_cells[i].is_chart) {
                sum = 0;
                parent_range = data.output_cells[i].parents[0];
                for (j = 0; j < parent_range.parents.length; j++) {
                    sum += parent_range.parents[j].worksheet.get_Range(parent_range.parents[j].name).getValue();
                }
                average = sum / parent_range.parents.length;
                sv = new StartValue(average);
                data.starting_outputs.push(sv);
            } else {
                //TODO the StartValue constrctor is overloaded but I do not take that into account
                //Solve that when you find out why.
                nodeWorksheet = data.output_cells[i].worksheet;//The worksheet where the node n is located
                cell = nodeWorksheet.get_Range(data.output_cells[i].name);
                val = cell.getValue();
                sv = new StartValue(val);
                data.starting_outputs.push(sv);
            }
        }
    };

    /**
     * Return a bidimensional array of cells with formulas.
     * Each item in the array represents an array of cells with formulas from the same sheet.
     * @param app The application context. This is used to access Office/_GDocs specific methods
     * @returns {Array}
     */
    ConstructTree.getFormulaRanges = function (/*AppContext*/app) {

        var i, len, len1, len2, j, k, usedRange;
        var sheets = app.getWorksheets();
        var analysisRanges = [];//Bidimensional array of cells with formulas
        var sheetRanges;
        for (i = 0, len = sheets.length; i < len; i++) {
            usedRange = sheets[i].getUsedRange();
            sheetRanges = [];
            for (j = 0, len1 = usedRange.length; j < len1; j++) {
                for (k = 0, len2 = usedRange[j].length; k < len2; k++) {
                    if (usedRange[j][k].hasFormula()) {
                        sheetRanges.push(usedRange[j][k]);
                    }
                }
            }
            if (sheetRanges.length > 0) {
                analysisRanges.push(sheetRanges);
            }
        }
        return analysisRanges;
    };

    ConstructTree.countFormulaCells = function (/*XCell[][]*/ rs) {

        var count = 0, i, len;
        for (i = 0, len = rs.length; i < len; i++) {
            count += rs[i].length;
        }
        return count;
    };
//Go through every sheet and create a node for every cell that contains a formula
    ConstructTree.createFormulaNodes = function (/*XRange[][]*/formulaRanges, /*XApplication*/app) {

        var wb = app.getActiveWorkbook();
        var treeDict = new HashMap();
        var cell, ws, addr, n, i, j, len;
        for (i = 0, len = formulaRanges.length; i < len; i++) {
            //All the cells in a list have the same sheet
            if (formulaRanges[i].length > 0) {
                ws = formulaRanges[i][0].getSheet();
            }
            for (j = 0; j < formulaRanges[i].length; j++) {
                cell = formulaRanges[i][j];
                if (cell.getValue() !== null && cell.getValue() !== "") {
                    addr = Parser.getAddress(cell.getR1C1Address(), wb, ws);
                    n = new TreeNode(cell, cell.getA1Address(), ws, wb);
                    if (cell.hasFormula()) {
                        n.is_formula = true;
                        n.dont_perturb = true;
                        n.formula = cell.getFormula();
                        treeDict.put(addr, n);
                    }
                }
            }
        }
        return treeDict;
    };

    ConstructTree.makeRangeTreeNode = function (/*TreeNode[]*/range_nodes, /*XRange*/range, /*TreeNode*/formula_node) {

        var range_node = null;
        var i, len;
        for (i = 0, len = range_nodes.length; i < len; i++) {
            //TODO This must be checked. Does getA1Address?
            if (range_nodes[i].name === range.getA1Address()) {
                range_node = range_nodes[i];
                break;
            }
        }
        if (range_node === null) {
            range_node = new TreeNode(range, range.getA1Address(), range.Worksheet, formula_node.workbook);
            range_nodes.push(range_node);
        }
        return range_node;

    };
    return ConstructTree;
});
