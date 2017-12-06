"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("plugin-inline-video");
**/

// base
require("../base/query");
require("../base/event");
require("../base/debounce");

// -------------------------------------
//   Component - Inline Video
// -------------------------------------
/**
    * @name inline-video.component
    * @desc The inline video component for the app.
**/
(function() {
    console.log("components/inline-video.component.js loaded.");

    /**
        * @name InlineVideoController
        * @desc Class for the inline video controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} PageService - The custom page service
        * @return {Object} - The instance of the controller class
    **/
    function InlineVideoController($scope, $element, CONFIG, PageService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el = null; // reference to the DOM element
        var _elPage = null; // reference to the page DOM element
        var _elVideo = null; // reference to the video DOM element
        var _inlineVideo = null; // reference to the inline video

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
        function _onInit() { /* empty block */ }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            // get the DOM elements
            _el = $element[0]; // main element
            _elPage = PageService.getPage(); // page element
            _elVideo = query(".inline-video", _el)[0]; // video element

            // create a new inline video
            _inlineVideo = new InlineVideo({
                 // set the source element
                element: _elVideo,

                source: { // set the source folders
                    desktop: ctrl.data.video.desktop, // desktop
                    tablet:  ctrl.data.video.tablet,  // tablet
                    mobile:  ctrl.data.video.mobile   // mobile
                }
            });

            // attach video play and stop
            // listener to the page scroll
            _addScrollListener();

            // manually trigger the page scroll
            // event atleast once on page load
            /* setTimeout(function() {
                var event = new CustomEvent("scroll"); // create event
                _elPage.dispatchEvent(event); // dispatch created event
            }, CONFIG.timeout.scope * 6); */
            // note: this trigger is not required because
            // the footer component takes care of this now
        }

        // @name _addScrollListener
        // @desc function to add a scroll listener to the page
        function _addScrollListener() {
            // attach video play and stop to the page scroll
            _elPage.addEventListener("scroll", _onScrollListener);
        }

        // @name _removeScrollListener
        // @desc function to remove the scroll listener from the page
        function _removeScrollListener() {
            // remove video play and stop from the page scroll
            _elPage.removeEventListener("scroll", _onScrollListener);
        }

        // @name _isVideoInView
        // @desc function to check if the given video element is in view
        // @param {DOM} elem - the video element to be checked for being in view
        // @return {Boolean} - true (or) false depending on whether the element is in view
        function _isVideoInView(elem) {
            var classList = elem.classList;
            var style = getComputedStyle(elem);
            var rect = elem.getBoundingClientRect();

            return (
                (style["display"] != "none") &&
                rect.left >= (0 - (rect.width / 2)) &&
                rect.right <= ((window.innerWidth || _elHtml.clientWidth) + (rect.width / 2)) &&

                rect.top >= (0 - (rect.height / 2)) &&
                rect.bottom <= ((window.innerHeight || _elHtml.clientHeight) + (rect.height / 2))
            );
        }


        // @name _onScrollListener
        // @desc function to be executed on page scroll event
        // @param (Event) event - the event that triggered this function
        var _onScrollListener = debounce(function(event) {
            // check if the video element is in view
            // play video if is in view
            if(_isVideoInView(_elVideo)) {
                // play video if is in view
                _inlineVideo.play();
            }

            // stop video if not in view
            else { _inlineVideo.stop(); }
        }, CONFIG.timeout.scope / 4);

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
        $scope.$on("$destroy", function() {
            // remove video play and stop
            // listener from the page scroll
            _removeScrollListener();
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name InlineVideoTemplate
        * @desc Class for the inline video template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function InlineVideoTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "inline-video.template.html";
    }

    /**
        * @name inlineVideo
        * @desc Function for the inline video component.
        * @return {Object} - The instance of the component function
    **/
    var inlineVideo = function() {
        return {
            controller: InlineVideoController,
            templateUrl: InlineVideoTemplate,
            bindings: { data: "<" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("inlineVideo", inlineVideo); // set component
})();
