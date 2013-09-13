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
 * @Description Generic logging facilities.
 * Return the logging object that works in the given context
 */
define("XClasses/XLogger", function () {
    "use strict";
    if (typeof SpreadsheetApp !== "undefined") {
        return Logger;
    } else {
        return console;
    }
});