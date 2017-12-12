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
//   Component - Overlay Loader
// -------------------------------------
/**
    * @name overlay-loader.component
    * @desc The overlay loader component for the app.
**/
(function() {
    console.log("components/overlay-loader.component.js loaded.");

    /**
        * @name OverlayLoaderController
        * @desc Class for the overlay loader controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} LoaderService - The custom loader service
        * @return {Object} - The instance of the controller class
    **/
    function OverlayLoaderController($scope, $element, CONFIG, ScopeService, LoaderService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _duration = { // the duration for various operations
            delay: (CONFIG.animation.duration * 1.3), // default animation delay for the loader
            anim : (CONFIG.animation.duration * 1.3)  // default animation duration for the loader
        };

        var _showTimer = null; // reference to the loader show timer
        var _hideTimer = null; // reference to the loader hide timer

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl       = this;   // to capture the context of this
        ctrl.CONFIG    = CONFIG; // reference to the config constant
        ctrl.isLoading = false;  // flag to indicate if the loader is loading

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            _parseAttributes(ctrl); /* // parse the bound attributes
            ctrl.data = _parseData(ctrl.data); // parse bound data */

            // set the loader scope on init
            LoaderService.setOverlayScope(ctrl.name, $scope);

            // set the loader component on init
            LoaderService.addOverlayLoader(ctrl.name, ctrl);
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() { /* empty block */ }

        // @name _onChanges
        // @desc function for on binding changes
        function _onChanges() { /* empty block */ }

        // @name _parseAttributes
        // @desc function to parse the bound attributes and fill gaps with default values
        // @params {Object} ctrl - the controller that the attributes have been bound to
        function _parseAttributes(ctrl) {
            // check if the given
            // position is valid
            switch(ctrl.position) {
                case "top": { break; }
                case "bottom": { break; }
                default: { ctrl.position = "center"; }
            }

            // check if a valid name exists
            // otherwise use the time as name
            if(!ctrl.name || !ctrl.name.length) {
                ctrl.name = Date.now();
            }
        }

        // @name _parseData
        // @desc function to parse the bound data and fill gaps with default values
        // @params {Object} data - the bound data that needs to parsed and checked
        // @return {Object} cdata - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            // (note: only if copy is required)
            var cdata = angular.copy(data);

            // return the parsed data
            return cdata;
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name show
        // @desc function to show the overlay loader
        // @return {Promise(Boolean)} - the promise with resolve as true or false
        function show() {
            return new Promise(function(resolve) {
                // only proceed if the loader
                // is not currently visible
                if(ctrl.isLoading) {
                    console.warn("overlay-loader.component.js: The " + ctrl.name + " loader is already visible and loading.");
                    return resolve(false); // resolve the promimse with false immediately
                }

                ctrl.isLoading = true; // set visible flag as true
                clearTimeout(_showTimer); // clear any previous timers
                ScopeService.digest($scope); // update the component scope

                // resolve the promise with true
                // when the animation completes
                _showTimer = setTimeout(function() {
                    return resolve(true);
                }, _duration.anim);
            });
        };

        // @name hide
        // @desc function to hide the overlay loader
        // @return {Promise(Boolean)} - the promise with resolve as true or false
        function hide() {
            return new Promise(function(resolve) {
                // only proceed if the loader
                // is already currently visible
                if(!ctrl.isLoading) {
                    console.warn("overlay-loader.component.js: The " + ctrl.name + " loader is already hidden and not loading.");
                    return resolve(false); // resolve the promimse with false immediately
                }

                ctrl.isLoading = false; // set visible flag as false
                clearTimeout(_hideTimer); // clear any previous timers
                ScopeService.digest($scope); // update the component scope

                // resolve the promise with true
                // when the animation completes
                _hideTimer = setTimeout(function() {
                    return resolve(true);
                }, _duration.anim);
            });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit    = _onInit;     // function for on init
        ctrl.$postLink  = _onPostLink; // function for on post link
        ctrl.$onChanges = _onChanges;  // function for on binding changes

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            // clear the timers in the component
            clearTimeout(_showTimer);
            clearTimeout(_hideTimer);
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.show = show; // function to show the overlay loader
        ctrl.hide = hide; // function to hide the overlay loader
    }

    /**
        * @name OverlayLoaderTemplate
        * @desc Class for the overlay loader template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function OverlayLoaderTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "overlay-loader.template.html";
    }

    /**
        * @name overlayLoader
        * @desc Function for the overlay loader component.
        * @return {Object} - The instance of the component function
    **/
    var overlayLoader = function() {
        return {
            controller: OverlayLoaderController,
            templateUrl: OverlayLoaderTemplate,
            bindings: { name: "@", position: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("overlayLoader", overlayLoader); // set component

})();
