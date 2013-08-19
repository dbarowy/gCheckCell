define("XClasses/XLogger", function () {
    "use strict";
    if (typeof SpreadsheetApp !== "undefined") {
        return Logger;
    } else {
        return console;
    }
});