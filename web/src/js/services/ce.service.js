"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Service - Ce
// -------------------------------------
/**
    * @name ce.service
    * @desc The helper service for the app that contains functions to
            create and share content with the help of crazy egg analytics.
**/
(function() {
    console.log("services/ce.service.js loaded.");

    /**
        * @name CeService
        * @desc Class for the ce service.
        * @return {Object} - The instance of the service class
    **/
    function CeService() {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _id = { cv: null, pv: null } // ids for the ce object
        var _hasCe = false; // flag to indicate if a ce object has been created

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
        // @name create
        // @desc function to create a ce object for the app for the given type
        // @param {String} type - the type that determines the ce id for the app
        // @return {Boolean} - true of false depending on whether the object was created
        function create(type) {
            // check if a ce object has
            // been created for this app
            if(_hasCe) {
                console.log("ce.service.js: Cannot create crazy egg analytics object more than once.");
                return false;
            }

            // else try to create a new
            // ce object for the given type
            var id = null;

            // get the id that matches the given type
            try { switch(type.toLowerCase()) {
                // commercial (or) passenger
                case "cv": { id = _id.cv; break;  }
                case "pv": default: { id = _id.pv; break; }}

                // create the new ce object
                /* no additional code needed */

                // set flag as true to indicate
                // that the ce object was created
                console.log("ce.service.js: Crazy egg analytics object was created for the type: " + type);
                _hasCe = true; return true;

            } catch(error) {
                console.log("ce.service.js: Cannot create crazy egg analytics object for the type: " + type);
                return false;
            }
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // inject the crazy egg analytics script code on init
        setTimeout(function() {
            var a = document.createElement("script");
            var b = document.getElementsByTagName("script")[0];
            a.src = document.location.protocol + "//script.crazyegg.com/pages/scripts/0018/4953.js?" + Math.floor(new Date().getTime() / 3600000);
            a.async = true; a.type = "text/javascript"; b.parentNode.insertBefore(a, b);
        }, 1);

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.create = create; // function to create a ce object for the app for the given type
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("CeService", CeService); // set service

})();
