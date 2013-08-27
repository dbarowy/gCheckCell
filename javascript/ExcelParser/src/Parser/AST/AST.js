define("Parser/AST/AST", ["Parser/AST/Address", "Parser/AST/BinOpExpr", "Parser/AST/ParensExpr", "Parser/AST/Range", "Parser/AST/Reference", "Parser/AST/ReferenceAddress", "Parser/AST/ConstantNumber", "Parser/AST/ReferenceExpr", "Parser/AST/ReferenceFunction", "Parser/AST/ReferenceNamed", "Parser/AST/ReferenceRange", "Parser/AST/ConstantString", "Parser/AST/UnaryOpExpr", "Parser/AST/PostfixOpExpr", "Parser/AST/ConstantLogical", "Parser/AST/ConstantError", "Parser/AST/ConstantArray"], function (Address, BinOpExpr, ParensExpr, Range, Reference, ReferenceAddress, ConstantNumber, ReferenceExpr, ReferenceFunction, ReferenceNamed, ReferenceRange, ConstantString, UnaryOpExpr, PostfixOpExpr, ConstantLogical, ConstantError, ConstantArray) {
    "use strict";
    return {
        ReferenceAddress: ReferenceAddress,
        UnaryOpExpr: UnaryOpExpr,
        ParensExpr: ParensExpr,
        BinOpExpr: BinOpExpr,
        ReferenceExpr: ReferenceExpr,
        ReferenceRange: ReferenceRange,
        ReferenceFunction: ReferenceFunction,
        ConstantNumber: ConstantNumber,
        ReferenceNamed: ReferenceNamed,
        Reference: Reference,
        Range: Range,
        Address: Address,
        ConstantLogical: ConstantLogical,
        ConstantString: ConstantString,
        PostfixOpExpr: PostfixOpExpr,
        ConstantError: ConstantError,
        ConstantArray: ConstantArray
    };

});