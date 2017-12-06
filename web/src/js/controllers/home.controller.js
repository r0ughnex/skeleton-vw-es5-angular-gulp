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
//   Controller - Home
// -------------------------------------
/**
    * @name home.controller
    * @desc The home controller for the app,
            declared inline as directive or
            in the state CONFIG as a controller.
**/
(function() {
    console.log("controllers/home.controller.js loaded.");

    /**
        * @name HomeController
        * @desc Class for the home controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $state - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} DataService - the custom data service
        * @param {Service} PageService - The custom page service
        * @param {Service} LoaderService - the custom loader service
        * @return {Object} - The instance of the controller class
    **/
    function HomeController($scope, $state, CONFIG, ScopeService, DataService, PageService, LoaderService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl    = this;   // to capture the context of this
        ctrl.CONFIG = CONFIG; // reference to the config constant

        ctrl.page = { // reference to the flags for the page
            isVisible: false, // flag to indicate page visibility
            hasErrors: false  // flag to indicate page has errors
        };

        ctrl.data = { // reference to the data for the page
            // TO-DO add data that is
            // used on the page here
        };

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() { /* empty block */ }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {

            setTimeout(function() {
                LoaderService.showLoader().then(function() {

                    // TO-DO: add code to request
                    // the data for the page here
                    // (the timeout is a simulation)

                    setTimeout(function() {
                        ctrl.page.isVisible = true;
                        ScopeService.digest($scope);

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

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit   = _onInit;     // function for on init
        ctrl.$postLink = _onPostLink; // function for on post link

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() { /* empty block */ });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name homeLink
        * @desc Function for post link on the home controller directive.
        * @param {Object} scope - The scope within which the directive exists
        * @param {Object} element - The wrapped element to which the directive is attached
        * @param {Object} attrs - The attributes of the element that contains the directive
        * @param {Object} ctrl - The instance of controller which is used in the directive
        * @return {Object} - The instance of the link function
    **/
    var homeLink = function(scope, element, attrs, ctrl) { /* empty block */ };

    /**
        * @name homeController
        * @desc Function for the home controller directive.
        * @return {Object} - The instance of the controller function
    **/
    var homeController = function() {
        return {
            retrict: "A", scope: true, controller: HomeController,
            controllerAs: "$ctrl_home", bindToController: true, link: homeLink
        };
    };

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("homeController", homeController)   // set directive
        .controller("HomeController", HomeController); // set controller

})();
