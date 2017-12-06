"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Polyfill - Array FindIndex
// -------------------------------------
/**
    * @name array.findIndex
    * @desc A polyfill module for Array.prototype.findIndex(), a method which returns
            the index of the first element in the array that satisfies the provided
            testing function. Otherwise -1 is returned.
**/
(function() {
    console.log("polyfills/array.findIndex.js loaded.");

    // @name arrayFindIndex
    // @desc the main object for the polyfill
    var arrayFindIndex = {
        value: function(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                var kValue = o[k];

                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }

                // e. Increase k by 1.
                k++;
            }

          // 7. Return -1.
          return -1;
        }
    };

    // ---------------------------------------------
    //   Attach polyfill to the global namespace
    // ---------------------------------------------
    if (!Array.prototype.findIndex) {
        Object.defineProperty(Array.prototype, 'findIndex', arrayFindIndex);
    }

})();
