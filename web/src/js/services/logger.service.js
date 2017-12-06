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
//   Service - Logger
// -------------------------------------
/**
    * @name logger.service
    * @desc The helper logger service for the app that
            contains functions to log warnings and errors.
**/
(function() {
    console.log("services/logger.service.js loaded.");

    /**
        * @name LoggerService
        * @desc Class for the logger service.
        * @param {Service} $http - Service in module
        * @param {Service} $state - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the service class
    **/
    function LoggerService($http, $state, CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        // reference to the URLs for
        // the logger log API calls
        var _dataURL = {
            // data URL for the API calls
            // under volkswagen environment
            volkswagen: {
                warn:  "/welcome-proto/api/error", // api url to log warnings (relative)
                error: "/welcome-proto/api/error"  // api url to log errors   (relative)
            },

            // data URL for the API calls
            // under any other environment
            other: {
                warn:  "https://au.volkswagen.tribalstage.com/welcome-proto/api/error", // api url to log warnings
                error: "https://au.volkswagen.tribalstage.com/welcome-proto/api/error"  // api url to log errors
            }
        };

        var _logCount = 0;   // reference to the number of logs that were written to the api
        var _logDelay = 1600 // reference to the delay between each log written into the api

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the content of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _isValue
        // @desc function to check if the given value is of valid type
        // @param {String} value - the value to check for type validity
        // @param {Boolean} value - the value to check for type validity
        // @return {Boolean} - true if the value is valid, false if not
        function _isValue(value) {
            return (typeof value !== "undefined"
                && (typeof value === "boolean"
                ||  typeof value === "string"));
        }

        // @name _isObject
        // @desc function to check if the given object is of valid type
        // @param {Object} object - the object to check for type validity
        // @return {Boolean} - true if the object is valid, false if not
        function _isObject(object) {
            return (typeof object !== "undefined"
                 && typeof object === "object");
        }

        // @name _isUserValid
        // @desc function to check if the given user id is valid or not
        // @param {String} userId - the id of the user to check for validity
        // @return {Boolean} - true if the user is valid, false if it is not
        function _isUserValid(userId) {
            return (userId !== null
                 && userId !== "api-tests"
                 && userId !== "style-guide"
                 && userId !== "test-shipping-default-golf"
                 && userId !== "test-shipping-default-jetta"
                 && userId !== "test-shipping-alternate-golf"
                 && userId !== "test-shipping-alternate-jetta");
        }

        // @name _getProperties
        // @desc function to get the properties that are to be written to the log
        // @return {Object} - the object containing the properties to write to the log
        function _getProperties() {
            // create the properties object to be written
            var properties = { }; // create a new object

            // create a local copy of the config
            // and remove irrelevant keys, values
            var config = angular.copy(CONFIG);
            delete config.animation;
            delete config.timeout;
            delete config.path;

            // loop through all the nested keys
            // and add them to the parent layer
            Object.keys(config).forEach(function(okey, oindex) {
                // get the value for the key
                var ovalue = config[okey];

                // add the key to property if it is valid
                if(okey !== "value" && _isValue(ovalue)) {
                    properties[okey] = ovalue;
                }

                // loop through the nested
                // keys if it is an object
                else if(_isObject(ovalue)) {
                    Object.keys(ovalue).forEach(function(ikey, iindex) {
                        // get the value for the key
                        var ivalue = ovalue[ikey];

                        // add the key to property if it is valid
                        if(ikey !== "value" && _isValue(ivalue)) {
                            properties[okey + "_" +  ikey] = ivalue;
                        }
                    });
                }
            });

            // add the user id and anchor id
            // to the existing set of properties
            var params           = $state.params; // get the state params
            properties.id_user   = params["id"] ? params["id"] : "undefined";
            properties.id_anchor = params["anchor"] ? params["anchor"] : "undefined";

            // return the properties
            return properties;
        }

        // @name _log
        // @desc function to log and store the given warning or error message
        // @param {String} message - the warning or error message to to be logged
        // @param {Type} type - the type of message to be logged, i.e. warning or error
        // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
        function _log(message, type) {
            return new Promise(function(resolve, reject) {
                // check if the given type value is valid
                if(type !== "warn") { type = "error"; }

                // only proceed if the given message is not null and if is a string, a valid string
                if(typeof message === null || (typeof message === "string" && message.length <= 3)) {
                    print("logger.service.js: Cannot log the given " + type + " message.");
                    print("message: " + message ? message : "message is not defined.");
                    return resolve(false); // resolve promise with false on error
                }

                // print the message based
                // on the given message type
                switch(type) {
                    case "warn" : { print(message);  break; } // for warning
                    case "error": { prompt(message); break; } // for error
                }

                // create the data for the
                // post request to be sent
                var data = {
                    source: "Welcome Experience", // the source name of the log
                    properties: _getProperties(),  // the properties for the log
                    message: message, // the message to write to the log
                    type: type // the type of log, i.e. warning or error
                };

                // add required suffix the data source name based on the environment
                     if(CONFIG.environment.isLocalHost) { data.source += " - Local"; } // for local
                else if(CONFIG.environment.isAmazonHost) { data.source += " - AWS S3"; } // for aws
                else if(CONFIG.environment.isVolkswagenProd) { data.source += " - VW Prod"; } // for vw
                else if(CONFIG.environment.isVolkswagenStage) { data.source += " - VW Stage"; } // for vw

                // get the correct data url to post the data to (based on the environment)
                var dataURL = _dataURL.other; // the default environment is not volkswagen
                if(CONFIG.environment.isVolkswagenHost) { dataURL = _dataURL.volkswagen; }


                // increment the log count
                // and increase the delay and
                _logCount++; // check if it is valid
                if(_logCount < 0) { _logCount = 0; }

                // post the data and message to the logger api
                // note: the timeout is to allow the network
                // bandwidth to be used for other resources
                setTimeout(function() {
                    // only log the data if the user is valid
                    // note: lgo not applicable to test users
                    if(_isUserValid(data.properties.id_user)) { /*
                        $http.post(dataURL[type], data).then(
                            // on sucess callback
                            function(response) {
                                _logCount--; // decrement the log count and delay on success
                                return resolve(true); // resolve promise with true on success
                            },

                            // on error callback
                            function(error) {
                                _logCount--; // decrement the log count and delay on error
                                return resolve(false); // resolve promise with false on error
                            }
                        ); */

                        // note: the error logger has been temporarily disabled to
                        // prevent sending information logs to the volkswagen server
                        return resolve(true); // resolve promise with true on success
                    }

                    // only log the data if the user is valid
                    // note: lgo not applicable to test users
                    else { _logCount--; return resolve(true); }
                }, ((_logCount > 1) ? (_logCount * _logDelay) : 0));
            });
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name warn
        // @desc function to log and store the given warning message
        // @param {String} message - the warning or error message to to be logged
        // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
        function warn(message) {
            return _log(message, "warn");
        }

        // @name error
        // @desc function to log and store the given error message
        // @param {String} message - the warning or error message to to be logged
        // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
        function error(message) {
            return _log(message, "error");
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.warn  = warn;  // function to log and store the given warning message
        service.error = error; // function to log and store the given error message
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("LoggerService", LoggerService); // set service

})();
