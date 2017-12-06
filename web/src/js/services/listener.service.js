"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Service - Listener
// -------------------------------------
/**
    * @name listener.service
    * @desc The helper listener service for the app
            that contains functions to clear and unbind
            set intervals, timeouts and angular listeners.
**/
(function() {
    console.log("services/listener.service.js loaded.");

    /**
        * @name ListenerService
        * @desc Class for the listener service.
        * @return {Object} - The instance of the service class
    **/
    function ListenerService() {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the content of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name clear
        // @desc function to clear timers
        // @param {Array} timers - the array of timers
        function clear(timers) {
            // loop through all the timers
            timers.forEach(function(timer) {
                // check if timer is defined
                if(timer != null
                    && typeof timer != "undefined") {
                    // clear both the interval and timeout timers
                    try { clearInterval(timer); } catch(error) { console.log(error); }
                    try { clearTimeout(timer);  } catch(error) { console.log(error); }
                }
            });
        }

        // @name unbind
        // @desc function to unbind listeners
        // @param {Array} timers - the array of listeners
        function unbind(listeners) {
            // loop through all the listener functions
            listeners.forEach(function(listener) {
                // check if listener is valid
                if(listener != null
                    && typeof listener != "undefined"
                    && typeof listener == "function") {
                    listener(); // unbind each listener
                }
            });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.clear  = clear;  // function to clear timers
        service.unbind = unbind; // function to unbind listeners
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("ListenerService", ListenerService); // set service

})();
