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
//   Service - Data
// -------------------------------------
/**
    * @name data.service
    * @desc The helper data service for the app
            that contains functions to get and parse
            data from katzion for each user milestone.
**/
(function() {
    console.log("services/data.service.js loaded.");

    /**
        * @name DataService
        * @desc Class for the data service.
        * @param {Service} $http - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the service class
    **/
    function DataService($http, CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _dataURL = { // reference to the api urls for get the required data
            staging:    CONFIG.path.data + "{{id}}.json", // api url for staging
            production: CONFIG.path.data + "{{id}}.json"  // api url for production
        };

        var _savedData = { }; // reference to the api datas that have been saved

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the content of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _isEven
        // @desc function to check if the given number is even or not
        // @param {Number} number - the number to perform the check for
        // @return {Boolean} - true if the number is even, false if it is not
        function _isEven(number) {
            if(typeof number !== "number") { return false; }
            return (number === 0 || ((number % 2) === 0));
        }

        // @name _isOdd
        // @desc function to check if the given number is odd or not
        // @param {Number} number - the number to perform the check for
        // @return {Boolean} - true if the number is odd, false if it is not
        function _isOdd(number) {
            if(typeof number !== "number") { return false; }
            return !_isEven(number);
        }

        // @name _parseCTA
        // @desc function to parse the given cta data and fill gaps with default values
        // @param {Object} cta - the data to be parsed and checked for any missing information
        // @return {Object} ccta - a copy of the parsed and modifed data once parsing is complete
        function _parseCTA(cta) { try {
            // make a local copy of the data
            var ccta = angular.copy(cta);

            // check if the given cta contains
            // valid url, title and target set
            if(!ccta.url    || !ccta.url.length)    { ccta.url    = "#";        }  // default url
            if(!ccta.title  || !ccta.title.length)  { ccta.title  = ccta.label; }  // default title
            if(!ccta.target || !ccta.target.length) { ccta.target = "_self";    }  // default target

            // make sure that internal '#'
            // links have no default target
            if(ccta.url === "#") { ccta.target = ""; }}

            // on errors while parsing the data
            catch(error) { console.log(error); }

            // check if the the cta link is valid
            // note: not applicable for test users
            var link = ccta.url; // get the cta link
            if(typeof link !== "string" || link.length < 7
            || (!link.includes("http://") && !link.includes("https://"))) {
                prompt("----------------------------------------------");
                prompt("data.service.js:", "Invalid CTA link detected:");
                prompt("data.service.js:", (link ? link : "CTA link is not defined."));
                prompt("----------------------------------------------");
            }

            // check if the the cta label is valid
            // note: not applicable for test users
            var label = ccta.label; // get cta label
            if(typeof label !== "string" || label.length < 5) {
                prompt("-----------------------------------------------");
                prompt("data.service.js:", "Invalid CTA label detected:");
                prompt("data.service.js:", (label ? label : "CTA label is not defined."));
                prompt("-----------------------------------------------");
            }

            // return the parsed and
            // modified cta object
            return ccta;
        }

        // @name _parseImages
        // @desc function to parse the given image data and fill gaps with default values
        // @param {Object} images - the data to be parsed and checked for any missing information
        // @return {Object} cimages - a copy of the parsed and modifed data once parsing is complete
        function _parseImages(images) { try {
            // make a local copy of the data
            var cimages = angular.copy(images);

            // loop through each image (desktop and mobile)
            Object.keys(cimages).forEach(function(key, index) {
                // get the current image
                var image = cimages[key];

                // set validity flag
                var isValid = true;

                // check if the image is a string of valid length
                if(typeof image !== "string" || image.length < 7 ||
                  (!image.includes(".jpg") &&  // is a *.jpg image
                   !image.includes(".png") &&  // is a *.png image
                   !image.includes(".gif"))) { // is a *.gif image
                    isValid = false; // set the validity flag to be false otherwise
                    prompt("-------------------------------------------------------");
                    prompt("data.service.js:", "Invalid " + key + " image detected:");
                    prompt("data.service.js:", (image ? image : key + " image is not defined."));
                    prompt("-------------------------------------------------------");
                }

                // note: the image can contain absolute or relative
                // urls, so check if the image url path is relative
                if(isValid && !image.includes("http://") && !image.includes("https://")) {
                    // and add a prefix to the url path
                    image = CONFIG.path.images + image;
                    image = image.replace("//", "/");
                }

                // add image back to object
                cimages[key] = image;
            });}

            // on error while parsing
            catch(error) { console.log(error); }

            // return the parsed and
            // modified images object
            return cimages;
        }

        // @name _parseData
        // @desc function to parse the given response data and fill gaps with default values
        // @param {Object} data - the data to be parsed and checked for any missing information
        // @return {Object} cdata - a copy of the parsed and modifed data once parsing is complete
        function _parseData(data) { try {
            // make a local copy of the data
            var cdata = angular.copy(data);

            // loop through each object in the response data
            Object.keys(cdata).forEach(function(key, index) {
                // get the current object
                var obj  = cdata[key];
                var keys = Object.keys(obj);

                // TO-DO: add code to parse
                // the obtained data here

                // parse any cta in data
                if(keys.includes("cta")) {
                    obj.cta = _parseCTA(obj.cta);
                }

                // parse any images in data
                if(keys.includes("image")) {
                    obj.image = _parseImages(obj.image);
                }

                // check if the given data
                // contains nested children
                if(keys.includes("children")) {
                    // then parse nested children
                    obj.children = _parseData(obj.children);
                }
            });

            // return the parsed
            // and replaced data
            return cdata; }

            // return null if there are any errors on parsing
            catch(error) { console.log(error); return null; }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name getData
        // @desc function to get the corresponding data for the given id
        // @param {String} id - the given id to get the corresponding data for
        // @return {Promise(Object)} - the promise with the json data as response
        function getData(id) {
            return new Promise(function(resolve, reject) {
                // get the staging data api url
                var dataURL = _dataURL.staging;

                // check if this the vw production server
                if(CONFIG.environment.isVolkswagenProd) {
                    // get the production api url
                    dataURL = dataURL.production;
                }

                // TO-DO: add code to get the
                // data for the given id here

                // check if a saved copy of the data exists
                // and resolve promise with the saved data
                if(Object.keys(_savedData).includes(id)) {
                    return resolve(_savedData[id]);
                }

                // get the data that corresponds to the given id
                $http.get(dataURL.replace("{{id}}", id)).then(
                    // on api success
                    function(response) {
                        var responseData = _parseData(response.data); // parse the data
                        if(responseData === null || typeof responseData === "undefined") {
                            prompt("---------------------------------------------------");
                            prompt("data.service.js:", "Invalid response data detected:");
                            prompt("data.service.js:", (responseData ? responseData : "response data is not defined."));
                            prompt("---------------------------------------------------");
                        }

                        // save the data so as it can be re-used later
                        // and resolve the promise with the parsed data
                        _savedData[id] = responseData;
                        return resolve(_savedData[id]);
                    },

                    // on api error
                    function(error) {
                        // return null if there are errors
                        prompt(error); return resolve(null);
                    }
                );
            });
        }

        // @name groupData
        // @desc function to group the given data into rows and columns
        // @param {Array} dataArray - the array of data that needs to be grouped
        // @param {Number} dataCount - the count of no.of. columns in each row of data
        // @return {Object} - the copy of the grouped data split into rows and columns
        function groupData(dataArray, dataCount) { try {
            var data = angular.copy(dataArray); // make a local copy of data array
            var group = []; // create empty array for the group of items created

            var groupCount = 1; // set default group count of groups created
            var groupedData = []; // create empty array for grouped data

            // if there is only one item in the data array
            if(dataArray.length <= 1){
                // push the data into the grouped data
                groupedData.push({ id: "group-" + groupCount, data: data });
                return groupedData;
            }

            // else loop through each item in the data array
            dataArray.forEach(function(item, index) {
                // set item as not empty
                item.isEmpty = false;

                // push the item into the group
                group.push(item);

                // check if the data count has been reached
                if((index + 1) % dataCount === 0){
                    // then push the data into the grouped data
                    groupedData.push({ id: "group-" + groupCount, data: group });
                    groupCount++;
                    group = [];
                }
            });

            // if there are any extra
            // items are leftover in group
            if(group.length) {
                // get the first item in the group
                // and create an empty item out of it
                var emptyItem = angular.copy(group[0]);

                // and reset the value of each key in the empty item
                Object.keys(emptyItem).forEach(function(key) {
                    var value = emptyItem[key];
                    switch((typeof value).toLowerCase()) {
                        case "number" : { emptyItem[key] = 0;  break; }
                        case "string" : { emptyItem[key] = ""; break; }
                        case "array"  : { emptyItem[key] = []; break; }
                        case "boolean": { emptyItem[key] = false; break; }
                        default: { emptyItem[key] = null; break; }
                    } emptyItem.isEmpty = true; // set empty flag as true
                });

                // populate the group with empty items if
                // it is less than the required data count
                for(var i = group.length; i < dataCount; i++) {
                    group.push(angular.copy(emptyItem));
                }

                // push the final group into the grouped data
                groupedData.push({ id: "group-" + groupCount, data: group });
                groupCount++;
                group = [];
            }

            // return the grouped data on success
            return groupedData; }

            // return original data on error
            catch(error) { console.log(error); return dataArray; }
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.getData   = getData;   // function to get the corresponding data for the given id
        service.groupData = groupData; // function to group the given data into rows and columns
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("DataService", DataService); // set service

})();
