"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Base - Query
// -------------------------------------
/**
    * @name query
    * @desc A base module to abstract document.querySelectorAll
            for increased performance and greater usability.
            query is attached to the window object.
**/
(function() {
    console.log("base/query.js loaded.");

    var doc = window.document,
    simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
    periodRe = /\./g,
    slice = [].slice,
    classes;

    // @name query
    // @desc the main function for the base
    // @param {String} selector
    // @param {Element} context (optional)
    // @return {Array}
    function query (selector, context) {
        context = context || doc;
        // Redirect simple selectors to the more performant function
        if(simpleRe.test(selector)){
            switch(selector.charAt(0)){
                case "#":
                    // Handle ID-based selectors
                    return [context.getElementById(selector.substr(1))];
                case ".":
                    // Handle class-based selectors
                    // Query by multiple classes by converting the selector
                    // string into single spaced class names
                    classes = selector.substr(1).replace(periodRe, " ");
                    return slice.call(context.getElementsByClassName(classes));
                default:
                    // Handle tag-based selectors
                    return slice.call(context.getElementsByTagName(selector));
            }
        }
        // Default to `querySelectorAll`
        return slice.call(context.querySelectorAll(selector));
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    window.query = query;

})();
