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
import NodeTypes = require("NodeTypes");

/**
 * @Author Alexandru Toader, alexandru.v.toader@gmail.com
 * @Description This file contains the TreeNode class.
 */
export class TreeNode {
    public parents = []; //these are the TreeNodes that feed into the current cell
    public children = []; //these are the TreeNodes that the current cell feeds into
    public name; //For normal cells, the name is just the address of the cell.
    public com;
    public ws; //Reference to the XWorksheet object where this range is located
    public wb; //Reference to the XWorkbook object where this range is located
    public rows;
    public columns;
    public type;
    public is_formula;
    public formula;
    public weight;
    public dont_perturb; //True if we do not want to perform perturbation analysis
    public computed; //This is true if the value for the formula associated with this node has already been computed
    //if a root node has computed set to a value, then all its children have the same value for computed

    /**
     * Data structure for representing nodes of the dependence graph (DAG) internally.
     * There are three type of nodes: cell and range nodes
     * @param com Range object that represents the node in the document
     * @param ws Worksheet object associated with the node
     * @param wb Workbook object associated with the node
     * @constructor
     */
    constructor(/*XRange*/com, /*XWorksheet*/ws, /*XWorkbook*/wb) {
        if (ws === null || wb === null) {
            throw new Error("Workbook and worksheet objects must be set.");
        }
        this.name = com.Workbook.Name + "_" + com.Worksheet.Name + "_" + com.getA1Address();
        // For ranges, the name is of the format <EndCell>:<EndCell>, such as "A1:A5"
        //For chart nodes, the name begins with the string "Chart", followed by the name of the chart object from Excel, with the white spaces stripped
        this.com = com;
        this.worksheet = ws;
        this.workbook = wb;
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
        this.weight = 0.0;
        this.dont_perturb = true;
        this.computed = true;
    }

    /**
     * Mark this node as computable i.e. it and all its parents have to be recomputed
     */
    public enableCompute() {
        var i;
        this.computed = false;
        for (i = 0; i < this.parents.length; i++) {
            if (this.parents[i].computed !== false) {
                this.parents[i].enableCompute();
            }
        }
    }

    /**
     * Mark this node as computed.
     */
    public disableCompute() {
        var i;
        this.computed = true;
        for (i = 0; i < this.children.length; i++) {
            if (this.children[i].computed !== true) {
                this.children[i].disableCompute();
            }
        }
    }

    public toString() {
        var parents_string = "", children_string = "";
        var i, len;
        for (i = 0, len = this.parents.length; i < len; i++) {
            parents_string += this.parents[i].name + ", ";
        }
        for (i = 0, len = this.children.length; i < len; i++) {
            children_string += this.children[i].name + ", ";
        }
        return this.name + "\nParents: " + parents_string + "\nChildren: " + children_string;
    }

    /**
     * Get the GraphViz representation of this node.
     * @returns {string}
     */
    public toGVString() {
        var i, len, parents_string = "";
        for (i = 0, len = this.parents.length; i < len; i++) {
            parents_string += "\n" + this.parents[i].name.replace(" ", "").replace(":", "") + "->" + this.name.replace(" ", "").replace(":", "");
        }
        return ("\n" + this.name.replace(" ", "").replace(":", "") + "[shape=ellipse]" + parents_string).replace("$", "");
    }

    /**
     * Add the node as a parent to the current TreeNode.
     * @param node
     */
    public addParent(/*TreeNode*/node) {
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
    }

    /**
     * Add the node as a child to the current TreeNode
     * @param node
     */
    public addChild(/*TreeNode*/node) {
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
    }

    /**
     * The name is used as a hashcode when using an object as a hashmap.
     * The hashcode
     * @returns {*}
     */
    public getHashCode() {
        return this.name;
    }
}
