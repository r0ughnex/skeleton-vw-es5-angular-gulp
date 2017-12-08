"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Base - Event
// -------------------------------------
/**
    * @name event
    * @desc A base module that is used to create an event
            interface that represents events initialized
            by an app for any purpose.
**/

(function() {
    console.log("base/event.js loaded.");

    // @name CustomEvent
    // @desc the main function for the base
    // @param {String} event - the name of the event
    // @param {Object} params - the options for the event
    // @param {Event} - the created custom event object
    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    if (typeof window.CustomEvent !== "function") {
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

})();
