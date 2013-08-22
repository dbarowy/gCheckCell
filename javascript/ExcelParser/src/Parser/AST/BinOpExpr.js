/**
 * This file contains the BinOpExpr class.
 * This class is used to represent expressions that involve an infix operator.
 */
define("Parser/AST/BinOpExpr", ["Parser/AST/ReferenceAddress", "Parser/AST/ReferenceRange"], function (ReferenceAddress, ReferenceRange) {
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
         * This will resize the given matrix to the specified number of rows and columns.
         * It follows the rules in the Ecma Office Open XML Part 1 - Fundamentals And Markup Language Reference.pdf 4th edition
         * @param matr The matrix to resize
         * @param maxRows
         * @param maxCols
         * @returns {*}
         * @private
         */
        BinOpExpr.prototype._adjustMatrix = function (matr, maxRows, maxCols) {
            var row = [], i, j;
            for (i = 0; i < matr[0].length; i++) {
                row.push("#N/A");
            }
            if (matr.length === 1 && matr[0].length == 1) {
                for (j = 0; j < maxCols - 1; j++) {
                    matr[0].push(matr[0][0]);
                }
            }
            if (matr.length < maxRows) {
                if (matr.length === 1) {
                    for (i = 1; i < maxRows; i++) {
                        matr.push(matr[0]);
                    }
                } else {
                    for (i = matr.length; i < maxRows; i++) {
                        matr.push(row);
                    }
                }
            }
            if (matr[0].length < maxCols) {
                if (matr[0].length === 1) {
                    for (i = 0; i < matr.length; i++) {
                        for (j = 1; j < maxCols; j++) {
                            matr[i].push(matr[i][0]);
                        }
                    }
                } else {
                    for (i = 0; i < matr.length; i++) {
                        for (j = 1; j < maxCols - matr[0].length + 1; j++) {
                            matr[i].push("#N/A")
                        }
                    }
                }
            }
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
        BinOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range,/*Boolean*/full_range) {
            var l, r, isnan, maxRows, maxCols, i, j;
            var err = new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
            l = this.Left.compute(app, source, array, false, false);
            r = this.Right.compute(app, source, array, false, false);
            if (array) {
                maxRows = l.length > r.length ? l.length : r.length;
                maxCols = l[0].length > r[0].length ? l[0].length : r[0].length;
                this._adjustMatrix(l, maxRows, maxCols);
                this._adjustMatrix(r, maxRows, maxCols);
                switch (this.Operator) {
                    case "+":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (isFinite(l[i][j]) && isFinite(r[i][j])) {
                                    //converts "" to 0
                                    l[i][j] = (+l[i][j])+ (+r[i][j]);
                                } else {
                                    if (err.test(l[i][j])) {
                                        break;
                                    } else if (err.test(r[i][j])) {
                                        l[i][j] = r[i][j];
                                    } else {
                                        l[i][j] = "#VALUE!";
                                    }
                                }
                            }
                        }
                    }
                        break;
                    case "-":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (isFinite(l[i][j]) && isFinite(r[i][j])) {
                                    //converts "" to 0
                                    l[i][j] = (+l[i][j])- (+r[i][j]);
                                } else {
                                    if (err.test(l[i][j])) {
                                        break;
                                    } else if (err.test(r[i][j])) {
                                        l[i][j] = r[i][j];
                                    } else {
                                        l[i][j] = "#VALUE!";
                                    }
                                }
                            }
                        }
                    }
                        break;
                    case "*":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (isFinite(l[i][j]) && isFinite(r[i][j])) {
                                    //converts "" to 0
                                    l[i][j] = (+l[i][j])* (+r[i][j]);
                                } else {
                                    if (err.test(l[i][j])) {
                                        break;
                                    } else if (err.test(r[i][j])) {
                                        l[i][j] = r[i][j];
                                    } else {
                                        l[i][j] = "#VALUE!";
                                    }
                                }
                            }
                        }
                    }
                        break;
                    case "/":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (isFinite(l[i][j]) && isFinite(r[i][j])) {
                                    l[i][j] = +l[i][j];
                                    r[i][j] = +r[i][j];
                                    if (r[i][j] === 0) {
                                        l[i][j] = "#DIV/0";
                                    } else {
                                        l[i][j] /= r[i][j];
                                    }
                                } else {
                                    if (err.test(l[i][j])) {
                                        break;
                                    } else if (err.test(r[i][j])) {
                                        l[i][j] = r[i][j];
                                    } else {
                                        l[i][j] = "#VALUE!";
                                    }
                                }
                            }
                        }
                    }
                        break;
                    case "^":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (isFinite(l[i][j]) && isFinite(r[i][j])) {
                                    l[i][j] = Math.pow(+l[i][j], +r[i][j]);
                                } else {
                                    if (err.test(l[i][j])) {
                                        break;
                                    } else if (err.test(r[i][j])) {
                                        l[i][j] = r[i][j];
                                    } else {
                                        l[i][j] = "#VALUE!";
                                    }
                                }
                            }
                        }
                    }
                        break;
                    case "&":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (err.test(l[i][j])) {
                                    break;
                                } else if (err.test(r[i][j])) {
                                    l[i][j] = r[i][j];
                                } else {
                                    l[i][j] = "" + l[i][j] + r[i][j];
                                }
                            }
                        }

                    }
                        break;
                    case "=":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (err.test(l[i][j])) {
                                } else if (err.test(r[i][j])) {
                                    l[i][j] = r[i][j];
                                } else {
                                    if (isFinite(l[i][j] && isFinite(r[i][j]))) {
                                        l[i][j] = (l[i][j] == r[i][j]);
                                    } else {
                                        l[i][j] = ((l[i][j].toLocaleUpperCase()).localeCompare(r[i][j].toLocaleUpperCase()) === 0);
                                    }
                                }
                            }
                        }

                    }
                        break;
                    case "<>":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (err.test(l[i][j])) {
                                } else if (err.test(r[i][j])) {
                                    l[i][j] = r[i][j];
                                } else {
                                    if (isFinite(l[i][j] && isFinite(r[i][j]))) {
                                        l[i][j] = (l[i][j] != r[i][j]);
                                    } else {
                                        l[i][j] = ((l[i][j].toLocaleUpperCase()).localeCompare(r[i][j].toLocaleUpperCase()) !== 0);
                                    }
                                }
                            }
                        }

                    }
                        break;
                    case "<=":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (err.test(l[i][j])) {
                                } else if (err.test(r[i][j])) {
                                    l[i][j] = r[i][j];
                                } else {
                                    if (isFinite(l[i][j] && isFinite(r[i][j]))) {
                                        l[i][j] = (l[i][j] <= r[i][j]);
                                    } else {
                                        l[i][j] = ((l[i][j].toLocaleUpperCase()).localeCompare(r[i][j].toLocaleUpperCase()) <= 0);
                                    }
                                }
                            }
                        }

                    }
                        break;
                    case ">=":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (err.test(l[i][j])) {
                                } else if (err.test(r[i][j])) {
                                    l[i][j] = r[i][j];
                                } else {
                                    if (isFinite(l[i][j] && isFinite(r[i][j]))) {
                                        l[i][j] = (l[i][j] >= r[i][j]);
                                    } else {
                                        l[i][j] = ((l[i][j].toLocaleUpperCase()).localeCompare(r[i][j].toLocaleUpperCase()) >= 0);
                                    }
                                }
                            }
                        }

                    }
                        break;
                    case "<":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (err.test(l[i][j])) {
                                } else if (err.test(r[i][j])) {
                                    l[i][j] = r[i][j];
                                } else {
                                    if (isFinite(l[i][j] && isFinite(r[i][j]))) {
                                        l[i][j] = (l[i][j] < r[i][j]);
                                    } else {
                                        l[i][j] = ((l[i][j].toLocaleUpperCase()).localeCompare(r[i][j].toLocaleUpperCase()) < 0);
                                    }
                                }
                            }
                        }

                    }
                        break;
                    case ">":
                    {
                        for (i = 0; i < maxRows; i++) {
                            for (j = 0; j < maxCols; j++) {
                                if (err.test(l[i][j])) {
                                } else if (err.test(r[i][j])) {
                                    l[i][j] = r[i][j];
                                } else {
                                    if (isFinite(l[i][j] && isFinite(r[i][j]))) {
                                        l[i][j] = (l[i][j] > r[i][j]);
                                    } else {
                                        l[i][j] = ((l[i][j].toLocaleUpperCase()).localeCompare(r[i][j].toLocaleUpperCase()) > 0);
                                    }
                                }
                            }
                        }

                    }
                        break;
                    default:
                    {
                        throw new Error("Unsupported binary operation." + this.toString());
                    }

                }
                return l;
            } else {
                isnan = !(isFinite(l) && isFinite(r));
                if (isnan) {
                    l = ("" + l).toLocaleUpperCase();
                    r = ("" + r).toLocaleUpperCase();

                }
                switch (this.Operator) {
                    case "+":
                    {
                        if (isnan) {
                            if (err.test(l)) {
                                return l;
                            }
                            else if (err.test(r)) {
                                return r;
                            } else {
                                return "#VALUE!";
                            }
                        }
                        else {
                            return (+l) + (+r);
                        }
                    }
                        break;
                    case "-":
                    {
                        if (isnan) {
                            if (err.test(l)) {
                                return l;
                            }
                            else if (err.test(r)) {
                                return r;
                            } else {
                                return "#VALUE!";
                            }
                        }
                        else {
                            return (+l) - (+r);
                        }
                    }
                        break;
                    case "*" :
                    {
                        if (isnan) {
                            if (err.test(l)) {
                                return l;
                            }
                            else if (err.test(r)) {
                                return r;
                            } else {
                                return "#VALUE!";
                            }
                        }
                        else {
                            return (+l) * (+r);
                        }
                    }
                        break;
                    case "/" :
                    {
                        if (isnan) {
                            if (err.test(l)) {
                                return l;
                            }
                            else if (err.test(r)) {
                                return r;
                            } else {
                                return "#VALUE!";
                            }
                        }
                        else {
                            l = +l;
                            r = +r;
                            if (r === 0) {
                                return "#DIV/0";
                            } else {
                                return l / r;
                            }
                        }
                    }
                        break;
                    case "^" :
                    {
                        if (isnan) {
                            if (err.test(l)) {
                                return l;
                            }
                            else if (err.test(r)) {
                                return r;
                            } else {
                                return "#VALUE!";
                            }
                        }
                        else {
                            l = l === "" ? 0 : l;
                            r = r === "" ? 0 : r;
                            return Math.pow(+l, +r);
                        }
                    }
                        break;
                    case "&":
                    {
                        if (err.test(l)) {
                            return l;
                        }
                        else if (err.test(r)) {
                            return r;
                        } else {
                            return "" + l + r;
                        }
                    }

                    case "=" :
                    {
                        if (err.test(l)) {
                            return l;
                        }
                        else if (err.test(r)) {
                            return r;
                        } else {
                            if (isnan) {
                                return l.localeCompare(r) == 0;
                            } else {
                                return l == r;
                            }
                        }

                    }
                        break;
                    case
                    "<>"
                    :
                    {
                        if (err.test(l)) {
                            return l;
                        }
                        else if (err.test(r)) {
                            return r;
                        } else {
                            if (isnan) {
                                return l.localeCompare(r) != 0;
                            } else {
                                return l != r;
                            }
                        }

                    }
                        break;
                    case "<=" :
                    {
                        if (err.test(l)) {
                            return l;
                        }
                        else if (err.test(r)) {
                            return r;
                        } else {
                            if (isnan) {
                                return l.localeCompare(r) <= 0;
                            } else {
                                return l <= r;
                            }
                        }
                    }
                        break;
                    case ">=" :
                    {
                        if (err.test(l)) {
                            return l;
                        }
                        else if (err.test(r)) {
                            return r;
                        } else {
                            if (isnan) {
                                return l.localeCompare(r) >= 0;
                            } else {
                                return l >= r;
                            }
                        }
                    }
                        break;
                    case
                    "<"
                    :
                    {
                        if (err.test(l)) {
                            return l;
                        }
                        else if (err.test(r)) {
                            return r;
                        } else {
                            if (isnan) {
                                return l.localeCompare(r) < 0;
                            } else {
                                return l < r;
                            }
                        }
                    }
                        break;
                    case ">" :
                    {
                        if (err.test(l)) {
                            return l;
                        }
                        else if (err.test(r)) {
                            return r;
                        } else {
                            if (isnan) {
                                return l.localeCompare(r) > 0;
                            } else {
                                return l > r;
                            }
                        }
                    }
                        break;
                    /* case ":":{
                     //TODO Should I consider addresses on different sheets?
                     if(this.Left instanceof ReferenceAddress && this.Right instanceof ReferenceAddress){
                     if(this.Left.Address.X <= this.Right.Address.X){
                     leftX=this.Left.Address.X;
                     rightX=this.Right.Address.X;
                     }else{
                     leftX = this.Right.Address.X;
                     rightX = this.Left.Address.X;
                     }
                     if(this.Left.Address.Y <= this.Right.Address.Y){
                     topY=this.Left.Address.Y;
                     bottomY=this.Right.Address.Y;
                     }else{
                     bottomY=this.Left.Address.Y;
                     topY=this.Right.Address.Y;
                     }
                     }else if(this.Left instanceof ReferenceAddress && this.Right instanceof ReferenceRange){
                     */
                    /*  if(this.Left.Address.X <= this.Right.Range.getXLeft()){
                     leftX = this.Left.Address.X;
                     rightX = this.Right.Range.getXRight();
                     }else{
                     leftX = this.Right.Range.getXLeft();
                     if(this.Left.Address.X >= this.Right.Range.getXRight()){
                     rightX = this.Left.Address.X;
                     }else{
                     rightX = this.Right.Range.getXRight();
                     }
                     }*/
                    /*
                     }else if(this.Left instanceof ReferenceRange && this.Right instanceof ReferenceRange){
                     leftX = (this.Left.Range.getXLeft() <= this.Right.Range.getXLeft())?this.Left.Range.getXLeft():this.Right.Range.getXLeft();
                     rightX = (this.Left.Range.getXRight() >= this.Right.Range.getXRight())? this.Left.Range.getXRight(): this.Right.Range.getXRight();
                     topY = (this.Left.Range.getYTop() <= this.Right.Range.getYTop())? this.Left.Range.getYTop():this.Right.Range.getYTop();
                     bottomY = (this.Left.Range.getYBottom() >= this.Right.Range.getYBottom())? this.Left.Range.getYBottom(): this.Right.Range.getYBottom();
                     }



                     else{
                     throw new Error("Illegal operator \":\"");
                     }
                     }
                     break;*/
                    default:
                        throw new Error("Unknown operator" + this.toString());
                }
            }

        }
        ;
        return BinOpExpr;
    }
)
;