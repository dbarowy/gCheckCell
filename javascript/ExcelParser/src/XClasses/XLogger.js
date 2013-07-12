define("XClasses/XLogger", function () {
    "use strict";
    if (typeof(SpreadsheetApp)!=="undefined") {
        return Logger;
    }
    else {
     //   throw new Error("Undefined methods");
        return console;
    }
});