"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("swiper");
**/

// base
require("../base/query");

// -------------------------------------
//   Component - Shipping Carousel
// -------------------------------------
/**
    * @name shipping-carousel.component
    * @desc The shipping carousel component for the app.
**/
(function() {
    console.log("components/shpg-carousel.component.js loaded.");

    /**
        * @name ShippingCarouselController
        * @desc Class for the shipping carousel controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @return {Object} - The instance of the controller class
    **/
    function ShippingCarouselController($scope, $element, CONFIG, ScopeService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el  = null; // reference to the DOM element
        var _els = null; // reference to the slider DOM element

        var _swiper = null; // reference to the intialized swiper component
        var _timer  = { render: null, update: null }; // reference to timers

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl      = this;   // to capture the context of this
        ctrl.CONFIG   = CONFIG; // reference to the config constant
        ctrl.activeAt = 1;      // reference to the current active index ( zero based )

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            _parseFunctions(ctrl);  // parse the bound functions
            _parseAttributes(ctrl); // parse the bound attributes
            ctrl.data = _parseData(ctrl.data); // parse bound data
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            // get the DOM element
            _el = $element[0];
        }

        // @name _onChanges
        // @desc function for on binding changes
        function _onChanges() {
            // make sure the given is loading status is valid
            // note: the data and the attributes do not change
            // but the isLoading flag can be changed by the parent
            if(ctrl.isLoading !== false && ctrl.isLoading !== "false") {
                ctrl.isLoading = true; // default status is true
            }

            // make sure the given is ready status is valid
            // note: the data and the attributes do not change
            // but the isReady flag can be changed by the parent
            if(ctrl.isReady !== true && ctrl.isReady !== "true") {
                ctrl.isReady = false; // default status is false
            }

            // check if the swiper
            // has been initialized
            if(_swiper !== null) {
                // clear all previous timers
                if(_timer.update !== null) {
                    clearTimeout(_timer.update);
                    _timer.update = null;
                }

                // note: the timeout is to ensure that
                // the initial slide poistion changes
                // based on the given start position
                _timer.update = setTimeout(function() {
                    // check if the component is
                    // ready for user interaction
                    // disable user events if not
                    if(!ctrl.isReady) { _swiper.lockSwipes(); }

                    // enable user events if it is
                    else { _swiper.unlockSwipes(); }
                }, 1);
            }
        }

        // @name _parseFunctions
        // @desc function to parse the bound functions and
        //       replace any missing information with default values
        // @params {Object} ctrl - the controller attributes are bound to
        function _parseFunctions(ctrl) {
            // ensure that the update function
            // bound to the component is valid
            if(typeof ctrl.onUpdate   !== "function"
            || typeof ctrl.onUpdate() !== "function") {
                // add a default fallback function if it is not valid
                var onUpdateFallback = function() { /* empty block */ };
                ctrl.onUpdate = function() { return onUpdateFallback; };
            }
        }

        // @name _parseAttributes
        // @desc function to parse the bound attributes and
        //       replace any missing information with default values
        // @params {Object} ctrl - the controller attributes are bound to
        function _parseAttributes(ctrl) {
            // parse the given component startAt value
            // note: default position is 1 (one based)
            try { ctrl.startAt = parseInt(ctrl.startAt); }
            catch(error) { console.log(error); ctrl.startAt = 1; }

            try { if(isNaN(ctrl.startAt) || ((ctrl.startAt - 1) >= ctrl.data.length) ) { ctrl.startAt = 1; }}
            catch(error) { console.log(error); ctrl.startAt = 1; }

            // set the current active slide index
            ctrl.activeAt = (ctrl.startAt - 1);
        }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            // return the parsed data
            return data;
        }

        // @name _onSlideChange
        // @desc function to be exected on the slide change event
        // @param (Event) event - the event that triggered this function
        function _onSlideChange(event) {
            if(event && typeof event.activeIndex === "number") {
                // call the update function bound to
                // the component with the event info
                ctrl.activeAt = event.activeIndex;
                ctrl.onUpdate()(event.activeIndex);
                ScopeService.digest($scope);
            }
        }

        // @name _addOnChangeListener
        // @desc function to add a on slide change listener
        function _addOnChangeListener() {
            if(_swiper !== null && typeof _swiper.on === "function") {
                _swiper.on("onSlideChangeStart", _onSlideChange);
            }
        }

        // @name _removeOnChangeListener
        // @desc function to remove the on slide change listener
        function _removeOnChangeListener() {
            if(_swiper !== null && typeof _swiper.off === "function") {
                _swiper.off("onSlideChangeStart", _onSlideChange);
            }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name onRenderComplete
        // @desc function called when component elements have rendered
        function onRenderComplete() {
            // get the slider element on render complete
            _els = query(".shpg-carousel__container", _el)[0];

            // clear all previous timers
            if(_timer.render !== null) {
                clearTimeout(_timer.render);
                _timer.render = null;
            }

            // clear all previous timers
            if(_timer.update !== null) {
                clearTimeout(_timer.update);
                _timer.update = null;
            }

            // note: the time timeout is to ensure that
            // the animation on the parent has completed
            _timer.render = setTimeout(function() {
                // initiate the swiper on the slider element
                _swiper = new Swiper(_els, {
                    initialSlide: (ctrl.startAt - 1), // set the initial active slide
                    speed: CONFIG.animation.durationFast, // set the animation duration

                    autoHeight: false, grabCursor: true, // set the height and hover cursor
                    centeredSlides: true, slidesPerView: "auto" // set the slide behaviour
                });

                // add event listener for slide
                // change on the slider element
                _addOnChangeListener();

                // note: the timeout is to ensure that
                // the initial slide poistion changes
                // based on the given start position
                _timer.update = setTimeout(function() {
                    // check if the component is
                    // ready for user interaction
                    // disable user events if not
                    if(!ctrl.isReady) { _swiper.lockSwipes(); }

                    // enable user events if it is
                    else { _swiper.unlockSwipes(); }
                }, 1);
            }, 1);
        }

        // @name onPagerClick
        // @desc function called when component pager element is clicked
        // @param {Number} index - the index of the pager element clicked
        // @param (Event) event - the event that triggered this function
        function onPagerClick(index, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // only proceed if the component is not loading
            // and is ready, and if the given index is valid
            if(ctrl.isLoading || !ctrl.isReady || index < 0
            || index === ctrl.activeAt || index > (ctrl.data.length - 1)) {
                return false;
            }

            // only proceed if a valid swiper instance exists
            if(_swiper !== null && typeof _swiper.slideTo === "function") {
                _swiper.slideTo(index); // slide to the given index
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
            // clear all previous timers
            if(_timer.render !== null) {
                clearTimeout(_timer.render);
                _timer.render = null;
            }

            // clear all previous timers
            if(_timer.update !== null) {
                clearTimeout(_timer.update);
                _timer.update = null;
            }

            if(_swiper !== null && typeof _swiper.destroy === "function") {
                // remove event listener for slide
                // change on the slider element
                _removeOnChangeListener();

                // destroy the intialized swiper instance
                // and reset all references to objects
                _swiper.destroy(); _swiper = null;
                _el = null; _els = null;
            }
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.onRenderComplete = onRenderComplete; // function called when component elements have rendered
        ctrl.onPagerClick     = onPagerClick;     // function called when component pager element is clicked
    }

    /**
        * @name ShippingCarouselTemplate
        * @desc Class for the shipping carousel template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function ShippingCarouselTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "shipping-carousel.template.html";
    }

    /**
        * @name shippingCarousel
        * @desc Function for the shipping carousel component.
        * @return {Object} - The instance of the component function
    **/
    var shippingCarousel = function() {
        return {
            controller: ShippingCarouselController,
            templateUrl: ShippingCarouselTemplate,
            bindings: { data: "<", startAt: "@", isLoading: "<", isReady: "<", onUpdate: "&" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("shippingCarousel", shippingCarousel); // set component
})();
