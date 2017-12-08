"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Base - Request Animation Frame
// -------------------------------------
/**
    * @name requestAnimationFrame
    * @desc A base module to window.requestAnimationFrame
            for creating a single cross browser version.
            requestAnimationFrame is attached to the
            window object.
**/
(function() {
    console.log("base/raf.js loaded.");

    var lastTime = 0;
    var vendors = ["ms", "moz", "webkit", "o"];

    // assign the correct vendor prefix to the window.requestAnimationFrame
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+"RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x]+"CancelAnimationFrame"]
                                   || window[vendors[x]+"CancelRequestAnimationFrame"];
    }

    // @name requestAnimationFrame
    // @desc the main function for the base
    // @param {Function} callback - the callback function
    // @return {Integer} requestID - the id passed to cancelAnimationFrame
    function requestAnimationFrame(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    }

    // @name cancelAnimationFrame
    // @desc the sub function for the base
    // @param {String} id - the requestID to cancel
    function cancelAnimationFrame(id) {
        clearTimeout(id);
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = requestAnimationFrame;
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = cancelAnimationFrame;
    }

})();
