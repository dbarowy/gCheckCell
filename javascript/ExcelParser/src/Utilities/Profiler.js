//TODO add XLogger path
define("Utilities/Profiler", function (XLogger) {
    "use strict";
    return  {
        start: function (name) {
            if (!this[name]) {
                this[name] = {};
                this[name].start = new Date();
            } else {
                this[name].start = new Date();
            }
        },
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
        report: function () {
            for (var prop in this) {
                if (this[prop].duration){
                    XLogger.log("Run \"" + prop + "\" took " + this[prop].duration);
                }

            }
        }

    };

});