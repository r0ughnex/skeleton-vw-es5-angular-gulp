"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Controller - App
// -------------------------------------
/**
    * @name app.controller
    * @desc The app controller for the app,
            declared inline as directive or
            in the state CONFIG as a controller.
**/
(function() {
    console.log("controllers/app.controller.js loaded.");

    /**
        * @name AppController
        * @desc Class for the app controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $state - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} DataService - the custom data service
        * @param {Service} DominantColorService - The custom dominant color service
        * @return {Object} - The instance of the controller class
    **/
    function AppController($scope, $state, CONFIG, ScopeService, DataService, DominantColorService) {
        "ngInject"; // tag this function for dependency injection

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

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() { /* empty block */ }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() { /* empty block */ }

        // @name _registerDigestListener
        // @desc internal function to count the no.of times
        //       $rootScope.$digest is called, for the purpose
        //       of optimizing performance on the app. The less
        //       it"s called, the better. ( only works in dev mode )
        function _registerDigestListener() {
            // reset the digest count
            // and set a digest timer
            var digestCount = 0;
            var digestTimer = null;

            // this watch will be triggered
            // everytime $scope.$apply is triggered
            _registeredListeners.push($scope.$watch(function() {
                // clear any previous timers
                // increase the digest count
                clearTimeout(digestTimer);
                digestTimer = null;
                digestCount++;

                // set a reset timer
                digestTimer = setTimeout(function(){
                    // print the current total digest count
                    // and reset the digest count
                    console.log("app.controller.js: $rootScope.$digest() calls triggered on this cycle: " + digestCount);
                    digestCount = 0;
                }, CONFIG.timeout.scope);
            }));
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

        // only register digest listener if this is not production mode
        if(!CONFIG.environment.isProd) { _registerDigestListener(); }

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            _registeredListeners.forEach(function(deregisterListener) {
                deregisterListener();
            });
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name appLink
        * @desc Function for post link on the app controller directive.
        * @param {Object} scope - The scope within which the directive exists
        * @param {Object} element - The wrapped element to which the directive is attached
        * @param {Object} attrs - The attributes of the element that contains the directive
        * @param {Object} ctrl - The instance of controller which is used in the directive
        * @return {Object} - The instance of the link function
    **/
    var appLink = function(scope, element, attrs, ctrl) { /* empty block */ };

    /**
        * @name appController
        * @desc Function for the app controller directive.
        * @return {Object} - The instance of the controller function
    **/
    var appController = function() {
        return {
            retrict: "A", scope: true, controller: AppController,
            controllerAs: "$ctrl_app", bindToController: true, link: appLink
        };
    };

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("appController", appController)   // set directive
        .controller("AppController", AppController); // set controller

})();
