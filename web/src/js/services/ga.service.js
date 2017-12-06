"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Service - Ga
// -------------------------------------
/**
    * @name ga.service
    * @desc The helper service for the app that contains functions to
            create and share content with the help of google analytics.
**/
(function() {
    console.log("services/ga.service.js loaded.");

    /**
        * @name GaService
        * @desc Class for the ga service.
        * @return {Object} - The instance of the service class
    **/
    function GaService() {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _id = { cv: "UA-38084908-4", pv: "UA-21975546-7" } // ids for the ga object
        var _hasGa = false; // flag to indicate if a ga object has been created

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
        // @desc function to create a ga object for the app for the given type
        // @param {String} type - the type that determines the ga id for the app
        // @return {Boolean} - true of false depending on whether the object was created
        function create(type) {
            // check if a ga object has
            // been created for this app
            if(_hasGa) {
                console.log("ga.service.js: Cannot create google analytics object more than once.");
                return false;
            }

            // else try to create a new
            // ga object for the given type
            var id = null;

            // get the id that matches the given type
            try { switch(type.toLowerCase()) {
                // commercial (or) passenger
                case "cv": { id = _id.cv; break;  }
                case "pv": default: { id = _id.pv; break;  }}

                // create the new ga object
                ga("create", id, "auto");
                ga("send", "pageview");

                // set flag as true to indicate
                // that the ga object was created
                console.log("ga.service.js: Google analytics object was created for the type: " + type);
                _hasGa = true; return true;

            } catch(error) {
                console.log("ga.service.js: Cannot create google analytics object for the type: " + type);
                return false;
            }
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // inject the google analytics script code on init
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/
        (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
        })(window,document,"script","https://www.google-analytics.com/analytics.js","ga");

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.create = create; // function to create a ga object for the app for the given type
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("GaService", GaService); // set service

})();
