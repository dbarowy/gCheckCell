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
 /**
 * @Author Alexandru Toader, alexandru.v.toader@gmail.com
 * @Description Represents a range that is used as an input sample.
 */
define("DataDebugMethods/InputSample", function () {
    "use strict";
    function InputSample(/*int*/rows, /*int*/cols) {
        this.rows = rows;  //number of rows in the range
        this.cols = cols;  //number of columns in the range
        this.excludes = {}; //list of inputs excluded in this sample
        this.includes = []; //a counter of values included by this sample.
        this.input_array = []; // Array of values used to replace the original range. This is a bidimensional array.
        this._i = 0;  //internal length counter for Add
        this._maxSize = rows * cols;
    }

    /**
     * Add an element to the input array. This will add the element in the next available position in the matrix
     * @param datum
     */
    InputSample.prototype.add = function (/*string*/datum) {
        if (this._i >= this._maxSize) {
            throw new Error("Exceeded maximum size.");
        }
        var pair = this.oneDtoTwoD(this._i);
        if (this.input_array[pair.row] == null) {
            this.input_array[pair.row] = [];
        }
        this.input_array[pair.row][pair.col] = datum;
        this._i++;
    };

    InputSample.prototype.addArray = function (/*string[][]*/data) {
        if (this._i !== 0) {
            throw new Error("You must EITHER Add or AddArray, but not both.");
        }
        if (data.length !== this.rows || data[0].length !== this.cols) {
            throw new Error("Data exceeds range size.");
        }
        this._i = this._maxSize;
        this.input_array = data;
    };
    /**
     * Used to convert a 1D index to a 2D index
     * @param idx
     * @returns {{col: number, row: number}}
     */
    InputSample.prototype.oneDtoTwoD = function (/*int*/idx) {
        return {col: idx % this.cols, row: Math.floor(idx / this.cols)};
    };

    /**
     * Get the input at the respective index from the array
     * @param num
     * @returns {*}
     */
    InputSample.prototype.getInput = function (/*int*/num) {
        var pair = this.oneDtoTwoD(num);
        return this.input_array[pair.row][pair.col];
    };
    /**
     * InputSample is used as a key in a HashMap and the "hashcode" identifies unique input samples.
     * @returns {string}
     */
    InputSample.prototype.getHashCode = function () {
        return this.includes.toString();
    };
    /**
     * Mark the elements that are included in this sample and those that are excluded.
     * @param includes
     */
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