define("DataDebugMethods/FunctionOutput", function () {
    function FunctionOutput(value, excludes) {
        this.value = value;
        this.excludes = excludes;     //HashSet<int>

    }

    return FunctionOutput;
});