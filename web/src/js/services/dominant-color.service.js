"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Service - Dominant Color
// -------------------------------------
/**
    * @name dominant-color.service
    * @desc The helper service for the app that contains functions to
            be used in conjunction with the dominant color directive.
**/
(function() {
    console.log("services/dominant-color.service.js loaded.");

    /**
        * @name DominantColorService
        * @desc Class for the dominant color service.
        * @param {Service} $http - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the service class
    **/
    function DominantColorService($http, CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el = null; // reference to the DOM element
        var _dominantColors = null; // reference to all the dominant colours
        var _dataURL = CONFIG.path.data + "dominant-colors.json"; // reference to the data url

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the content of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _getData
        // @desc function to get the data for the all the images with their dominant colors
        // @return {Promise(Object)} - the promise with the json data as response
        function _getData() {
            return new Promise(function(resolve, reject) {
                $http.get(_dataURL).then(
                    // on success callback
                    function(response) { try {
                        // only proceed if the response is a valid json
                        var data = JSON.parse(JSON.stringify(response.data));
                        if(data != null && typeof data != "undefined") {
                            // resolve the promise with the new data
                            return resolve(data);
                        }} // try end

                        // resolve the promise with null on error
                        catch(error) {
                            console.log(error);
                            return resolve(null);
                        } // catch end
                    }, // success end

                    // on error callback
                    function(error) {
                        // resolve the promise with null on error
                        console.log(error);
                        return resolve(null);
                    } // error end
                ); // then end
            }); // Promise end
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name getColor
        // @desc function to get the dominant color for the image with the given name
        // @param {String} imageName - the name of the image used as key in the json data
        // @return {String} - the dominant color in the image in either rgb or hex format
        function getColor(imageName) {
            return new Promise(function(resolve, reject) {
                // only get the new json data if
                // the current data is empty
                if(_dominantColors == null
                    || typeof _dominantColors == "undefined") {
                    _getData().then(function(colors) {
                        // set new data
                        _dominantColors = colors;

                        // resolve the promise with the new data
                        try { return resolve(_dominantColors[imageName]); }
                        catch(error) { console.log(error); return resolve(null); }
                    });
                }

                // else resolve the promise
                // with the current data
                else {
                    try { return resolve(_dominantColors[imageName]); }
                    catch(error) { console.log(error); return resolve(null); }
                }
            });
        }

        // @name isColorValid
        // @desc function to check if the given color is a valid color
        // @param {String} color - the color in either rgb or hex format
        // @return {Boolean} - true of false depending on validity of color
        function isColorValid(color) {
            // return false if color is not specified
            if(color == null || typeof color == "undefined") {
                return false;
            }

            // create a dummy element to check color validity
            if (_el == null) { _el = document.createElement("div"); }

            // set and get the color
            _el.style.borderColor = "";
            _el.style.borderColor = color;
            var tempcolor = _el.style.borderColor;

            // check if the color was valid
            if (tempcolor.length == 0) { return false; }
            else { return true; }
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // get the data for the all the images
        // with their dominant colors on init
        _getData().then(function(colors) {
            _dominantColors = colors;
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.getColor     = getColor;     // function to get the dominant color for the image with the given name
        service.isColorValid = isColorValid; // function to check if the given color is a valid color
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("DominantColorService", DominantColorService); // set service

})();
