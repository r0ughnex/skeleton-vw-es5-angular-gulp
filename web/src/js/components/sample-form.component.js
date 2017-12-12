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
        // @desc function to get the state for the given postcode
        // @param {Number} postcode - the given postcode to get the state for
        // @return {String} state - the state that corresponds to the given postcode
        function _getState(postcode) {
            // convert postcode to integer
            postcode = parseInt(postcode);

            // only proceed if the given
            // postcode is a valid integer
            if(
               typeof postcode !== "number"
               || isNaN(postcode)) {
                return null;
            }

            // match given postcode to
            // the corresponding state
            // postcode checks for ACT
            else if(
               (postcode >=  200 && postcode <=  299) ||
               (postcode >= 2600 && postcode <= 2618) ||
               (postcode >= 2900 && postcode <= 2920)) {
                return "ACT";
            }

            // postcode checks for NSW
            else if(
                (postcode >= 1000 && postcode <= 1999) ||
                (postcode >= 2000 && postcode <= 2599) ||
                (postcode >= 2619 && postcode <= 2898) ||
                (postcode >= 2921 && postcode <= 2999)) {
                return "NSW";
            }

            // postcode checks for NT
            else if(
               (postcode >=  800 && postcode <=  899) ||
               (postcode >=  900 && postcode <=  999)) {
                return "NT";
            }

            // postcode checks for QLD
            else if(
               (postcode >= 4000 && postcode <= 4999) ||
               (postcode >= 9000 && postcode <= 9999)) {
                return "QLD";
            }

            // postcode checks for SA
            else if(
               (postcode >= 5000 && postcode <= 5799) ||
               (postcode >= 5800 && postcode <= 5999)) {
                return "SA";
            }

            // postcode checks for TAS
            else if(
               (postcode >= 7000 && postcode <= 7799) ||
               (postcode >= 7800 && postcode <= 7999)) {
                return "TAS";
            }

            // postcode checks for VIC
            else if(
               (postcode >= 3000 && postcode <= 3999) ||
               (postcode >= 8000 && postcode <= 8999)) {
                return "VIC";
            }

            // postcode checks for WA
            else if(
               (postcode >= 6000 && postcode <= 6797) ||
               (postcode >= 6800 && postcode <= 6999)) {
                return "WA";
            }

            // if no match was found
            else { return null; }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name onPostcodeChange
        // @desc function triggered when the input postcode is changed
        // @param {Number} postcode - the changed value of the postcode
        // @param {Boolean} isValid - flag indicating if the postcode is valid
        // @return {Boolean} isSuccess - flag indicating on change success or failure
        function onPostcodeChange(postcode, isValid) {
            // check if the given
            // postcode is valid
            if(isValid) {
                // set state if the postcode is valid
                ctrl.data.state = _getState(postcode);
                return true; // exit the function
            }

            else {
                // set null if the postcode is invalid
                ctrl.data.state = _getState(null);
                return false; // exit the function
            }
        }

        // @name isTypeRequired
        // @desc function to determine if the given vehicle type is required or not
        // @param {String} type - the vehicle type to be determined as required or not
        // @return {Boolean} isRequired - the boolean flag indicating if it is required
        function isTypeRequired(type) { try {
            var data = ctrl.data;

            switch(type) {
                // all vehicle types
                // are treated same
                case "pv": case "cv":
                case "no": default: {
                    return (
                    !data.type.pv &&
                    !data.type.cv &&
                    !data.type.no);
                }
            }}

            // return false on any errors
            catch(error) { return false; }
        }

        // @name isTypeDisabled
        // @desc function to determine if the given vehicle type is disabled or not
        // @param {String} type - the vehicle type to be determined as disabled or not
        // @return {Boolean} isDisabled - the boolean flag indicating if it is disabled
        function isTypeDisabled(type) { try {
            var data = ctrl.data;

            switch(type) {
                // for when the user owns either
                // personal / commercial vehicles
                case "pv": case "cv": {
                    return data.type.no;
                }

                // when the user does
                // not own a vehicle
                case "no": {
                    return (data.type.pv ||
                            data.type.cv);
                }

                // for all other cases
                default: { return false; }
            }}

            // return false on any errors
            catch(error) { return false; }
        }

        // @name isTypeError
        // @desc function to determine if the given vehicle type has errored or not
        // @param {String} type - the vehicle type to be determined as errored or not
        // @return {Boolean} isError - the boolean flag indicating if it has errored
        function isTypeError(type) { try {
            var form = ctrl.form;

            switch(type) {
                // all vehicle types
                // are treated same
                case "pv": case "cv":
                case "no": default: {
                    return ((form.type_pv.$invalid  ||
                             form.type_cv.$invalid  ||
                             form.type_no.$invalid) &&

                            (form.type_pv.$dirty ||
                             form.type_cv.$dirty ||
                             form.type_no.$dirty));
                }
            }}

            // return false on any errors
            catch(error) { return false; }
        }

        // @name submitForm
        // @desc function to submit the form with the given data
        // @param {Object} data - the given form data to be submitted
        function submitForm(data, isValid, event) {
            if(event) { try {
                // stop event propogation
                event.preventDefault();
                event.stopPropagation();

                // blur the focussed button
                event.target.blur(); // <span>
                event.target.parentNode.blur(); // <a>
                } catch(error) { console.log(error); }
            }

            print("------------------------------------------------------------------------------------");
            print("sample-form.controller.js: This submitted form is", (isValid ? "valid." : "invalid."));
            print("sample-form.controller.js: This submitted form data is:");
            print("data:", data ? data : "data is not defined.");
            print("------------------------------------------------------------------------------------");

            // only proceed if the data is
            // not empty and form is valid
            if(!data || !isValid) { return false; }
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
        ctrl.onPostcodeChange = onPostcodeChange; // function triggered when the input postcode is changed
        ctrl.isTypeRequired   = isTypeRequired;   // function to determine if the given vehicle type is required or not
        ctrl.isTypeDisabled   = isTypeDisabled;   // function to determine if the given vehicle type is disabled or not
        ctrl.isTypeError      = isTypeError;      // function to determine if the given vehicle type has errored or not
        ctrl.submitForm       = submitForm;
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
