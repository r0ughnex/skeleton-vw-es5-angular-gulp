"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// base
require("../base/query");
require("../base/event");
require("../base/debounce");

// -------------------------------------
//  Component - Footer
// -------------------------------------
/**
    * @name footer.component
    * @desc The footer component for the app.
**/
(function() {
    console.log("components/footer.component.js loaded.");

    /**
        * @name FooterController
        * @desc Class for the footer controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom data service
        * @param {Service} PageService - The custom page service
        * @return {Object} - The instance of the controller class
    **/
    function FooterController($scope, $element, CONFIG, ScopeService, PageService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el = null; // reference to the DOM element
        var _elPage = null; // reference to the page DOM element
        var _scrollTimer = null; // reference to the page scroll timer

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl    = this;   // to capture the context of this
        ctrl.CONFIG = CONFIG; // reference to the config constant

        ctrl.year = null; // reference to the current year
        ctrl.disclaimer = null; // reference to the disclaimer
        ctrl.isToTopVisible = false; // flag to indicate if back to top is visible

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            // parse the bound data
            ctrl.data = _parseData(ctrl.data);
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            // get the DOM elements
            _el = $element[0]; // main element
            _elPage = PageService.getPage(); // page element

            // attach footer show and hide
            // listener to the page scroll
            _addScrollListener();

            // manually trigger the page scroll
            // event atleast once on page load
            setTimeout(function() {
                var event = new CustomEvent("scroll"); // create event
                _elPage.dispatchEvent(event); // dispatch created event
            }, CONFIG.timeout.scope * 6);
        }

        // @name _onChanges
        // @desc function for on binding changes
        function _onChanges() { /* empty block */ }

        // @name _addScrollListener
        // @desc function to add a scroll listener to the page
        function _addScrollListener() {
            // attach footer show and hide to the page scroll
            _elPage.addEventListener("scroll", _onScrollListener);
        }

        // @name _removeScrollListener
        // @desc function to remove the scroll listener from the page
        function _removeScrollListener() {
            // remove footer show and hide from the page scroll
            _elPage.removeEventListener("scroll", _onScrollListener);
        }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            var date = new Date(); // create a new date object
            ctrl.year = date.getFullYear(); // set the current year

            // split the data copy into sentances
            var sentances = data.copy ? data.copy.split(". ") : [];

            // check if the sentances can  be split into two columns
            if(sentances.length > 1) {
                var disclaimer = { left: "", right: "" };
                var leftCount = Math.ceil(sentances.length / 2); // left column count
                var rightCount = (sentances.length - leftCount); // right column count

                // populate the sentances in the left column
                for(var i = 0; i < leftCount; i++) {
                    if(i > 0 ) { disclaimer.left += ". "; }
                    disclaimer.left += sentances[i];
                    if(i == (leftCount - 1)) { disclaimer.left += "."; }
                }

                // populate the sentances in the right column
                for(var j = leftCount; j < (leftCount + rightCount); j++) {
                    if(j > leftCount) { disclaimer.right += ". "; }
                    disclaimer.right += sentances[j];
                }

                // set the disclaimer from the copy
                ctrl.disclaimer = disclaimer;
            }

            // if the sentances cannot be split into 2 columns
            else { ctrl.disclaimer = data.copy; }

            // return the parsed data
            return data;
        }

        // @name _onScrollListener
        // @desc function to be executed on page scroll event
        // @param (Event) event - the event that triggered this function
        var _onScrollListener = debounce(function(event) {
            // check if the page has scrolled beyond the viewport
            if(_elPage.scrollTop > (window.innerHeight / 2)) {
                // if so set visibility flag as true
                ctrl.isToTopVisible = true;

                // clear the previously set timer
                if(_scrollTimer != null) {
                    clearTimeout(_scrollTimer);
                    _scrollTimer = null;
                }

                // manually add the enter complete class if
                // the animation completion did not add it
                // to the element after a set timeout
                _scrollTimer = setTimeout(function() { try {
                    var elTop = query(".footer__back-to-top", _el)[0];
                    var enterCompleteClass = elTop.getAttribute("enter-complete-class");

                    if(!elTop.classList.contains(enterCompleteClass)) {
                        elTop.classList.add(enterCompleteClass); }}

                    catch(error) { console.log(error); /* do nothing */ }
                }, CONFIG.timeout.animation * 2);
            }

            // if the page is stil
            // within the viewport
            else {
                // if not set visibility flag as false
                ctrl.isToTopVisible = false;

                // clear the previously set timer
                if(_scrollTimer != null) {
                    clearTimeout(_scrollTimer);
                    _scrollTimer = null;
                }
            }

            // update the data in the scope
            ScopeService.digest($scope);
        }, CONFIG.timeout.scope / 4);

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name scrollToTop
        // @desc function to scroll to the top of the page
        // @param (Event) event - the event that triggered this function
        function scrollToTop(event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // set visibility flag as false
            ctrl.isToTopVisible = false;

            // scroll to the top
            PageService.scrollToTop();
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
            // remove footer show and hide
            // listener from the page scroll
            _removeScrollListener();
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.scrollToTop = scrollToTop; // function to scroll to the top of the page
    }

    /**
        * @name FooterTemplate
        * @desc Class for the footer template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function FooterTemplate(CONFIG) {
        "ngInject";
        return CONFIG.path.templates + "footer.template.html";
    }

    /**
        * @name footer
        * @desc Function for the footer component.
        * @return {Object} - The instance of the component function
    **/
    var footer = function() {
        return {
            controller: FooterController,
            templateUrl: FooterTemplate,
            bindings: { data: "<" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("footer", footer); // set component
})();
