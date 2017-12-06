"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Polyfill - String Includes
// -------------------------------------
/**
    * @name string.includes
    * @desc A polyfill module for String.prototype.includes(), which
            is a method that determines whether one string may
            be found within another string, returning true
            or false as appropriate.
**/
(function() {
    console.log("polyfills/string.includes.js loaded.");

    // @name stringIncludes
    // @desc the main function for the polyfill
    function stringIncludes(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        }

        else { return this.indexOf(search, start) !== -1; }
    };

    // ---------------------------------------------
    //   Attach polyfill to the global namespace
    // ---------------------------------------------
    if (!String.prototype.includes) {
        String.prototype.includes = stringIncludes;
    }

})();
