/**
 * Generic logging facilities.
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