"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// base
require("../base/raf");
require("../base/query");
require("../base/promise");
require("../base/debounce");

// -------------------------------------
//   Factory - Pin
// -------------------------------------
/**
    * @name pin.factory
    * @desc The extendable pin factory for the app that contains functions create
            to and interact with a custom google map marker pin on a given map.
**/
(function() {
    console.log("factories/pin.factory.js loaded.");

    /**
        * @name Pin
        * @desc Class for the pin factory.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} LoggerService - The custom logger service
        * @return {Object} - The instance of the factory class
    **/
    function Pin(CONFIG, LoggerService) {
        "ngInject"; // tag this function for dependancy injection


        /**
            * @name Pin
            * @desc Class for the pin factory with custom constructors.
            * @param {Object} options - the options for the map constructor
            *        {Object.Object} options.map      - the google map, the pin is attached to (mandatory)
            *        {Object.Object} options.google   - the google map script object for the map (mandatory)
            *        {Object.Object} options.coords   - the lat, lng coords for the pin on the map (mandatory)
            *        {Object.Object} options.isActive - the flag that indicates if the pin is active (optional)
        **/
        function Pin(options) {
            // ---------------------------------------------
            //   Private members
            // ---------------------------------------------
            var self = this; // reference to get the context of this
            var _el  = null; // reference to the custom pin DOM element
            var _pin = null; // reference to the custom map overlay view

            var _elDot    = null; // reference to the inner dot DOM element
            var _elImage  = null; // reference to the inner image DOM element
            var _elOPulse = null; // reference to the outer pulse DOM element
            var _elIPulse = null; // reference to the inner pulse DOM element

            var _isActive  = false; // flag to indicate if the pin is active
            var _isVisible = false; // flag to indicate if the pin is visible

            var _hasDot   = false; // flag to indicate if this pin has a dot
            var _hasPulse = false; // flag to indicate if this pin has a pulse

            var _image  = null; // reference to the url for the pin image
            var _google = null; // reference to the google map script object
            var _latlng = null; // reference to the object with google.maps.LatLng
            var _coords = { lat: 0, lng: 0 }; // reference to the pin lat, lng coords

            // (obtained from components/shipping-pathway.scss)
            var _mrkrWidth  = { default: 50, mobile: 40 }; // the marker width in pixels

            var _dotWidth  = {
                default: _mrkrWidth.default * (25.18 / 100), // the default dot width in pixels
                mobile:  _mrkrWidth.mobile  * (25.18 / 100)  // the mobile dot width in pixels
            };

            var _dotHeight  = {
                default: _dotWidth.default * 1.00, // the default dot height in pixels
                mobile:  _dotWidth.mobile  * 1.00  // the mobile dot height in pixels
            };

            var _pinWidth = {
                default: _mrkrWidth.default * 1.00, // the default pin width in pixels
                mobile:  _mrkrWidth.mobile  * 1.00  // the mobile pin width in pixels
            };

            var _pinHeight = {
                default: _pinWidth.default * 1.64, // the default pin height in pixels
                mobile:  _pinWidth.mobile  * 1.65  // the mobile pin height in pixels
            };

            var _templateType  = "div"; // reference to the element type used by the template
            var _templateHTML  = // reference to the inner DOM template used for the pin element
            "<img class='shpwy__mrkr__image' src='https://via.placeholder.com/800x450.jpg/ffffff/808890' alt=''>" +

            "<svg class='shpwy__mrkr__svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 123.9 186.9' style='enable-background: new 0 0 123.9 186.9;' xml:space='preserve'>" +

                "<g class='shpwy__mrkr__pin'>" +

                    "<circle class='shpwy__mrkr__pin__pulse shpwy__mrkr__pin__pulse--outer' cx='61.9' cy='125' r='61.9'/>" +
                    "<circle class='shpwy__mrkr__pin__pulse shpwy__mrkr__pin__pulse--inner' cx='61.9' cy='125' r='36.5'/>" +
                    "<circle class='shpwy__mrkr__pin__dot' cx='61.9' cy='125' r='15.6'/>" +

                    "<g>" +
                        "<circle class='shpwy__mrkr__pin__circle' cx='61.9' cy='41.8' r='41.8'/>" +
                        "<path class='shpwy__mrkr__pin__path' d='M101.8,41.6c0,27.9-39.8,84.4-39.8,84.4S22.1,69.6,22.1,41.6c0-22,17.8-39.8,39.8-39.8S101.8,19.6,101.8,41.6z'/>" +
                    "</g>" +
                "</g>" +

            "</svg>"

            var _query = { // reference to different queries used to select DOM elements
                main:   ".shpwy__mrkr", // query for selecting the main outer main DOM element
                dot:    ".shpwy__mrkr__pin__dot", // query for selecting the inner dot DOM element
                image:  ".shpwy__mrkr__image",    // query for selecting the inner image DOM element
                opulse: ".shpwy__mrkr__pin__pulse--outer", // query for selecting the outer pulse DOM element
                ipulse: ".shpwy__mrkr__pin__pulse--inner"  // query for selecting the inner pulse DOM element
            };

            var _animClass = { // reference to the scss classes added to tje DOM for animation
                "pulse":       "shpwy__animation__mrkr-pulse",        // pulse animation - base
                "pulse-outer": "shpwy__animation__mrkr-pulse--outer", // pulse animation - outer
                "pulse-inner": "shpwy__animation__mrkr-pulse--inner", // pulse animation - inner

                "fade":    "shpwy__animation__mrkr-fade",    // fade animation - base
                "fade-in": "shpwy__animation__mrkr-fade--in" // fade animation - in
            };

            var _colorHex = { // reference to the different fill hex colors used in the DOM template
                default: "#808890", // rgb(128,136,144) - reference to the default color used in the template
                active:  "#0c98d6"  // rgb( 12,152,214) - reference to the active color used in the template
            };


            // ---------------------------------------------
            //   Public members
            // ---------------------------------------------
            /* empty block */

            // ---------------------------------------------
            //   Private methods
            // ---------------------------------------------
            // @name _onWindowResizeListener
            // @desc function to be executed on window resize event
            // @param (Event) event - the event that triggered this function
            var _onWindowResizeListener = debounce(function(event) {
                // manually trigger re-draw for
                // the pin if it is visible
                if(_isVisible) { draw(); }
            }, CONFIG.timeout.scope);

            // @name _addWindowResizeListener
            // @desc function to add a listener to the window resize event
            function _addWindowResizeListener() {
                window.addEventListener("resize", _onWindowResizeListener);
            }

            // @name _removeWindowResizeListener
            // @desc function to remove the listener on the window resize event
            function _removeWindowResizeListener() {
                window.removeEventListener("resize", _onWindowResizeListener);
            }

            // ---------------------------------------------
            //   Public methods
            // ---------------------------------------------
            // @name init
            // @desc function called when a pin object is initialized
            function init() {
                // note: nothing needs to be done here
                // the pin is intialized automatically
            }

            // @name destroy
            // @desc function called when the pin object is destroyed
            function destroy() {
                // stop queued animations
                Velocity(_el, "stop", true);

                // remove listener attached
                // to the window resize event
                _removeWindowResizeListener();
                _onWindowResizeListener = null;

                // reset all references
                // to objects and arrays
                _pin.setMap(null);
                _pin = null; _image = null;
                _google = null; _latlng = null;
                _coords = { lat: 0, lng: 0 };

                // reset all flags to their default values
                _isActive = false; _isVisible = false;
                _hasDot   = false; _hasPulse  = false;
            }

            // @name setIsActive
            // @desc function to set the is active flag for the pin
            // @param {Boolean} isActive - the boolean flag value to be set
            function setIsActive(isActive) {
                if(typeof isActive !== "boolean") {
                    console.warn("pin.factory.js: Cannot set isActive flag for the pin with the given value:");
                    console.warn(isActive ? isActive : "isActive is not defined.");
                    return; // exit the function if not valid
                }

                 // set is active flag
                _isActive = isActive;

                // manually trigger re-draw for
                // the pin if it is visible
                if(_isVisible) { draw(); }
            }

            // @name setHasDot
            // @desc function to set the has dot flag for the pin
            // @param {Boolean} hasDot - the boolean flag value to be set
            function setHasDot(hasDot) {
                if(typeof hasDot !== "boolean") {
                    console.warn("pin.factory.js: Cannot set hasDot flag for the pin with the given value:");
                    console.warn(hasDot ? hasDot : "hasDot is not defined.");
                    return; // exit the function if not valid
                }

                 // set has dot flag
                _hasDot = hasDot;
            }

            // @name setHasPulse
            // @desc function to set the has pulse flag for the pin
            // @param {Boolean} hasPulse - the boolean flag value to be set
            function setHasPulse(hasPulse) {
                if(typeof hasPulse !== "boolean") {
                    console.warn("pin.factory.js: Cannot set hasPulse flag for the pin with the given value:");
                    console.warn(hasPulse ? hasPulse : "hasPulse is not defined.");
                    return; // exit the function if not valid
                }

                 // set has pulse flag
                _hasPulse = hasPulse;
            }

            // @name getIsActive
            // @desc function to get the is active flag for the pin
            function getIsActive() {
                // return is active flag for the pin
                return _isActive ? _isActive : false;
            }

            // @name getHasDot
            // @desc function to get the has dot flag for the pin
            function getHasDot() {
                // return has dot flag for the pin
                return _hasDot ? _hasDot : false;
            }

            // @name getHasPulse
            // @desc function to get the has pulse flag for the pin
            function getHasPulse() {
                // return has pulse flag for the pin
                return _hasPulse ? _hasPulse : false;
            }

            // @name draw
            // @desc function called when the pin object is re-drawn
            function draw() {
                // if this is mobile breakpoint
                if(CONFIG.breakpoint.isMobile) {
                    _el.style.width  = _pinWidth.mobile  + "px"; // set the element width
                    _el.style.height = _pinHeight.mobile + "px"; // set the element height
                }

                // if this is any other breakpoint
                else {
                    _el.style.width  = _pinWidth.default  + "px"; // set the element width
                    _el.style.height = _pinHeight.default + "px"; // set the element height
                }

                // convert the pin lat, lng coords into pixels
                var point = _pin.getProjection().fromLatLngToDivPixel(_latlng);

                // if this is mobile breakpoint
                if(CONFIG.breakpoint.isMobile) {
                    _el.style.left = point.x - (_pinWidth.mobile  / 2) + "px"; // adjust element to center
                    _el.style.top  = point.y - (_pinHeight.mobile / 2) - (_dotHeight.mobile / (CONFIG.browser.isIEOld ? 1 : 1.4)) + "px"; // adjust element to bottom
                }

                // if this is any other breakpoint
                else {
                    _el.style.left = point.x - (_pinWidth.default  / 2) + "px"; // adjust element to center
                    _el.style.top  = point.y - (_pinHeight.default / 2) - (_dotHeight.default / (CONFIG.browser.isIEOld ? 1 : 1.4)) + "px"; // adjust element to bottom
                }

                // check if the pin is active,
                // and set the active fill color
                if(_isActive) {
                    // if the pin
                    // has a dot
                    if(_hasDot) {
                        _elDot.style.fill = _colorHex.active;
                    }

                    // if the pin
                    // has a pulse
                    if(_hasPulse) {
                        _elOPulse.style.fill = _colorHex.active;
                        _elIPulse.style.fill = _colorHex.active;
                    }
                }

                // if the pin is not active,
                // set the default fill color
                else {
                    // if the pin
                    // has a dot
                    if(_hasDot) {
                        _elDot.style.fill = _colorHex.default;
                    }

                    // if the pin
                    // has a pulse
                    if(_hasPulse) {
                        _elOPulse.style.fill = _colorHex.default;
                        _elIPulse.style.fill = _colorHex.default;
                    }
                }
            }

            // @name onAdd
            // @desc function called when the pin object is added to the map
            function onAdd() {
                // only proceed if the function has
                // not already been triggered before
                if(!_el) {
                    _el = document.createElement(_templateType); // create a new element
                    _el.classList.add(_query.main.replace(".", "")); // set the classname
                    _el.innerHTML = _templateHTML; // set the element template

                    _el.style.pointerEvents = "none"; // set the element events
                    _el.style.position = "absolute"; // set the element position
                    _el.style.cursor   = "default"; // set the element cursor
                    _el.style.left     = 0;  // set element position left
                    _el.style.top      = 0;  // set element position top
                    _el.style.opacity  = 0;  // set initial opacity to 0

                    var panes = _pin.getPanes(); // get the current available panes
                    panes.overlayImage.appendChild(_el); // append the element to it

                    // get reference to the inner dot and pulse DOM elements
                    if(!_elDot)    { _elDot    = query(_query.dot,    _el)[0]; }
                    if(!_elImage)  { _elImage  = query(_query.image,  _el)[0]; }
                    if(!_elOPulse) { _elOPulse = query(_query.opulse, _el)[0]; }
                    if(!_elIPulse) { _elIPulse = query(_query.ipulse, _el)[0]; }

                    // set the vehicle image source path for the pin
                    if(_elImage) { _elImage.setAttribute("src", _image); }
                }
            }

            // @name onRemove
            // @desc function called when the pin object is removed from the map
            function onRemove() {
                // only proceed if the function has
                // not already been triggered before
                if(_el) {
                    // remove the element from the parent
                    // and reset references to element
                    _el.parentNode.removeChild(_el);
                    _el = null; _elDot = null;
                    _elImage  = null;
                    _elOPulse = null;
                    _elIPulse = null;
                }
            }

            // @name show
            // @desc function called to show the pin on the map
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function show() {
                return new Promise(function(resolve, reject) {
                    if(_isVisible) {
                        console.warn("pin.factory.js: Cannot show a pin that is already visible.");
                        return resolve(false); // resolve promise with false on error
                    }

                    // request a new animation frame
                    requestAnimationFrame(function() {
                        // manually trigger re-draw for
                        // the dot before the animation
                        draw();

                        // stop queued animations
                        Velocity(_el, "stop", true);

                        // perform the show animation
                        Velocity(_el, "transition.slideDownBigIn", {
                            display: null, easing: "easeInOutQuad",
                            duration: CONFIG.animation.duration,

                            // set the visible flag to true
                            // when the show animation starts
                            begin: function() { _isVisible = true; },

                            // resolve promise with true on success
                            // once the show animation is complete
                            complete: function() {
                                // if the pin
                                // has a dot
                                if(_hasDot) {
                                    // add all the DOM animation scss classes
                                    _elDot.classList.add(_animClass["fade"]);
                                    _elDot.classList.add(_animClass["fade-in"]);
                                }

                                // if the pin
                                // has a pulse
                                if(_hasPulse) {
                                    // add all the DOM animation scss classes
                                    _elOPulse.classList.add(_animClass["pulse"]);
                                    _elIPulse.classList.add(_animClass["pulse"]);
                                    _elOPulse.classList.add(_animClass["pulse-outer"]);
                                    _elIPulse.classList.add(_animClass["pulse-inner"]);
                                }

                                // resolve the promise
                                // on animation complete
                                return resolve(true);
                            }
                        });
                    });
                });
            }

            // @name hide
            // @desc function called to hide the pin on the map
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function hide() {
                return new Promise(function(resolve, reject) {
                    if(!_isVisible) {
                        console.warn("pin.factory.js: Cannot hide a pin that is already hidden.");
                        return resolve(false); // resolve promise with false on error
                    }

                    // request a new animation frame
                    requestAnimationFrame(function() {
                        // stop queued animations
                        Velocity(_el, "stop", true);

                        // perform the hide animation
                        Velocity(_el, "transition.fadeOut", {
                            display: null, easing: "easeInOutQuad",
                            duration: CONFIG.animation.duration,

                            // set the visible flag to false
                            // when the hide animation starts
                            begin: function() { _isVisible = false; },

                            // resolve promise with true on success
                            // once the show animation is complete
                            complete: function() {
                                // if the pin
                                // has a dot
                                if(_hasDot) {
                                    // remove all the DOM animation scss classes
                                    _elDot.classList.remove(_animClass["fade"]);
                                    _elDot.classList.remove(_animClass["fade-in"]);
                                }

                                // if the pin
                                // has a pulse
                                if(_hasPulse) {
                                    // remove all the DOM animation scss classes
                                    _elOPulse.classList.remove(_animClass["pulse"]);
                                    _elIPulse.classList.remove(_animClass["pulse"]);
                                    _elOPulse.classList.remove(_animClass["pulse-outer"]);
                                    _elIPulse.classList.remove(_animClass["pulse-inner"]);
                                }

                                // resolve the promise
                                // on animation complete
                                return resolve(true);
                            }
                        });
                    });
                });
            }

            // ---------------------------------------------
            //   Constructor block
            // ---------------------------------------------
            /* -- note: checks for mandatory params -- */
            // check if the given options is valid
            if(!options || typeof options !== "object") {
                LoggerService.error("pin.factory.js: Cannot create pin without the required options:");
                LoggerService.error((options !== null) ? options : "options is not defined.");
                return null; // return empty instance on error
            }

            // check if the given google object is valid
            if(!options.google || !options.google.maps
            || typeof options.google.maps.OverlayView !== "function") {
                LoggerService.error("pin.factory.js: Cannot create pin with the given script object:");
                LoggerService.error((options.google !== null) ? options.google : "options.google is not defined.");
                return null; // return empty instance on error
            }

            // set the google script object
            _google = options.google;

            // extend the default google maps overlay view to create the pin
            var Overlay = function() { /* create a new overlay object */ };
            Overlay.prototype = new _google.maps.OverlayView(); // extend
            Overlay.prototype.onRemove = onRemove; // implement on remove
            Overlay.prototype.onAdd = onAdd; // implement on add
            Overlay.prototype.draw = draw; // implement draw
            _pin = new Overlay(); // create a new pin

            // check if the given map object is a valid map
            if(!options.map || !options.map.mapTypes || !options.map.overlayMapTypes) {
                LoggerService.error("pin.factory.js: Cannot create pin with the given map object:");
                LoggerService.error((options.map !== null) ? options.map : "options.map is not defined.");
                return null; // return empty instance on error
            }

            // set the map object using the
            // inherited prototype function
            _pin.setMap(options.map);

            // check if the given pin image is valid
            if(!options || !options.image
            || !options.image.includes("http")) {
                LoggerService.error("pin.factory.js: Cannot create pin with the given vehicle image:");
                LoggerService.error((options.image !== null) ? options.image : "options.image is not defined.");
                return null; // return empty instance on error
            }

            // set the pin image
            _image = options.image;

            // check if the given lat, lng coords are valid
            if(!options.coords || !options.coords.lat || !options.coords.lng
            || typeof options.coords.lat !== "number" || typeof options.coords.lat !== "number") {
                LoggerService.error("pin.factory.js: Cannot create pin with the given coords object:");
                LoggerService.error((options.coords !== null) ? options.coords : "options.coords is not defined.");
                return null; // return empty instance on error
            }

            // set the pin coords
            _coords = options.coords; // and get the lat, lng from coords
            _latlng = new _google.maps.LatLng(_coords.lat, _coords.lng);

            /* -- note: checks for optional params -- */
            // check if a valid active flag has been set
            if(typeof options.isActive !== "boolean") {
                LoggerService.warn("pin.factory.js: Cannot create pin with the given isActive flag:");
                LoggerService.warn((options.isActive !== null) ? options.isActive : "options.isActive is not defined.");
                options.isActive = false; // set the is active flag to be false
            }

            // set the is active flag
            _isActive = options.isActive;

            // check if a valid has dot flag has been set
            if(typeof options.hasDot !== "boolean") {
                LoggerService.warn("pin.factory.js: Cannot create pin with the given hasDot flag:");
                LoggerService.warn((options.hasDot !== null) ? options.hasDot : "options.hasDot is not defined.");
                options.hasDot = false; // set the is active flag to be false
            }

            // check if a valid has pulse flag has been set
            if(typeof options.hasPulse !== "boolean") {
                LoggerService.warn("pin.factory.js: Cannot create pin with the given hasPulse flag:");
                LoggerService.warn((options.hasPulse !== null) ? options.hasPulse : "options.hasPulse is not defined.");
                options.hasPulse = false; // set the is active flag to be false
            }

            // set the has dot and pin flags
            _hasDot   = options.hasDot;
            _hasPulse = options.hasPulse;

            // add a listener to the
            // window resize event
            _addWindowResizeListener();

            // ---------------------------------------------
            //   Instance block
            // ---------------------------------------------
            return new (function() {
                /* -- note: getting object prototype -- */
                var prototype = Object.getPrototypeOf(this);

                /* -- note: mandatorily inherited methods -- */
                prototype.init    = init;    // function called when a pin object is initialized
                prototype.destroy = destroy; // function called when a pin object is destroyed

                prototype.setIsActive = setIsActive; // function to get the is active flag for the pin
                prototype.getIsActive = getIsActive; // function to get the is active flag for the pin

                prototype.setHasDot   = setHasDot;   // function to get the has dot flag for the pin
                prototype.getHasDot   = getHasDot;   // function to get the has dot flag for the pin
                prototype.setHasPulse = setHasPulse; // function to get the has pulse flag for the pin
                prototype.getHasPulse = getHasPulse; // function to get the has pulse flag for the pin

                prototype.draw     = draw;     // function called when the pin object is re-drawn
                prototype.onAdd    = onAdd;    // function called when the pin object is added to the map
                prototype.onRemove = onRemove; // function called when the pin object is removed from the map

                /* -- note: optionally inherited methods -- */
                this.show = show; // function called to show the pin on the map
                this.hide = hide; // function called to hide the pin on the map
            })();
        }

        // return internal class
        return Pin;
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .factory("Pin", Pin); // set factory

})();
