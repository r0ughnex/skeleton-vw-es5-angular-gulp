"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Sample Form
// -------------------------------------
/**
    * @name sample-form.component
    * @desc The sample form component for the app.
**/
(function() {
    console.log("components/sample-form.component.js loaded.");

    /**
        * @name SampleFormController
        * @desc Class for the sample form controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the controller class
    **/
    function SampleFormController($scope, $element, CONFIG) {
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

        ctrl.pattern = { // reference to the patterns used on the input fields for validation
            email: /^([a-zA-Z0-9_\-\.]+)@([a-z0-9-]{2,6})+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/, // email - a slightly more stricter version of email
            name : /^(?=^[^\s'-]*[\s'-]?[^\s'-]*$)[a-zA-Z\s'-]{2,}$/, // name - only alphabets with one space, apostrophe (or) dash
            phone: /^\+?\d{10,13}$/, // phone - only australia mobiles and phones
            postcode: /^\d+$/ // post - only numbers without spaces
        };

        ctrl.data    = { }; // reference to the data bound to the form
        ctrl.form    = { }; // reference to the form containing the bound data
        ctrl.options = { }; // reference to the available options for the form data

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
        function _parseAttributes(ctrl) { /* empty block */ }

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

            // reset all references to objects and arrays
            ctrl.data = ctrl.form = ctrl.options = { };
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name SampleFormTemplate
        * @desc Class for the sample form template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function SampleFormTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "sample-form.template.html";
    }

    /**
        * @name sampleForm
        * @desc Function for the sample form component.
        * @return {Object} - The instance of the component function
    **/
    var sampleForm = function() {
        return {
            controller: SampleFormController,
            templateUrl: SampleFormTemplate,
            bindings: { data: "<", options: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("sampleForm", sampleForm); // set component
})();
