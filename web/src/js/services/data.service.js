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
        var _dataURL = { }; // reference to the data api urls

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

        // @name _parseData
        // @desc function to parse given data and modify it by
        //        replacing any missing information with default values
        // @param {Object} data - the data to be parsed and checked for missing information
        // @return {Object} cdata - a copy of the parsed and modifed data once parsing is complete
        function _parseData(data) {
            // make a local copy of the data
            var cdata = angular.copy(data);

            // TO-DO: add code to parse
            // the obtained data here

            // return the parsed
            // and replaced data
            return cdata;
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

                // TO-DO: add code to get the
                // data for the given id here
                return resolve(true);

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
