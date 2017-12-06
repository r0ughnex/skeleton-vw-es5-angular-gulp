"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Teaser Image Big
// -------------------------------------
/**
    * @name teaser-image-big.component
    * @desc The teaser image big component for the app.
**/
(function() {
    console.log("components/teaser-image-big.component.js loaded.");

    /**
        * @name TeaserImageBigController
        * @desc Class for the teaser image big controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the controller class
    **/
    function TeaserImageBigController($scope, $element, CONFIG) {
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
            // parse the component type
            if(ctrl.data.cta && ctrl.data["cta-alt"]) { ctrl.type = "alt"; } // type - alt
            else { ctrl.type = "default"; }  // type - default
        }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            // check if data attributes exist else
            // create a empty data attribute object
            if(!data.attr) {  data.attr = {}; }

            // parse the data attributes
            switch(data.attr.align) {
                case "right": { data.attr.align = "right"; break; } // right aligned (h)
                default:      { data.attr.align = "left";  break; } // left aligned (h)
            }

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
        * @name TeaserImageBigTemplate
        * @desc Class for the teaser image big template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function TeaserImageBigTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "teaser-image-big.template.html";
    }

    /**
        * @name teaserImageBig
        * @desc Function for the teaser image big component.
        * @return {Object} - The instance of the component function
    **/
    var teaserImageBig = function() {
        return {
            controller: TeaserImageBigController,
            templateUrl: TeaserImageBigTemplate,
            bindings: { data: "<", type: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("teaserImageBig", teaserImageBig); // set component
})();
