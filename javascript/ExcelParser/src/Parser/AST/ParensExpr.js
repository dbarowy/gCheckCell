/**
 * This file contains the class ParensExpr which is used to represent expressions inside parentheses
 */
define("Parser/AST/ParensExpr", function () {
    "use strict";
    function ParensExpr(/*Expression*/expr) {
        this.Expr = expr;
    }

    ParensExpr.prototype.toString = function () {
        return "ParensExpr(" + this.Expr + ")";
    };

    ParensExpr.prototype.Resolve = function (/*Workbook*/ wb, /*Worksheet*/ ws) {
        this.Expr.Resolve(wb, ws);
    };
    ParensExpr.prototype.fixAssoc = function(){
        this.Expr.fixAssoc();
    };
    ParensExpr.prototype.getValue = function(source){
        return this.Expr.getValue(source);
    };

    return ParensExpr;
});