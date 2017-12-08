"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// base
require("../base/raf");

// -------------------------------------
//   Controller - Samples
// -------------------------------------
/**
    * @name samples.controller
    * @desc The samples controller for the app,
            declared inline as directive or
            in the state CONFIG as a controller.
**/
(function() {
    console.log("controllers/samples.controller.js loaded.");

    /**
        * @name SamplesController
        * @desc Class for the samples controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $state - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} DataService - the custom data service
        * @param {Service} PageService - The custom page service
        * @param {Service} LoaderService - the custom loader service
        * @return {Object} - The instance of the controller class
    **/
    function SamplesController($scope, $state, CONFIG, ScopeService, DataService, PageService, LoaderService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        // array that holds the deregister functions
        // from all the registered listeners
        var _registeredListeners = [];

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl    = this;   // to capture the context of this
        ctrl.CONFIG = CONFIG; // reference to the config constant

        ctrl.isVisible = false; // flag to indicate page is visible
        ctrl.hasErrors = false; // flag to indicate page has errors

        ctrl.data = { // reference to the data for the page

            // TO-DO: add data to be
            // used on the page here

        };

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() { try {
            // get the saved from and to state
            // objects from the parent controller
            var fromState = ctrl.parent.fromState;
            var toState   = ctrl.parent.toState;

            // if the from state name is valid
            if(typeof fromState.name === "string"
               && fromState.name.includes("app.")) {

                // show the current page, since it
                // is coming from a previous page
                if(!ctrl.isVisible) {
                    ctrl.isVisible = true;
                    ScopeService.digest($scope);
                }
            }}

            // on parent state object errors
            catch(error) { console.log(error); }
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            setTimeout(function() {
                LoaderService.showLoader().then(function() {

                    // TO-DO: add code to request
                    // the data for the page here
                    // (the timeout is a simulation)

                    // get the data for the footer component on the page
                    DataService.getData("footer").then(function(footerData) {
                        ctrl.data.footer = footerData; // set footer data
                    });

                    setTimeout(function() {
                        // show the current page,
                        // once data is available
                        if(!ctrl.isVisible) {
                            ctrl.isVisible = true;
                            ScopeService.digest($scope);
                        }

                        setTimeout(function() {
                            LoaderService.hideLoader().then(function() {

                                // TO-DO: add code to do something
                                // with the obtained page data here
                                // (the timeout is just a simulation)

                            });
                        }, (CONFIG.timeout.scope * 6));
                    }, (CONFIG.timeout.animation * 1));
                });
            }, 1);
        }

        // @name _onChanges
        // @desc function for on binding changes
        function _onChanges() { /* empty block */ }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit    = _onInit;     // function for on init
        ctrl.$postLink  = _onPostLink; // function for on post link
        ctrl.$onChanges = _onChanges;  // function for on binding changes

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            // deregister all listeners registered in the controller
            _registeredListeners.forEach(function(deregisterListener) {
                deregisterListener();
            });

            // reset all references to objects and arrays
            ctrl.data = { };

            // reset all flags to their default values
            ctrl.isVisible = ctrl.hasErrors = false;
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name samplesLink
        * @desc Function for post link on the samples controller directive.
        * @param {Object} scope - The scope within which the directive exists
        * @param {Object} element - The wrapped element to which the directive is attached
        * @param {Object} attrs - The attributes of the element that contains the directive
        * @param {Object} ctrl - The instance of controller which is used in the directive
        * @return {Object} - The instance of the link function
    **/
    var samplesLink = function(scope, element, attrs, ctrl) { /* empty block */ };

    /**
        * @name samplesController
        * @desc Function for the samples controller directive.
        * @return {Object} - The instance of the controller function
    **/
    var samplesController = function() {
        return {
            require:  { parent: '^^appController' },
            retrict: "A", scope: true, controller: SamplesController,
            controllerAs: "$ctrl_page", bindToController: true, link: samplesLink
        };
    };

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("samplesController", samplesController)   // set directive
        .controller("SamplesController", SamplesController); // set controller

})();
