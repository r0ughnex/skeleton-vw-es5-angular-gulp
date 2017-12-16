"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Teaser Image Small
// -------------------------------------
/**
    * @name teaser-image-small.component
    * @desc The teaser image small component for the app.
**/
(function() {
    console.log("components/teaser-image-small.component.js loaded.");

    /**
        * @name TeaserImageSmallController
        * @desc Class for the teaser image small controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the controller class
    **/
    function TeaserImageSmallController($scope, $element, CONFIG) {
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

        // @name _onChanges
        // @desc function for on binding changes
        function _onChanges() { /* empty block */ }

        // @name _parseAttributes
        // @desc function to parse the bound attributes and fill gaps with default values
        // @params {Object} ctrl - the controller that the attributes have been bound to
        function _parseAttributes(ctrl) {
            // parse the component type
            switch(ctrl.type) {
                case "alt": { ctrl.type = "alt";     break; } // type - alt
                default:    { ctrl.type = "default"; break; } // type - default
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

            // check if data attributes exist else
            // create a empty data attribute object
            if(!cdata.attr) {  cdata.attr = {}; }

            // parse the data attributes
            switch(cdata.attr.align) {
                case "top":    { cdata.attr.align = "top";    break; } // top aligned (v)
                case "center": { cdata.attr.align = "center"; break; } // center aligned (v)

                default: {
                    if(ctrl.type == "alt") { cdata.attr.align = "top"; } // type alt - top aligned (v)
                    else { cdata.attr.align = "center"; } // type default - default center aligned (v)
                    break;
                }
            }

            // return the parsed data
            return cdata;
        }

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
        $scope.$on("$destroy", function() { /* empty block */ });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name TeaserImageSmallTemplate
        * @desc Class for the teaser image small template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function TeaserImageSmallTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "teaser-image-small.template.html";
    }

    /**
        * @name teaserImageSmall
        * @desc Function for the teaser image small component.
        * @return {Object} - The instance of the component function
    **/
    var teaserImageSmall = function() {
        return {
            controller: TeaserImageSmallController,
            templateUrl: TeaserImageSmallTemplate,
            bindings: { data: "<", type: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("teaserImageSmall", teaserImageSmall); // set component
})();
