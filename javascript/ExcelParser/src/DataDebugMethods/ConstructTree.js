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
        //Get a range representing the formula cells for each worksheet in each workbook
        // XRange[][]
        var formulaRanges = ConstructTree.getFormulaRanges(app);
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
                //     ConstructTree.createCellNodesFromRange(range_node, formula_node, analysisData.formula_nodes, analysisData.cell_nodes);
                range_node.addParent(formula_node);
                formula_node.addChild(range_node);
                //I don't create nodes from the ranges. We don't need the children of the range
                //If the range contains formulas, we will come through the nodes in the next loop
            }
            //FOr each single-cell input found in the formula by the parser
            //link to output TreeNode if the input cell is a formula. This allows
            //us to consider functions with single-cell inputs as outputs
            addresses = ParserUtility.getSingleCellReferencesFromFormula(formula_node.formula, formula_node.workbook, formula_node.worksheet);
            for (j = 0; j < addresses.length; j++) {
                if (tn = analysisData.formula_nodes.get(addresses[j])) {
                    if (tn.is_formula) {
                        formula_node.addChild(tn);
                        tn.addParent(formula_node);
                    }
                }
            }
        }
        //ConstructTree.storeOutputs(analysisData);
    };

    ConstructTree.countNodes = function (/*AnalysisData*/data) {
        var nodes = data.formula_nodes;
        var tree = 0, sum;
        var i, entrySet = nodes.getEntrySet();
        sum = entrySet.length;
        sum += data.input_ranges.length;
        for (i = 0; i < entrySet.length; i++) {
            tree += entrySet[i].value.parents.length;
        }
        for (i = 0; i < data.input_ranges.length; i++) {
            tree += data.input_ranges[i].parents.length;
        }
    };

    //TODO This has to be rewritten
    ConstructTree.createCellNodesFromRange = function (/*TreeNode*/rangeNode, /*TreeNode*/formulaNode, /*HashMap*/formula_nodes, /*HashMap*/cell_nodes) {
        var cellRange = rangeNode.com.getCellMatrix();
        var i, j, len, len1, address, cellNode, cell;
        for (i = 0, len = cellRange.length; i < len; i++) {
            for (j = 0, len1 = cellRange[i].length; j < len1; j++) {
                cell = cellRange[i][j];
                address = Parser.getAddress(cell.getR1C1Address(), cell.Workbook, cell.Worksheet);
                if ((cellNode = formula_nodes.get(address))) {
                    rangeNode.addParent(cellNode);
                    cellNode.addChild(rangeNode);
                }
                //if(cellNode.com.startRow==9 && cellNode.com.startCol==9)


            }
        }
        return rangeNode;
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
        var cell, ws, addr, n, i, j, len, formula;
        for (i = 0, len = formulaRanges.length; i < len; i++) {
            //All the cells in a list have the same sheet
            if (formulaRanges[i].length > 0) {
                ws = formulaRanges[i][0].Worksheet;
            }
            for (j = 0; j < formulaRanges[i].length; j++) {
                cell = formulaRanges[i][j];
                //The cell has to have content in order for it to influence the output
                if (cell.getValue()) {
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
        }
        return treeDict;
    };

    ConstructTree.makeRangeTreeNode = function (/*TreeNode[]*/range_nodes, /*XRange*/range, /*TreeNode*/formula_node) {
        var range_node = null;
        var i, len, range_name = range.Workbook.Name + "_" + range.Worksheet.Name + "_" + range.getA1Address();
        for (i = 0, len = range_nodes.length; i < len; i++) {
            if (range_nodes[i].name === range_name) {
                range_node = range_nodes[i];
                break;
            }
        }
        if (range_node === null) {
            range_node = new TreeNode(range, range.Worksheet, formula_node.workbook);
            range_nodes.push(range_node);
        }
        return range_node;
    };
    return ConstructTree;
});
