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
define("Utilities/HashMap", function () {
    "use strict";
    function HashMap() {
        this._map = {};
    }

    /**
     * Adds a <key,value> pair to the map. If the key already exists, the pair is replaced
     * @param key The object to be used as the key. It must have getHashCode method implemented.
     * @param value The value to pair with the key
     */
    HashMap.prototype.put = function (key, value) {
        this._map[key.getHashCode()] = {"key": key, "value": value};
    };
    /**
     * Remove the key and its associated object from the map
     * @param key
     */
    HashMap.prototype.remove = function (key) {
        delete this._map[key.getHashCode()];
    };
    /**
     * Return the value associated with the respective key
     * @param key
     * @returns The object associated with the ky
     */
    HashMap.prototype.get = function (key) {
        var aux = this._map[key.getHashCode()];
        return aux && aux.value;
    };
    /**
     * Returns an array of <key, value> pairs
     * @returns {Array}
     */
    HashMap.prototype.getEntrySet = function () {
        var res = [];
        for (var pair in this._map) {
            if (this._map.hasOwnProperty(pair)) {
                res.push(this._map[pair]);
            }
        }
        return res;
    };

    HashMap.prototype.toString = function () {
        var str = "[";
        for (var pair in this._map) {
            if (this._map.hasOwnProperty(pair)) {
                str += this._map[pair].key.toString() + "=" + this._map[pair].value.toString() + ", ";

            }
        }
        return str + "]";
    };
    return HashMap;

});
