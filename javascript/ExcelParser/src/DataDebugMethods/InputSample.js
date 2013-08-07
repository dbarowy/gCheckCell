define("DataDebugMethods/InputSample", function () {
    "use strict";
    function InputSample(/*int*/rows, /*int*/cols) {
        this.rows = rows;
        this.cols = cols;
        this.excludes = {};
        this.includes = [];
        this.input_array = [];
        this._i = 0;
    }

    InputSample.prototype.add = function (/*string*/datum) {
        var pair = this.oneDtoTwoD(this._i);
        this.input_array[pair.row][pair.col] = datums;
        this._i++;
    };

    InputSample.prototype.addArray = function (/*string[][]*/data) {
        if (this._i !== 0) {
            throw new Error("You must EITHER Add or AddArray, but not both.");
        }
        this.input_array = data;
    };

    InputSample.prototype.oneDtoTwoD = function (/*int*/idx) {
        return {row: idx % this.cols, col: Math.floor(idx / this.cols)};
    };

    InputSample.prototype.getInput = function (/*int*/num) {
        var pair = this.oneDtoTwoD(num);
        return this.input_array[pair.row][pair.col];
    };

    InputSample.prototype.getHashCode = function () {
        return this.includes.toString();
    };

    InputSample.prototype.setIncludes = function (/*int[]*/includes) {
        var i;
        this.includes = includes;
        for (i = 0; i < this.includes.length; i++) {
            if (this.includes[i] === 0) {
                this.excludes[i] = i;
            }
        }
    };


    InputSample.prototype.toString = function () {
        return this.input_array.join(",");
    };
    return InputSample;

});