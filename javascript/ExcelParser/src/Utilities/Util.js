define("Utilities/Util", function () {
    return {/**
     * This will resize the given matrix to the specified number of rows and columns.
     * It follows the rules in the Ecma Office Open XML Part 1 - Fundamentals And Markup Language Reference.pdf 4th edition
     * @param matr The matrix to resize
     * @param maxRows
     * @param maxCols
     * @returns {*}
     * @private
     */
    adjustMatrix: function (matr, maxRows, maxCols) {

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
                    var pushes = maxCols - matr[i].length + 1;
                    for (j = 1; j < pushes; j++) {
                        matr[i].push("#N/A");
                    }
                }
            }
        }
    }

    };
})
;