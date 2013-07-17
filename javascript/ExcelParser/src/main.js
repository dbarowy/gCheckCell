require.config({
    urlArgs: "bust=" + (new Date()).getTime()
});

function Construct(){
    "use strict";
require(["DataDebugMethods/AnalysisData","DataDebugMethods/ConstructTree", "XClasses/XApplication",  "XClasses/XLogger","Utilities/Profiler"], function(AnalysisData, ConstructTree,XApplication, XLogger, Profiler){
    var data = new AnalysisData(XApplication);
    Profiler.start("constructing tree");
    ConstructTree.constructTree(data, XApplication);
    var a = ConstructTree.generateGraphVizTree(data.formula_nodes);
    Profiler.end("constructing tree");
    document.getElementById("res").innerHTML=a;
    Profiler.report();
    //XLogger.log(a);
});
}
