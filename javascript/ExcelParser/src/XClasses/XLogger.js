define("XClasses/XLogger", function () {
    "use strict";
    if (SpreadsheetApp) {
        return Logger;
    }
    else {
        throw new Error("Undefined methods");
    }
});