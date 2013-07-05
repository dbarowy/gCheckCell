define("Utilities/HashMap", function () {
    "use strict";
    function HashMap() {
        this._map = {};
    }

    HashMap.prototype.put = function (key, value) {
        this._map[key.getHashCode()] = {"key": key, "value": value};
    };
    HashMap.prototype.remove = function (key) {
        delete this._map[key.getHashCode()];
    };
    HashMap.prototype.get = function (key) {
        return this._map[key.getHashCode()];
    };
    HashMap.prototype.containsKey = function (key) {
        return (typeof(this._map[key.getHashCode()]) !== "undefined");
    };
    HashMap.prototype.getEntrySet = function () {
        var res = [];
        for (var pair in this._map) {
            if (this._map.hasOwnProperty(pair)) {
                res.push(this._map[pair]);
            }
        }
        return res;
    };
    return HashMap;

});
