define("Utilities/Function", ["Libraries/formula", "Parser/AST/ConstantString", "XClasses/XLogger", "XClasses/XTypes", "XClasses/XTypedValue", "Parser/Parser", "Utilities/Util"], function (Formula, ConstantString, XLogger, XTypes, XTypedValue, Parser, Util) {
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
        if (args.length !== 1) {
            return func._returnError("#N/A", array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            val[i][j].value = Math.floor(val[i][j].value);
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j])) {
                                val[i][j].value = Math.floor(+val[i][j].value);
                                val[i][j].type = XTypes.Number;
                            } else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        case XTypes.Date:
                        {
                            val[i][j].value = Math.floor(Parser.getNumberFromDate(val[i][j].value));
                            val[i][j].type = XTypes.Date;
                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = "#VALUE!";
                            val[i][j].value = XTypes.error;
                        }
                        //If we have an error, let it be

                    }
                }
            }
        }
        if (array) {
            return val;
        } else {
            return val[0][0];
        }
    };


    /**
     * Determines the minimum value among the passsed values.
     * Logical values and text representation of numbers are ignored.
     * @returns {*}
     * @constructor
     */
    func.MIN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, min = +Infinity, i, j;
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true, true);
            if (!(val instanceof Array)) {
                val = [
                    [val]
                ];

            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            if (val[i][j].value < min) {
                                min = val[i][j].value;
                            }
                        }
                            break;
                        case XTypes.Date:
                        {
                            var temp = Parser.getNumberFromDate(val[i][j].value);
                            if (temp < min) {
                                min = temp;
                            }
                        }
                            break;
                        case XTypes.Error:
                        {
                            //return point
                            return func._returnError(val[i][j], array);
                        }
                        // Ignore booleans and strings
                    }
                }
            }
        }
        if (!isFinite(min)) {
            min = 0;
        }
        min = new XTypedValue(min, XTypes.Number);
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
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true, true);
            if (!(val instanceof Array)) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            if (val[i][j].value > max) {
                                max = val[i][j].value;
                            }
                        }
                            break;
                        case XTypes.Date:
                        {
                            var temp = Parser.getNumberFromDate(val[i][j].value);
                            if (temp > max) {
                                max = temp;
                            }
                        }
                            break;
                        case XTypes.Error:
                        {
                            //return point
                            return func._returnError(val[i][j], array);
                        }
                        // Ignore booleans and strings
                    }
                }
            }
        }
        if (!isFinite(max)) {
            max = 0;
        }
        max = new XTypedValue(max, XTypes.Number);
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
        var k, val, sum = 0, final_type = XTypes.Number, i, j;
        if (args.length === 0) {
            return func._returnError("#N/A", array);
        }
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true, true);
            if (!(val instanceof Array)) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            sum += val[i][j].value;
                        }
                            break;
                        case XTypes.Boolean:
                        {
                            sum += val[i][j].value;

                        }
                            break;
                        case XTypes.Date:
                        {
                            sum += Parser.getNumberFromDate(val[i][j].value);
                            final_type = XTypes.Date;
                        }
                            break;

                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                sum += (+val[i][j].value);
                            } else {
                                return func._returnError(new XTypedValue("#VALUE!", XTypes.Error), array);
                            }
                        }
                            break;
                        case XTypes.Error:
                        {
                            return func._returnError(val[i][j], array);

                        }
                    }
                }
            }
        }
        sum = new XTypedValue(sum, final_type);
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
        if (args.length !== 1) {
            return func._returnError("#N/A", array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            if (val[i][j].value >= 0) {
                                val[i][j].value = Math.sqrt(val[i][j].value);
                            } else {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        case XTypes.Date:
                        {
                            var temp = Parser.getNumberFromDate(val[i][j].value);
                            if (temp >= 0) {
                                val[i][j].value = Math.sqrt(temp);
                                val[i][j].type = XTypes.Number;
                            } else {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.sqrt(val[i][j].value);
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                val[i][j].value = Math.sqrt(+val[i][j].value);
                                val[i][j].type = XTypes.Number;
                            } else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                        //for error do not do anything
                    }
                }
            }
        }
        if (array) {
            return val;
        } else {
            return val[0][0];
        }

    };


    /**
     * @returns {*}
     * @constructor
     */
    func.PRODUCT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, product = 1, i, j, ok = 0;
        if (args.length === 0) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        }
        for (k = 0; k < args.length; k++) {
            val = args[k].compute(app, source, array, true, true);
            if (!(val instanceof Array)) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            product *= val[i][j].value;
                            ok = 1;
                        }
                            break;
                        case XTypes.Date:
                        {
                            product *= Parser.getNumberFromDate(val[i][j].value);
                            ok = 1;
                        }
                            break;
                        case XTypes.Error:
                        {
                            return func._returnError(val[i][j], array);

                        }
                        //The other data types are ignored
                    }
                }
            }
        }

        if (!ok) {
            product = 0;
        }
        product = new XTypedValue(product, XTypes.Number);
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
        var urls, links, maxRows, maxCols;
        if (args.length === 0 || args.length > 2) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            if (args.length === 1) {
                return args[0].compute(app, source, array, false, false);
            } else {
                if (args.length === 2) {
                    urls = args[0].compute(app, source, array, false, false);
                    links = args[1].compute(app, source, array, false, false);
                    if (array) {
                        maxRows = urls.length > links.length ? urls.length : links.length;
                        maxCols = urls[0].length > links[0].length ? urls[0].length : links[0].length;
                        Util.adjustMatrix(links, maxRows, maxCols);
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
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            for (k = 0; k < args.length; k++) {
                val = args[k].compute(app, source, array, true, true);
                if (!(val instanceof Array)) {
                    val = [
                        [val]
                    ];
                }
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        if (val[i][j].type === XTypes.Number || val[i][j].type === XTypes.Date) {
                            count++;
                        }
                    }
                }
            }
            count = new XTypedValue(count, XTypes.Number);
            if (array) {
                return [
                    [count]
                ];
            } else {
                return count;
            }
        }
    };


    /**
     * @returns {*}
     * @constructor
     */
    func.MEDIAN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, med = [], i, j;
        if (args.length === 0) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            for (k = 0; k < args.length; k++) {
                val = args[k].compute(app, source, array, true, true);
                if (!(val instanceof Array)) {
                    val = [
                        [val]
                    ];
                }
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        switch (val[i][j].type) {
                            case XTypes.Number:
                            {
                                med.push(val[i][j].value);
                            }
                                break;
                            case XTypes.Date:
                            {
                                med.push(Parser.getNumberFromDate(val[i][j].value));
                            }
                                break;
                            case XTypes.Error:
                            {
                                return func._returnError(val[i][j], array);
                            }
                        }
                    }
                }
            }
            if (med.length === 0) {
                med.push(0);
            }
            med = new XTypedValue(Formula.MEDIAN(med), XTypes.Number);
            if (array) {
                return [
                    [med]
                ];
            } else {
                return med;
            }
        }
    };


    /**
     * @returns {*}
     * @constructor
     */
    func.AVERAGE = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, sum = 0, i, j, count = 0;
        if (args.length == 0) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            for (k = 0; k < args.length; k++) {
                val = args[k].compute(app, source, array, true, true);
                if (!(val instanceof Array)) {
                    val = [
                        [val]
                    ];
                }
                for (i = 0; i < val.length; i++) {
                    for (j = 0; j < val[i].length; j++) {
                        switch (val[i][j].type) {
                            case XTypes.Number:
                            {
                                sum += val[i][j].value;
                                count++;
                            }
                                break;
                            case XTypes.Date:
                            {
                                sum += Parser.getNumberFromDate(val[i][j].value);
                                count++;
                            }
                                break;
                            case XTypes.Error:
                            {
                                return func._returnError(val[i][j], array);
                            }
                            //the rest of the types are ignored
                        }
                    }
                }
            }
        }

        if (count === 0) {
            sum = new XTypedValue("#DIV/0!", XTypes.Error);
        } else {
            sum = new XTypedValue(sum / count, XTypes.Number);
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
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            val[i][j].value = Math.abs(val[i][j].value);
                        }
                            break;
                        case XTypes.Date:
                        {
                            val[i][j].value = Math.abs(Parser.getNumberFromDate(val[i][j].value));
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.abs(val[i][j].value);
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                val[i][j].value = Math.abs(+val[i][j].value);
                                val[i][j].type = XTypes.Number;
                            } else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        //the error is left untouched
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ACOS = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j, aux;
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            if (val[i][j].value < -1 || val[i][j].value > 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.acos(val[i][j].value);
                            }

                        }
                            break;
                        case XTypes.Date:
                        {
                            aux = Parser.getNumberFromDate(val[i][j].value);
                            if (aux < -1 || aux > 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.acos(aux);
                                val[i][j].type = XTypes.Number;
                            }

                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.acos(val[i][j].value);
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                if ((+val[i][j].value) < -1 || (+val[i][j].value) > 1) {
                                    val[i][j].value = "#NUM!";
                                    val[i][j].type = XTypes.Error;
                                } else {
                                    val[i][j].value = Math.acos(+val[i][j].value);
                                    val[i][j].type = XTypes.Number;
                                }
                            }
                            else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        //the error is left untouched
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ACOSH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j, aux;
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            if (val[i][j].value < 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.log(val[i][j].value + Math.sqrt(val[i][j].value * val[i][j].value - 1));
                            }

                        }
                            break;
                        case XTypes.Date:
                        {
                            aux = Parser.getNumberFromDate(val[i][j].value);
                            if (aux < 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.log(aux + Math.sqrt(aux * aux - 1));
                                val[i][j].type = XTypes.Number;
                            }

                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.log(val[i][j].value + Math.sqrt(val[i][j].value * val[i][j].value - 1));
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                if ((+val[i][j].value) < 1) {
                                    val[i][j].value = "#NUM!";
                                    val[i][j].type = XTypes.Error;
                                } else {
                                    val[i][j].value = Math.log((+val[i][j].value) + Math.sqrt((+val[i][j].value) * (+val[i][j].value) - 1));
                                    val[i][j].type = XTypes.Number;

                                }
                            }
                            else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        //the error is left untouched
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };

    /**+
     * @returns {*}
     * @constructor
     */
    func.ASIN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j, aux;
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            if (val[i][j].value < -1 || val[i][j].value > 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.asin(val[i][j].value);
                            }

                        }
                            break;
                        case XTypes.Date:
                        {
                            aux = Parser.getNumberFromDate(val[i][j].value);
                            if (aux < -1 || aux > 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.asin(aux);
                                val[i][j].type = XTypes.Number;
                            }

                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.asin(val[i][j].value);
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                if ((+val[i][j].value) < -1 || (+val[i][j].value) > 1) {
                                    val[i][j].value = Math.asin(+val[i][j].value);
                                    val[i][j].type = XTypes.Number;
                                } else {
                                    val[i][j].value = "#NUM!";
                                    val[i][j].type = XTypes.Error;
                                }
                            }
                            else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        //the error is left untouched
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ASINH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j, aux;
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            val[i][j].value = Math.log(val[i][j].value + Math.sqrt(val[i][j].value * val[i][j].value + 1));

                        }
                            break;
                        case XTypes.Date:
                        {
                            aux = Parser.getNumberFromDate(val[i][j].value);
                            val[i][j].value = Math.log(aux + Math.sqrt(aux * aux + 1));
                            val[i][j].type = XTypes.Number;

                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.log(val[i][j].value + Math.sqrt(val[i][j].value * val[i][j].value + 1));
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                val[i][j].value = Math.log((+val[i][j].value) + Math.sqrt((+val[i][j].value) * (+val[i][j].value ) + 1));
                                val[i][j].type = XTypes.Number;
                            }
                            else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        //the error is left untouched
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };

    func.ATAN = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j;
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            val[i][j].value = Math.atan(val[i][j].value);

                        }
                            break;
                        case XTypes.Date:
                        {
                            val[i][j].value = Math.atan(Parser.getNumberFromDate(val[i][j].value));
                            val[i][j].type = XTypes.Number;

                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.atan(val[i][j].value);
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                val[i][j].value = Math.atan(+val[i][j].value);
                                val[i][j].type = XTypes.Number;
                            }
                            else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        //the error is left untouched
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ATAN2 = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var l, r, i, j, maxRows, maxCols;
        if (args.length !== 2) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            l = args[0].compute(app, source, array, false, false);
            r = args[1].compute(app, source, array, false, false);
            if (!array) {
                l = [
                    [l]
                ];
                r = [
                    [r]
                ];
            }
            maxRows = l.length > r.length ? l.length : r.length;
            maxCols = l[0].length > r[0].length ? l[0].length : r[0].length;
            Util.adjustMatrix(l, maxRows, maxCols);
            Util.adjustMatrix(r, maxRows, maxCols);
            for (i = 0; i < maxRows; i++) {
                for (j = 0; j < maxCols; j++) {
                    switch (l[i][j].type) {
                        case XTypes.Number:
                        {
                            switch (r[i][j].type) {
                                case XTypes.Number:
                                {
                                    l[i][j].value = Formula.ATAN2(l[i][j].value, r[i][j].value);
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    l[i][j].value = Formula.ATAN2(l[i][j].value, Parser.getNumberFromDate(r[i][j].value));

                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    l[i][j].value = Formula.ATAN2(l[i][j].value, r[i][j].value);
                                }
                                    break;
                                case XTypes.String:
                                {
                                    if (isFinite(r[i][j].value)) {
                                        l[i][j].value = Formula.ATAN2(l[i][j].value, +r[i][j].value);
                                    } else {
                                        l[i][j].value = "#VALUE!";
                                        l[i][j].type = XTypes.Error;
                                    }
                                }
                                    break;
                                case XTypes.Error:
                                {
                                    l[i][j].value = r[i][j].value;
                                    l[i][j].type = XTypes.Error;
                                }
                                    break;
                            }

                        }
                            break;
                        case XTypes.Date:
                        {
                            switch (r[i][j].type) {
                                case XTypes.Number:
                                {
                                    l[i][j].value = Formula.ATAN2(Parser.getNumberFromDate(l[i][j].value), r[i][j].value);
                                    l[i][j].type = XTypes.Number;
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    l[i][j].value = Formula.ATAN2(Parser.getNumberFromDate(l[i][j].value), Parser.getNumberFromDate(r[i][j].value));
                                    l[i][j].type = XTypes.Number;

                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    l[i][j].value = Formula.ATAN2(Parser.getNumberFromDate(l[i][j].value), r[i][j].value);
                                    l[i][j].type = XTypes.Number;
                                }
                                    break;
                                case XTypes.String:
                                {
                                    if (isFinite(r[i][j].value)) {
                                        l[i][j].value = Formula.ATAN2(Parser.getNumberFromDate(l[i][j].value), +r[i][j].value);
                                        l[i][j].type = XTypes.Number;
                                    } else {
                                        l[i][j].value = "#VALUE!";
                                        l[i][j].type = XTypes.Error;
                                    }
                                }
                                    break;
                                case XTypes.Error:
                                {
                                    l[i][j].value = r[i][j].value;
                                    l[i][j].type = XTypes.Error;
                                }
                                    break;
                            }

                        }
                            break;
                        case XTypes.Boolean:
                        {
                            switch (r[i][j].type) {
                                case XTypes.Number:
                                {
                                    l[i][j].value = Formula.ATAN2(l[i][j].value, r[i][j].value);
                                    l[i][j].type = XTypes.Number;
                                }
                                    break;
                                case XTypes.Date:
                                {
                                    l[i][j].value = Formula.ATAN2(l[i][j].value, Parser.getNumberFromDate(r[i][j].value));
                                    l[i][j].type = XTypes.Number;

                                }
                                    break;
                                case XTypes.Boolean:
                                {
                                    l[i][j].value = Formula.ATAN2(l[i][j].value, r[i][j].value);
                                    l[i][j].type = XTypes.Number;
                                }
                                    break;
                                case XTypes.String:
                                {
                                    if (isFinite(r[i][j].value)) {
                                        l[i][j].value = Formula.ATAN2(l[i][j].value, +r[i][j].value);
                                        l[i][j].type = XTypes.Number;
                                    } else {
                                        l[i][j].value = "#VALUE!";
                                        l[i][j].type = XTypes.Error;
                                    }
                                }
                                    break;
                                case XTypes.Error:
                                {
                                    l[i][j].value = r[i][j].value;
                                    l[i][j].type = XTypes.Error;
                                }
                                    break;
                            }

                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(l[i][j].value)) {
                                l[i][j].value = +l[i][j].value;
                                switch (r[i][j].type) {
                                    case XTypes.Number:
                                    {
                                        l[i][j].value = Formula.ATAN2(l[i][j].value, r[i][j].value);
                                        l[i][j].type = XTypes.Number;
                                    }
                                        break;
                                    case XTypes.Date:
                                    {
                                        l[i][j].value = Formula.ATAN2(l[i][j].value, Parser.getNumberFromDate(r[i][j].value));
                                        l[i][j].type = XTypes.Number;

                                    }
                                        break;
                                    case XTypes.Boolean:
                                    {
                                        l[i][j].value = Formula.ATAN2(l[i][j].value, r[i][j].value);
                                        l[i][j].type = XTypes.Number;
                                    }
                                        break;
                                    case XTypes.String:
                                    {
                                        if (isFinite(r[i][j].value)) {
                                            l[i][j].value = Formula.ATAN2(l[i][j].value, +r[i][j].value);
                                            l[i][j].type = XTypes.Number;
                                        } else {
                                            l[i][j].value = "#VALUE!";
                                            l[i][j].type = XTypes.Error;
                                        }
                                    }
                                        break;
                                    case XTypes.Error:
                                    {
                                        l[i][j].value = r[i][j].value;
                                        l[i][j].type = XTypes.Error;
                                    }
                                        break;
                                }
                            } else {
                                l[i][j].value = "#VALUE!";
                                l[i][j].type = XTypes.Error;

                            }

                        }
                            break;
                        //Skip the error case
                    }
                }
            }
            if (array) {
                return l;
            } else {
                return l[0][0];
            }
        }
    };
    /**
     * @returns {*}
     * @constructor
     */
    func.ATANH = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j, aux;
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    switch (val[i][j].type) {
                        case XTypes.Number:
                        {
                            if (val[i][j].value < -1 || val[i][j].value > 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.log((1 + val[i][j].value) / (1 - val[i][j].value)) / 2;
                            }

                        }
                            break;
                        case XTypes.Date:
                        {
                            aux = Parser.getNumberFromDate(val[i][j].value);
                            if (aux < -1 || aux > 1) {
                                val[i][j].value = "#NUM!";
                                val[i][j].type = XTypes.Error;
                            } else {
                                val[i][j].value = Math.log((1 + aux) / (1 - aux)) / 2;
                                val[i][j].type = XTypes.Number;
                            }

                        }
                            break;
                        case XTypes.Boolean:
                        {
                            val[i][j].value = Math.log((1 + val[i][j].value) / (1 - val[i][j].value)) / 2;
                            val[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (isFinite(val[i][j].value)) {
                                if ((+val[i][j].value) < -1 || (+val[i][j].value) > 1) {
                                    val[i][j].value = Math.log((1 + (+val[i][j].value)) / (1 - (+val[i][j].value))) / 2;
                                    val[i][j].type = XTypes.Number;
                                } else {
                                    val[i][j].value = "#NUM!";
                                    val[i][j].type = XTypes.Error;
                                }
                            }
                            else {
                                val[i][j].value = "#VALUE!";
                                val[i][j].type = XTypes.Error;
                            }
                        }
                            break;
                        //the error is left untouched
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.BIN2DEC = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var val, i, j;
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            val = args[0].compute(app, source, array, false, false);
            if (!array) {
                val = [
                    [val]
                ];
            }
            for (i = 0; i < val.length; i++) {
                for (j = 0; j < val[i].length; j++) {
                    if (val[i][j].type != XTypes.Error) {
                        val[i][j].value = Formula.BIN2DEC(val[i][j].value);
                        if (val[i][j].value === "#NUM!") {
                            val[i][j].type = XTypes.Error;
                        } else {
                            val[i][j].type = XTypes.Number;
                        }
                    }
                }
            }
            if (array) {
                return val;
            } else {
                return val[0][0];
            }
        }
    };

    /**
     * @returns {*}
     * @constructor
     */
    func.ARRAYFORMULA = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        if (args.length !== 1) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);

        } else {
            return args[0].compute(app, source, true, true, true);
        }
    };

    //TODO You are here
    /**
     * @returns {*}
     * @constructor
     */
    func.SUMPRODUCT = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var k, val, product, sum = 0, i, j;
        if (args.length === 0) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
        } else {
            product = args[0].compute(app, source, true, true, true);
            for (i = 0; i < product.length; i++) {
                for (j = 0; j < product[i].length; j++) {
                    switch (product[i][j].type) {
                        case XTypes.Date:
                        {
                            product[i][j].value = Parser.getNumberFromDate(product[i][j].value);
                            product[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.Boolean:
                        {
                            product[i][j].value = +product[i][j].value;
                            product[i][j].type = XTypes.Number;
                        }
                            break;
                        case XTypes.String:
                        {
                            if (!isFinite(product[i][j].value)) {
                                product[i][j].value = 0;
                            }
                            product[i][j].type = XTypes.Number;
                        }
                            break;
                        // If the item is a number or an error, we just leave it be
                    }
                }
            }
            for (k = 1; k < args.length; k++) {
                val = args[k].compute(app, source, true, true, true);
                if (product.length !== val.length || product[0].length !== val[0].length) {
                    return func._returnError(new XTypedValue("#VALUE!", XTypes.Error), array);
                } else {
                    for (i = 0; i < product.length; i++) {
                        for (j = 0; j < product[i].length; j++) {
                            switch (product[i][j].type) {
                                case XTypes.Number:
                                {
                                    switch (val[i][j].type) {
                                        case XTypes.Number:
                                        {
                                            product[i][j].value *= val[i][j].value;
                                        }
                                            break;
                                        case XTypes.Date:
                                        {
                                            product[i][j].value *= Parser.getNumberFromDate(val[i][j].value);
                                        }
                                            break;
                                        case XTypes.Boolean:
                                        {
                                            product[i][j].value *= val[i][j].value;
                                        }
                                            break;
                                        case XTypes.String:
                                        {
                                            if (isFinite(val[i][j].value)) {
                                                product[i][j].value *= (+val[i][j].value);
                                            } else {
                                                product[i][j].value = 0;
                                            }
                                        }
                                            break;
                                        case XTypes.Error:
                                        {
                                            product[i][j].value = val[i][j].value;
                                            product[i][j].type = XTypes.Error;
                                        }
                                    }
                                }
                                    break;
                                //We can only have errors, so we leave them and catch them in the next step

                            }
                        }
                    }
                }
            }
            for (i = 0; i < product.length; i++) {
                for (j = 0; j < product[i].length; j++) {
                    switch (product[i][j].type) {
                        case XTypes.Number:
                        {
                            sum += product[i][j].value;
                        }
                            break;
                        case XTypes.Error:
                        {
                            return func._returnError(product[i][j], array);
                        }
                    }

                }
            }
            if (array) {
                return [
                    [new XTypedValue(sum, XTypes.Number)]
                ];
            } else {
                return new XTypedValue(sum, XTypes.Number);
            }

        }
    };

    /**
     * @returns {*}
     * @constructor
     * TODO
     */
    func.RANK = function (/*XApplication*/app, /*Address*/source, /*Boolean*/array, /*Boolean*/range, /*Boolean*/full_range, args) {
        var value, data, type, arr = [], i, j, maxRows, maxCols, rangeArgument;
        var err = RegExp("(#DIV/0|#N/A|#NAME\?|#NULL!|#NUM!|#REF!|#VALUE!|#GETTING_DATA)");
        if (args.length < 2 || args.length > 3) {
            return func._returnError(new XTypedValue("#N/A", XTypes.Error), array);
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
            Util.adjustMatrix(value, maxRows, maxCols);
            Util.adjustMatrix(type, maxRows, maxCols);
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

    /**
     * @returns {*}
     * @constructor
     * TODO
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
                Util.adjustMatrix(test, maxRows, maxCols);
                Util.adjustMatrix(then_value, maxRows, maxCols);
                Util.adjustMatrix(otherwise_value, maxRows, maxCols);
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

    return func;
});