"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Filter - Trust Html
// -------------------------------------
/**
    * @name trust-html.filter
    * @desc An app filter for converting the given
            html string into valid and trused source.
**/
(function() {
    console.log("filters/trust-html.filter.js loaded.");

    /**
        * @name trustHtml
        * @desc Function for the trust html filter.
        * @param {String} html - The string to be converted to trused source
        * @return {String} html - The html string after conversion to trused source
    **/
    function trustHtml($sce) {
        "ngInject"; // tag this function for dependancy injection

        return function(html) {
            return $sce.trustAsHtml(html);
        };
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .filter("trustHtml", trustHtml); // set filter

})();
