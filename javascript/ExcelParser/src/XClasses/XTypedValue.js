/**
 * This file contains the implementation of the XTypedValue class
 * This class is used to work with the types in the Excel computation
 */
define("XClasses/XTypedValue", function () {
    function XTypedValue(value, type) {
        this.value = value;
        this.type = type;
    }

    return XTypedValue;
});