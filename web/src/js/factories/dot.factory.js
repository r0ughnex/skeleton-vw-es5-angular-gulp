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
//   Factory - Dot
// -------------------------------------
/**
    * @name dot.factory
    * @desc The extendable dot factory for the app that contains functions create
            to and interact with a custom google map marker dot on a given map.
**/
(function() {
    console.log("factories/dot.factory.js loaded.");

    /**
        * @name Dot
        * @desc Class for the dot factory.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} LoggerService - The custom logger service
        * @return {Object} - The instance of the factory class
    **/
    function Dot(CONFIG, LoggerService) {
        "ngInject"; // tag this function for dependancy injection


        /**
            * @name Dot
            * @desc Class for the dot factory with custom constructors.
            * @param {Object} options - the options for the map constructor
            *        {Object.Object} options.map      - the google map, the dot is attached to (mandatory)
            *        {Object.Object} options.google   - the google map script object for the map (mandatory)
            *        {Object.Object} options.coords   - the lat, lng coords for the dot on the map (mandatory)
            *        {Object.Object} options.isActive - the flag that indicates if the dot is active (optional)
        **/
        function Dot(options) {
            // ---------------------------------------------
            //   Private members
            // ---------------------------------------------
            var self = this; // reference to get the context of this
            var _el  = null; // reference to the custom dot DOM element
            var _dot = null; // reference to the custom map overlay view

            var _elDot = null; // reference to the inner dot DOM element
            var _isActive = false; // flag to indicate if the dot is active
            var _isVisible = false; // flag to indicate if the dot is visible

            var _google = null; // reference to google map script object
            var _latlng = null; // reference to the object with google.maps.LatLng
            var _coords = { lat: 0, lng: 0 }; // reference to the dot lat, lng coords

            // (obtained from components/shipping-pathway.scss)
            var _mrkrWidth = { default: 50, mobile: 40 }; // the marker width in pixels

            var _dotWidth  = {
                default: _mrkrWidth.default * (25.18 / 100), // the default dot width in pixels
                mobile:  _mrkrWidth.mobile  * (25.18 / 100)  // the mobile dot width in pixels
            };

            var _dotHeight  = {
                default: _dotWidth.default * 1.00, // the default dot height in pixels
                mobile:  _dotWidth.mobile  * 1.00  // the mobile dot height in pixels
            };

            var _templateType  = "div"; // reference to the element type used by the template
            var _templateHTML  = // reference to the inner DOM template used for the dot element
            "<svg class='gmap__mrkr__svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 31.2 31.2' style='enable-background: new 0 0 31.2 31.2;' xml:space='preserve'>" +

                "<g class='gmap__mrkr__pin'>" +
                    "<circle class='gmap__mrkr__pin__dot' cx='15.6' cy='15.6' r='15.6' style='enable-background: new;'/>" +
                "</g>" +

            "</svg>";

            var _query = { // reference to different queries used to select DOM elements
                main: ".gmap__mrkr", // query for selecting the main outer main DOM element
                dot:  ".gmap__mrkr__pin__dot" // query for selecting the inner dot DOM element
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
                // the dot if it is visible
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
            // @desc function called when a dot object is initialized
            function init() {
                // note: nothing needs to be done here
                // the dot is intialized automatically
            }

            // @name destroy
            // @desc function called when the dot object is destroyed
            function destroy() {
                // stop queued animations
                Velocity(_el, "stop", true);

                // remove listener attached
                // to the window resize event
                _removeWindowResizeListener();
                _onWindowResizeListener = null;

                // reset all references to objects and arrays
                _dot.setMap(null); _dot = null;
                _google = null; _latlng = null;
                _coords = { lat: 0, lng: 0 };

                // reset all flags to their default values
                _isActive = false; _isVisible = false;
            }

            // @name setIsActive
            // @desc function to set the is active flag for the dot
            // @param {Boolean} isActive - the boolean flag value to be set
            function setIsActive(isActive) {
                if(typeof isActive !== "boolean") {
                    console.warn("dot.factory.js: Cannot set is-active flag for the dot with the given value:");
                    console.warn(isActive ? isActive : "isActive is not defined.");
                    return; // exit the function if not valid
                }

                 // set is active flag
                _isActive = isActive;

                // manually trigger re-draw for
                // the dot if it is visible
                if(_isVisible) { draw(); }
            }

            // @name getIsActive
            // @desc function to get the is active flag for the dot
            function getIsActive() {
                // return is active flag for the dot
                return _isActive ? _isActive : false;
            }

            // @name draw
            // @desc function called when the dot object is re-drawn
            function draw() {
                // if this is mobile breakpoint
                if(CONFIG.breakpoint.isMobile) {
                    _el.style.width  = _dotWidth.mobile  + "px"; // set the element width
                    _el.style.height = _dotHeight.mobile + "px"; // set the element height
                }

                // if this is any other breakpoint
                else {
                    _el.style.width  = _dotWidth.default  + "px"; // set the element width
                    _el.style.height = _dotHeight.default + "px"; // set the element height
                }

                // convert the dot lat, lng coords into pixels
                var point = _dot.getProjection().fromLatLngToDivPixel(_latlng);

                // if this is mobile breakpoint
                if(CONFIG.breakpoint.isMobile) {
                    _el.style.left = point.x - (_dotWidth.mobile  / 2) + "px"; // adjust element to center
                    _el.style.top  = point.y - (_dotHeight.mobile / 2) + "px"; // adjust element to center
                }

                // if this is any other breakpoint
                else {
                    _el.style.left = point.x - (_dotWidth.default  / 2) + "px"; // adjust element to center
                    _el.style.top  = point.y - (_dotHeight.default / 2) + "px"; // adjust element to center
                }

                // check if the dot is active,
                // and set the active fill color
                if(_isActive) { _elDot.style.fill = _colorHex.active; }

                // if the dot is not active,
                // set the default fill color
                else { _elDot.style.fill = _colorHex.default; }
            }

            // @name onAdd
            // @desc function called when the dot object is added to the map
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

                    var panes = _dot.getPanes(); // get the current available panes
                    panes.overlayImage.appendChild(_el); // append the element to it

                    // get reference to the inner dot DOM element
                    if(!_elDot) { _elDot = query(_query.dot, _el)[0]; }
                }
            }

            // @name onRemove
            // @desc function called when the dot object is removed from the map
            function onRemove() {
                // only proceed if the function has
                // not already been triggered before
                if(_el) {
                    // remove the element from the parent
                    // and reset references to element
                    _el.parentNode.removeChild(_el);
                    _el = null; _elDot = null;
                }
            }

            // @name show
            // @desc function called to show the dot on the map
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function show() {
                return new Promise(function(resolve, reject) {
                    if(_isVisible) {
                        console.warn("dot.factory.js: Cannot show a dot that is already visible.");
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
                        Velocity(_el, "transition.expandIn", {
                            display: null, easing: "ease",
                            duration: CONFIG.animation.durationFast,

                            // set the visible flag to true
                            // when the show animation starts
                            begin: function() { _isVisible = true; },

                            // resolve promise with true on success
                            // once the show animation is complete
                            complete: function() { return resolve(true); }
                        });
                    });
                });
            }

            // @name hide
            // @desc function called to hide the dot on the map
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function hide() {
                return new Promise(function(resolve, reject) {
                    if(!_isVisible) {
                        console.warn("dot.factory.js: Cannot hide a dot that is already hidden.");
                        return resolve(false); // resolve promise with false on error
                    }

                    // request a new animation frame
                    requestAnimationFrame(function() {
                        // stop queued animations
                        Velocity(_el, "stop", true);

                        // perform the hide animation
                        Velocity(_el, "transition.expandOut", {
                            display: null, easing: "ease",
                            duration: CONFIG.animation.durationFast,

                            // set the visible flag to false
                            // when the hide animation starts
                            begin: function() { _isVisible = false; },

                            // resolve promise with true on success
                            // once the show animation is complete
                            complete: function() { return resolve(true); }
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
                LoggerService.error("dot.factory.js: Cannot create dot without the required options:");
                LoggerService.error((options !== null) ? options : "options is not defined.");
                return null; // return empty instance on error
            }

            // check if the given google object is valid
            if(!options.google || !options.google.maps
            || typeof options.google.maps.OverlayView !== "function") {
                LoggerService.error("dot.factory.js: Cannot create dot with the given script object:");
                LoggerService.error((options.google !== null) ? options.google : "options.google is not defined.");
                return null; // return empty instance on error
            }

            // set the google script object
            _google = options.google;

            // extend the default google maps overlay view to create the dot
            var Overlay = function() { /* create a new overlay object */ };
            Overlay.prototype = new _google.maps.OverlayView(); // extend
            Overlay.prototype.onRemove = onRemove; // implement on remove
            Overlay.prototype.onAdd = onAdd; // implement on add
            Overlay.prototype.draw = draw; // implement draw
            _dot = new Overlay(); // create a new dot

            // check if the given map object is a valid map
            if(!options.map || !options.map.mapTypes || !options.map.overlayMapTypes) {
                LoggerService.error("dot.factory.js: Cannot create dot with the given map object:");
                LoggerService.error((options.map !== null) ? options.map : "options.map is not defined.");
                return null; // return empty instance on error
            }

            // set the map object using the
            // inherited prototype function
            _dot.setMap(options.map);

            // check if the given lat, lng coords are valid
            if(!options.coords || !options.coords.lat || !options.coords.lng
            || typeof options.coords.lat !== "number" || typeof options.coords.lat !== "number") {
                LoggerService.error("dot.factory.js: Cannot create dot with the given coords object:");
                LoggerService.error((options.coords !== null) ? options.coords : "options.coords is not defined.");
                return null; // return empty instance on error
            }

            // set the dot coords
            _coords = options.coords; // and get the lat, lng from coords
            _latlng = new _google.maps.LatLng(_coords.lat, _coords.lng);

            /* -- note: checks for optional params -- */
            // check if a valid active flag has been set
            if(typeof options.isActive !== "boolean") {
                LoggerService.warn("dot.factory.js: Cannot create dot with the given isActive flag:");
                LoggerService.warn((options.isActive !== null) ? options.isActive : "options.isActive is not defined.");
                options.isActive = false; // set the is active flag to be false
            }

            // set the is active flag
            _isActive = options.isActive;

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
                prototype.init    = init;    // function called when a dot object is initialized
                prototype.destroy = destroy; // function called when a dot object is destroyed

                prototype.setIsActive = setIsActive; // function to get the is active flag for the dot
                prototype.getIsActive = getIsActive; // function to get the is active flag for the dot

                prototype.draw     = draw;     // function called when the dot object is re-drawn
                prototype.onAdd    = onAdd;    // function called when the dot object is added to the map
                prototype.onRemove = onRemove; // function called when the dot object is removed from the map

                /* -- note: optionally inherited methods -- */
                this.show = show; // function called to show the dot on the map
                this.hide = hide; // function called to hide the dot on the map
            })();
        }

        // return internal class
        return Dot;
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .factory("Dot", Dot); // set factory

})();
