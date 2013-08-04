define("Utilities/Function", ["formula"], function (Formula) {
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
    /**
     * @returns {*}
     * @constructor
     */
    func.ABS = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var val, i, j;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length !== 1) {
            return "#N/A";
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
            return "#N/A";
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
                                val[i][j] = Math.acos(val[i][j]);
                            }
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
            return "#N/A";
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
        var val, i, j, res = true, ok = false;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length === 0) {
            return "#N/A";
        } else {
            for (i = 0; i < this.args.length; i++) {
                val = this.args[i].compute(app, source, array, true);
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
        if (array) {
            return [
                [res && ok]
            ];
        } else {
            return res && ok;
        }
    };

    func.SUM = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
        var i, val;
        for (i = 0; i < args.length; i++) {
            val = args[i].compute(app, source, array, true);
            if (val instanceof Array) {
                aux.push(this._flattenMatrix(val))
            } else {
                aux.push(val);
            }
        }
        val = Formula.SUM.apply(null, aux);
        if (array) {
            return [
                [val]
            ];
        } else {
            return val;
        }
    };

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
                        if (err.test(val[i][j])) {
                            break;
                        } else {
                            val[i][j] = Formula.ASINH(val[i][j]);
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
                        if (err.test(val[i][j])) {
                            break;
                        } else {
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

    func.ATAN2 = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, args) {
      /*  var val1,val2 i, j;
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
            val1 = args[0].compute(app, source, array, false);
            val2 = args[1].compute(app, source, array, false);
            if (array) {
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (err.test(val[i][j])) {
                            break;
                        } else {
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
        }*/
    };


    return func;
});