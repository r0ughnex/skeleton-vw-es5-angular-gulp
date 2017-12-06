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
//   Service - Shipping
// -------------------------------------
/**
    * @name shipping.service
    * @desc The helper shipping service for the app
            that contains functions to get and parse the
            shipping data from katzion for each user milestone.
**/
(function() {
    console.log("services/shipping.service.js loaded.");

    /**
        * @name ShippingService
        * @desc Class for the shipping service.
        * @param {Service} $http - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} LoggerService - The custom logger service
        * @return {Object} - The instance of the service class
    **/
    function ShippingService($http, CONFIG, LoggerService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        // reference to the URLs for
        // the shipping data API calls
        var _dataURL = {
            // data URL for the API calls under volkswagen environments
            volkswagen: CONFIG.path.data + "shipping/{{journeyType}}-{{modelName}}.json",

            // data URL for the API calls under any other environments
            other: CONFIG.path.data + "shipping/{{journeyType}}-{{modelName}}.json"
        };

        /*
        // reference to the URLs for
        // the shipping data API calls
        var _dataURL = {
            // data URL for the API calls under volkswagen environments
            volkswagen: "/welcome-proto/api/shipping?id={{userId}}",

            // data URL for the API calls under any other environments
            other: "https://au.volkswagen.tribalstage.com/welcome-proto/api/shipping?id={{userId}}"
        }; */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the content of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _isResponseValid
        // @desc function to check if the given response is valid
        // @param {Object} response - the response json object to checked
        // @return {Boolean} - true is response is valid, false if it is not
        function _isResponseValid(response) {
            // check if the response contains
            // atleast more than 2 markers
            if(response && response.data
                && response.data.markers
                && response.data.markers.length > 2) {
                return true; // return true if it does
            }

            // return false if it does not
            else { return false; }
        }

        // @name _isCoordinatesValid
        // @desc function to check if the given coordinates are valid
        // @param {Number} lat - the latitude coordinate to be checked
        // @param {Number} lng - the longitude coordinate to be checked
        // @return {Boolean} - true if they are valid, false if they are not
        function _isCoordinatesValid(lat, lng) {
            // check if the lat and
            // lng are valid numbers
            if(typeof lat !== "number"
            || typeof lng !== "number") {
                return false;
            }

            // check for non-zero values
            // note: use == because we are
            // comparing float and integer
            if(parseFloat(lat) == 0
            || parseFloat(lng) == 0) {
                return false;
            }

            // check if lat and lng
            // are within their range
            if(lat >= -90  && lat <= 90
            && lng >= -180 && lng <= 180) {
                return true;
            }

            // return false if not
            else { return false; }
        }

        // @name _isNameValid
        // @desc function to check if the given name content is valid
        // @param {String} name - the content of the name to check for validity
        // @return {Boolean} - true if the name content is valid, false if it is not
        function _isNameValid(name) {
            if(typeof name !== "string" ||  name.length < 5 || name.length > 40
            || name.toLowerCase().includes("lorem") || name.toLowerCase().includes("ipsum")
            || name.toLowerCase().includes("dolor") || name.toLowerCase().includes("elit")
            || name.toLowerCase().includes("name")) {
                return false; // return false if not valid
            }

            // return true if is valid
            else { return true; }
        }

        // @name _isHeadlineValid
        // @desc function to check if the given headline content is valid
        // @param {String} headline - the content of the headline to check for validity
        // @return {Boolean} - true if the headline content is valid, false if it is not
        function _isHeadlineValid(headline) {
            if(typeof headline !== "string" || headline.length < 5 || headline.length > 30
            || headline.toLowerCase().includes("lorem") || headline.toLowerCase().includes("ipsum")
            || headline.toLowerCase().includes("dolor") || headline.toLowerCase().includes("elit")
            || headline.toLowerCase().includes("headline")) {
                return false; // return false if not valid
            }

            // return true if is valid
            else { return true; }
        }

        // @name _isCopyValid
        // @desc function to check if the given copy content is valid
        // @param {String} copy - the content of the copy to check for validity
        // @return {Boolean} - true if the copy content is valid, false if it is not
        function _isCopyValid(copy) {
            if(typeof copy !== "string" ||  copy.length < 10 || copy.length > 195
            || copy.toLowerCase().includes("lorem") || copy.toLowerCase().includes("ipsum")
            || copy.toLowerCase().includes("dolor") || copy.toLowerCase().includes("elit")
            || copy.toLowerCase().includes("copy")) {
                return false; // return false if not valid
            }

            // return true if is valid
            else { return true; }
        }

        // @name _isImageValid
        // @desc function to check if the given image url is valid
        // @note the given image can only contain an absolute url
        // @param {String} image - the url of the image to check for validity
        // @return {Boolean} - true if the image url is valid, false if it is not
        function _isImageValid(image) {
            if(typeof image !== "string" || image.length < 10 || image.length > 165
            || (!image.toLowerCase().includes(".jpg")  && !image.toLowerCase().includes(".png")
            &&  !image.toLowerCase().includes(".gif")) || !image.toLowerCase().includes("http")
            ||   image.toLowerCase().includes("/home/home-")
            ||   image.toLowerCase().includes("placeholder")) {
                return false; // return false if not valid
            }

            // return true if is valid
            else {  return true; }

        }

        // @name _parseCoords
        // @desc function to recurse and parse given coords object and modify
        //       it by replacing any missing information with default values
        // @param {Object} coords - the coords object to be parsed and checked for missing information
        // @return {Object} - a copy of the parsed and modifed coords object once the parsing is complete
        function _parseCoords(coords) {
            // make a local copy of the coords
            var coords = angular.copy(coords);

            // check if the given lat and lng are valid
            var lat = coords.lat, lng = coords.lng;
            if(_isCoordinatesValid(lat, lng)) {
                /* empty block */
            }

            // check again by switcing the given coords
            else if(_isCoordinatesValid(lng, lat)) {
                LoggerService.error("shipping.service.js: Invalid latitude and longitude coords detected:");
                LoggerService.error("shipping.service.js: latitude: " + lat + ", longitude: " + lng);

                // switch the given lat and lng coords
                lat = coords.lat; lng = coords.lng;

                LoggerService.error("shipping.service.js: The given coords are valid if they are switched:");
                LoggerService.error("shipping.service.js: latitude: " + lat + ", longitude: " + lng);
            }

            // if the given lat and lng are not valid
            else {
                LoggerService.error("shipping.service.js: Invalid latitude and longitude coords detected:");
                LoggerService.error("shipping.service.js: latitude: " + lat + ", longitude: " + lng);

                // reset both the coords to default
                lat = 0; lng = 0; // default is zero

                console.warn("shipping.service.js: Resetting the given coords to their default values:");
                console.warn("shipping.service.js: latitude: " + lat + ", longitude: " + lng);
            }

            // convert given lat, lng to float values
            coords.lat = parseFloat(lat.toFixed(5)); // round to 5 decimal places
            coords.lng = parseFloat(lng.toFixed(5)); // round to 5 decimal places

            // return the parsed and
            // modified coords object
            return coords;
        }

        // @name _parseName
        // @desc function to recurse and parse given name and modify
        //       it by replacing any missing information with default values
        // @param {String} name - the name to be parsed and checked for missing information
        // @return {String} - a copy of the parsed and modifed name once the parsing is complete
        function _parseName(name) {
            // make a local copy of the name
            var name = angular.copy(name);

            // check if the name is valid
            if(!_isNameValid(name)) {
                LoggerService.warn("shipping.service.js: Invalid marker name content detected:");
                LoggerService.warn("name: " + ((name && name.length) ? name : "name is not defined"));

                // set a default placholder
                // if the name is invalid
                name = "Lorem Ipsum, dolar sit";
            }

            // return the parsed and
            // modified name
            return name;
        }

        // @name _parseHeadline
        // @desc function to recurse and parse given headline and modify
        //       it by replacing any missing information with default values
        // @param {String} headline - the headline to be parsed and checked for missing information
        // @return {String} - a copy of the parsed and modifed headline once the parsing is complete
        function _parseHeadline(headline) {
            // make a local copy of the headline
            var headline = angular.copy(headline);

            // check if the headline is valid
            if(!_isHeadlineValid(headline)) {
                LoggerService.warn("shipping.service.js: Invalid marker headline content detected:");
                LoggerService.warn("headline: " + ((headline && headline.length) ? headline : "headline is not defined"));

                // set a default placholder
                // if the headline is invalid
                headline = "Lorem Ipsum, dolar sit";
            }

            // return the parsed and
            // modified headline
            return headline;
        }

        // @name _parseCopy
        // @desc function to recurse and parse given copy and modify
        //       it by replacing any missing information with default values
        // @param {String} copy - the copy to be parsed and checked for missing information
        // @return {String} - a copy of the parsed and modifed copy once the parsing is complete
        function _parseCopy(copy) {
            // make a local copy of the copy
            var copy = angular.copy(copy);

            // check if the copy is valid
            if(!_isCopyValid(copy)) {
                LoggerService.warn("shipping.service.js: Invalid marker copy text content detected:");
                LoggerService.warn("copy: " + ((copy && copy.length) ? copy : "copy is not defined"));

                // set a default placholder if the copy is invalid
                copy = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ullamcorper enim odio, quis rhoncus enim blandit et. Sed ultricies lacus eget nunc mollis, eget ornare eros sollicitudin.";
            }

            // return the parsed
            // and modified copy
            return copy;
        }

        // @name _parseImages
        // @desc function to recurse and parse given images object and modify
        //       it by replacing any missing information with default values
        // @param {Object} images - the images object to be parsed and checked for missing information
        // @return {Object} - a copy of the parsed and modifed images object once the parsing is complete
        function _parseImages(images) { try {
            // make a local copy of the images
            var images = angular.copy(images);

            // make sure the required image
            // keys and values are available
            if(!images) { images = {}; }
            if(!images["desktop"]) { images["desktop"] = ""; }
            if(!images["mobile"])  { images["mobile"]  = ""; }

            // loop through each image (desktop and mobile)
            Object.keys(images).forEach(function(key) {
                // remove all keys except desktop and mobile
                if(key !== "desktop" && key !== "mobile") {
                    delete images[key]; // delete the given key
                    return false; // skip to the next iteration
                }

                // get the current image
                var image = images[key];

                /*
                // note: the image can only contain an absolute url
                // check if the image url path is relative and
                if(image.indexOf("http://")  === -1
                && image.indexOf("https://") === -1) {
                    // add path prefix to any relative path
                    image = CONFIG.path.images + image;
                    image = image.replace("//", "/");
                } */

                // check if the image is valid
                if(!_isImageValid(image)) {
                    LoggerService.warn("shipping.service.js: Invalid " + key + " image content detected:");
                    LoggerService.warn("image: " + ((image && image.length) ? image : "image is not defined"));

                    // set a default placeholder image
                    // if the given image is not valid
                    switch(key) {
                        case "desktop": { image = "https://via.placeholder.com/1250x570.jpg/808890/bdc3c6"; break; } // desktop
                        case "mobile":  { image = "https://via.placeholder.com/800x365.jpg/808890/bdc3c6";  break; } // mobile
                        default:        { image = "https://via.placeholder.com/800x365.jpg/808890/bdc3c6";  break; } // default
                    }
                }

                // add image back to object
                images[key] = image;
            });}

            // on error while parsing
            catch(error) { console.log(error); }

            // return the parsed and
            // modified images object
            return images;
        }

        // @name _parseData
        // @desc function to parse given data and modify it by
        //        replacing any missing information with default values
        // @param {Object} data - the data to be parsed and checked for missing information
        // @return {Object} - a copy of the parsed and modifed data once the parsing is complete
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            // only proceed if the given data is valid
            if(!data || !data.markers) { return null; }

            // loop through each of the markers in the data
            data.markers.forEach(function(marker, index) {
                console.log("----------------------------------------------------------------------------");
                console.log("shipping.service.js: Parsing the shipping data for the marker " + index + ".");
                // make sure the marker contains an id
                // if not set id based on current index
                if(!marker.id) { marker.id = (index + 1); }

                // make sure the marker contains a valid name
                var name = marker.name; // get the marker name
                marker.name = _parseName(name); // parse name

                // make sure the marker contains a valid type
                var type = marker.type; // get the marker type
                if(!type || !type.length) { marker.type = "route"; }

                // if it does then convert it to be lowercase
                else { marker.type = marker.type.toLowerCase(); }

                // make sure the marker contains valid coords
                if(!marker.coords || !marker.coords.dot) { marker.coords.dot = { lat: 0, lng: 0 }; }
                if(!marker.coords || !marker.coords.pin) { marker.coords.pin = { lat: 0, lng: 0 }; }

                // make sure the marker contains valid coords
                var dcoords = marker.coords.dot; // get the inner dot coords
                var pcoords = marker.coords.pin; // get the inner pin coords
                marker.dcoords = _parseCoords(dcoords); // parse coords into new key
                marker.pcoords = _parseCoords(pcoords); // parse coords into new key
                delete marker.coords; // delete the old coords key (not used anymore)

                // make sure the marker contains valid content
                if(!marker.content) { marker.content = {}; }

                // check if the marker contains a valid headline
                var headline = marker.content.headline; // get the headline
                marker.content.headline = _parseHeadline(headline); // parse

                // check if the marker contains a valid copy
                var copy = marker.content.copy; // get the copy
                marker.content.copy = _parseCopy(copy); // parse

                // check if the marker contains valid images
                var images = marker.content.image; // get the images
                marker.content.image = _parseImages(images); // parse

                // check if the marker contains valid routes
                var routes = marker.routes; // get the marker routes
                if(!routes || !Array.isArray(routes)) { marker.routes = []; }

                // loop through each of the inner nested route
                marker.routes.forEach(function(route, index) {
                    // make sure each route contains valid type and coords
                    if(!route.type   || !route.type.length) { route.type = "route"; }
                    if(!route.coords || !route.coords.dot)  { route.coords.dot = { lat: 0, lng: 0 }; }
                    if(!route.coords || !route.coords.pin)  { route.coords.pin = { lat: 0, lng: 0 }; }

                    // make sure each route contains valid type and coords
                    var dcoords = route.coords.dot; // get the inner dot coords
                    var pcoords = route.coords.pin; // get the inner pin coords
                    route.dcoords = _parseCoords(dcoords); // parse coords into new key
                    route.pcoords = _parseCoords(pcoords); // parse coords into new key
                    route.type    = route.type.toLowerCase(); // convert type to lowercase
                    delete route.coords; // delete the old coords key (it won't be used anymore)
                });
            });

            // return the parsed and
            // modified data object
            return data;
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name getData
        // @desc function to get the shipping data for the given model name and user id
        // @param {String} modelName - the vehicle model name to get shipping data for
        // @param {String} userId - the user id for the hub to get shipping data for
        // @return {Promise(Object)} - the promise with the json data as response
        function getData(modelName, userId) {
            return new Promise(function(resolve, reject) {
                // check if the given model name and user id are valid
                if(!modelName || typeof modelName !== "string" || !modelName.length
                 ||!userId    || typeof userId    !== "string" || !userId.length) {
                    LoggerService.error("shipping.service.js: Cannot get shipping data for the given name and id:");
                    LoggerService.error("modelName: " + modelName); LoggerService.error("userId: " + userId);
                    return resolve(null); // only proceed if both are valid strings
                }

                // get the correct data URL for the API call
                var dataURL = CONFIG.environment.isVolkswagenHost ?
                              _dataURL.volkswagen : _dataURL.other

                // if the URL points to a locally stores JSON object
                // convert the model name to use lowercase instead
                // and replace all spaces in the name with dashes
                if(dataURL.includes(".json")) {
                    modelName = modelName.toLowerCase();
                    modelName = modelName.replace(/ /gm, "-");
                }

                // check the user id and determine the journey direction
                var journeyType = "default"; // default shipping direction
                // note: the shipping API needs the test prefix for test data
                if(userId === "style-guide") { userId = "test-style-guide"; }
                if(userId.includes("alternate")) { journeyType = "alternate"; }

                // replace the set placeholders with the obtained
                // values and get the shipping data from the API
                $http.get(dataURL.replace("{{userId}}", userId)
                                 .replace("{{modelName}}", modelName)
                                 .replace("{{journeyType}}", journeyType)).then(

                    // on success callback
                    function(response) {
                        // check if the response
                        // obtained is valid or not
                        if(_isResponseValid(response)) {
                            // resolve the API call with
                            // the data from the response
                            console.log("--------------------------------------------------------------------------------");
                            console.log("shipping.service.js: Original response from the server for the shipping data is:");
                            console.log(response); return resolve(_parseData(response.data)); // return parsed data on success
                        } else {
                            LoggerService.error("shipping.service.js: The shipping data obtained for the given name and id is invalid:");
                            LoggerService.error("modelName: " + modelName); LoggerService.error("userId: " + userId); LoggerService.error(response);
                            return resolve(null); // return null data on error
                        }
                    },

                    // on error callback
                    function (error) {
                        LoggerService.error("shipping.service.js: The shipping data obtained for the given name and id is invalid:");
                        LoggerService.error("modelName: " + modelName); LoggerService.error("userId: " + userId); LoggerService.error(error);
                        return resolve(null); // return null data on error
                    }
                );
            });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.getData = getData; // function to get the shipping data for the given model name and user id
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("ShippingService", ShippingService); // set service

})();
