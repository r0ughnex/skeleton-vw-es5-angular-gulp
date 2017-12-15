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
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} LoaderService - the custom loader service
        * @return {Object} - The instance of the controller class
    **/
    function SampleFormController($scope, $element, CONFIG, ScopeService, LoaderService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl       = this;   // to capture the context of this
        ctrl.CONFIG    = CONFIG; // reference to the config constant
        ctrl.isLoading = false;  // flag to indicate if the form is loading

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
        function _onPostLink() {
            // check if the form data is empty
            // or contains any pre-filled data
            // (note: the timeout is to ensure
            // that the form bindings update)
            setTimeout(function() {
                // loop through each pre-filled item in the form data
                Object.keys(ctrl.data).forEach(function(field, index) {
                    var value   = ctrl.data[field]; // get the value
                    var element = ctrl.form[field]; // get the element

                    /*
                    console.log("-------------");
                    console.log("field:", field);
                    console.log("value:", value); */

                    // set the form field as dirty
                    // (for the errors to be visible)
                    if(typeof element !== "undefined" &&
                       typeof element.$setDirty === "function") {
                        element.$setDirty(true); // set field dirty
                    }

                    // if there are nested items
                    // in the parent form data
                    else {
                        // loop through each nested item in the parent form data
                        Object.keys(value).forEach(function(ifield, iindex) {
                            // note: this is specifically meant
                            // for type_pv, type_cv and type_no
                            ifield = field + "_" + ifield;    // get the inner key
                            var ivalue   = ctrl.data[ifield]; // get the inner value
                            var ielement = ctrl.form[ifield]; // get the inner element

                            /*
                            console.log("---------------");
                            console.log("ifield:", ifield);
                            console.log("ivalue:", ivalue); */

                            // set the inner form field as dirty
                            // (for the inner errors to be visible)
                            if(typeof ielement !== "undefined" &&
                               typeof ielement.$setDirty === "function") {
                                ielement.$setDirty(true); // set field dirty
                            }
                        });
                    }

                    // trigger the onPostcodeChange
                    // event manually when a bound
                    // postcode form value exists
                    if(field === "postcode") {
                        // note: the timeout is to ensure
                        // that the form bindings update
                        setTimeout(function() {
                            onPostcodeChange(value, null);
                            // update the component scope
                            ScopeService.digest($scope);
                        }, CONFIG.timeout.scope);
                    }
                });

                // update the component scope
                ScopeService.digest($scope);
            }, CONFIG.timeout.scope);
        }

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

            // TO-DO: Check if the form select
            // data, if given are valid and
            // are in the list of options

            // get the keys that exist in
            // both the form data and options
            var dataKeys   = Object.keys(cdata);
            var optionKeys = Object.keys(ctrl.options);

            // loop through each key in the form data
            dataKeys.forEach(function(dataKey, index) {
                // get the current form data
                var thisData = cdata[dataKey];

                // check if the data has options
                if(optionKeys.includes(dataKey)) {
                    // get the options for the form data
                    var thisOptions = ctrl.options[dataKey];

                    // check if the given value matches any of the set options
                    var matchedData = thisOptions.find(function(option, oindex) {
                        return thisData === option.value;
                    });

                    // reset the data if no match is founc
                    if(typeof matchedData === "undefined") {
                        cdata[dataKey] = null; // reset data
                    }
                }
            });

            // return the parsed data
            return cdata;
        }

        // @name _printData
        // @desc function to recursively print the given form data as key-value pairs
        // @param {Object} data - the form data that contains the key-value pairs to be printed
        // @param {String} pkey - the key from the parent recursion for the key-value pair to be printed
        function _printData(data, pkey) { try {
            // loop through all the items in the given data
            Object.keys(data).forEach(function(key, index) {
                var value = data[key]; // get the current item value
                // check if the item contains any nested child items
                if(typeof value !== "object" && !Array.isArray(value)) {
                    // print the current key-value pair with the parent key
                    print((pkey ? (pkey + ".") : "") + key + ": " + value);
                }

                // recurse on the child items
                else { _printData(value, key) }
            }); }

            // on any errors during the print
            catch(error) { console.log(error); }
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
            if(typeof isValid !== "boolean" || isValid) {
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

            // only proceed if the form
            // is currently not loading
            if(ctrl.isLoading) { return false; }

            // only proceed if the data is
            // not empty and form is valid
            if(!data || !isValid) { return false; }

            print("------------------------------------------------------------------------------------");
            print("sample-form.controller.js: This submitted form is", (isValid ? "valid." : "invalid."));
            print("sample-form.controller.js: This submitted form data is:");
            _printData(data, null); // recursively print the submitted data

            // show the loader when the form is started (to disable user interaction)
            ctrl.isLoading = true; // set the loading flag to true (before loader show)
            LoaderService.showOverlayLoader("sample-form").then(function(isShowSuccess) {
                console.log("------------------------------------------------------");
                console.log("sample-form.controller.js: Showing the overlay loader:");
                console.log("isShowSuccess:", isShowSuccess);

                // TO-DO: add code to submit the form
                // here and hide the loader when done
                // (the timeout is just a simulation)

                // hide the loader when the form submit
                // finishes (to allow user interaction)
                setTimeout(function() {
                    LoaderService.hideOverlayLoader("sample-form").then(function(isHideSuccess) {
                        console.log("-----------------------------------------------------");
                        console.log("sample-form.controller.js: Hiding the overlay loader:");
                        console.log("isHideSuccess:", isHideSuccess);

                        // set the loading flag to false (after loader hide)
                        ctrl.isLoading = false; ScopeService.digest($scope);
                    });  // showOverlayLoader() end
                }, (CONFIG.timeout.scope * 6));
            }); // showOverlayLoader() end
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

            // reset all flags to their default values
            ctrl.isLoading = false;
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
