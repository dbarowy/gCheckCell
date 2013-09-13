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
 * @Description This file groups all the AST modules under one module
 */



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