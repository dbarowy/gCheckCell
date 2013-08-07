define("DataDebugMethods/TreeNode", ["DataDebugMethods/NodeTypes"], function (NodeTypes) {
    "use strict";
    /**
     * Data structure for representing nodes of the dependence graph (DAG) internally.
     * There are three type of nodes: cell, range, and formula nodes.
     * @param com Range object that represents the node in the document
     * @param ws Worksheet object associated with the node
     * @param wb Workbook object associated with the node
     * @constructor
     */
//TODO add functionality for charts
    function TreeNode(/*XRange*/com, /*XWorksheet*/ws, /*XWorkbook*/wb) {
        this.parents = []; //these are the TreeNodes that feed into the current cell
        this.children = []; //these are the TreeNodes that the current cell feeds into
        if (ws === null || wb === null) {
            throw new Error("Workbook and worksheet objects must be set.");
        }
        this.name = com.Workbook.Name + "_" + com.Worksheet.Name + "_" + com.getA1Address(); //For normal cells, the name is just the address of the cell.
        // For ranges, the name is of the format <EndCell>:<EndCell>, such as "A1:A5"
        //For chart nodes, the name begins with the string "Chart", followed by the name of the chart object from Excel, with the white spaces stripped
        this.com = com;
        this.worksheet = ws; //Reference to the XWorksheet object where this range is located
        this.workbook = wb; //Reference to the XWorkbook object where this range is located
        this.rows = this.com.getRowCount();
        this.columns = this.com.getColumnCount();
        if (this.rows === 1 && this.columns === 1) {
            this.type = NodeTypes.Cell;
            if (this.com.containsFormula()) {
                this.is_formula = true;
                this.formula = this.com.getFormula();
            } else {
                this.is_formula = false;
            }
        }
        else {
            this.type = NodeTypes.Range;
            this.is_formula = false;
        }
        this.weight = 0;
        this.dont_perturb = true;
    }

    TreeNode.prototype.toString = function () {
        var parents_string = "", children_string = "";
        var i, len;
        for (i = 0, len = this.parents.length; i < len; i++) {
            parents_string += this.parents[i].name + ", ";
        }
        for (i = 0, len = this.children.length; i < len; i++) {
            children_string += this.children[i].name + ", ";
        }
        return this.name + "\nParents: " + parents_string + "\nChildren: " + children_string;
    };

    TreeNode.prototype.toGVString = function () {
        var i, len, parents_string = "";
        for (i = 0, len = this.parents.length; i < len; i++) {
            parents_string += "\n" + this.parents[i].name.replace(" ", "").replace(":", "") + "->" + this.name.replace(" ", "").replace(":", "");
        }
        return ("\n" + this.name.replace(" ", "").replace(":", "") + "[shape=ellipse]" + parents_string).replace("$", "");
    };

    TreeNode.prototype.addParent = function (/*TreeNode*/node) {
        var parent_already_added = false, i, len;
        for (i = 0, len = this.parents.length; i < len; i++) {
            if (node.name === this.parents[i].name) {
                parent_already_added = true;
                break;
            }
        }
        if (!parent_already_added) {
            this.parents.push(node);
        }
    };
    TreeNode.prototype.addChild = function (/*TreeNode*/node) {
        var child_already_added = false;
        var i, len;
        for (i = 0, len = this.children.length; i < len; i++) {
            if (node.name === this.children[i].name) {
                child_already_added = true;
                break;
            }
        }
        if (!child_already_added) {
            this.children.push(node);
        }
    };

    TreeNode.prototype.hasChildren = function () {
        return (this.children > 0);
    };

    TreeNode.prototype.hasParents = function () {
        return (this.parents.length > 0);
    };

    TreeNode.prototype.getHashCode = function () {
        return this.name;
    };


    TreeNode.prototype.isRange = function () {
        return this.type === NodeTypes.Range;
    };
    TreeNode.prototype.isChart = function () {
        return this.type === NodeTypes.Chart;
    };
    TreeNode.prototype.isCell = function () {
        return this.type === NodeTypes.Cell;
    };

    TreeNode.prototype.getCOMValueAsString = function () {
        return this.com.toString();
    };


    return TreeNode;
});