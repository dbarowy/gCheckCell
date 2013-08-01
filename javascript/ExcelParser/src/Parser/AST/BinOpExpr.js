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
     * Compute the value of this expression.
     * @param app Entry point to the application data
     * @param source The cell for which we are computing the formula
     * @param array True if we are computing an array formula, false otherwise
     * @returns {*}
     */
    BinOpExpr.prototype.compute = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array) {
        var l, r, isnan;
        var leftX, topY, rightX, bottomY;
        l = this.Left.compute(app, source, array);
        r = this.Right.compute(app, source, array);
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
             *//*  if(this.Left.Address.X <= this.Right.Range.getXLeft()){
         leftX = this.Left.Address.X;
         rightX = this.Right.Range.getXRight();
         }else{
         leftX = this.Right.Range.getXLeft();
         if(this.Left.Address.X >= this.Right.Range.getXRight()){
         rightX = this.Left.Address.X;
         }else{
         rightX = this.Right.Range.getXRight();
         }
         }*//*
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
                throw new Error("Unknown operator");
        }

    };
    return BinOpExpr;
});