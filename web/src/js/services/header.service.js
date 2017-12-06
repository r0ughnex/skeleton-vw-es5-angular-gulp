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
//   Service - Header
// -------------------------------------
/**
    * @name header.service
    * @desc The helper service for the app that contains functions
            to be used in conjunction with the main header component.
**/
(function() {
    console.log("services/header.service.js loaded.");

    /**
        * @name HeaderService
        * @desc Class for the header service.
        * @param {Service} $animate - Service in module
        * @param {Service} ScopeService - The custom scope service
        * @return {Object} - The instance of the service class
    **/
    function HeaderService($animate, ScopeService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _scope    = null; // reference to the scope
        var _elHeader = null; // reference to the DOM element

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the content of this
        service.isVisible = false; // flag indicate visibility status

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name setScope
        // @desc function to set the header scope
        // @param {$scope} scope - the scope of the component
        function setScope(scope) {
             // only set if it is a valid scope
            if(scope != null && typeof scope != "undefined") {
                _scope = scope;
            }
        }

        // @name setElement
        // @desc function to set the header DOM element
        // @param {$element} elem - the element of the component
        function setElement(elem) {
            // only set if it is a valid element
            if(elem != null && typeof elem != "undefined") {
                _elHeader = elem;
            }
        }

        // @name showHeader
        // @desc function to show the header with animation
        // @return {Promise(Boolean)} - the promise with the visibility flag
        function showHeader() {
            return new Promise(function(resolve, reject) {
                // if the header is not visible
                if(!service.isVisible) {
                    service.isVisible = true; // set visibility flag
                    ScopeService.digest(_scope); // update component scope
                    return resolve(service.isVisible); // resolve promise
                }  // if(!service.isVisible) end

                // if the header is already visible
                // resolve promise immediately
                else { return resolve(service.isVisible); }
            });
        }

        // @name hideHeader
        // @desc function to hide the header with animation
        // @return {Promise(Boolean)} - the promise with the visibility flag
        function hideHeader() {
            return new Promise(function(resolve, reject) {
                // if the header is visible
                if(service.isVisible) {
                    service.isVisible = false; // reset visibility flag
                    ScopeService.digest(_scope); // update component scope
                    return resolve(service.isVisible); // resolve promise
                }  // if(!service.isVisible) end

                // if the header is already hidden
                // resolve promise immediately
                else { return resolve(service.isVisible); }
            });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.setScope   = setScope;   // function to set the header scope
        service.setElement = setElement; // function to set the header DOM element
        service.showHeader = showHeader; // function to show the header with animation
        service.hideHeader = hideHeader; // function to hide the header with animation
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("HeaderService", HeaderService); // set service

})();
