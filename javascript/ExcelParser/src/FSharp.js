/**
 * @Author Alexandru Toader
 * @Description This file contains implementation of FSharp specific objets or functionalities that were needed
 * to circumvent problems in PEG or other environment restrictions
 */

var FSharp;
FSharp = (function(){
    var None, Some, __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }

            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    function FSharp(){}

    /**
     * null cannot be returned as the result of parsing an expression in PEGJS so I need a substitute.
     */
    None = (function(){
        function None(){}
        return None;
    })();

    /**
     * This is just a wrapper to signify that the function has returned a value.
     * It might not be necessary.
     */
    Some = (function(){
        var _val;
        function Some(/*Any*/value){
           _val = value;
        }
        Object.defineProperties(Some.prototype, { "Value": {"get": function () {
            return _val;
        }}});

        return Some;
    })()
    FSharp.None = None;
    FSharp.Some = Some;
    return FSharp;
})();