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
            return [
                [error]
            ];
        } else {
            return error;
        }
    };



    func.INT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");

        if (args.length !== 1) {
            return func._returnError("#N/A", array);
        } else {
            val = args[0].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (!err.test(val[i][j])) {
                            if (isFinite(val[i][j]) && val[i][j] !== true && val[i][j] !== false) {
                                val[i][j] = Math.floor(+val[i][j]);
                            } else {
                                val[i][j] = "#VALUE!";
                            }
                        }
                    }
                }
            } else {
                if (!err.test(val)) {
                    if (isFinite(val) && val !== true && val !== false) {
                        val = Math.floor(+val);
                    } else {
                        val = "#VALUE!";
                    }
                }
            }
        }
        return val;
    };


    /**
     * Determines the minimum value among the passsed values.
     * Logical values and text representation of numbers are ignored.
     * @returns {*}
     * @constructor
     */
    func.MIN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, min = +Infinity, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            return func._returnError(val[i][j], array);
                        } else {
                            if (isFinite(val[i][j]) && val[i][j] !== true && val[i][j] !== false && (typeof val[i][j] !== 'string') && val[i][j] < min) {
                                min = val[i][j];
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    func._returnError(val, array);
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
    func.MAX = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, max = -Infinity, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            return func._returnError(val[i][j], array);
                        } else {
                            if (isFinite(val[i][j]) && val[i][j] !== true && val[i][j] !== false && (typeof val[i][j] !== 'string') && val[i][j] > max) {
                                max = val[i][j];
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    return func._returnError(val, array);
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
    func.SUM = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, sum = 0, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length === 0) {
            return func._returnError("#N/A", array);
        }
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            return func._returnError(val[i][j], array);

                        } else {
                            if ((isFinite(val[i][j]) && typeof(val[i][j]) == "number") || val[i][j] === true) {
                                sum += (+val[i][j]);
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
    func.SQRT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j;
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
    func.SUMPRODUCT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, product, sum = 0, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length === 0) {
            return func._returnError("#N/A", array);
        }
        product = args[0].compute(app, source, true, true);
        for (k = 1; k < args.length; k++) {
            val = args[k].compute(app, source, true, true);
            if (product.length !== val.length || product[0].length !== val[0].length) {
                return func._returnError("#VALUE!", array);
            } else {
                for (i = 0; i < product.length; i++) {
                    for (j = 0; j < product[i].length; j++) {
                        if (!err.test(product[i][j])) {
                            if (err.test(val[i][j])) {
                                product[i][j] = val[i][j];
                            } else {
                                if (!isFinite(product[i][j]) || !isFinite(val[i][j])) {
                                    product[i][j] = 0;
                                } else {
                                    product[i][j] = (+product[i][j]) * (+val[i][j]);
                                }
                            }
                        }
                    }
                }
            }
        }
        for (i = 0; i < product.length; i++) {
            for (j = 0; j < product[i].length; j++) {
                if (err.test(product[i][j])) {
                    return func._returnError(product[i][j], array);

                } else {
                    if (isFinite(product[i][j])) {
                        sum += (+product[i][j]);
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
    func.IF = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        var test, then_value, otherwise_value, maxRows, maxCols, i, j;
        if (args.length <= 1 || args.length > 3) {
            return func._returnError("#N/A", array);
        } else {
            test = args[0].compute(app, source, array, false);
            then_value = args[1].compute(app, source, array, false);
            if (args.length === 2) {
                if (array) {
                    otherwise_value = [
                        [false]
                    ];
                } else {
                    otherwise_value = false;
                }
            } else {
                otherwise_value = args[2].compute(app, source, array, false);
            }
            if (array) {
                maxRows = (test.length > then_value.length) ? (test.length > otherwise_value.length ? test.length : otherwise_value.length) : (then_value.length > otherwise_value.length ? then_value.length : otherwise_value.length);
                maxCols = (test[0].length > then_value[0].length) ? (test[0].length > otherwise_value[0].length ? test[0].length : otherwise_value[0].length) : (then_value[0].length > otherwise_value[0].length ? then_value[0].length : otherwise_value[0].length);
                func._adjustMatrix(test, maxRows, maxCols);
                func._adjustMatrix(then_value, maxRows, maxCols);
                func._adjustMatrix(otherwise_value, maxRows, maxCols);
                for (i = 0; i < maxRows; i++) {
                    for (j = 0; j < maxCols; j++) {
                        if ((typeof(test[i][j]) === "number" && test[i][j]) || test[i][j] === true || (test[i][j] == "TRUE")) {
                            test[i][j] = then_value[i][j];
                        } else if ((typeof(test[i][j]) === "number" && !test[i][j]) || test[i][j] === false || (test[i][j] == "FALSE")) {
                            test[i][j] = otherwise_value[i][j];
                        } else {
                            if (!err.test(test[i][j])) {
                                test[i][j] = "#VALUE!";
                            }
                        }
                    }
                }

            } else {
                if ((typeof(test) === "number" && test) || test === true || (test == "TRUE")) {
                    test = then_value;
                } else if ((typeof(test) === "number" && !test) || test === false || (test == "FALSE")) {
                    test = otherwise_value;
                } else {
                    if (!err.test(test)) {
                        test = "#VALUE!";
                    }
                }
            }
        }
        return test;
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.PRODUCT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, product = 1, i, j, ok = 0;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length === 0) {
            return func._returnError("#N/A", array);
        }
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            return func._returnError(val[i][j], array);
                        } else {
                            if (typeof val[i][j] === "number") {
                                ok = 1;
                                product *= (val[i][j]);
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    return func._returnError(val, array);
                } else {
                    if (typeof val === "number") {
                        ok = 1;
                        product *= val;
                    }
                }
            }
        }
        if (!ok) {
            product = 0;
        }
        if (array) {
            return [
                [product]
            ];
        } else {
            return product;
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.HYPERLINK = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        //TODO HYPERLINK(TRUE) should return TRUE, not true
        var urls, links, maxRows, maxCols;
        if (args.length === 0 || args.length > 2) {
            return func._returnError("#N/A", array);
        } else {
            if (args.length === 1) {
                return args[0].compute(app, source, array, false);
            } else {
                if (args.length === 2) {
                    urls = args[0].compute(app, source, array, false);
                    links = args[1].compute(app, source, array, false);
                    if (array) {
                        maxRows = urls.length > links.length ? urls.length : links.length;
                        maxCols = urls[0].length > links[0].length ? urls[0].length : links[0].length;
                        func._adjustMatrix(links, maxRows, maxCols);

                    }
                    return links;
                }
            }
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.COUNT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j, count = 0, k;
        if (args.length === 0) {
            return func._returnError("#N/A", array);
        } else {
            for (k = 0; k < args.length; k++) {
                val = args[k].compute(app, source, array, true);
                if (val instanceof Array) {
                    for (i = 0; i < val.length; i++) {
                        for (j = 0; j < val[i].length; j++) {
                            if (typeof val[i][j] === "number") {
                                count++;
                            }
                        }
                    }
                } else {
                    if (typeof val === "number") {
                        count++;
                    }
                }
            }
        }
        if (array) {
            return [
                [count]
            ];
        } else {
            return count;
        }
    };


    /**
     * @returns {*}
     * @constructor
     */
    func.MEDIAN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, med = [], i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            return func._returnError(val[i][j], array);
                        } else {
                            if (isFinite(val[i][j]) && typeof(val[i][j]) === "number") {
                                med.push(val[i][j]);
                            }
                        }
                    }
                }
            } else {
                if (err.test(val)) {
                    return func._returnError(val, array);
                } else {
                    if (isFinite(val) && typeof(val) === "number") {
                        med.push(val);
                    }
                }
            }
        }
        if (med.length === 0) {
            med.push(0);
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
    func.RANK = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var value, data, type, arr = [], i, j, maxRows, maxCols, rangeArgument;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        console.log("range"+range);
        if (args.length < 2 || args.length > 3) {
            return func._returnError("#N/A", array);
        } else {
            if (args.length === 2) {
                type = [
                    [0]
                ];
            } else {
                type = args[2].compute(app, source, array, false, full_range);
            }
            if (!(type instanceof Array)) {
                type = [
                    [type]
                ];
            }
            console.log(full_range);

            value = args[0].compute(app, source, array, true, full_range);
            data = args[1].compute(app, source, array, true, full_range);
            if (!(value instanceof Array)) {
                value = [
                    [value]
                ];
            }
            if (!(data instanceof Array)) {
                data = [
                    [data]
                ];
            }
            for (i = 0; i < data.length; i++) {
                for (j = 0; j < data[i].length; j++) {
                    if (typeof data[i][j] == "number")
                        arr.push(data[i][j]);
                }
            }
            arr.sort();
            console.log(value);
            console.log(type);
            maxRows = value.length > type.length ? value.length : type.length;
            maxCols = (value[0].length > type[0].length) ? value[0].length : type[0].length;
            func._adjustMatrix(value, maxRows, maxCols);
            func._adjustMatrix(type, maxRows, maxCols);
            for (i = 0; i < maxRows; i++) {
                for (j = 0; j < maxCols; j++) {
                    if (!err.test(value[i][j])) {
                        if (!err.test(type[i][j])) {
                            if (typeof type[i][j] == "number" && isFinite(type[i][j])) {
                                if (type[i][j]) {
                                    var aux = value[i][j];
                                    value[i][j] = arr.indexOf(value[i][j]) + 1;
                                    if (value[i][j] == 0) {
                                        value[i][j] = "#VALUE!";
                                    }
                                } else {
                                    value[i][j] = arr.lastIndexOf(value[i][j]) + 1;
                                    if (value[i][j] == 0) {
                                        value[i][j] = "#VALUE!";
                                    }
                                }
                            } else {
                                value[i][j] = "#VALUE!";
                            }
                        } else {

                            value[i][j] = err[i][j];
                        }
                    }
                }

            }
            if (full_range || array || range) {
                return value;
            } else {
                return value[0][0];
            }

        }

    };

    /**
     * @returns {*}
     * @constructor
     */
    func.AVERAGE = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, sum = 0, i, j, count = 0;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length == 0) {
            return func._returnError("#N/A", array);
        }
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true);
            if (val instanceof Array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            return func._returnError(val[i][j], array);
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
                    return func._returnError(val, array);
                } else {
                    if (isFinite(val) && val !== true && val !== false && (typeof val !== 'string')) {
                        sum += val;
                        count += 1;
                    }
                }
            }
        }
        if (count === 0) {
            sum = "#DIV/0!";
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
    func.ABS = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.ACOS = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.ACOSH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.AND = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.ARRAYFORMULA = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.ImportRange = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
                if (array || range || full_range) {
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
    func.ASIN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.ASINH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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

    func.ATAN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.ATAN2 = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.ATANH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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
    func.BIN2DEC = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
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