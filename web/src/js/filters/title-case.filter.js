"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Filter - Title Case
// -------------------------------------
/**
    * @name title-case.filter
    * @desc An app filter for converting
            the rendered text to title case.
**/
(function() {
    console.log("filters/title-case.filter.js loaded.");

    /**
        * @name titleCase
        * @desc Function for the title case filter.
        * @param {String} s - The string to be converted to title case
        * @return {String} s - The string after conversion to title case
    **/
    function titleCase() {
        return function(s) {
            s = ( s === undefined || s === null ) ? '' : s;
            return s.toString().toLowerCase().replace( /\b([a-z])/g, function(ch) {
                return ch.toUpperCase();
            });
        };
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .filter("titleCase", titleCase); // set filter

})();
