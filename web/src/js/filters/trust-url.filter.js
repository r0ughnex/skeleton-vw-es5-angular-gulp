"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Filter - Trust Url
// -------------------------------------
/**
    * @name trust-url.filter
    * @desc An app filter for converting the given
            url string into valid and trused source.
**/
(function() {
    console.log("filters/trust-url.filter.js loaded.");

    /**
        * @name trustUrl
        * @desc Function for the trust url filter.
        * @param {String} url - The string to be converted to trused source
        * @return {String} url - The url string after conversion to trused source
    **/
    function trustUrl($sce) {
        "ngInject"; // tag this function for dependancy injection

        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .filter("trustUrl", trustUrl); // set filter

})();
