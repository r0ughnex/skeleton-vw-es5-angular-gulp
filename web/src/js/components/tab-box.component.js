"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Tab Box
// -------------------------------------
/**
    * @name tab-box.component
    * @desc The tab box component for the app.
**/
(function() {
    console.log("components/tab-box.component.js loaded.");

    /**
        * @name TabBoxController
        * @desc Class for the tab-box controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Service} $filter - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the controller class
    **/
    function TabBoxController($scope, $element, $filter, CONFIG) {
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
            switch(ctrl.type) {
                case "icon": { ctrl.type = "icon";     break; } // type - icon
                default:     { ctrl.type = "contents"; break; } // type - contents
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

            // flag to indicate if any of
            // the child item is active
            var hasActiveChild = false;

            // parse each of the bound child items and replace
            //  any missing information with default values
            data.children.forEach(function(child, index) {
                // check if any of the child items are active
                // and set the hasActiveChild flag as true
                if(child.isActive) { hasActiveChild = true; }

                // check if child attributes exist else
                // create a empty child attribute object
                if(!child.attr)       { child.attr = {}; } // empty attribute object
                if(!child.attr.color) { child.attr.color = "white"; } // default color
            });

            // if none of the child items are active set the first
            //  child item in the list as active and show the tab
            try { if(!hasActiveChild) { showTab(data.children[0]); }}
            catch(error) { console.log(error); }

            // return the parsed data
            return data;
        }

        // @name _getActiveTab
        // @desc function to get the current active tab
        // @return (Object) - the current tab that is set as active
        function _getActiveTab() {
            try { return $filter('filter')(ctrl.data.children, { isActive: true })[0]; }
            catch(error) { console.log(error); return null; }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name hideTab
        // @desc function to hide the given tab and set it as inactive
        // @param (Object) tab - the tab to be set as the inactive tab
        // @param (Event) event - the event that triggered this function
        function hideTab(tab, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // set the tab as inactive only
            // if it is the active tab
            if(tab && tab.isActive) {
                tab.isActive = false;
            }
        }

        // @name showTab
        // @desc function to show the given tab and set it as active
        // @param (Object) tab - the tab to be set as the active tab
        // @param (Event) event - the event that triggered this function
        function showTab(tab, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // set the tab as active only
            // if it is not the active tab
            if(tab && !tab.isActive) {
                hideTab(_getActiveTab()); // set current active as inactive
                tab.isActive = true; // set this tab as the active tab
            }
        }

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
        ctrl.hideTab = hideTab; // function to hide the given tab and set it as inactive
        ctrl.showTab = showTab; // function to show the given tab and set it as active
    }

    /**
        * @name TabBoxTemplate
        * @desc Class for the tab-box template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function TabBoxTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "tab-box.template.html";
    }

    /**
        * @name tabBox
        * @desc Function for the tab-box component.
        * @return {Object} - The instance of the component function
    **/
    var tabBox = function() {
        return {
            controller: TabBoxController,
            templateUrl: TabBoxTemplate,
            bindings: { data: "<", type: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("tabBox", tabBox); // set component
})();
