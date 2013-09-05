/**
 * Used to store the result of a formula
 */
define("DataDebugMethods/FunctionOutput", function () {
    function FunctionOutput(value, excludes) {
        this.value = value;
        this.excludes = excludes;     //HashSet<int> the indices of the values that were excluded from the computation of this formula
    }
    return FunctionOutput;
});