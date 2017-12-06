"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// base
require("../base/promise");

// -------------------------------------
//   Service - Google Maps
// -------------------------------------
/**
    * @name google-maps.service
    * @desc The helper google maps service for the app
            that contains functions to get and parse the
            google maps data and styles from it's JS API.
**/
(function() {
    console.log("services/google-maps.service.js loaded.");

    /**
        * @name GoogleMapsService
        * @desc Class for the google maps service.
        * @param {Service} $http - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the service class
    **/
    function GoogleMapsService($http, CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        // reference to the URLs for
        // the google map data API calls
        var _dataURL = {
            styles: CONFIG.path.data + "google-map-styles.json",  // for the google map styles
            scripts: "https://maps.googleapis.com/maps/api/js?" + // for the google map scripts
                     "t={{time}}&v={{version}}&key={{apiKey}}&libraries=geometry" // add geometry
        };

        var _version = "3.29"; // reference to the version for the javascript API
        var _timeout = 15000;  // reference to the timeout for the javascript API
        var _apiKey  = "AIzaSyCTPsigXm5aSsQ0kuZPx9SV50Z-w0BB5y8"; // and API key

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
        // @name getStyles
        // @desc function to get the google map styles for any model name and user id
        // @return {Promise(Object)} - the promise with the styles json data as response
        function getStyles() {
            return new Promise(function(resolve, reject) {
                // get the google map styles from the API
                $http.get(_dataURL.styles).then(
                    // on success callback
                    function(response) {
                        // check if the response
                        // obtained is valid or not
                        if(response && response.data
                        && Array.isArray(response.data)) {
                            // resolve the API call with
                            // the data from the response
                            return resolve(response.data);
                        } else {
                            console.warn("google-maps.service.js: The google map styles obtained for google-maps pathways is invalid:");
                            console.warn(response); return resolve([]); // return empty data on error
                        }
                    },

                    // on error callback
                    function (error) {
                        console.warn("google-maps.service.js: The google map styles obtained for google-maps pathways is invalid:");
                        console.warn(error); return resolve([]); // return empty data on error
                    }
                );
            });
        }

        // @name getScripts
        // @desc function to get the google map scripts for any model name and user id
        // @return {Promise(Object)} - the promise with the script reference object as response
        function getScripts() {
            return new Promise(function(resolve, reject) {
                // reference to the on load timer
                var onGoogleMapsLoadTimer = null;

                // check if google maps has already loaded
                // and only proceed if it has not loaded
                if(window.hasGoogleMapsLoaded) {
                    // return the script object as
                    // response if already loaded
                    return resolve(window.google);
                }

                // set the maps loaded flag to false
                window.hasGoogleMapsLoaded = false;

                var loadStartTime = Date.now(); // set the map load start time in ms
                var loadEndTime   = Date.now(); // set the map load end time in ms

                // set function to be executed on google maps loaded
                if(typeof window.onGoogleMapLoad !== "function") {
                    window.onGoogleMapsLoad = function() {
                        // get the config flag that indicates
                        // this is the production environment
                        var isProd = CONFIG.environment.isProd;


                        // delete the function after first trigger
                        delete window.hasGoogleMapsLoaded;

                        // set the maps loaded flag to true
                        window.hasGoogleMapsLoaded = true;

                        loadEndTime = Date.now(); // update the map load end time on load in ms
                        var loadTime = loadEndTime - loadStartTime; // calculate load time in ms
                        var loadSpeed = "fast"; // set the default google map load speed as fast

                        if(isProd) {  print("google-maps.service.js: Google map scripts load time: " + loadTime + "ms"); }
                        else { console.warn("google-maps.service.js: Google map scripts load time: " + loadTime + "ms"); }

                        // determining the load speed based on load time
                        if(CONFIG.device.isAndroidOld  // older - anything with an os below android v6.x and ios v9.x
                        || CONFIG.device.isIOSOld) { loadSpeed = "slower"; } // slower - not a newer mobile / tablet
                        else if(loadTime <= 400)   { loadSpeed = "fast";   } // fast   - less than (or =) 400 ms
                        else if(loadTime <= 800)   { loadSpeed = "slow";   } // slow   - less than (or =) 800 ms
                        else if(loadTime >  800)   { loadSpeed = "slower"; } // slower - anything above 800 ms

                        if(isProd) {  print("google-maps.service.js: Google map scripts load speed: " + loadSpeed); }
                        else { console.warn("google-maps.service.js: Google map scripts load speed: " + loadSpeed); }

                        // add function to get the google map load speed
                        window.getGoogleMapsSpeed = function() {
                            // return the load speed
                            return loadSpeed;
                        };

                        // return the script object as
                        // response on it has loaded
                        return resolve(window.google);
                    }
                }

                // prepare the script tag to be inserted into the page
                var scriptElement = document.createElement('script');
                scriptElement.src = _dataURL.scripts // set tag source
                                    .replace("{{version}}", _version) // google map scripts version
                                    .replace("{{apiKey}}", _apiKey)   // registered service api key
                                    .replace("{{time}}", Date.now()); // time to prevent caching

                // add callback function to script tag source
                scriptElement.src += "&callback=onGoogleMapsLoad";

                // append the script tag to the document body
                document.body.appendChild(scriptElement);

                // clear any previously set timers
                if(onGoogleMapsLoadTimer !== null) {
                    clearTimeout(onGoogleMapsLoadTimer);
                    onGoogleMapsLoadTimer = null;
                }

                // resolve the promise with null after a maximum set timeout
                var onGoogleMapsLoadTimer = setTimeout(function() {
                    // set the on load callback to a no-op
                    window.onGoogleMapsLoad = function() {}
                    return resolve(null);
                }, _timeout);
            });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.getStyles  = getStyles;  // function to get the google map styles for any model name and user id
        service.getScripts = getScripts; // function to get the google map scripts for any model name and user id
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("GoogleMapsService", GoogleMapsService); // set service

})();
