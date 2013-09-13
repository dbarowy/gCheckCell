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

/**
 * @Author Alexandru Toader, alexandru.v.toader@gmail.com
 * @Description This file contains the BinOpExpr class.
 * This class is used to represent expressions that involve an infix operator.
 */
define("Parser/AST/BinOpExpr", ["Utilities/Util", "XClasses/XTypes"], function (Util, XTypes) {
        "use strict";
        function BinOpExpr(/*string*/op, /*Expression*/left, /*Expression*/right) {
            this.Operator = op;
            this.Left = left;
            this.Right = right;

        }

        /*Operator precedence used to solve the issue of associativity*/
        BinOpExpr.prototype._precedence = {
            ":": 6,  //TODO implement these 3 operators
            " ": 6,  //This operator is not supported by the grammar
            ",": 6, //This operator is not supported by the grammar
            "^": 5,
            "*": 4,
            "/": 4,
            "+": 3,
            "-": 3,
            "&": 2,
            "=": 1,
            "<>": 1,
            "<=": 1,
            ">=": 1,
            "<": 1,
            ">": 1
        };

        BinOpExpr.prototype.toString = function () {
            return "BinOpExpr(\"" + this.Operator + "\",\n\t" + this.Left.toString() + ",\n\t" + this.Right.toString() + ")";
        };

        /**
         * Resolve the two terms that make up the binary operator expression to the given workbook and worksheet
         * @param wb
         * @param ws
         * @constructor
         */
        BinOpExpr.prototype.resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
            this.Left.resolve(wb, ws);
            this.Right.resolve(wb, ws);
        };
        /**
         * This method is used to transform the right associativity to left associativity
         * The output of PEG is a right associative tree. I could not solve this at parsing time,
         * so this method will solve it at runtime.
         */
        BinOpExpr.prototype.fixAssoc = function () {
            this.Left.fixAssoc();
            this.Right.fixAssoc();
            if (this.Right instanceof BinOpExpr) {
                //use the precedence of the operators to enforce the desired associativity
                if (this._precedence[this.Operator] >= this._precedence[this.Right.Operator]) {
                    this.Left = new BinOpExpr(this.Operator, this.Left, this.Right.Left);
                    this.Operator = this.Right.Operator;
                    this.Right = this.Right.Right;

                }
            }
            this.Left.fixAssoc();
            this.Right.fixAssoc();
        };


        /**
         * Compute the value of this expression.
         * @param app Entry point to the application data
         * @param source The cell for which we are computing the formula
         * @param array True if we are computing an array formula, false otherwise
         * @param range True if this is a range parameter to a function.
         * @param full_range Some functions return an array of values even when they are not in an ARRAYFORMULA.
         * This parameters tells the function if we want the complete range of just the first element
         * @returns {*}
         */
        BinOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range) {
            var l, r, maxRows, maxCols, i, j;
            //As this is a binary operator, we don't need the entire range or the full range returned by the
            //two terms
            l = this.Left.compute(app, source, array, false, false);
            r = this.Right.compute(app, source, array, false, false);
            //the code is more compact if we just work with arrays;
            if (array) {
                maxRows = l.length > r.length ? l.length : r.length;
                maxCols = l[0].length > r[0].length ? l[0].length : r[0].length;
                this._adjustMatrix(l, maxRows, maxCols);
                this._adjustMatrix(r, maxRows, maxCols);
            } else {
                l = [
                    [l]
                ];
                r = [
                    [r]
                ];
                maxRows=1;
                maxCols=1;
            }
            //consider the types of the two operators
            //and perform the needed operation
            //return the result of the operation in the left hand side operand
            switch (this.Operator) {
                case "+":
                {

                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {

                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value += r[i][j].value;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value += (+r[i][j].value);
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(r[i][j].value) + l[i][j].value);
                                            l[i][j].type = XTypes.Date;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value += r[i][j].value;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {

                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(l[i][j].value) + r[i][j].value);
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(l[i][j].value) + (+r[i][j].value));
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(r[i][j].value) + Util.getNumberFromDate(l[i][j].value));
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(l[i][j].value) + r[i][j].value);
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = l[i][j].value + r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = l[i][j].value + (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(r[i][j].value) + l[i][j].value);
                                            l[i][j].type = XTypes.Date;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value + r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) + r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value) && isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) + (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(r[i][j].value) + (+l[i][j].value));
                                                l[i][j].type = XTypes.Date;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) + r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "-":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value -= r[i][j].value;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value -= (+r[i][j].value);
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value-Util.getNumberFromDate(r[i][j].value) ;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value -= r[i][j].value;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(l[i][j].value) - r[i][j].value);

                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(l[i][j].value) - (+r[i][j].value));
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(r[i][j].value) - Util.getNumberFromDate(l[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Util.getDateFromNumber(Util.getNumberFromDate(l[i][j].value) - r[i][j].value);
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = l[i][j].value - r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = l[i][j].value - (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value-Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value - r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) - r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value) && isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) - (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value)-Util.getNumberFromDate(r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) - r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "*":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value *= r[i][j].value;
                                        }
                                            break;
                                        case XTypes.String:
                                        {

                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value =   l[i][j].value* (+r[i][j].value);
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(r[i][j].value) * l[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value *= r[i][j].value;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) * r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = Util.getNumberFromDate(l[i][j].value) * (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(r[i][j].value) * Util.getNumberFromDate(l[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) * r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = l[i][j].value * r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = l[i][j].value * (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(r[i][j].value) * l[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value * r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) * r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value) && isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) * (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = Util.getNumberFromDate(r[i][j].value) * (+l[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) * r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "/":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value /= r[i][j].value;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }

                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value /= (+r[i][j].value);
                                                if (!isFinite(l[i][j].value)) {
                                                    l[i][j].value = "#DIV/0!";
                                                    l[i][j].type = XTypes.Error;
                                                }
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value / Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value /= r[i][j].value;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) / r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = Util.getNumberFromDate(l[i][j].value) / (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                                if (!isFinite(l[i][j].value)) {
                                                    l[i][j].value = "#DIV/0!";
                                                    l[i][j].type = XTypes.Error;
                                                }
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) / Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) / r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = l[i][j].value / r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = l[i][j].value / (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                                if (!isFinite(l[i][j].value)) {
                                                    l[i][j].value = "#DIV/0!";
                                                    l[i][j].type = XTypes.Error;
                                                }
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value / Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }

                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value / r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) / r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                                if (!isFinite(l[i][j].value)) {
                                                    l[i][j].value = "#DIV/0!";
                                                    l[i][j].type = XTypes.Error;
                                                }
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value) && isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) / (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                                if (!isFinite(l[i][j].value)) {
                                                    l[i][j].value = "#DIV/0!";
                                                    l[i][j].type = XTypes.Error;
                                                }
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) / Util.getNumberFromDate(r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                                if (!isFinite(l[i][j].value)) {
                                                    l[i][j].value = "#DIV/0!";
                                                    l[i][j].type = XTypes.Error;
                                                }
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = (+l[i][j].value) / r[i][j].value;
                                                l[i][j].type = XTypes.Number;
                                                if (!isFinite(l[i][j].value)) {
                                                    l[i][j].value = "#DIV/0!";
                                                    l[i][j].type = XTypes.Error;
                                                }
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "^":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Math.pow(l[i][j].value, r[i][j].value);
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = Math.pow(l[i][j].value, +r[i][j].value);
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Math.pow(l[i][j].value, Util.getNumberFromDate(r[i][j].value));
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Math.pow(l[i][j].value, r[i][j].value);

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Math.pow(Util.getNumberFromDate(l[i][j].value), r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = Math.pow(Util.getNumberFromDate(l[i][j].value), (+r[i][j].value));
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Math.pow(Util.getNumberFromDate(l[i][j].value), Util.getNumberFromDate(r[i][j].value));
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Math.pow(Util.getNumberFromDate(l[i][j].value), r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Math.pow(l[i][j].value, r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j].value = Math.pow(l[i][j].value, (+r[i][j].value));
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Math.pow(l[i][j].value, Util.getNumberFromDate(r[i][j].value));
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Math.pow(l[i][j].value, r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = Math.pow((+l[i][j].value), r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value) && isFinite(l[i][j].value)) {
                                                l[i][j].value = Math.pow((+l[i][j].value), (+r[i][j].value));
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = Math.pow((+l[i][j].value), Util.getNumberFromDate(r[i][j].value));
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            if (isFinite(l[i][j].value)) {
                                                l[i][j].value = Math.pow((+l[i][j].value), r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "&":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = "" + l[i][j].value + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = "" + l[i][j].value + r[i][j].value;
                                            l[i][j].type = XTypes.String;

                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = "" + l[i][j].value + Util.getStringFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = "" + l[i][j].value + Util.boolToString(r[i][j].value);
                                            l[i][j].type = XTypes.String;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getStringFromDate(l[i][j].value) + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = Util.getStringFromDate(l[i][j].value) + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getStringFromDate(l[i][j].value) + Util.getStringFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Util.getStringFromDate(l[i][j].value) + Util.boolToString(r[i][j].value);
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.boolToString(l[i][j].value) + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = Util.boolToString(l[i][j].value) + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.boolToString(l[i][j].value) + Util.getStringFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Util.boolToString(l[i][j].value) + Util.boolToString(r[i][j].value);
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = l[i][j].value + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = l[i][j].value + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value + Util.getStringFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value + Util.boolToString(r[i][j].value);
                                            l[i][j].type = XTypes.String;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "=":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {

                                            l[i][j].value = l[i][j].value === r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value === Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) === r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) === Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value === r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = (l[i][j].value.toLocaleUpperCase()).localeCompare(r[i][j].value.toLocaleUpperCase()) === 0;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "<>":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {

                                            l[i][j].value = l[i][j].value !== r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value !== Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) !== r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) !== Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value !== r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = (l[i][j].value.toLocaleUpperCase()).localeCompare(r[i][j].value.toLocaleUpperCase()) != 0;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "<=":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {

                                            l[i][j].value = l[i][j].value <= r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value <= Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) <= r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) <= Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value <= r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = (l[i][j].value.toLocaleUpperCase()).localeCompare(r[i][j].value.toLocaleUpperCase()) <= 0;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case ">=":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {

                                            l[i][j].value = l[i][j].value >= r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value >= Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) >= r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) >= Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value >= r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = (l[i][j].value.toLocaleUpperCase()).localeCompare(r[i][j].value.toLocaleUpperCase()) >= 0;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case ">":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {

                                            l[i][j].value = l[i][j].value > r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value > Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) > r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) > Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value > r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = (l[i][j].value.toLocaleUpperCase()).localeCompare(r[i][j].value.toLocaleUpperCase()) > 0;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
                case "<":
                {
                    for (i = 0; i < maxRows; i++) {
                        for (j = 0; j < maxCols; j++) {
                            switch (l[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {

                                            l[i][j].value = l[i][j].value < r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = l[i][j].value < Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) < r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Util.getNumberFromDate(l[i][j].value) < Util.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = l[i][j].value < r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                case XTypes.String:
                                {
                                    switch (r[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = (l[i][j].value.toLocaleUpperCase()).localeCompare(r[i][j].value.toLocaleUpperCase()) < 0;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;

                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            l[i][j].value = r[i][j].value;
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                //For the error, do not modify anything
                            }
                        }
                    }
                }
                    break;
            }
            //If we have an array formula, return the full array
            if (array) {
                return l;
                //otherwise, return the first element
            } else {
                return l[0][0];
            }

        };

        return BinOpExpr;
    }
)
;