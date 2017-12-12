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

        var _oscopes  = { }; // reference to all the overlay loader scopes
        var _oloaders = { }; // reference to all the overlay loader components

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
            if(typeof scope !== "undefined" // the set scope
            && typeof scope.$apply === "function" // apply function
            && typeof scope.$digest === "function") { // digest function
                _scope = scope;
            }
        }

        // @name setLoader
        // @desc function to set the default loader component
        // @param {loader} loader - the default loader component
        function setLoader(loader) {
            // only set if loader is valid
            if(typeof loader !== "undefined" // the added loader
            && typeof loader.show === "function" // show function
            && typeof loader.hide === "function") { // hide function
                _loader = loader;
            }
        }

        // @name showLoader
        // @desc function to show the default loader with animation
        // @return {Promise(Boolean)} - the promise with the success flag
        function showLoader() {
            return new Promise(function(resolve, reject) { try {
                // show the default loader with the animation
                // note: the error function is not required because
                // the loader always uses resolve instead of reject
                _loader.show().then(function(isShowSuccess) {
                    // update the component scope
                    ScopeService.digest(_scope);
                    return resolve(isShowSuccess);
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
        // @return {Promise(Boolean)} - the promise with the success flag
        function hideLoader() {
            return new Promise(function(resolve, reject) { try {
                // hide the default loader with the animation
                // note: the error function is not required because
                // the loader always uses resolve instead of reject
                _loader.hide().then(function(isHideSuccess) {
                    // update the component scope
                    ScopeService.digest(_scope);
                    return resolve(isHideSuccess);
                }); }

                // on error
                catch(error) {
                    console.log(error);
                    return resolve(false);
                }
            });
        }

        // @name setOverlayScope
        // @desc function to set the overlay scope with the given name
        // @param {String} name - the name of the overlay loader to be set
        // @param {$scope} oscope - the scope of the overlay loader component
        function setOverlayScope(name, oscope) {
            // only set if the name and
            // overlay scope  are valid
            if(typeof name === "string" && name.length
            && typeof oscope !== "undefined" // the set scope
            && typeof oscope.$apply === "function" // apply function
            && typeof oscope.$digest === "function") { // digest function
                _oscopes[name] = oscope;
            }

            console.log("_oscopes:", _oscopes);
        }

        // @name addOverlayLoader
        // @desc function to add the overlay loader with the given name
        // @param {String} name - the name of the overlay loader to be added
        // @param {OverlayLoader} oloader - the overlay loader component added
        function addOverlayLoader(name, oloader) {
            // only add if the name and
            // overlay loader are valid
            if(typeof name === "string" && name.length
            && typeof oloader !== "undefined" // the added loader
            && typeof oloader.show === "function" // show function
            && typeof oloader.hide === "function") { // hide function
                _oloaders[name] = oloader;
            }

            console.log("_oloaders:", _oloaders);
        }

        // @name showOverlayLoader
        // @desc function to show the overlay loader with the given name
        // @param {String} name - the name of the overlay loader to be shown
        // @return {Promise(Boolean)} - the returned promise with the success flag
        function showOverlayLoader(name) {
            return new Promise(function(resolve, reject) { try {
                var oloader = _oloaders[name]; // get the overlay loader
                var oscope  = _oscopes[name];  // get the loader scope

                // show the overlay loader with the animation
                // note: the error function is not required because
                // the loader always uses resolve instead of reject
                oloader.show().then(function(isShowSuccess) {
                    // update the component scope
                    ScopeService.digest(oscope);
                    return resolve(isShowSuccess);
                }); }

                // on error
                catch(error) {
                    console.log(error);
                    return resolve(false);
                }
            });
        }

        // @name hideOverlayLoader
        // @desc function to hide the overlay loader with the given name
        // @param {String} name - the name of the overlay loader to be hidden
        // @return {Promise(Boolean)} - the returned promise with the success flag
        function hideOverlayLoader(name) {
            return new Promise(function(resolve, reject) { try {
                var oloader = _oloaders[name]; // get the overlay loader
                var oscope  = _oscopes[name];  // get the loader scope

                // hide the overlay loader with the animation
                // note: the error function is not required because
                // the loader always uses resolve instead of reject
                oloader.hide().then(function(isHideSuccess) {
                    // update the component scope
                    ScopeService.digest(oscope);
                    return resolve(isHideSuccess);
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
        service.setScope   = setScope;   // function to set the default loader scope
        service.setLoader  = setLoader;  // function to set the default loader component
        service.showLoader = showLoader; // function to show the default loader with animation
        service.hideLoader = hideLoader; // function to hide the default loader with animation

        service.setOverlayScope   = setOverlayScope;   // function to set the overlay scope with the given name
        service.addOverlayLoader  = addOverlayLoader;  // function to add the overlay loader with the given name
        service.showOverlayLoader = showOverlayLoader; // function to show the overlay loader with the given name
        service.hideOverlayLoader = hideOverlayLoader; // function to hide the overlay loader with the given name
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("LoaderService", LoaderService); // set service

})();
