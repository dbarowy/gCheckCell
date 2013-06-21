/**
 * @Author Alexandru Toader
 * @Description This file contains implementation of FSharp specific objets or functionalities that were needed
 * to circumvent problems in PEG or other environment restrictions
 */

var FSharp;
FSharp = (function () {
    "use strict";
    function FSharp() {
    }

    /**
     * null cannot be returned as the result of parsing an expression in PEGJS so I need a substitute.
     */
    function None() {
    }

    FSharp.None = None;
    return FSharp;
})();