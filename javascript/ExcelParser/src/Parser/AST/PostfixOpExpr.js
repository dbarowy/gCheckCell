/**
 * This file contains the class PostfixOpExpr used to represent expressions that involve a postfix operator
 * Example: A3%
 */
define("Parser/AST/PostfixOpExpr", function () {
    "use strict";
    function PostfixOpExpr(/*string*/op, /*Expression*/expr) {
        this.Operator = op;
        this.Expr = expr;
    }

    PostfixOpExpr.prototype.toString = function () {
        return "PostfixOpExpr(\"" + this.Operator + "\"," + this.Expr.toString()+")";
    };

    PostfixOpExpr.prototype.Resolve = function (/*XWorkbook*/ wb, /*XWorksheet*/ ws) {
        this.Expr.Resolve(wb, ws);
    };
    PostfixOpExpr.prototype.fixAssoc = function(){
        this.Expr.fixAssoc();
    };

    PostfixOpExpr.prototype.compute = function(/*XApplication*/app, /*Address*/source){
        return this.Expr.compute(app,source)/100;
    };

    return PostfixOpExpr;
});