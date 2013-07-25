/**
 * This file contains the BinOpExpr class.
 * This class is used to represent expressions that involve an infix operator.
 */
define("Parser/AST/BinOpExpr",["Parser/AST/ReferenceAddress", "Parser/AST/ReferenceRange"], function (ReferenceAddress, ReferenceRange) {
    "use strict";
    function BinOpExpr(/*string*/op, /*Expression*/left, /*Expression*/right) {
        this.Operator = op;
        this.Left = left;
        this.Right = right;
        /*Operator precedence used to solve the issue of associativity*/
        this._precedence = {
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
    }

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
        if (this.Right instanceof BinOpExpr) {
            if (this._precedence[this.Operator] >= this._precedence[this.Right.Operator]) {
                this.Left = new BinOpExpr(this.Operator, this.Left, this.Right.Left);
                this.Operator = this.Right.Operator;
                this.Right = this.Right.Right;

            }
        }
        this.Right.fixAssoc();
    };

    BinOpExpr.prototype.getValue = function (source) {
        var l, r, isnan;
        var Xs=[], Ys=[];
        l = this.Left.getValue(source);
        r = this.Right.getValue(source);
        isnan = isNaN(l) || isNaN(r);
        if (isnan) {
            l = ("" + l).toLocaleUpperCase();
            r = ("" + r).toLocaleUpperCase();
        }
        switch (this.Operator) {
            case "+":
            {
                if (isnan) {
                    throw new Error("#VALUE!");
                } else {
                    return l + r;
                }
            }
                break;
            case "-":
            {
                if (isnan) {
                    throw new Error("#VALUE!");
                } else {
                    return l - r;
                }
            }
                break;
            case "*":
            {
                if (isnan) {
                    throw new Error("#VALUE!");
                } else {
                    return l * r;
                }
            }
                break;
            case "/":
            {
                if (isnan) {
                    throw new Error("#VALUE!");
                } else {
                    return l / r;
                }
            }
                break;
            case "^":
            {
                if (isnan) {
                    throw new Error("#VALUE!");
                } else {
                    return Math.pow(l, r);
                }
            }
                break;
            case "&":
                return "" + l + r;
            case "=":
            {
                if (isnan) {
                    return l.localeCompare(r) === 0;
                } else {
                    return l === r;
                }
            }
                break;
            case "<>":
            {
                if (isnan) {
                    return l.localeCompare(r) !== 0;
                } else {
                    return l !== r;
                }
            }
                break;
            case "<=":
            {
                if (isnan) {
                    return l.localeCompare(r) <= 0;
                } else {
                    return l <= r;
                }
            }
                break;
            case ">=":
            {
                if (isnan) {
                    return l.localeCompare(r) >= 0;
                } else {
                    return l >= r;
                }
            }
                break;
            case "<":
            {
                if (isnan) {
                    return l.localeCompare(r) < 0;
                } else {
                    return l < r;
                }
            }
                break;
            case ">":
            {
                if (isnan) {
                    return l.localeCompare(r) > 0;
                } else {
                    return l > r;
                }
            }
                break;
            case ":":{

                if(this.Left instanceof ReferenceAddress){
                   Xs.push(this.Left.Address.X);
                    Ys.push(this.Left.Adddress.Y);
                }else if(this.Left instanceof ReferenceRange){
                    Xs.push(this.Left.Range.getXLeft());
                    Xs.push(this.Left.Range.getXRight());
                }
                if( (this.Left instanceof ReferenceAddress || this.Left instanceof ReferenceRange)  && (this.Right instanceof ReferenceAddress || this.Right instanceof ReferenceRange)){



                }else{
                    throw new Error("Illegal operator \":\"");
                }
            }
                break;
            default:
                throw new Error("Unknown operator");
        }

    };
    return BinOpExpr;
});