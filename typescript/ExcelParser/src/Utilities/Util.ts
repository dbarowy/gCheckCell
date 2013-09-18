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
 * @Description  This file contains the implementation of a basic HashMap..
 */
define("Utilities/Util", ["XClasses/XTypedValue", "XClasses/XTypes"], function (XTypedValue, XTypes) {
    var Util = {};
    /**
     * This will resize the given matrix to the specified number of rows and columns.
     * It follows the rules in the Ecma Office Open XML Part 1 - Fundamentals And Markup Language Reference.pdf 4th edition
     * @param matr The matrix to resize
     * @param maxRows The desired number of rows the matrix must have at the end
     * @param maxCols The desired number of columns the matrix must have at the end
     * @returns {*}
     */
    Util.adjustMatrix = function (matr, maxRows, maxCols) {
        var row = [], i, j;
        for (i = 0; i < matr[0].length; i++) {
            row.push(new XTypedValue("#N/A", XTypes.Error));
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
                        matr[i].push(new XTypedValue("#N/A", XTypes.Error));
                    }
                }
            }
        }
    };

    /**
     * Return the string representation of the boolean value;
     * @param val
     * @returns {string}
     */
    Util.boolToString = function (val) {
        if (val) {
            return "TRUE";
        } else {
            return "FALSE";
        }
    };

    /**
     * Convert a date into a serial number.
     * Each full day represents one unit and each milisecond represents 1/86400000 of a day.
     * The starting date for our system is 31/12/1899 = 1
     * @param date
     * @returns {number}
     */
    Util.getNumberFromDate = function (/*Date*/date) {
        if (date instanceof Date) {
            return (date - (new Date(1899, 11, 30))) / 86400000;
        } else {
            throw new Error("This is not a date" + date);
        }

    };

    /**
     * Get the string representation for the date
     * @param date
     * @returns {string}
     */
    Util.getStringFromDate = function (/*Date*/date) {
        return date.toLocaleString();
    };

    /**
     * Convert a number to a date. 1= 31/12/1899, each full day represents a full day.
     * @param nr
     * @returns {Date}
     */
    Util.getDateFromNumber = function (/*Number*/nr) {
        return new Date((nr * 86400000) + (+new Date(1899, 11, 30)));
    };
    return Util;
})
;