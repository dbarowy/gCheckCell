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
    return {"String": 0, "Number": 1, "Date": 2,"Error":3, "Boolean":4};
});