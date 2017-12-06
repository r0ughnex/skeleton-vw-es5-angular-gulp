"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Filter - Strip Html
// -------------------------------------
/**
    * @name strip-html.filter
    * @desc An app filter which uses regular expression
            to strip the HTML tags from the given string.
**/
(function() {
    console.log("filters/strip-html.filter.js loaded.");

    /**
        * @name stripHtml
        * @desc Function for the strip html filter.
        * @param {String} text - The string to be stripped off html tags
        * @return {String} text - The string after being stripped of html tags
    **/
    function stripHtml() {
        "ngInject"; // tag this function for dependancy injection

        return function (text) {
            text = text ? text.replace(/&nbsp;/gm, " ") : ""; // replace &nbsp; with a default space
            return text ? String(text).replace(/<[^>]+>/gm, "") : ""; // remove html tags completely
        };
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .filter("stripHtml", stripHtml); // set filter

})();
