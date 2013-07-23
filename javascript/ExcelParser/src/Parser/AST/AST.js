define("Parser/AST/AST", ["Parser/AST/Address", "Parser/AST/BinOpExpr", "Parser/AST/ParensExpr", "Parser/AST/Range", "Parser/AST/Reference", "Parser/AST/ReferenceAddress", "Parser/AST/ReferenceConstant", "Parser/AST/ReferenceExpr", "Parser/AST/ReferenceFunction", "Parser/AST/ReferenceNamed", "Parser/AST/ReferenceRange", "Parser/AST/ReferenceString", "Parser/AST/UnaryOpExpr", "Parser/AST/PostfixOpExpr", "Parser/AST/ReferenceLogical", "Parser/AST/ReferenceError"], function (Address, BinOpExpr, ParensExpr, Range, Reference, ReferenceAddress, ReferenceConstant, ReferenceExpr, ReferenceFunction, ReferenceNamed, ReferenceRange, ReferenceString, UnaryOpExpr,PostfixOpExpr,ReferenceLogical,ReferenceError) {
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
        ReferenceLogical:ReferenceLogical,
        ReferenceString: ReferenceString,
        PostfixOpExpr: PostfixOpExpr,
        ReferenceError:ReferenceError
    };

});