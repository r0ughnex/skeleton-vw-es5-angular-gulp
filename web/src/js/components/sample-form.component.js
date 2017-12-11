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
        ctrl.options = {    // reference to the available options for the form data
            // options available
            // for the countries
            country: [
                { value: "AUS", name: "Australia" }
            ],

            // options available
            // for the states
            state: [
                { value: "ACT", name: "Australian Capital Territory" },
                { value: "NSW", name: "New South Wales"    },
                { value: "NT" , name: "Northern Territory" },
                { value: "QLD", name: "Queensland"         },
                { value: "SA" , name: "South Australia"    },
                { value: "TAS", name: "Tasmania"           },
                { value: "VIC", name: "Victoria"           },
                { value: "WA" , name: "Western Australia"  }
            ]
        };

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

        // @name _getState
        // @desc To-DO: TBC
        // @param To-DO: TBC
        // @return To-DO: TBC
        function _getState(postcode) {
            postcode = parseInt(postcode);

            if(
               typeof postcode !== "number"
               || isNaN(postcode)) {
                return null;
            }

            else if(
               (postcode >=  200 && postcode <=  299) ||
               (postcode >= 2600 && postcode <= 2618) ||
               (postcode >= 2900 && postcode <= 2920)) {
                return "ACT";
            }

            else if(
                (postcode >= 1000 && postcode <= 1999) ||
                (postcode >= 2000 && postcode <= 2599) ||
                (postcode >= 2619 && postcode <= 2898) ||
                (postcode >= 2921 && postcode <= 2999)) {
                return "NSW";
            }

            else if(
               (postcode >=  800 && postcode <=  899) ||
               (postcode >=  900 && postcode <=  999)) {
                return "NT";
            }

            else if(
               (postcode >= 4000 && postcode <= 4999) ||
               (postcode >= 9000 && postcode <= 9999)) {
                return "QLD";
            }

            else if(
               (postcode >= 5000 && postcode <= 5799) ||
               (postcode >= 5800 && postcode <= 5999)) {
                return "SA";
            }

            else if(
               (postcode >= 7000 && postcode <= 7799) ||
               (postcode >= 7800 && postcode <= 7999)) {
                return "TAS";
            }

            else if(
               (postcode >= 3000 && postcode <= 3999) ||
               (postcode >= 8000 && postcode <= 8999)) {
                return "VIC";
            }

            else if(
               (postcode >= 6000 && postcode <= 6797) ||
               (postcode >= 6800 && postcode <= 6999)) {
                return "WA";
            }

            else { return null; }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name onPostcodeChange
        // @desc To-DO: TBC
        // @param To-DO: TBC
        // @param To-DO: TBC
        // @return To-DO: TBC
        function onPostcodeChange(postcode, isValid) {
            if(isValid) {
                ctrl.data.state = _getState(postcode);
                return true;
            }

            else {
                ctrl.data.state = _getState(null);
                return false;
            }
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

            // reset all references to objects and arrays
            ctrl.data = ctrl.form = ctrl.options = { };
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.onPostcodeChange = onPostcodeChange; // To-DO: TBC
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
            bindings: { data: "<" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("sampleForm", sampleForm); // set component
})();
