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
//   Service - Loader
// -------------------------------------
/**
    * @name loader.service
    * @desc The helper service for the app that contains functions
            to be used in conjunction with the main loader component.
**/
(function() {
    console.log("services/loader.service.js loaded.");

    /**
        * @name LoaderService
        * @desc Class for the loader service.
        * @param {Service} ScopeService - The custom scope service
        * @return {Object} - The instance of the service class
    **/
    function LoaderService(ScopeService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _scope  = null; // reference to the default loader scope
        var _loader = null; // reference to the default loader component

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the context of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name setScope
        // @desc function to set the default loader scope
        // @param {$scope} scope - the scope of the component
        function setScope(scope) {
             // only set if scope is valid
            if(typeof scope !== "undefined"
            && typeof scope.$apply === "function"
            && typeof scope.$digest === "function") {
                _scope = scope;
            }
        }

        // @name setLoader
        // @desc function to set the default loader component
        // @param {loader} loader - the default loader component
        function setLoader(loader) {
            // only set if loader is valid
            if(typeof loader !== "undefined"
            && typeof loader.show === "function"
            && typeof loader.hide === "function") {
                _loader = loader;
            }
        }


        // @name showLoader
        // @desc function to show the default loader with animation
        // @return {Promise(Boolean)} - the promise with the loading flag
        function showLoader() {
            return new Promise(function(resolve, reject) { try {
                // show the default loader with the animation
                // note: the error function is not required because
                // the loader always uses resolve instead of reject
                _loader.show().then(function(isLoading) {
                    // update the component scope
                    ScopeService.digest(_scope);
                    return resolve(isLoading);
                }); }

                // on error
                catch(error) {
                    console.log(error);
                    return resolve(false);
                }

            });
        }

        // @name hideLoader
        // @desc function to hide the default loader with animation
        // @return {Promise(Boolean)} - the promise with the loading flag
        function hideLoader() {
            return new Promise(function(resolve, reject) { try {
                // hide the default loader with the animation
                // note: the error function is not required because
                // the loader always uses resolve instead of reject
                _loader.hide().then(function(isLoading) {
                    // update the component scope
                    ScopeService.digest(_scope);
                    return resolve(isLoading);
                }); }

                // on error
                catch(error) {
                    console.log(error);
                    return resolve(false);
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
        service.setScope  = setScope;  // function to set the default loader scope
        service.setLoader = setLoader; // function to set the default loader component

        service.showLoader = showLoader; // function to show the default loader with animation
        service.hideLoader = hideLoader; // function to hide the default loader with animation
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("LoaderService", LoaderService); // set service

})();
