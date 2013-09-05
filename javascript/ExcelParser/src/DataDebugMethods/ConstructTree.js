define("DataDebugMethods/ConstructTree", [ "Parser/ParserUtility", "Utilities/HashMap", "DataDebugMethods/TreeNode", "Parser/Parser", "Parser/AST/AST"], function (ParserUtility, HashMap, TreeNode, Parser, AST) {
    "use strict";
    var ConstructTree = {};
    /**
     * This method constructs the dependency from from the workbook.
     * It analyzes formulas and looks for references to cells or ranges of cells.
     * @param analysisData
     * @param app
     */
    ConstructTree.constructTree = function (/*AnalysisData*/analysisData, /*XApplication*/app) {
        var nodes, i, formula_node, ranges, range_node, j, addresses, tn;
        //Get a range representing the formula cells for each worksheet in each workbook
        // XRange[][]
        var formulaRanges = ConstructTree.getFormulaRanges(app);
        //Create nodes for every cell containing a formula
        analysisData.formula_nodes = ConstructTree.createFormulaNodes(formulaRanges, app);
        //Now we parse the formulas in nodes to extract any range and cell references
        nodes = analysisData.formula_nodes.getEntrySet();
        var r = 0, a = 0;
        for (i = 0; i < nodes.length; i++) {
            formula_node = nodes[i].value;
            //For each of the ranges found in the formula by the parser
            //1.Make a TreeNode for the range
            ranges = [];
            addresses = [];
            ParserUtility.getAllReferencesFromFormula(formula_node.formula, formula_node.workbook, formula_node.worksheet, addresses, ranges);
            for (j = 0; j < ranges.length; j++) {
                range_node = ConstructTree.makeRangeTreeNode(analysisData, ranges[j], formula_node);
                range_node.addParent(formula_node);
                formula_node.addChild(range_node);
                //I don't create nodes from the ranges. We don't need the children of the range
                //If the range contains formulas, we will come through the nodes in the next loop
            }
            //FOr each single-cell input found in the formula by the parser
            //link to output TreeNode if the input cell is a formula. This allows
            //us to consider functions with single-cell inputs as outputs
            for (j = 0; j < addresses.length; j++) {
                if (tn = analysisData.formula_nodes.get(addresses[j])) {
                    if (tn.is_formula) {
                        formula_node.addChild(tn);
                        tn.addParent(formula_node);
                    }
                }
            }
        }
    };


    ConstructTree.genGraph = function (/*AnalysisData*/data) {
        var nodes = data.formula_nodes;
        var tree = "";

        var i, entrySet = nodes.getEntrySet();
        for (i = 0; i < entrySet.length; i++) {
            tree += entrySet[i].value.toGVString() + "\n";
        }

        for (i = 0; i < data.input_ranges.length; i++) {

            tree += data.input_ranges[i].toGVString() + "\n";
        }
        return "digraph g{" + tree + "}";

    };
    /**
     * Return a bidimensional array of cells with formulas.
     * Each item in the array represents an array of cells with formulas from the same sheet.
     * @param app The application context. This is used to access Office/_GDocs specific methods
     * @returns {Array}
     */
    ConstructTree.getFormulaRanges = function (/*XApplication*/app) {
        var i, len, len1, len2, j, k, usedRange;
        var sheets = app.getWorksheets();
        var analysisRanges = [];//Bidimensional array of cells with formulas
        var sheetRanges;

        for (i = 0, len = sheets.length; i < len; i++) {
            usedRange = sheets[i].getUsedRange();
            sheetRanges = [];
            for (j = 0, len1 = usedRange.length; j < len1; j++) {
                for (k = 0, len2 = usedRange[j].length; k < len2; k++) {
                    if (usedRange[j][k].containsFormula()) {
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

//Go through every sheet and create a node for every cell that contains a formula
    /**
     * Go through the array with formulas and create a node for every cell that contains a formula
     * @param formulaRanges An array of arrays. Each second level array contains XRanges with formulas from the same sheet
     * @param app Application context
     * @returns {*}
     */
    ConstructTree.createFormulaNodes = function (/*XRange[][]*/formulaRanges, /*XApplication*/app) {
        var wb = app.getActiveWorkbook();
        var treeDict = new HashMap();
        var cell, ws, addr, n, i, j, len, formula;
        for (i = 0, len = formulaRanges.length; i < len; i++) {
            //All the cells in a list have the same sheet
            if (formulaRanges[i].length > 0) {
                ws = formulaRanges[i][0].Worksheet;
            }
            for (j = 0; j < formulaRanges[i].length; j++) {
                cell = formulaRanges[i][j];
                //The cell has to have content in order for it to influence the output
                addr = Parser.getAddress(cell.getR1C1Address(), wb, ws);
                n = new TreeNode(cell, ws, wb);
                if ((formula = cell.getFormula())) {
                    n.is_formula = true;
                    n.dont_perturb = true;
                    n.formula = formula;
                    treeDict.put(addr, n);
                }
            }
        }
        return treeDict;
    };

    /**
     * Make a TreeNode from a range.
     * @param analysis
     * @param range The range to process
     * @param formula_node The formula node that references this range
     * @returns {null}
     */
    ConstructTree.makeRangeTreeNode = function (/*AnalysisData*/analysis, /*XRange*/range, /*TreeNode*/formula_node) {
        var range_nodes = analysis.input_ranges, tn;
        var range_node = null, found = false, bookName, sheetName, addr, cell;
        var i, j, len, cellMatrix, range_name = range.Workbook.Name + "_" + range.Worksheet.Name + "_" + range.getA1Address();
        //search for the node in the nodes that have been already created
        for (i = 0, len = range_nodes.length; i < len; i++) {
            if (range_nodes[i].name === range_name) {
                found = true;
                range_node = range_nodes[i];
                break;
            }
        }
        if (range_node === null) {
            range_node = new TreeNode(range, range.Worksheet, formula_node.workbook);
            range_nodes.push(range_node);
        }
        range_node.dont_perturb = range_node.com.containsFormula();
        //if the range contains formulas, get the cell with formulas and set them as children of this range node
        if (range_node.dont_perturb && !found) {
            bookName = range.Workbook.Name;
            sheetName = range.Worksheet.Name;
            cellMatrix = range_node.com.getCellMatrix();
            for (i = 0; i < cellMatrix.length; i++) {
                for (j = 0; j < cellMatrix[i].length; j++) {
                    cell = cellMatrix[i][j];
                    if (cell.hasFormula()) {
                        addr = new AST.Address(cell.startRow, cell.startCol, sheetName, bookName);
                        if (tn = analysis.formula_nodes.get(addr)) {
                            range_node.addChild(tn);
                            tn.addParent(range_node);
                        }
                    }
                }
            }
        }
        return range_node;
    };
    return ConstructTree;
});
