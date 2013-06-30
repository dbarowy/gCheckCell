/**
 * Data structure for representing nodes of the dependence graph (DAG) internally.
 * There are three type of nodes: cell, range, and formula nodes.
 * For normal cells, the name is just the address of the cell
 * For ranges, the name is of the format <EndCell>:<EndCell>, such as "A1:A5"
 * For chart nodes, the name begins with the string "Chart", followed by the name of the chart object from Excel, with the white spaces stripped
 * @param com Range object that represents the node in the document
 * @param name Name given to the node. It is used for identification
 * @param ws Worksheet object associated with the node
 * @param wb Workbook object associated with the node
 * @constructor
 */
function TreeNode(/*XRange*/com, /*string*/name, /*XWorksheet*/ws, /*XWorkbook*/wb) {
    "use strict";
    this.parents = [];
    this.children = [];
    this.name = name;
    this.com = com;
    this.worksheet = ws;
    this.workbook = wb;
    if (this.worksheet === null) {
        this.worksheet_name = "none";
    } else {
        this.worksheet_name = ws.Name;
    }
    this.rows = this.com.getRowCount();
    this.columns = this.com.getColumnCount();
    if (this.rows === 1 && this.columns === 1) {
        if (this.com.hasFormulas()) {
            this.is_formula = true;
            this.formula = this.com.getFormula();
        } else {
            this.is_formula = false;
        }
    }
    else {
        this.is_formula = false;
    }
    this.dont_perturb = true;
}

TreeNode.prototype.dontPerturb = function () {
    "use strict";
    this.dont_perturb = true;
};
TreeNode.prototype.perturb = function () {
    "use strict";
    this.dont_perturb = false;
};
TreeNode.prototype.toString = function () {
    "use strict";
    var parents_string = "", children_string = "";
    var i, len;
    for (i = 0, len = this.parents.length; i < len; i++) {
        parents_string += this.parents[i].worksheet_name + " " + this.parents[i].name + ", ";
    }
    for (i = 0, len = this.children.length; i < len; i++) {
        children_string += this.children[i].name + ", ";
    }
    return this.name + "\nParents: " + parents_string + "\nChildren: " + children_string;
};

TreeNode.prototype.addParent = function (/*TreeNode*/node) {
    "use strict";
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
    "use strict";
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
    "use strict";
    return (this.children > 0);
};

TreeNode.prototype.hasParents = function () {
    "use strict";
    return this.parents.length > 0;
};

//TODO add functionality for charts
TreeNode.prototype.isRange = function () {
    "use strict";
    return (this.name.indexOf(":") !== -1);
};




