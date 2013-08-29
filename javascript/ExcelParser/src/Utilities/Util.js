define("Utilities/Util", function () {
    var Util = {};
    /**
     * This will resize the given matrix to the specified number of rows and columns.
     * It follows the rules in the Ecma Office Open XML Part 1 - Fundamentals And Markup Language Reference.pdf 4th edition
     * @param matr The matrix to resize
     * @param maxRows
     * @param maxCols
     * @returns {*}
     */
        //TODO replace the hardcoded error object with XTypes and XTypedValue
    Util.adjustMatrix = function (matr, maxRows, maxCols) {
        var row = [], i, j;
        for (i = 0; i < matr[0].length; i++) {
            row.push({value: "#N/A", type: 3});
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
                    var pushes = maxCols - matr[i].length + 1;
                    for (j = 1; j < pushes; j++) {
                        matr[i].push({value: "#N/A", type: 3});
                    }
                }
            }
        }
    };

    Util.boolToString = function (val) {
        if (val) {
            return "TRUE";
        } else {
            return "FALSE";
        }
    };
    //TODO Unimplemented
    Util.getNumberFromDate = function (/*Date*/date) {
        if (date instanceof Date) {
            return 0;
        } else {
            throw new Error("This is not a date" + date);
        }

    };
    Util.getStringFromDate = function (/*Date*/date) {
       return date.toLocaleString();
    };

    Util.getDateFromNumber = function (/*Number*/nr) {
        return new Date();
    };
    return Util;
})
;