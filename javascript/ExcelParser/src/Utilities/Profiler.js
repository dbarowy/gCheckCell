/**
 * This file contains the implementation of a basic profiler.
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