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
 * This specifies the type of a data item in Excel.
 * We have 5 types of data:
 * 1.Strings
 * 2.Numbers
 * 3.Dates
 * 4.Error
 * 5.Boolean
 */
define("XClasses/XTypes", function () {
    return {"String": 0, "Number": 1, "Date": 2, "Error": 3, "Boolean": 4};
});