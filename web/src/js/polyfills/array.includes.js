"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Polyfill - Array Includes
// -------------------------------------
/**
    * @name array.includes
    * @desc A polyfill module for Array.prototype.includes(), a method which is
            generic, and does not require this value to be an Array object,
            so it can be applied to other kinds of objects. The example
            below illustrates includes() method called on the
            function's arguments object.
**/
(function() {
    console.log("polyfills/array.includes.js loaded.");

    // @name arrayIncludes
    // @desc the main object for the polyfill
    var arrayIncludes = {
        value: function(searchElement, fromIndex) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            // (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            // a. Let k be n.
            // 6. Else n < 0,
            // a. Let k be len + n.
            // b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }

                k++;
            }

            // 8. Return false
            return false;
        }
    };

    // ---------------------------------------------
    //   Attach polyfill to the global namespace
    // ---------------------------------------------
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', arrayIncludes);
    }

})();
