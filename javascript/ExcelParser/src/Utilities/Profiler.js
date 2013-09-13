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
 *  @Author Alexandru Toader, alexandru.v.toader@gmail.com
 * @Description This file contains the implementation of a basic profiler.
 * It works by placing the profiled code between Profiler.start and Profiler.end calls;
 * Usage:
 * Profiler.start("testing");
 * Profiler.end("testing");
 *
 */
define("Utilities/Profiler", ["XClasses/XLogger"], function (XLogger) {
    "use strict";
    return  {
        /**
         * Start the profiler for the given name;Every profile is associated with a name, the name is used
         * to start and stop the timer.
         * @param name
         */
        start: function (name) {
            if (!this[name]) {
                this[name] = {};
                this[name].start = new Date();
            } else {
                this[name].start = new Date();
            }
        },
        /**
         * End the profiler for the given timed operation.
         * @param name The name of the given operation
         */
        end: function (name) {
            if (!this[name]) {
                throw new Error();
            } else {
                if (!this[name].duration) {
                    this[name].duration = 0;
                }

                this[name].duration += (new Date() - this[name].start) / 1000;
            }
        },
        /**
         * Report the information gathered so far.
         */
        report: function () {
            for (var prop in this) {
                if (this.hasOwnProperty(prop) && this[prop].duration) {
                    XLogger.log("Run \"" + prop + "\" took " + this[prop].duration);
                }

            }
        }

    };

});