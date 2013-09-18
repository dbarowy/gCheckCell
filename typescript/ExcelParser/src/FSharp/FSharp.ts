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
"use strict";

/**
 * @Author Alexandru Toader
 * @Description This file contains implementation of FSharp specific objects or functionalities that were needed
 * to circumvent problems in PEG or other environment restrictions.
 */

export class None {
    /**
     * Null cannot be returned as the result of parsing an expression in PEGJS so None acts as a substitute.
     */
    constructor() {
    }

    public toString() {
        return "None";
    }
}

export class FSharp {
    constructor() {}
    public static None = None;
}
