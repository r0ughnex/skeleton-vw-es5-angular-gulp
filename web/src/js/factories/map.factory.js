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
//   Factory - Map
// -------------------------------------
/**
    * @name map.factory
    * @desc The extendable map factory for the app that contains functions
            to create and interact with google maps on a given element.
**/
(function() {
    console.log("factories/map.factory.js loaded.");

    /**
        * @name Map
        * @desc Class for the map factory.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} LoggerService - The custom logger service
        * @param {Factory} Line - The custom extendable line factory
        * @param {Factory} Dot - The custom extendable dot factory
        * @param {Factory} Pin - The custom extendable pin factory
        * @return {Object} - The instance of the factory class
    **/
    function Map(CONFIG, LoggerService, Line, Dot, Pin) {
        "ngInject"; // tag this function for dependancy injection


        /**
            * @name Map
            * @desc Class for the map factory with custom constructors.
            * @param {Object} options - the options for the map constructor
            *        {Object.DOM} options.elem - the DOM elem on which the map is created (mandatory)
            *        {Object.Object} options.styles  - the google map style object for the map (optional)
            *        {Object.Object} options.google  - the google map script object for the map (mandatory)
            *        {Object.Object} options.startAt - the start at position for the map (one based) (optional)
            *        {Object.Array}  options.markers - the array of all available markers for the map (mandatory)
            *        {Object.String} options.image   - the string with the url for the marker vehicle image (mandatory)
            *        {Object.String} options.speed   - the string representing the google map load, render speed (optional)
        **/
        function Map(options) {
            // ---------------------------------------------
            //   Private members
            // ---------------------------------------------
            var self    = this;  // reference to get the context of this
            var _map    = null;  // reference to the initiated google map
            var _google = null;  // reference to google map script object

            var _dots = []; // reference to all the custom dots added on the map
            var _pins = []; // reference to all the custom pins added on the map
            var _lines = []; // reference to all the custom lines added on the map
            var _markers = []; // reference to all the available markers on the map

            var _startIndex   = -1; // reference to the index of the start active marker (zero based)
            var _activeIndex  = -1; // reference to the index of the current active marker (zero based)
            var _visibleIndex = -1; // reference to the index of the current visible marker (zero based)
            var _isWestIndex  = -1; // reference to the index from where the map moves west (zero based)

            var _markerImage   = null;   // reference to the url for the marker vehicle image
            var _mapLoadSpeed  = "slow"; // reference to the map load speed (used to slow animations)
            var _moveAnimation = null;   // reference to the returned move animation object with cancel
            var _moveAnimTimer = null;   // reference to the returned move animation timer with cancel

            var _moveAnimDuration = { fast: 950, slow: 1125, slower: 1300 }; // references to the move animation duration
            var _loadTilesTimeout = { fast: 300, slow: 400,  slower: 500  }; // references to the preload tiles timeout

            // ---------------------------------------------
            //   Public members
            // ---------------------------------------------
            /* empty block */

            // ---------------------------------------------
            //   Private methods
            // ---------------------------------------------
            // @name _isCoordinatesValid
            // @desc function to check if the given coordinates are valid
            // @param {Number} lat - the latitude coordinate to be checked
            // @param {Number} lng - the longitude coordinate to be checked
            // @return {Boolean} - true if coordinate are valid, false if not
            function _isCoordinatesValid(lat, lng) {
                // check if the lat and
                // lng are valid numbers
                if(typeof lat !== "number"
                || typeof lng !== "number") {
                    return false;
                }

                // check for non-zero values
                // note: use == because we are
                // comparing float and integer
                if(parseFloat(lat) == 0
                || parseFloat(lng) == 0) {
                    return false;
                }

                // check if lat and lng
                // are within their range
                if(lat >= -90  && lat <= 90
                && lng >= -180 && lng <= 180) {
                    return true;
                }

                // return false if not
                else { return false; }
            }


            // @name _isCoordinatesEqual
            // @desc function to check if the two given coordinates are equal
            // @param {Object} acoords - the latitude, longitute coordinates to be checked
            // @param {Object} bcoords - the latitude, longitute coordinates to be checked
            // @return {Boolean} - true if the two given coordinates are equal, false if not
            function _isCoordinatesEqual(acoords, bcoords) { try {
                return (acoords.lat === bcoords.lat // check if lat coords are equal
                     && acoords.lng === bcoords.lng); } // check if lng coords are rqual
                catch(error) { console.log(error); return false; } // return false on error
            }

            // @name _isMarkersValid
            // @desc function to check if the given markers are valid
            // @param {Array} markers - the array of marker objects to be checked
            // @return {Boolean} - true if the marker objects are valid, false if not
            function _isMarkersValid(markers) {
                // only proceed if the given
                // markers are of valid type
                if(!markers || !markers.length
                    || !Array.isArray(markers)) {
                    return false; // return false if not
                }

                // default flag for validity
                var isMarkersValid = true;

                // check each marker for validity
                markers.forEach(function(marker, mindex) {
                    // break loop if already invalid
                    if(!isMarkersValid) { return false; }

                    // check if the marker dot coords exist
                    if(!marker.dcoords || !marker.dcoords.lat || !marker.dcoords.lng) {
                        isMarkersValid = false; // set as false
                        return false; // break loop if invalid
                    }

                    // check if the marker pin coords exist
                    if(!marker.pcoords || !marker.pcoords.lat || !marker.pcoords.lng) {
                        isMarkersValid = false; // set as false
                        return false; // break loop if invalid
                    }

                    // check if the marker dot coords are valid
                    if(!_isCoordinatesValid(marker.dcoords.lat, marker.dcoords.lng)) {
                        isMarkersValid = false;  // set as false
                        return false; // break loop if invalid
                    }

                    // check if the marker pin coords are valid
                    if(!_isCoordinatesValid(marker.pcoords.lat, marker.pcoords.lng)) {
                        isMarkersValid = false;  // set as false
                        return false; // break loop if invalid
                    }

                    // check if is east flag have been set
                    if(typeof marker.isEast !== "undefined") {
                        // check if the flag has been set to true
                        marker.isEast = (marker.isEast === true    // condition for boolean
                                      || marker.isEast === "true") // condition for string
                                       ? true : false; // default value for everyting else
                    }

                    // check if is west flag have been set
                    if(typeof marker.isWest !== "undefined") {
                        // check if the flag has been set to true
                        marker.isWest = (marker.isWest === true    // condition for boolean
                                      || marker.isWest === "true") // condition for string
                                       ? true : false; // default value for everyting else
                    }

                    // if the is west flag has been set to true
                    if(marker.isWest) {
                        _isWestIndex = mindex; // capture the index at which it has been set to true
                        console.warn("map.factory.js: The map direction is West from the given index:");
                        console.warn("marker.isWest: " + marker.isWest + ", _isWestIndex: " + _isWestIndex);
                    }

                    // check if there are any inner child routes
                    var routes = marker.routes ? marker.routes : [];
                    if(routes && routes.length && Array.isArray(routes)) {
                        // loop validity check on the inner child routes
                        if(!_isMarkersValid(routes)) {
                            isMarkersValid = false;  // set as false
                            return false; // break loop if invalid
                        }
                    }
                });

                // return markers validity
                return isMarkersValid;
            }

            // @name _isLoadSpeedValid
            // @desc function to determine if the given load speed is valid
            // @param {String} speed - the given map load speed to be checked
            // @retrun {Boolean} - true if the load speed is valid, false if not
            function _isLoadSpeedValid(speed) {
                // only proceed if the given
                // load speed is of valid type
                if(typeof speed !== "string") {
                    return false; // return false if not
                }

                // check the given value of speed
                switch(speed.toLowerCase()) {
                    // return true if valid
                    case "fast": case "slow":
                    case "slower": { return true; }

                    // return false if not
                    default: { return false; }
                }
            }

            // @name _parseMarkers
            // @desc function to recurse and parse given markers object and modify
            //       it by replacing any missing information with default values
            // @param {Object} markers - the markers object to be parsed and checked for missing information
            // @return {Object} - a copy of the parsed and modifed markers object once the parsing is complete
            function _parseMarkers(markers) {
                // make a local copy of markers
                markers = angular.copy(markers);

                // check each marker for validity
                markers.forEach(function(marker, mindex) {
                    // default values to subtract
                    var subd = 0; var subp = 0;

                    // check if the current marker is less than, equal
                    // to the index of the marker that needs to go west
                    if(_isWestIndex > -1 && mindex <= _isWestIndex) {
                        subd = marker.dcoords.lng < 0 ? 360 : 360; // determine the value to subtract
                        subp = marker.pcoords.lng < 0 ? 360 : 360; // determine the value to subtract
                    }

                    // check if the current marker is greater than
                    // the index of the marker that needs to go west
                    else if(_isWestIndex > -1 && mindex > _isWestIndex) {
                        subd = marker.dcoords.lng < 0 ? 360 : 720; // determine the value to subtract
                        subp = marker.pcoords.lng < 0 ? 360 : 720; // determine the value to subtract
                    }

                    // subtract 360* / 720* from the coords if it is (only subtract from the lat)
                    marker.dcoords.lng = parseFloat((marker.dcoords.lng - subd).toFixed(5));
                    marker.pcoords.lng = parseFloat((marker.pcoords.lng - subp).toFixed(5));

                    // also subtract it from all the nested routes
                    // coords that exist within the current marker
                    marker.routes.forEach(function(route, rindex) {
                        // subtract 360* / 720* from the coords if it is (only subtract from the lat)
                        route.dcoords.lng = parseFloat((route.dcoords.lng - subd).toFixed(5));
                        route.pcoords.lng = parseFloat((route.pcoords.lng - subp).toFixed(5));
                    });
                });

                console.log("map.factory.js: Parsed markers from the factory for the map is:")
                console.log(markers);

                // return parsed markers
                return markers;
            }

            // @name _getDeltaXY
            // @desc function to get delta (diff) in coords between markers with the given indices (zero based)
            // @param {Number} fIndex - the index of the from marker to calculate the difference (zero based)
            // @param {Number} tIndex - the index of the to marker to calculate the difference (zero based)
            // @return {Object} - the object containing the difference in coords as { x: dx, y: dy }
            function _getDeltaXY(fIndex, tIndex) { try {
                // get the from marker and to marker
                var fromMarker = _markers[fIndex];
                var toMarker   = _markers[tIndex];

                // get the from marker and to marker coords
                var fromCoords = fromMarker.pcoords;
                var toCoords   = toMarker.pcoords;

                // set the from and to values for the movement
                var from = { x: fromCoords.lat, y: fromCoords.lng };
                var to   = { x: toCoords.lat,   y: toCoords.lng   };

                // calculate the difference between the two values
                var dx = parseFloat(Math.abs(to.x - from.x).toFixed(5)); // delta (diff) in lat
                var dy = parseFloat(Math.abs(to.y - from.y).toFixed(5)); // delta (diff) in lng
                return { x: dx, y: dy }; } // return the delta (diff) in lat and lng on success
                catch(error) { console.log(error); return { dx: 0, dy: 0 }; } // return 0 on error
            }

            // @name _getActiveIndex
            // @desc function to get the active marker index for the given start index
            // @param {Number} sIndex - the start index to calculate the active index for
            // @return {Number} - the active marker index calculated from the given start index
            function _getActiveIndex(sIndex) {
                // get the start marker index
                // and the previous marker index
                var startIndex = sIndex; // start
                var prevIndex  = (startIndex - 1);

                // get the start marker for the given index
                var startMarker = _markers[startIndex];
                var prevMarker  = null; // previous marker

                // check if previous marker index is valid
                // and get the previous marker for that index
                if(prevIndex >= 0) { prevMarker = _markers[prevIndex]; }

                // only proceed if the previous marker is valid
                if(prevMarker !== null) {
                    // calculate the difference between the two values
                    // note: prev is the 'from', and start is the 'to'
                    var delta = _getDeltaXY(prevIndex, startIndex);
                    var dx = delta.x; // get delta (diff) in lat
                    var dy = delta.y  // get delta (diff) in lng

                    // only proceed if the delta is significant
                    if(dx < 11 && dy < 11) { // in this case delta should at least have a difference of 11
                        console.warn("map.factory.js: Setting the map active marker index to the prev index:");
                        console.warn("startIndex: " + startIndex + ", prevIndex: " + prevIndex);
                        return prevIndex; // return the previous index if not significant
                    }

                    // else return the start index
                    else { return startIndex; }
                }

                // else return the start index
                else { return startIndex; }
            }

            // @name _getZoom
            // @desc function to get the map zoom level for the given marker type
            // @param {String} type - the marker type of calculate the map zoom value for
            // @return {Number} - the map zoom value calculated for the given marker type
            function _getZoom(type) {
                // check if the given type is valid
                if(!type && typeof type !== "string") {
                    type = "default"; // set to default
                }

                // check if this is tablet or mobile breakpoint
                var isBrTablet = CONFIG.breakpoint.isTablet;
                var isBrMobile = CONFIG.breakpoint.isMobile;

                /*
                // note: only used for testing stage animations
                return (isBrTablet || isBrMobile) ? 2 : 3; */

                // note: for the time being all marker types have been
                // set to be at the same zoom level. it is is yet to
                // be confirmed if they need to be different or not

                // return map zoom value based on type
                // and based on the current breakpoint
                switch(type.toLowerCase()) {
                    case "factory": { return (isBrTablet || isBrMobile) ? 4 : 5; } // for factory markers
                    case "route":   { return (isBrTablet || isBrMobile) ? 4 : 5; } // for route markers
                    case "port":    { return (isBrTablet || isBrMobile) ? 4 : 5; } // for port markers

                    case "dealership": { return (isBrTablet || isBrMobile) ? 4 : 5; } // for dealership markers
                    default:           { return (isBrTablet || isBrMobile) ? 4 : 5; } // for all other markers
                }
            }

            // @name _onWindowResizeListener
            // @desc function to be executed on window resize event
            // @param (Event) event - the event that triggered this function
            var _onWindowResizeListener = debounce(function(event) {
                // only proceed if animations
                // are currently not in progress
                if(_moveAnimation === null) {
                    // pan the center of the map to
                    // the currently active marker
                    var marker = _markers[_activeIndex];
                    _map.panTo(marker.pcoords);

                    // get the current and
                    // required zoom levels
                    var currZoom = _map.getZoom();
                    var reqZoom  = _getZoom(marker.type);

                    // check if the zoom level of
                    // the map needs to be changed
                    if(currZoom !== reqZoom) {
                        _map.setZoom(reqZoom);
                    }
                }
            }, CONFIG.timeout.scope / 4);

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


            // @name _addDots
            // @desc function to create and add a dot for each marker in the map
            function _addDots() {
                // add a dot for each marker in the map
                _markers.forEach(function(marker, index) {
                    // create a new dot
                    var dot = new Dot({
                        map: _map, // the map the dot is added to
                        google: _google, // the google script object
                        coords: marker.dcoords, // the coords for the dot
                        isActive: index <= _startIndex // set is active flag
                    });

                    // add dot to array
                    _dots.push(dot);
                });

                console.log("map.factory.js: Custom dot objects initialized on the map area.");
                console.log(_dots);
            }

            // @name _removeDots
            // @desc function to destroy and remove the dot for each marker from the map
            function _removeDots() {
                // loop through all the dots in the map
                _dots.forEach(function(dot, index) {
                    // destroy the dot
                    dot.destroy();
                });

                // remove dots
                // from array
                _dots = [];

                console.log("map.factory.js: Custom dot objects destroyed from the map area.");
                console.log(_dots);
            }

            // @name _addLines
            // @desc function to create and add a line between each marker in the map
            function _addLines() {
                // add a line between each marker in the map
                _markers.forEach(function(marker, index) {
                    // get the start and the end marker for the line
                    var smarker = (_markers[index]     ? _markers[index]     : null);
                    var emarker = (_markers[index + 1] ? _markers[index + 1] : null);

                    // only proceed if both markers are available
                    if(!emarker || !smarker) { return false; }

                    // add the start pin to the existing list of routes for the line
                    // note: only applicable if the pin, dot are at different coords
                    if(!_isCoordinatesEqual(smarker.pcoords, smarker.dcoords)){
                        // add the start pin at the beginning of the routes
                        var newRoute = { }; // create new route obj to add
                        newRoute.type    = smarker.type;    // add the route type
                        newRoute.dcoords = smarker.pcoords; // add route dot coords
                        newRoute.pcoords = smarker.pcoords; // add route pin coords
                        smarker.routes.unshift(newRoute);   // add the route to array
                    }

                    // add the end pin to the existing list of routes for the line
                    // note: only applicable if the pin, dot are at different coords
                    if(!_isCoordinatesEqual(emarker.pcoords, emarker.dcoords)){
                        // add the end pin at the ending of the routes
                        var newRoute = { }; // create new route obj to add
                        newRoute.type    = emarker.type;    // add the route type
                        newRoute.dcoords = emarker.pcoords; // add route dot coords
                        newRoute.pcoords = emarker.pcoords; // add route pin coords
                        smarker.routes.push(newRoute);      // add the route to array
                    }

                    // create a new line
                    var line = new Line({
                        map: _map, // the map the line is added to
                        google: _google, // the google script object
                        stype: smarker.type, // the type of the start coords
                        etype: emarker.type, // the type of the ending coords
                        scoords: smarker.dcoords, // the start coords for the line
                        ecoords: emarker.dcoords, // the ending coords for the line
                        routes : smarker.routes,  // the route to follow for the line
                        isActive: (index + 1) <= _startIndex // set the is active flag
                    });

                    // add line to array
                    _lines.push(line);
                });

                console.log("map.factory.js: Custom line objects initialized on the map area.");
                console.log(_lines);
            }

            // @name _removeLines
            // @desc function to destroy and remove the line between each marker from the map
            function _removeLines() {
                // loop through all the lines in the map
                _lines.forEach(function(line, index) {
                    // destroy the dot
                    line.destroy();
                });

                // remove lines
                // from array
                _lines = [];

                console.log("map.factory.js: Custom line objects destroyed from the map area.");
                console.log(_lines);
            }

            // @name _addPins
            // @desc function to create and add a pin for each marker in the map
            function _addPins() {
                // add a pin for each marker in the map
                _markers.forEach(function(marker, index) {
                    // create a new pin
                    var pin = new Pin({
                        map: _map, // the map the pin is added to
                        google: _google, // the google script object
                        image: _markerImage, // the image for the pin
                        coords: marker.pcoords, // the coords for the pin
                        isActive: index <= _startIndex, // set is active flag

                        // set flags that indicate if the pin has a dot and a pulse
                        hasDot: _isCoordinatesEqual(marker.dcoords, marker.pcoords),
                        hasPulse: _isCoordinatesEqual(marker.dcoords, marker.pcoords)
                    });

                    // add pin to array
                    _pins.push(pin);
                });

                console.log("map.factory.js: Custom pin objects initialized on the map area.");
                console.log(_pins);
            }

            // @name _removePins
            // @desc function to destroy and remove the pin for each marker from the map
            function _removePins() {
                // loop through all the pins in the map
                _pins.forEach(function(pin, index) {
                    // destroy the dot
                    pin.destroy();
                });

                // remove pins
                // from array
                _pins = [];

                console.log("map.factory.js: Custom pin objects destroyed from the map area.");
                console.log(_pins);
            }

            // ---------------------------------------------
            //   Public methods
            // ---------------------------------------------
            // @name init
            // @desc function called when the map object is initialized
            function init() {
                // note: nothing needs to be done here
                // the map is intialized automatically
            }

            // @name destroy
            // @desc function called when the map object is destroyed
            function destroy() {
                // cancel any existing move animations
                // that might be currently in progress
                if(_moveAnimation !== null) { try {
                    _moveAnimation.cancel(); // cancel the animation
                    _moveAnimation = null; } // reset the reference
                    catch(error) { console.log(error); }
                }

                // cancel any existing move animations
                // that might be currently in progress
                if(_moveAnimTimer !== null) { try {
                    clearTimeout(_moveAnimTimer) // cancel the timer
                    _moveAnimTimer = null; } // reset the reference
                    catch(error) { console.log(error); }
                }

                // remove listener attached to the window resize event and
                // destroy, remove all lines, dots and pins added to the map
                _removeWindowResizeListener(); _removeLines(); _removeDots();
                _removePins(); _onWindowResizeListener = null;

                // reset all references to objects and arrays
                _map = null; _google  = null; _markers = [];
                _markerImage = null; // reset marker image

                // reset all indices to their default values
                _startIndex   = -1; _activeIndex = -1;
                _visibleIndex = -1; _isWestIndex = -1;
            }

            // @name setMarkers
            // @desc function to set the given markers to the map
            // @param {Array} markers - the array of markers to be set
            function setMarkers(markers) {
                // only proceed if the given
                // array of markers are valid
                if(!_isMarkersValid(markers)) {
                    console.warn("map.factory.js: Cannot set map with the given set of markers:");
                    console.warn(markers ? markers : "markers is not defined.");
                    return; // exit the function if not valid
                }

                 // set the given markers
                _markers = options.markers;
            }

            // @name getMarkers
            // @desc function to get the current markers in the map
            // @return {Array} - the array of markers set in the map
            function getMarkers() {
                // return the markers in the map
                return _markers ? _markers : [];
            }

            // @name setActiveIndex
            // @desc function to set the index of the current active marker (zero based)
            // @param {Number} index - the marker index to be set as active (zero based)
            function setActiveIndex(index) {
                // only proceed if the given
                // active marker index is valid
                index = parseInt(index); // parse the index
                if(isNaN(index) || index < 0 || index >= _markers.length) { // (zero based)
                    console.warn("map.factory.js: Cannot set the given index as the active index:");
                    console.warn("index: " + ((index !== null) ? index : "index is not defined."));
                    return; // exit the function if not valid
                }

                // set the active index
                _activeIndex = index;
            }

            // @name getActiveIndex
            // @desc function to get the index of the current active marker (zero based)
            // @return {Number} - the marker index that is currently active (zero based)
            function getActiveIndex() {
                // return index of the current active marker
                return _activeIndex >= 0 ? _activeIndex : -1;
            }

            // @name setVisibleIndex
            // @desc function to set the index of the current visible marker (zero based)
            // @param {Number} index - the marker index to be set as visible (zero based)
            function setVisibleIndex(index) {
                // only proceed if the given
                // visible marker index is valid
                index = parseInt(index); // parse the index
                if(isNaN(index) || index < 0 || index >= _markers.length) { // (zero based)
                    console.warn("map.factory.js: Cannot set the given index as the visible index:");
                    console.warn("index: " + ((index !== null) ? index : "index is not defined."));
                    return; // exit the function if not valid
                }

                // set the visible index
                _visibleIndex = index;
            }

            // @name getVisibleIndex
            // @desc function to get the index of the current visible marker (zero based)
            // @return {Number} - the marker index that is currently visible (zero based)
            function getVisibleIndex() {
                // return index of the current visible marker
                return _visibleIndex >= 0 ? _visibleIndex : -1;
            }

            // @name _easeInOutQuad
            // @desc function to get easing for the given animation parameters
            // @param {Number} time - the current time in the animation tween timeline
            // @param {Number} from - the start value of the variable to do animation from
            // @param {Number} change - the change in value of the variable in the animation
            // @param {Number} duration - the total duration of the animation tween timeline
            // @return {Number} - the current updated value with easing applied for the animation
            function _easeInOutQuad (time, from, change, duration) {
                if ((time /= duration / 2) < 1) return change / 2 * time * time + from;
                return -change / 2 * ((--time) * (time - 2) - 1) + from;
            }

            // @name _animateMove
            // @desc function to animate values to be moved between the given from and to lat, lng coords
            // @param {Number} from - the coords object containing the lat, lng to do move animation from
            // @param {Number} to - the coords object containing the lat, lng to do the move animation to
            // @param {Number} duration - the duration for the animation in ms between the given coords
            // @param {Function} update - the progress function called while the animation progresses
            // @param {Function} done - the callback function called when the animation has completed
            // @return {Function} - the function that can be called to cancel the current animation
            function _animateMove(from, to, duration, update, done) {
                // only proceed if the from and to are valid objects
                if(typeof from !== "object" || typeof to !== "object") {
                    console.warn("map.factory.js: Cannot do move animation with the given options:");
                    console.warn("from: " + from + " to: " + to + " duration: " + duration);
                    return null; // return null object on error
                }

                // only proceed if from, to and duration values are valid numbers
                if(typeof from.x !== "number" || typeof from.y !== "number"
                || typeof to.x   !== "number" || typeof to.y   !== "number"
                || typeof duration !== "number") {
                    console.warn("map.factory.js: Cannot do move animation with the given options:");
                    console.warn("from: " + from + " to: " + to + " duration: " + duration);
                    return null; // return null object on error
                }

                // check if update and done are valid functions (assign defaults if not)
                if(typeof update !== "function") { update = function() { /* do nothing */ }; }
                if(typeof done   !== "function") { done   = function() { /* do nothing */ }; }

                // create a new web worker to perform the animation (to be run in a seperate background thread)
                var animWorkerPath = CONFIG.path.scripts + "factories/map.factory/animation-move.worker.js";
                if(CONFIG.environment.isProd) { animWorkerPath = animWorkerPath.replace(".js", ".min.js"); }
                var animationWorker = new Worker(animWorkerPath);

                // notify the worker to initialize the animation
                animationWorker.postMessage(JSON.stringify({
                    type: "animation.init", // the message type sent to the worker
                    duration: duration, // the duration of the animation
                    start: from, // the start value for the animation
                    end: to // the end value for the animation
                }));

                /*
                console.log("----------------------------------");
                console.log("animationWorker: ", animationWorker); */

                // function to receive messages from the worker
                animationWorker.onmessage = function(event) {
                    // only proceed if a valid
                    // event and event type exist
                    if(!event) { return false; }
                    try { event = JSON.parse(event.data); }
                    catch(error) { event = { }; /* reset */ }

                    if(!event.type) { return false; } /*
                    console.log("onMessage: ", event); */

                    // determine the function to be
                    // run based on the event type
                    switch(event.type) {
                        // function called on animation progress
                        case "animation.progress": {
                            requestAnimationFrame(function() {
                                update(event.value.x, event.value.y, event.step, event.updates);
                            }); break;
                        }

                        // function called on animation complete
                        case "animation.complete": {
                            requestAnimationFrame(function() {
                                done(event.value.x, event.value.y, event.step, event.updates);

                                // terminate the created worker
                                // and free the referenced memory
                                try { animationWorker.terminate(); }
                                catch(error) { } animationWorker = null; /*
                                console.log("animationWorker: ", animationWorker);
                                console.log("----------------------------------"); */
                            }); break;
                        }
                    }
                }

                // function to receive errors from the worker
                animationWorker.onerror = function(event) {
                    // prevent default action
                    try { event.preventDefault(); }
                    catch(error) { event = { }; /* reset */ }

                    LoggerService.error("map.factory.js: Cannot use web workers to perform the move animation:");
                    LoggerService.error("worker.message: " + (event.message ? event.message : "message is not defined."));

                    requestAnimationFrame(function() {
                        // run the function called on animation complete
                        // with the final value and set the step as -ve
                        done(to.x, to.y, -1, parseInt((duration * 60) / 1000));

                        // terminate the created worker
                        // and free the referenced memory
                        try { animationWorker.terminate(); }
                        catch(error) { } animationWorker = null; /*
                        console.log("animationWorker: ", animationWorker);
                        console.log("----------------------------------"); */
                    });
                }

                // notify the worker to start the animation
                animationWorker.postMessage(JSON.stringify({
                    type: "animation.start"
                }));

                // function instance
                // with return object
                return {
                    // function to cancel
                    // the current animation
                    cancel: function() {
                        // notify the worker to cancel the animation
                        // note: "animation.cancel" will trigger the
                        // event "animation.complete" once cancelled
                        animationWorker.postMessage(JSON.stringify({
                            type: "animation.cancel"
                        }));
                    }
                };
            }

            // @name canMoveToMarker
            // @desc function to check if the map can move from, to the marker with indices (zero based)
            // @param {Number} fIndex - the from marker index to move the map from (zero based)
            // @param {Number} tIndex - the to marker index to move the map to (zero based)
            // @return {Boolean} - true if map the can move, false if it cannot
            function canMoveToMarker(fIndex, tIndex) {
                // check if the given from and to marker indices are valid
                if(typeof fIndex !== "number" || typeof tIndex !== "number"
                || fIndex === tIndex || fIndex < 0 || tIndex < 0
                || fIndex > (_markers.length - 1)
                || tIndex > (_markers.length - 1)) {
                    return false; // only proceed if they are
                }

                // calculate the difference between the two values
                // note: fIndex is the 'from', and tIndex is the 'to'
                var delta = _getDeltaXY(fIndex, tIndex);
                var dx = delta.x; // get delta (diff) in lat
                var dy = delta.y  // get delta (diff) in lng

                // return false if delta is not significant, in this
                // case delta should at least have a difference of 11
                if(dx < 13 && dy < 13) { return false; }
                return true; // return true if it is
            }

            // @name moveToMarker
            // @desc function to move the center of the map to the marker with given index (zero based)
            // @param {Number} index - the index of the marker to move the center of the map to
            // @param {Boolean} animate - the flag indicating if the move should be animated
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function moveToMarker(index, animate) {
                return new Promise(function(resolve, reject) {
                    index = parseInt(index); // parse index
                    // check if the given index is valid
                    if(isNaN(index) || typeof index !== "number"
                    || index < 0 || index >= _markers.length) {
                        console.warn("map.factory.js: Cannot move the map to the marker with given index:");
                        console.warn("index: " + ((index !== null) ? index : "index is not defined."));
                        return resolve(false); // resolve promise with false on error
                    }

                    // get the from marker and to marker
                    var fromMarker = _markers[_activeIndex];
                    var toMarker   = _markers[index];

                    // get the from marker and to marker coords
                    var fromCoords = fromMarker.pcoords;
                    var toCoords   = toMarker.pcoords;

                    // set the from and to values for the movement
                    var from = { x: fromCoords.lat, y: fromCoords.lng };
                    var to   = { x: toCoords.lat,   y: toCoords.lng   };

                    // calculate the difference between the two values
                    // note: active is the 'from', and other is the 'to'
                    var delta = _getDeltaXY(_activeIndex, index);
                    var dx = delta.x; // get delta (diff) in lat
                    var dy = delta.y  // get delta (diff) in lng

                    // print the movement direction and the values to confirm the animation curve
                    console.log("map.factory.js: Moving the map from marker " + _activeIndex + " - " + index + ":");
                    console.log("index: " + index + ", dx: " + dx + ", dy: " + dy);

                    // only proceed if the delta is significant, and if the map can move to the given marker (from the active)
                    if(!canMoveToMarker(_activeIndex, index)) { // in this case delta should at least have a difference of 11
                        console.warn("map.factory.js: Cannot move the map to the marker with given index:");
                        console.warn("index: " + index + ", dx: " + dx + ", dy: " + dy);
                        return resolve(false); // resolve promise with false on error
                    }

                    // set duration based on the map load speed
                    var duration = _moveAnimDuration.fast; // default animation duration
                    if     (_mapLoadSpeed === "fast")   { duration = _moveAnimDuration.fast;   } // fast
                    else if(_mapLoadSpeed === "slow")   { duration = _moveAnimDuration.slow;   } // slow
                    else if(_mapLoadSpeed === "slower") { duration = _moveAnimDuration.slower; } // slower

                    // cancel any existing move animations
                    // that might be currently in progress
                    if(_moveAnimation !== null) { try {
                        _moveAnimation.cancel(); // cancel the animation
                        _moveAnimation = null; } // reset the reference
                        catch(error) { console.log(error); }
                    }

                    // cancel any existing move animations
                    // that might be currently in progress
                    if(_moveAnimTimer !== null) { try {
                        clearTimeout(_moveAnimTimer) // cancel the timer
                        _moveAnimTimer = null; } // reset the reference
                        catch(error) { console.log(error); }
                    }

                    // function to resolve and end the
                    // map move to marker function call
                    function endMoveToMarker() {
                        // get the current and
                        // required zoom levels
                        var currZoom = _map.getZoom();
                        var reqZoom  = _getZoom(toMarker.type);

                        // check if the zoom level of
                        // the map needs to be changed
                        if(currZoom !== reqZoom) {
                            _map.setZoom(reqZoom);
                        }

                        _moveAnimation = null; // reset reference to move animation
                        _activeIndex = index;  // update current active marker index
                        return resolve(true);  // resolve promise with true on success
                    }

                    // check if a valid boolean animate flag has been set
                    if(typeof animate !== "boolean" || animate !== false) {
                        animate = true; // default value is true otherwise
                    }

                    // if animate flag has been set to true
                    if(animate) {
                        // perform the move animation with the given options
                        _moveAnimation = _animateMove(from, to, duration,
                            // function called on animation progress
                            function(x, y, step, updates) {
                                // pan the map to the new coords
                                // on each animation frame update
                                _map.panTo({ lat: x, lng: y });
                            },

                            // function called on animation complete
                            function(x, y, step, updates) {
                                // check if the animation was completed or cancelled
                                if(step !== updates) { // if animation was cancelled
                                    // pan the map to the end coords in the next frame
                                    setTimeout(function() { requestAnimationFrame(function() {
                                        _map.panTo({ lat: to.x, lng: to.y }); // pan to coords
                                        return endMoveToMarker(); // end the map move to marker
                                    }); }, 0);
                                }

                                // if animation was completed
                                // end the map move to marker
                                else {  return endMoveToMarker(); }
                            }
                        );
                    }

                    // if animate flag has been set to false
                    else {
                        // pan the map to the end coords after the given animation duration time
                        _moveAnimTimer = setTimeout(function() { requestAnimationFrame(function() {
                            _map.panTo({ lat: to.x, lng: to.y }); // pan to map to coords

                            _moveAnimTimer = setTimeout(function() { // the second half
                                return endMoveToMarker(); // end the map move animation
                            }, duration * (1 / 3)); // set map zoom in the second half
                        }); }, duration * (2 / 3)); // pan the map in the first half
                    }
                });
            }

            // @name preloadTiles
            // @desc function to preload map tiles for all the available markers in the map
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function preloadTiles() {
                return new Promise(function(resolve, reject) {
                    console.log("----------------------------------------------------------------");
                    console.log("map.factory.js: Preloading tiles for all the markers on the map.");
                    console.time("map.factory.js: preloadTiles() load time");

                    // set the recurson start and end indices
                    var recStart = _activeIndex, recEnd = _markers.length;

                    // set the recursion current index,
                    // previous index and recursion count
                    var recCount = 0; // set recursion count
                    var recCurr  = getRecNext(recStart); // set the current index
                    var recPrev  = recCurr - 1; // set previous index from current

                    // set timeout based on the map load speed
                    var timeout = (CONFIG.timeout.scope * 0.5); // default preload timeout
                    if     (_mapLoadSpeed === "fast")   { timeout = _loadTilesTimeout.fast;   } // fast
                    else if(_mapLoadSpeed === "slow")   { timeout = _loadTilesTimeout.slow;   } // slow
                    else if(_mapLoadSpeed === "slower") { timeout = _loadTilesTimeout.slower; } // slower

                    // function to get the next recursion
                    // index to move and preload the tiles
                    // based on the given recursion index
                    function getRecNext(index) {
                        // set default next index
                        var recNext = index;

                        // increase the recursion index if
                        // it has not reached the end marker
                        if(recNext < (recEnd - 1)) { return ++index; }

                        // reset the recursion index if
                        // it has reached the end marker
                        else { return 0; }
                    }

                    // function to recursively move to each
                    // marker in the map to preload the tiles
                    function moveToMarkers() {
                        return new Promise(function(iresolve, ireject) {
                            // if the end of recursion has not yet been reached
                            // note: iresolve signifies the resolve is internal
                            if(recCount < recEnd) {
                                var animate = true; // set the animate move flag
                                if((recPrev - recCurr) > 1) { animate = false; }

                                // move to the current marker in the recursion
                                moveToMarker(recCurr, animate).then(function() {
                                    recCount++; // increase the recursion count
                                    recPrev = recCurr; // update the previous index
                                    recCurr = getRecNext(recCurr); // get the next index

                                    // recurse on the marker with recursion index
                                    setTimeout(function() {
                                        // the timeout is for smoother load
                                        return iresolve(moveToMarkers());
                                    }, timeout);
                                });
                            }

                            // if the end of recursion
                            // has just been reached
                            else { return iresolve(true); }
                        });
                    }

                    // recursively move to each of the available marker
                    // so the all the tiles for each marker is loaded
                    moveToMarkers().then(function() {
                        console.timeEnd("map.factory.js: preloadTiles() load time");
                        return resolve(true); // resolve promise with true on success
                    });
                });
            }

            // @name showDots
            // @desc function to show all the dots added to the map for each marker
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function showDots () {
                return new Promise(function(resolve, reject) {
                    var currIndex = _startIndex;  // set the start index for recursion
                    var maxmIndex = (_dots.length - 1); // set maximum recursion index

                    // check which dot needs to be drawn to set
                    // which previous dot has to be drawn first
                    if(currIndex >= maxmIndex) { currIndex-= 2; } // show the 2nd previous dot first
                    else if(currIndex !== 0)   { currIndex-= 1; } // show the 1st previous dot first

                    var currCount = 0; // set the current no.of loop count
                    var maxmcount = _dots.length; // set the maximum loops

                    // recursive function to show
                    // the dot at the given index
                    function showDot(currIndex) {
                        // if no.of loops has not
                        // exceeded the max count
                        if(currCount < maxmcount) {
                            // increase the loop count
                            currCount++;

                            // show the dot with the current index
                            var dot = _dots[currIndex]; // get dot
                            if(dot && typeof dot.show === "function") {
                                dot.show().then(function() {
                                    // if give index is less
                                    // than the maximum index
                                    if(currIndex < maxmIndex) {
                                        // increase the index
                                        currIndex++;
                                    }

                                    // else set index to start
                                    // and show the next dot
                                    else { currIndex = 0; }
                                    showDot(currIndex);
                                });
                            }
                        }

                        // resolve promise with true on success
                        // once the show animation is complete
                        else { return resolve(true); }
                    }

                    // show each dot recursively
                    showDot(currIndex);
                });
            }

            // @name hideDots
            // @desc function to hide all the dots added to the map for each marker
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function hideDots() {
                return new Promise(function(resolve, reject) {
                    var currIndex = _startIndex;  // set the start index for recursion
                    var maxmIndex = (_dots.length - 1); // set maximum recursion index

                    var currCount = 0; // set the current no.of loop count
                    var maxmcount = _dots.length; // set the maximum loops

                    // recursive function to hide
                    // the dot at the given index
                    function hideDot(currIndex) {
                        // if no.of loops has not
                        // exceeded the max count
                        if(currCount < maxmcount) {
                            // increase the loop count
                            currCount++;

                            // hide the dot with the current index
                            var dot = _dots[currIndex]; // get dot
                            if(dot && typeof dot.hide === "function") {
                                dot.hide().then(function() {
                                    // if give index is less
                                    // than the maximum index
                                    if(currIndex < maxmIndex) {
                                        // increase the index
                                        currIndex++;
                                    }

                                    // else set index to start
                                    // and hide the next dot
                                    else { currIndex = 0; }
                                    hideDot(currIndex);
                                });
                            }
                        }

                        // resolve promise with true on success
                        // once the hide animation is complete
                        else { return resolve(true); }
                    }

                    // hide each dot recursively
                    hideDot(currIndex);
                });
            }

            // @name showLiness
            // @desc function to show all the lines added to the map for each marker
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function showLines() {
                return new Promise(function(resolve, reject) {
                    var currIndex = _startIndex;  // set the start index for recursion
                    var maxmIndex = (_lines.length - 1); // set maximum recursion index

                    // check which line needs to be drawn to set
                    // which previous line has to be drawn first
                    if(currIndex >= maxmIndex) { currIndex-= 2; } // show the 2nd previous line first
                    else if(currIndex !== 0)   { currIndex-= 1; } // show the 1st previous line first

                    var currCount = 0; // set the current no.of loop count
                    var maxmcount = _lines.length; // set the maximum loops

                    // recursive function to show
                    // the line at the given index
                    function showLine(currIndex) {
                        // if no.of loops has not
                        // exceeded the max count
                        if(currCount < maxmcount) {
                            // increase the loop count
                            currCount++;

                            // show the line with the current index
                            var line = _lines[currIndex]; // get line
                            if(line && typeof line.show === "function") {
                                line.show().then(function() {
                                    // if give index is less
                                    // than the maximum index
                                    if(currIndex < maxmIndex) {
                                        // increase the index
                                        currIndex++;
                                    }

                                    // else set index to start
                                    // and show the next line
                                    else { currIndex = 0; }
                                    showLine(currIndex);
                                });
                            }
                        }

                        // resolve promise with true on success
                        // once the show animation is complete
                        else { return resolve(true); }
                    }

                    // show each line recursively
                    showLine(currIndex);
                });
            }

            // @name hideLiness
            // @desc function to hide all the lines added to the map for each marker
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function hideLines() {
                return new Promise(function(resolve, reject) {
                    var currIndex = _startIndex;  // set the start index for recursion
                    var maxmIndex = (_lines.length - 1); // set maximum recursion index

                    var currCount = 0; // set the current no.of loop count
                    var maxmcount = _lines.length; // set the maximum loops

                    // recursive function to hide
                    // the line at the given index
                    function hideLine(currIndex) {
                        // if no.of loops has not
                        // exceeded the max count
                        if(currCount < maxmcount) {
                            // increase the loop count
                            currCount++;

                            // hide the line with the current index
                            var line = _lines[currIndex]; // get line
                            if(line && typeof line.hide === "function") {
                                line.hide().then(function() {
                                    // if give index is less
                                    // than the maximum index
                                    if(currIndex < maxmIndex) {
                                        // increase the index
                                        currIndex++;
                                    }

                                    // else set index to start
                                    // and hide the next line
                                    else { currIndex = 0; }
                                    hideLine(currIndex);
                                });
                            }
                        }

                        // resolve promise with true on success
                        // once the hide animation is complete
                        else { return resolve(true); }
                    }

                    // hide each line recursively
                    hideLine(currIndex);
                });
            }

            // @name showPin
            // @desc function to show the pin at the given index (zero based)
            // @param {Number} index - the index of the pin to show (zero based)
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function showPin(index) {
                return new Promise(function(resolve, reject) {
                    // only proceed if the given index for the pin is valid
                    if(typeof index !== "number" || index < 0 || index >= _pins.length) {
                        console.warn("map.factory.js: Cannot show the pin at the given index:");
                        console.warn("index: " + ((index !== null) ? index : "index is not defined."));
                        return resolve(false); // resolve promise with false on error
                    } try {

                    // if there is any other pin that is currently visible
                    // note: only one pin can be visible at any given time
                    if(_visibleIndex >= 0 && _visibleIndex < _pins.length) {
                        // hide the pin that is currently visible
                        hidePin(_visibleIndex).then(function() {
                            // show the pin at the given index and
                            // resolve promise with true on success
                            _visibleIndex = index; // set visible index to given index
                            _pins[index].show().then(function() { return resolve(true); });
                        });
                    } else {
                        // show the pin at the given index and
                        // resolve promise with true on success
                        _visibleIndex = index; // set visible index to given index
                        _pins[index].show().then(function() { return resolve(true); });
                    }}

                    // resolve promise with false on error
                    catch(error) { console.log(error); return resolve(false); }
                });
            }

            // @name hidePin
            // @desc function to hide the pin at the given index (zero based)
            // @param {Number} index - the index of the pin to hide (zero based)
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function hidePin(index) {
                return new Promise(function(resolve, reject) {
                    // only proceed if the given index for the pin is valid
                    if(typeof index !== "number" || index < 0 || index >= _pins.length) {
                        console.warn("map.factory.js: Cannot hide the pin at the given index:");
                        console.warn("index: " + ((index !== null) ? index : "index is not defined."));
                        return resolve(false); // resolve promise with false on error
                    }

                    // hide the pin at the given index and
                    // resolve promise with true on success
                    _visibleIndex = -1; // re-set visible index to default
                    _pins[index].hide().then(function() { return resolve(true); });
                });
            }

            // ---------------------------------------------
            //   Constructor block
            // ---------------------------------------------
            /* -- note: checks for mandatory params -- */
            // check if the given element is valid
            if(!options || !options.elem
            || !options.elem.nodeName
            || !options.elem.nodeType) {
                LoggerService.error("map.factory.js: Cannot create map on the given element:");
                LoggerService.error((options.elem !== null) ? options.elem : "options.elem is not defined.");
                return null; // return empty instance on error
            }

            // check if the given google object is valid
            if(!options || !options.google
            || !options.google.maps) {
                LoggerService.error("map.factory.js: Cannot create map with the given script object:");
                LoggerService.error((options.google !== null) ? options.google : "options.google is not defined.");
                return null; // return empty instance on error
            }

            // set the google script object
            _google = options.google;

            // check if the given array of markers are valid
            if(!options || !options.markers
            || !_isMarkersValid(options.markers)) {
                LoggerService.error("map.factory.js: Cannot create map with the given set of markers:");
                LoggerService.error((options.markers !== null) ? options.markers : "options.markers is not defined.");
                return null; // return empty instance on error
            }

            // set the markers for the map
            _markers = _parseMarkers(options.markers);

            // check if the given marker image is valid
            if(!options || !options.image
            || !options.image.includes("http")) {
                LoggerService.error("map.factory.js: Cannot create map with the given vehicle image:");
                LoggerService.error((options.image !== null) ? options.image : "options.image is not defined.");
                return null; // return empty instance on error
            }

            // set the marker image for the map
            _markerImage = options.image;

            /* -- note: checks for optional params -- */
            // check if the given styles are valid
            if(!options || !options.styles
            || !Array.isArray(options.styles)) {
                LoggerService.warn("map.factory.js: Cannot create map with the given style object:");
                LoggerService.warn("options.styles: " + ((options.styles !== null) ? options.styles : "options.styles is not defined."));
                options.styles = []; // set styles to be empty on error
            }

            // check if the given start at value is valid
            if(!options || !options.startAt
            || typeof options.startAt !== "number"
            || (options.startAt - 1) >= _markers.length) {
                LoggerService.warn("map.factory.js: Cannot create map with the given start at value:");
                LoggerService.warn("options.startAt: " + ((options.startAt !== null) ? options.startAt : "options.startAt is not defined."));
                options.startAt = 1; // set start at value to be 1
            }

            // check if the given map speed is valid
            if(!options || !options.speed
            || !_isLoadSpeedValid(options.speed)) {
                LoggerService.warn("map.factory.js: Cannot create map with the given speed value:");
                LoggerService.warn("options.speed: " + ((options.speed !== null) ? options.speed : "options.speed is not defined."));
                options.speed = "fast"; // set speed value to be fast
            }

            _startIndex   = (parseInt(options.startAt) - 1); // get the index of the start active marker (zero based)
            _activeIndex  = _getActiveIndex(_startIndex); // get the index of the current active marker (zero based)
            _mapLoadSpeed = options.speed; // set the  map load speed (used to slow animations)

            // initialize the google map with the given options
            _map = new _google.maps.Map(options.elem, {
                center: { // set the coords for the map center
                    lat: _markers[_activeIndex].pcoords.lat,
                    lng: _markers[_activeIndex].pcoords.lng
                },

                // set the map zoom based on the marker type
                zoom: _getZoom(_markers[_activeIndex].type),

                 // set the map styles
                styles: options.styles,

                // set the map user and gesture options
                draggable: false, scrollwheel: false,
                gestureHandling: "none", keyboardShortcuts: false,
                disableDefaultUI: true, disableDoubleClickZoom: false
            });

            // create and add dot, line and pins
            // for each of the marker in the map
            _addDots(); _addLines();
            _addPins();

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
                prototype.init    = init;    // function called when the map object is initialized
                prototype.destroy = destroy; // function called when the map object is destroyed

                prototype.setMarkers = setMarkers; // function to set the given markers to the map
                prototype.getMarkers = getMarkers; // function to get the current markers in the map

                prototype.setActiveIndex = setActiveIndex; // function to set the index of the current active marker (zero based)
                prototype.getActiveIndex = getActiveIndex; // function to get the index of the current active marker (zero based)

                prototype.setVisibleIndex = setVisibleIndex; // function to set the index of the current visible marker (zero based)
                prototype.getVisibleIndex = getVisibleIndex; // function to get the index of the current visible marker (zero based)

                /* -- note: optionally inherited methods -- */
                this.canMoveToMarker = canMoveToMarker; // function to check if the map can move from, to the marker with indices (zero based)
                this.moveToMarker    = moveToMarker;    // function to move the center of the map to the marker with given index (zero based)
                this.preloadTiles    = preloadTiles;    // function to preload map tiles for all the available markers in the map

                this.showDots  = showDots;  // function to show all the dots added to the map for each marker
                this.hideDots  = hideDots;  // function to hide all the dots added to the map for each marker
                this.showLines = showLines; // function to show all the lines added to the map for each marker
                this.hideLines = hideLines; // function to hide all the lines added to the map for each marker

                this.showPin = showPin; // function to show the pin at the given index (zero based)
                this.hidePin = hidePin; // function to hide the pin at the given index (zero based)
            })();
        }

        // return internal class
        return Map;
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .factory("Map", Map); // set factory

})();
