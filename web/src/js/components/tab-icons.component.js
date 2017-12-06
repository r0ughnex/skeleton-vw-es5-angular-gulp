"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Tab Icons
// -------------------------------------
/**
    * @name tab-icons.component
    * @desc The tab icons component for the app.
**/
(function() {
    console.log("components/tab-icons.component.js loaded.");

    /**
        * @name TabIconsController
        * @desc Class for the tab-icons controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the controller class
    **/
    function TabIconsController($scope, $element, CONFIG) {
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

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            _parseAttributes(ctrl); // parse the bound attributes
            ctrl.data = _parseData(ctrl.data); // parse bound data
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() { /* empty block */ }

        // @name _parseAttributes
        // @desc function to parse the bound attributes and
        //       replace any missing information with default values
        // @params {Object} ctrl - the controller attributes are bound to
        function _parseAttributes(ctrl) {
            // parse the component color
            if(!ctrl.color || !ctrl.color.length) {
                ctrl.color = "white"; // default color
            }
        }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            // parse each of the bound child items and replace
            //  any missing information with default values
            data.children.forEach(function(child, index) {
                // check if child attributes exist else
                // create a empty child attribute object
                if(!child.attr)      { child.attr = {}; } // empty attribute object
                if(!child.attr.name) { child.attr.name = "help"; } // default name
            });

            // return the parsed data
            return data;
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
        * @name TabIconsTemplate
        * @desc Class for the tab-icons template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function TabIconsTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "tab-icons.template.html";
    }

    /**
        * @name tabIcons
        * @desc Function for the tab-icons component.
        * @return {Object} - The instance of the component function
    **/
    var tabIcons = function() {
        return {
            controller: TabIconsController,
            templateUrl: TabIconsTemplate,
            bindings: { data: "<", type: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("tabIcons", tabIcons); // set component
})();
