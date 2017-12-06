"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Service - Fb
// -------------------------------------
/**
    * @name fb.service
    * @desc The helper service for the app that contains functions
            to create and share content with the help of facebook sdk.
**/
(function() {
    console.log("services/fb.service.js loaded.");

    /**
        * @name FbService
        * @desc Class for the fb service.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the service class
    **/
    function FbService(CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _id = { // ids for the fb object
            aws:   { cv: "367651903570061",  pv: "367651903570061"  }, // for aws
            live:  { cv: "1674320059548311", pv: "1674320059548311" }, // for live
            local: { cv: "599477443565626",  pv: "599477443565626"  }  // for local
        }

        var _hasFb = false; // flag to indicate if a fb object has been created

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
        // @desc function to create a fb object for the app for the given type
        // @param {String} type - the type that determines the fb id for the app
        // @return {Boolean} - true of false depending on whether the object was created
        function create(type) {
            // check if a fb object has
            // been created for this app
            if(_hasFb) {
                console.log("fb.service.js: Cannot create facebook sdk object more than once.");
                return false;
            }

            // else try to create a new
            // fb object for the given type
            var id = null;

            // get the current host environment
            var env = "local"; // default is local
            env = CONFIG.environment.isAmazonHost ? "aws" : env;
            env = CONFIG.environment.isVolkswagenHost ? "live" : env;

            // get the id that matches the given type
            try { switch(type.toLowerCase()) {
                // commercial (or) passenger
                case "cv": { id = _id[env].cv; break;  }
                case "pv": default: { id = _id[env].pv; break; }}

                // create the new fb object
                if(FB != null && typeof FB != "undefined") {
                    // if FB is available to use
                    FB.init({ appId: id, xfbml: true, version: "v2.7" });
                } else {
                    // if FB is not available to use
                    window.fbAsyncInit = function() {
                        FB.init({ appId: id, xfbml: true, version: "v2.7" });
                    };
                }

                // set flag as true to indicate
                // that the fb object was created
                console.log("fb.service.js: Facebook web sdk object was created for the type: " + type);
                _hasFb = true; return true;

            } catch(error) {
                console.log("fb.service.js: Cannot create facebook sdk object for the type: " + type);
                return false;
            }
        }

        // @name share
        // @desc function to share to facebook with the given data
        // @param {Object} data - the data that is to be shared to facebook
        function share(data) {
            // only proceed if fb object is available
            if(!_hasFb) { return false; }

            // create a new fb share
            // dialog with given data
            FB.ui({
                method: "share",
                quote: data.copy,
                title: data.title,

                picture: data.image,
                caption: data.caption,
                description: data.copy,

                "redirect_uri": data.url,
                href: data.url, link: data.url,
                "mobile_iframe": CONFIG.device.isMobile ? "true" : "false"
            }, function(response) { });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // inject the facebook sdk script code on init
        // https://developers.facebook.com/docs/javascript/quickstart
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;} js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js"; fjs.parentNode.insertBefore(js, fjs);
        }(document, "script", "facebook-jssdk"));

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.create = create; // function to create a fb object for the app for the given type
        service.share  = share;  // function to share to facebook with the given data
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("FbService", FbService); // set service

})();
