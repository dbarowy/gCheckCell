define(["Parser/AST/Address", "AST/BinOpExpr", "AST/ParensExpr", "AST/Range", "AST/Reference", "AST/ReferenceAddress", "AST/ReferenceConstant", "AST/ReferenceExpr", "AST/ReferenceFunction", "AST/ReferenceNamed", "AST/ReferenceRange", "AST/ReferenceString", "AST/UnaryOpExpr"], function (Address, BinOpExpr, ParensExpr, Range, Reference, ReferenceAddress, ReferenceConstant, ReferenceExpr, ReferenceFunction, ReferenceNamed, ReferenceRange, ReferenceString, UnaryOpExpr) {
    "use strict";

    return {
        ReferenceAddress: ReferenceAddress,
        UnaryOpExpr: UnaryOpExpr,
        ParensExpr: ParensExpr,
        BinOpExpr: BinOpExpr,
        ReferenceExpr: ReferenceExpr,
        ReferenceRange: ReferenceRange,
        ReferenceFunction: ReferenceFunction,
        ReferenceConstant: ReferenceConstant,
        ReferenceNamed: ReferenceNamed,
        Reference: Reference,
        Range: Range,
        Address: Address,
        ReferenceString: ReferenceString
    };

});