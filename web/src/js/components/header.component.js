"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Header
// -------------------------------------
/**
    * @name header.component
    * @desc The header component for the app.
**/
(function() {
    console.log("components/header.component.js loaded.");

    /**
        * @name HeaderController
        * @desc Class for the header controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ListenerService - The custom listener service
        * @param {Service} HeaderService - The custom header service
        * @return {Object} - The instance of the controller class
    **/
    function HeaderController($scope, $element, CONFIG, ListenerService, HeaderService) {
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
        var ctrl       = this;   // to capture the context of this
        ctrl.CONFIG    = CONFIG; // reference to the config constant
        ctrl.isVisible = false;  // flag to check if the header is visible

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            // set the header scope
            HeaderService.setScope($scope);
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            // set the header element
            HeaderService.setElement($element);
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

        // watch for changes to visibility
        _registeredListeners.push($scope.$watch(
            // function to watch for changes
            function() { return HeaderService.isVisible; },

            // function to handle the changes
            function(isVisible) {
                // set the visibility flag if it
                // is not the current set value
                if(ctrl.isVisible != isVisible) {
                    ctrl.isVisible = isVisible;
                }
            }
        ));

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            ListenerService.unbind(_registeredListeners);
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name HeaderTemplate
        * @desc Class for the header template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function HeaderTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "header.template.html";
    }

    /**
        * @name header
        * @desc Function for the header component.
        * @return {Object} - The instance of the component function
    **/
    var header = function() {
        return {
            controller: HeaderController,
            templateUrl: HeaderTemplate
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("header", header); // set component
})();
