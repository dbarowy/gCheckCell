define("Utilities/Function", ["Libraries/formula", "Parser/AST/ConstantString", "XClasses/XLogger"], function (Formula, ConstantString, XLogger) {
    "use strict";
    var func = {};
    func._isError = function (value) {
        return (new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)")).test(value);
    };

    func._containsError = function (matrix) {
        var err = new RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        var i, j;
        for (i = 0; i < matrix.length; i++) {
            for (j = 0; j < matrix[0].length; j++) {
                if (err.test(matrix[i][j])) {
                    return matrix[i][j];
                }
            }
        }
        return false;
    };
    func._flattenMatrix = function (matrix) {
        var res = [], i;
        for (i = 0; i < matrix.length; i++) {
            res = res.concat(matrix[i]);
        }
        return res;
    };

    func._returnError = function (error, array) {
        if (array) {
            return [error];
        } else {
            return error;
        }
    };

    /**
     * This will resize the given matrix to the specified number of rows and columns.
     * It follows the rules in the Ecma Office Open XML Part 1 - Fundamentals And Markup Language Reference.pdf 4th edition
     * @param matr The matrix to resize
     * @param maxRows
     * @param maxCols
     * @returns {*}
     * @private
     */
    func._adjustMatrix = function (matr, maxRows, maxCols) {
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
                    for (j = 1; j < maxCols - matr[0].length + 1; j++) {
                        matr[i].push("#N/A")
                    }
                }
            }
        }
    };
    /**
     * Determines the minimum value among the passsed values.
     * Logical values and text representation of numbers are ignored.
     * @returns {*}
     * @constructor
     */
    func.MIN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var k, val, min = +Infinity, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            if (array) {
                                return [
                                    [val[i][j]]
                                ];
                            } else {
                                return val[i][j];
                            }
                        } else {
                            if (isFinite(val[i][j]) && val[i][j] !== true && val[i][j] !== false && (typeof val[i][j] !== 'string') && val[i][j] < min) {
                                min = val[i][j];
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    if (array) {
                        return [
                            [val]
                        ];
                    } else {
                        return val;
                    }
                } else {
                    if (isFinite(val) && val !== true && val !== false && (typeof val !== 'string') && val < min) {
                        min = val;
                    }
                }
            }
        }
        if (!isFinite(min)) {
            min = 0;
        }
        if (array) {
            return [
                [min]
            ];
        } else {
            return min;
        }
    };


    /**
     * Determines the maximum value among the passsed values.
     * Logical values and text representation of numbers are ignored.
     * @returns {*}
     * @constructor
     */
    func.MAX = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var k, val, max = -Infinity, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            if (array) {
                                return [
                                    [val[i][j]]
                                ];
                            } else {
                                return val[i][j];
                            }
                        } else {
                            if (isFinite(val[i][j]) && val[i][j] !== true && val[i][j] !== false && (typeof val[i][j] !== 'string') && val[i][j] > max) {
                                max = val[i][j];
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    if (array) {
                        return [
                            [val]
                        ];
                    } else {
                        return val;
                    }
                } else {
                    if (isFinite(val) && val !== true && val !== false && (typeof val !== 'string') && val > max) {
                        max = val;
                    }
                }
            }
        }
        if (!isFinite(max)) {
            max = 0;
        }
        if (array) {
            return [
                [max]
            ];
        } else {
            return max;
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.SUM = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var k, val, sum = 0, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            return func._returnError(val[i][j], array);

                        } else {
                            if (isFinite(val[i][j])) {
                                sum += (+val[i][j]);
                            } else {
                                return func._returnError("#VALUE!", array);
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    return func._returnError(val, array);
                } else {
                    if (isFinite(val)) {
                        sum += (+val);
                    } else {
                        return func._returnError("#VALUE!", array);
                    }
                }
            }
        }
        if (array) {
            return [
                [sum]
            ];
        } else {
            return sum;
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.SQRT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var k, val, sum = 0, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");

        if (args.length !== 1) {
            return func._returnError("#N/A", array);
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (!err.test(val[i][j])) {
                            val[i][j] = (isFinite(val[i][j]) && (+val[i][j]) >= 0) ? Math.sqrt(+val[i][j]) : "#VALUE!";
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = (isFinite(val) && (+val) >= 0) ? Math.sqrt(+val) : "#VALUE!";
                }
            }
        }
        return val;

    };


    /**
     * @returns {*}
     * @constructor
     */
    func.MEDIAN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var k, val, med = [], i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            if (array) {
                                return [
                                    [val[i][j]]
                                ];
                            } else {
                                return val[i][j];
                            }
                        } else {
                            if (isFinite(val[i][j]) && val[i][j] !== true && val[i][j] !== false && (typeof val[i][j] !== 'string')) {
                                med.push(val[i][j]);
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    if (array) {
                        return [
                            [val]
                        ];
                    } else {
                        return val;
                    }
                } else {
                    if (isFinite(val) && val !== true && val !== false && (typeof val !== 'string')) {
                        med.push(val);
                    }
                }
            }
        }

        if (array) {
            return [
                [Formula.MEDIAN(med)]
            ];
        } else {
            return Formula.MEDIAN(med);
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.AVERAGE = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var k, val, sum = 0, i, j, count = 0;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            if (array) {
                                return [
                                    [val[i][j]]
                                ];
                            } else {
                                return val[i][j];
                            }
                        } else {
                            if (isFinite(val[i][j]) && val[i][j] !== true && val[i][j] !== false && (typeof val[i][j] !== 'string')) {
                                sum += val[i][j];
                                count += 1;
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    if (array) {
                        return [
                            [val]
                        ];
                    } else {
                        return val;
                    }
                } else {
                    if (isFinite(val) && val !== true && val !== false && (typeof val !== 'string')) {
                        sum += val;
                        count += 1;
                    }
                }
            }
        }
        if (count === 0) {
            sum = "#DIV/0";
        } else {
            sum = sum / count;
        }
        if (array) {
            return [
                [sum]
            ];
        } else {
            return sum;
        }
    };


    /**
     * @returns {*}
     * @constructor
     */
    func.ABS = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }

        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            break;
                        } else {
                            val[i][j] = Math.abs(val[i][j]);
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = Math.abs(val);
                }
            }
            return val;
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ACOS = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            break;
                        } else {
                            val[i][j] = (val < -1 || val > 1) ? "#NUM!" : Math.acos(val[i][j]);
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = Math.acos(val);
                }
            }
            return val;
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ACOSH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            break;
                        } else {
                            val[i][j] = (val[i][j] < 1) ? "#NUM!" : Formula.ACOSH(val[i][j]);
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = (val < 1) ? "#NUM!" : Formula.ACOSH(val);
                }
            }
            return val;
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.AND = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j, res = true, ok = false, k;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length === 0) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            for (k = 0; k < this.args.length; k++) {
                val = this.args[k].compute(app, source, array, true);
                if (val instanceof Array) {
                    for (i = 0; i < val.length; i++) {
                        for (j = 0; j < val[i].length; j++) {
                            if (err.test(val[i][j])) {
                                if (array) {
                                    return [
                                        [val[i][j]]
                                    ];
                                } else {
                                    return val[i][j];
                                }

                            } else {
                                if (!(val[i][j] instanceof String)) {
                                    ok = true;
                                    res = res && val[i][j];
                                }
                            }
                        }
                    }
                } else {
                    if (!(val instanceof String)) {
                        ok = true;
                        res = res && val;
                    }
                }
            }
        }
        //If there has not been a value that is not a string, ok will be false
        if (!ok) {
            res = "#VALUE!";
        }
        if (array) {
            return [
                [res]
            ];
        } else {
            return res;
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.ARRAYFORMULA = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            return args[0].compute(app, source, true, true);
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.ImportRange = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        //TODO Rewrite
        "use strict";
        var val;
        if (args.length !== 2) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else if (args[0].Ref instanceof ConstantString && args[1].Ref instanceof ConstantString) {
            try {
                val = app.getExternalRange(args[0].Ref._value, args[1].Ref._value);
                if (array || range) {
                    return val;
                } else {
                    return val[0][0];
                }
            } catch (e) {
                XLogger.log("ImportRange error " + e);
                if (array) {
                    return [
                        ["#REF!"]
                    ];
                } else {
                    return "#REF!";
                }
            }
        } else {
            if (array) {
                return [
                    ["#REF!"]
                ];
            } else {
                return  "#REF!";
            }
        }
    };
    /**+
     * @returns {*}
     * @constructor
     */
    func.ASIN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            break;
                        } else {
                            if (val < -1 || val > 1) {
                                val[i][j] = "#NUM!";
                            } else {
                                val[i][j] = Math.asin(val[i][j]);
                            }
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = Math.asin(val);
                }
            }
            return val;
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ASINH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (!err.test(val[i][j])) {
                            val[i][j] = Formula.ASINH(val[i][j]);
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = Formula.ASINH(val);
                }
            }
            return val;
        }
    };

    func.ATAN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (!err.test(val[i][j])) {
                            val[i][j] = Math.atan(val[i][j]);
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = Math.atan(val);
                }
            }
            return val;
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ATAN2 = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var l, r, i, j, maxRows, maxCols;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 2) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            l = args[0].compute(app, source, array, false);
            r = args[1].compute(app, source, array, false);
            if (array) {
                maxRows = l.length > r.length ? l.length : r.length;
                maxCols = l[0].length > r[0].length ? l[0].length : r[0].length;
                this._adjustMatrix(l, maxRows, maxCols);
                this._adjustMatrix(r, maxRows, maxCols);
                for (i = 0; i < l.length; i++) {
                    for (j = 0; j < l[i].length; j++) {
                        if (!isFinite(l[i][j]) || !isFinite(r[i][j])) {
                            if (err.test(l[i][j])) {
                            } else if (err.test(r[i][j])) {
                                l[i][j] = r[i][j];
                            } else {
                                l[i][j] = "#VALUE!";
                            }
                        } else {
                            l[i][j] = Formula.ATAN2(l[i][j], r[i][j]);
                        }
                    }
                }

            } else {
                if (!isFinite(l) || !isFinite(r)) {
                    if (err.test(l)) {
                    } else if (err.test(r)) {
                        l = r;
                    } else {
                        l = "#VALUE!";
                    }
                } else {
                    l = Formula.ATAN2(l, r);
                }
            }
            return l;
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ATANH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (!err.test(val[i][j])) {
                            val[i][j] = (val[i][j] < -1 || val[i][j] > 1) ? "#NUM!" : Formula.ATANH(val[i][j]);
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    val = (val < -1 || val > 1) ? "#NUM!" : Formula.ATANH(val);
                }
            }
            return val;
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.BIN2DEC = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)"), res, val;
        if (args.length !== 1) {
            if (array) {
                return [
                    ["#N/A"]
                ];
            } else {
                return "#N/A";
            }
        } else {
            val = args[0].compute(app, source, array, false);
            if (!err.test(val)) {
                res = Formula.BIN2DEC(val);
            } else {
                res = val;
            }

        }
        if (array) {
            return [
                [res]
            ];
        } else {
            return res;
        }
    };


    return func;
});