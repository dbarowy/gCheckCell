/**
 * This file contains the BinOpExpr class.
 * This class is used to represent expressions that involve an infix operator.
 */
define("Parser/AST/BinOpExpr", ["Utilities/Util", "XClasses/XTypes", "XClasses/XTypedValue", "Parser/Parser"], function (Util, XTypes, XTypedValue, Parser) {
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

        BinOpExpr.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
            this.Left.Resolve(wb, ws);
            this.Right.Resolve(wb, ws);
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
            var l, r, isnan, maxRows, maxCols, i, j;
            var err = new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
            l = this.Left.compute(app, source, array, false, false);
            r = this.Right.compute(app, source, array, false, false);
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
            }
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
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(r[i][j].value) + l[i][j]);
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
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(l[i][j].value) + r[i][j].value);
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j] = Parser.getDateFromNumber(Parser.getNumberFromDate(l[i][j].value) + (+r[i][j].value));
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(r[i][j].value) + Parser.getNumberFromDate(l[i][j].value));
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(l[i][j].value) + r[i][j].value);
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
                                                l[i][j] = l[i][j].value + (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(r[i][j].value) + l[i][j].value);
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
                                                l[i][j] = (+l[i][j].value) + (+r[i][j].value);
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
                                                l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(r[i][j].value) + (+l[i][j].value));
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
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(r[i][j].value) - l[i][j]);
                                            l[i][j].type = XTypes.Date;
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
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(l[i][j].value) - r[i][j].value);
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j] = Parser.getDateFromNumber(Parser.getNumberFromDate(l[i][j].value) - (+r[i][j].value));
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(r[i][j].value) - Parser.getNumberFromDate(l[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(l[i][j].value) - r[i][j].value);
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
                                                l[i][j] = l[i][j].value - (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(r[i][j].value) - l[i][j].value);
                                            l[i][j].type = XTypes.Date;
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
                                                l[i][j] = (+l[i][j].value) - (+r[i][j].value);
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
                                                l[i][j].value = Parser.getDateFromNumber(Parser.getNumberFromDate(r[i][j].value) - (+l[i][j].value));
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
                                                l[i][j].value *= (+r[i][j].value);
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(r[i][j].value) * l[i][j];
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) * r[i][j].value;
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j] = Parser.getNumberFromDate(l[i][j].value) * (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(r[i][j].value) * Parser.getNumberFromDate(l[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) * r[i][j].value;
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
                                                l[i][j] = l[i][j].value * (+r[i][j].value);
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(r[i][j].value) * l[i][j].value;
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
                                                l[i][j] = (+l[i][j].value) * (+r[i][j].value);
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
                                                l[i][j].value = Parser.getNumberFromDate(r[i][j].value) * (+l[i][j].value);
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
                                            l[i][j].value = l[i][j] / Parser.getNumberFromDate(r[i][j].value);
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) / r[i][j].value;
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
                                                l[i][j] = Parser.getNumberFromDate(l[i][j].value) / (+r[i][j].value);
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) / Parser.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                            if (!isFinite(l[i][j].value)) {
                                                l[i][j].value = "#DIV/0!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) / r[i][j].value;
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
                                                l[i][j] = l[i][j].value / (+r[i][j].value);
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
                                            l[i][j].value = l[i][j].value / Parser.getNumberFromDate(r[i][j].value);
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
                                                l[i][j] = (+l[i][j].value) / (+r[i][j].value);
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
                                                l[i][j].value = (+l[i][j].value) / Parser.getNumberFromDate(r[i][j].value);
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
                                            l[i][j].value = Math.pow(l[i][j].value, Parser.getNumberFromDate(r[i][j].value));
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
                                            l[i][j].value = Math.pow(Parser.getNumberFromDate(l[i][j].value), r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(r[i][j].value)) {
                                                l[i][j] = Math.pow(Parser.getNumberFromDate(l[i][j].value), (+r[i][j].value));
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Math.pow(Parser.getNumberFromDate(l[i][j].value), Parser.getNumberFromDate(r[i][j].value));
                                            l[i][j].type = XTypes.Number;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Math.pow(Parser.getNumberFromDate(l[i][j].value), r[i][j].value);
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
                                                l[i][j] = Math.pow(l[i][j].value, (+r[i][j].value));
                                                l[i][j].type = XTypes.Number;
                                            } else {
                                                l[i][j].value = "#VALUE!";
                                                l[i][j].type = XTypes.Error;
                                            }
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Math.pow(l[i][j].value, Parser.getNumberFromDate(r[i][j].value));
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
                                                l[i][j] = Math.pow((+l[i][j].value), (+r[i][j].value));
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
                                                l[i][j].value = Math.pow((+l[i][j].value), Parser.getNumberFromDate(r[i][j].value));
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
                                            l[i][j].value = "" + l[i][j].value + Parser.getStringFromDate(r[i][j].value);
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
                                            l[i][j].value = Parser.getStringFromDate(l[i][j].value) + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            l[i][j].value = Parser.getStringFromDate(l[i][j].value) + r[i][j].value;
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getStringFromDate(l[i][j].value) + Parser.getStringFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.String;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = Parser.getStringFromDate(l[i][j].value) + Util.boolToString(r[i][j].value);
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
                                            l[i][j].value = Util.boolToString(l[i][j].value) + Parser.getStringFromDate(r[i][j].value);
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
                                            l[i][j].value = l[i][j].value + Parser.getStringFromDate(r[i][j].value);
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
                                            l[i][j].value = l[i][j].value === Parser.getNumberFromDate(r[i][j].value);
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) === r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            //TODO Not really sure of this
                                            l[i][j].value = false;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) === Parser.getNumberFromDate(r[i][j].value);
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
                                            //TODO
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
                                            l[i][j].value = l[i][j].value !== Parser.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) !== r[i][j].value;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            //TODO Not really sure of this
                                            l[i][j].value = true;
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) !== Parser.getNumberFromDate(r[i][j].value);
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
                                            //TODO
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
                                            l[i][j].value = l[i][j].value <= Parser.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) <= r[i][j].value;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) <= Parser.getNumberFromDate(r[i][j].value);
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
                                            //TODO
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
                                            l[i][j].value = l[i][j].value >= Parser.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) >= r[i][j].value;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) >= Parser.getNumberFromDate(r[i][j].value);
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
                                            //TODO
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
                                            l[i][j].value = l[i][j].value > Parser.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = false;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) > r[i][j].value;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) > Parser.getNumberFromDate(r[i][j].value);
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
                                            //TODO
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
                                            l[i][j].value = l[i][j].value < Parser.getNumberFromDate(r[i][j].value);
                                            l[i][j].type = XTypes.Boolean;
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            l[i][j].value = true;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) < r[i][j].value;
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
                                            l[i][j].value = Parser.getNumberFromDate(l[i][j].value) < Parser.getNumberFromDate(r[i][j].value);
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
                                            //TODO
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
            if (array) {
                return l;
            } else {
                return l[0][0];
            }

        };

        return BinOpExpr;
    }
)
;