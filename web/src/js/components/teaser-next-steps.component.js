"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Teaser Next Steps
// -------------------------------------
/**
    * @name teaser-next-steps.component
    * @desc The next steps teaser component for the app.
**/
(function() {
    console.log("components/teaser-next-steps.component.js loaded.");

    /**
        * @name TeaserNextStepsController
        * @desc Class for the next steps teaser controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} DataService - The custom data service
        * @return {Object} - The instance of the controller class
    **/
    function TeaserNextStepsController($scope, $element, CONFIG, DataService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _dataCount = 1; // reference to the no.of. columns in each row of data

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
            switch(ctrl.type) {
                case "x1": { ctrl.type = "x1"; _dataCount = 1; break; } // type - x1
                case "x2": { ctrl.type = "x2"; _dataCount = 2; break; } // type - x2
                default:   { ctrl.type = "x3"; _dataCount = 3; break; } // type - x3
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

            // check if data attributes exist else
            // create a empty data attribute object
            if(!data.attr) {  data.attr = {}; }

            // parse the data attributes
            switch(data.attr.align) {
                case "right": { data.attr.align = "right"; break; } // right aligned (h)
                default:      { data.attr.align = "left";  break; } // left aligned (h)
            }

            // group the data into rows with x no.of. items in each column
            data.children = DataService.groupData(data.children,  _dataCount);

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
        * @name TeaserNextStepsTemplate
        * @desc Class for the next steps teaser template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function TeaserNextStepsTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "teaser-next-steps.template.html";
    }

    /**
        * @name teaserNextSteps
        * @desc Function for the next steps teaser component.
        * @return {Object} - The instance of the component function
    **/
    var teaserNextSteps = function() {
        return {
            controller: TeaserNextStepsController,
            templateUrl: TeaserNextStepsTemplate,
            bindings: { data: "<", type: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("teaserNextSteps", teaserNextSteps); // set component
})();
