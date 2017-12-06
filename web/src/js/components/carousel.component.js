"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("lory");
**/

// base
require("../base/query");

// -------------------------------------
//   Component - Carousel
// -------------------------------------
/**
    * @name carousel.component
    * @desc The carousel component for the app.
**/
(function() {
    console.log("components/carousel.component.js loaded.");

    /**
        * @name CarouselController
        * @desc Class for the carousel controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Service} $filter - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @return {Object} - The instance of the controller class
    **/
    function CarouselController($scope, $element, $filter, CONFIG, ScopeService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el  = null; // reference to the DOM element
        var _els = null; // reference to the slider DOM element

        var _slider = null; // reference to the intialized lory slider
        var _timer  = { render: null, destory: null }; // reference to timers

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
            _parseAttributes(ctrl); // parse the bound attributes
            ctrl.data = _parseData(ctrl.data); // parse bound data

            // get the startAt position and set
            // the corresponding item as active
            var startIndex = (ctrl.startAt - 1);
            goToCarouselIndex(startIndex);
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            // get the DOM element
            _el = $element[0];
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

            try { if(isNaN(ctrl.startAt) || ((ctrl.startAt - 1) >= ctrl.data.children.length) ) { ctrl.startAt = 1; }}
            catch(error) { console.log(error); ctrl.startAt = 1; }
        }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            // splice any children items that are greater
            // than the max allowed length ( which is 4 )
            while(data.children && data.children.length > 4) {
                data.children.splice(3, 1);
            }

            // parse the component type based on length of children
            try { ctrl.type = "x" + data.children.length; }
            catch(error) { console.log(error); ctrl.type = "x0"; }

            // return the parsed data
            return data;
        }

        // @name _getActiveCarousel
        // @desc function to get the current active carousel
        // @return (Object) - the current carousel that is set as active
        function _getActiveCarousel() {
            try { return $filter('filter')(ctrl.data.children, { isActive: true })[0]; }
            catch(error) { console.log(error); return null; }
        }

        // @name _goFromCarousel
        // @desc function to goFrom the given carousel and set it as inactive
        // @param (Object) carousel - the carousel to be set as the inactive carousel
        // @param (Event) event - the event that triggered this function
        function _goFromCarousel(carousel, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // set the carousel as inactive only
            // if it is the active carousel
            if(carousel && carousel.isActive) {
                carousel.isActive = false;
            }
        }

        // @name _getActiveCarouselIndex
        // @desc function to get the current active carousel index
        // @return (Number) - the index of current carousel that is set as active
        function _getActiveCarouselIndex() {
            return ctrl.data.children.indexOf(_getActiveCarousel());
        }

        // @name _setActiveCarouselIndex
        // @desc function to set the current active carousel index
        // @param (Number) - the index of current carousel that is set as active
        function _setActiveCarouselIndex(index) {
            // check if the index is valid and
            // set it as the current active index
            try { index = parseInt(index); }
            catch(error) { console.log(error); }
            if(!isNaN(index) && index >= 0) { ctrl.activeAt = index; }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name goToCarousel
        // @desc function to go to the given carousel item and set it as the active carousel item
        // @param (Object) carousel - the carousel item to be set as the active carousel item
        // @param (Event) event - the event that triggered this function
        function goToCarousel(carousel, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // set the carousel as active only
            // if it is not the active carousel
            if(carousel && !carousel.isActive) {
                // set current active as inactive
                // and set this carousel as active
                _goFromCarousel(_getActiveCarousel());
                carousel.isActive = true;

                // get and update the active carousel index
                _setActiveCarouselIndex(_getActiveCarouselIndex());

                // slide to the next slide if the
                // event was triggered by the user
                if(event) {
                    try { _slider.slideTo(ctrl.activeAt - (ctrl.startAt - 1)) }
                    catch(error) { console.log(error); }
                }
            }
        }

        // @name goToCarouselIndex
        // @desc function to go to the carousel item with the given index and set it as active
        // @param (Number) index - the index of the carousel to be set as the active carousel
        // @param (Event) event - the event that triggered this function
        function goToCarouselIndex(index, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // get the carousel with the given index
            // and go to the carousel ( if it is valid )
            try {
                var carousel = ctrl.data.children[index];
                if(carousel !== null && typeof carousel !== "undefined") {
                    goToCarousel(carousel, event); // also pass the event
                }
            }

            // print any errors ( no action required )
            catch(error) { console.log(error); }
        }

        // @name _addSlideListener
        // @desc function to add a on lory resize listener
        function _addResizeListener() {
            _els.addEventListener("on.lory.resize", _onLoryResize);
        }

        // @name _addSlideListener
        // @desc function to add a after lory slide listener
        function _addSlideListener() {
            // note: to temporarily disable all
            // user interactions on the carousel
            _els.addEventListener("before.lory.slide", _beforeLorySlide);
            _els.addEventListener("after.lory.slide", _afterLorySlide);
        }

        // @name _removeSlideListener
        // @desc function to remove the on lory resize listener
        function _removeResizeListener() {
            _els.removeEventListener("on.lory.resize", _onLoryResize);
        }

        // @name _removeSlideListener
        // @desc function to remove the after lory slide listener
        function _removeSlideListener() {
            // note: to temporarily disable all
            // user interactions on the carousel
            _els.removeEventListener("before.lory.slide", _beforeLorySlide);
            _els.removeEventListener("after.lory.slide", _afterLorySlide);
        }

        // @name _beforeLorySlide
        // @desc function to be exected before lory slide event
        // @param (Event) event - the event that triggered this function
        function _beforeLorySlide(event) { try {
            // remove the slide listeners
            // to avoid an indefinte loop
            _removeSlideListener();

            // note: to temporarily disable all
            // user interactions on the carousel
            event.preventDefault();
            event.stopPropagation();

            // get the current slide and the carousel index
            // and go to the the corresponding carousel index
            var currentSlide = parseInt(event.detail.index);
            var currentCarouselIndex = currentSlide + (ctrl.startAt - 1);

            // note: the delay is to revert the
            // actions of the after slide event
            setTimeout(function() {
                goToCarouselIndex(currentCarouselIndex);
                _slider.slideTo(currentCarouselIndex);

                // update the component scope and
                // add the event listener for slide
                // change back to the slider element
                ScopeService.digest($scope);
                _addSlideListener();
            }, CONFIG.timeout.scope); }

            // print errors ( no action is required )
            catch(error) { console.log(error); /* do nothing */ }
        }

        // @name _afterLorySlide
        // @desc function to be exected after lory slide event
        // @param (Event) event - the event that triggered this function
        function _afterLorySlide(event) { try {
            // get the current slide and the carousel index
            // and go to the the corresponding carousel index
            var currentSlide = parseInt(event.detail.currentSlide);
            var currentCarouselIndex = currentSlide + (ctrl.startAt - 1);
            goToCarouselIndex(currentCarouselIndex);
            ScopeService.digest($scope); }

            // print errors ( no action is required )
            catch(error) { console.log(error); /* do nothing */ }
        }

        // @name _onLoryResize
        // @desc function to be exected after lory resize event
        // @param (Event) event - the event that triggered this function
        function _onLoryResize(event) { try {
            // get the updated current slide carousel index
            // and go to the the corresponding carousel index
            var currentCarouselIndex = _slider.returnIndex() + (ctrl.startAt - 1);
            goToCarouselIndex(currentCarouselIndex);
            ScopeService.digest($scope);

            // clear all previous timers
            if(_timer.destroy !== null) {
                clearTimeout(_timer.destroy);
                _timer.destroy = null;
            }

            // time timeout is to ensure that the
            // animation on the slider container completes
            _timer.destroy = setTimeout(function() {
                // destroy and re-initaite the lory slider
                _slider.destroy(); _slider = null;
                _slider = lory(_els, { enableMouseEvents: true });

                // get the new current slide carousel index
                // and go to the the corresponding carousel index
                currentCarouselIndex = _slider.returnIndex() + (ctrl.startAt - 1);
                goToCarouselIndex(currentCarouselIndex);
                ScopeService.digest($scope);
            }, 1); }

            // print errors ( no action is required )
            catch(error) { console.log(error); /* do nothing */ }
        }

        // @name onRenderComplete
        // @desc function called when component elements have rendered
        function onRenderComplete() {
            // get the slider element on render complete
            _els = query(".carousel__slider", _el)[0];

            // clear all previous timers
            if(_timer.render !== null) {
                clearTimeout(_timer.render);
                _timer.render = null;
            }

            // note: the time timeout is to ensure that
            // the animation on the parent has completed
            _timer.render = setTimeout(function() {
                // initiate the slider on the slider element
                _slider = lory(_els, { enableMouseEvents: true });
            }, 1);

            // add event listener for slide
            // change on the slider element
            _addSlideListener();

            // add event listener for slide
            // resize on the slider element
            _addResizeListener();
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit   = _onInit;     // function for on init
        ctrl.$postLink = _onPostLink; // function for on post link

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            // remove event listener for slide
            // change from the slider element
            _removeSlideListener();

            // remove event listener for slide
            // resize from the slider element
            _removeResizeListener();

            // destroy and the lory slider
            _slider.destroy(); _slider = null;
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.goToCarousel      = goToCarousel;      // function to go to the given carousel item and set it as the active carousel item
        ctrl.goToCarouselIndex = goToCarouselIndex; // function to go to the carousel item with the given index and set it as active
        ctrl.onRenderComplete  = onRenderComplete;  // function called when component elements have rendered
    }

    /**
        * @name CarouselTemplate
        * @desc Class for the carousel template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function CarouselTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "carousel.template.html";
    }

    /**
        * @name carousel
        * @desc Function for the carousel component.
        * @return {Object} - The instance of the component function
    **/
    var carousel = function() {
        return {
            controller: CarouselController,
            templateUrl: CarouselTemplate,
            bindings: { data: "<", startAt: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("carousel", carousel); // set component
})();
