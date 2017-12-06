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
//   Factory - Line
// -------------------------------------
/**
    * @name line.factory
    * @desc The extendable line factory for the app that contains functions create
            to and interact with a custom google map marker line on a given map.
**/
(function() {
    console.log("factories/line.factory.js loaded.");

    /**
        * @name Line
        * @desc Class for the line factory.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} LoggerService - The custom logger service
        * @return {Object} - The instance of the factory class
    **/
    function Line(CONFIG, LoggerService) {
        "ngInject"; // tag this function for dependancy injection


        /**
            * @name Line
            * @desc Class for the line factory with custom constructors.
            * @param {Object} options - the options for the map constructor
            *        {Object.Object} options.map      - the google map, the line is attached to (mandatory)
            *        {Object.Object} options.google   - the google map script object for the map (mandatory)
            *        {Object.Object} options.stype    - the type of the start coords for the given line (optional)
            *        {Object.Object} options.etype    - the type of the ending coords for the given line (optional)
            *        {Object.Object} options.scoords  - the start lat, lng coordinates for the line on the map (mandatory)
            *        {Object.Object} options.ecoords  - the ending lat, lng coordinates for the line on the map (mandatory)
            *        {Object.Object} options.routes   - the route to follow from the start to end coordinates (mandatory)
            *        {Object.Object} options.isActive - the flag that indicates if the line is active (optional)
        **/
        function Line(options) {
            // ---------------------------------------------
            //   Private members
            // ---------------------------------------------
            var self  = this; // reference to get the context of this
         /* var _el   = null; // reference to the custom line DOM element */
            var _line = null; // reference to the custom google map polyline

            var _isActive  = false; // flag to indicate if the line is active
            var _isVisible = false; // flag to indicate if the line is visible

            var _google  = null; // reference to the google map script object used in the factory
            var _routes  = [];   // reference to the route to follow from the start to end coordinates
            var _path    = [];   // reference to the line path array contaning google.map.LatLng objects

            var _stype = "default"; // reference to the start coords type for the line
            var _etype = "default"; // reference to the ending coords type for the line

            var _scoords = { lat: 0, lng: 0 }; // reference to the polyline start lat, lng coordinates
            var _ecoords = { lat: 0, lng: 0 }; // reference to the polyline end lat, lng coordinates

            var _slatlng = null; // reference to the object with google.maps.LatLng for the start coordinates
            var _elatlng = null; // reference to the object with google.maps.LatLng for the end coordinates

            var _drawAnimation = null;   // reference to the returned draw animation object with cancel
            var _fadeAnimation = null;   // reference to the returned fade animation object with cancel

            var _drawAnimDuration = { fast: 200, slow: 650, slower: 850 }; // references to the draw animation duration
            var _fadeAnimDuration = { fast: 300, slow: 500, slower: 650 }; // references to the fade animation duration

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
            // @name _areRoutesValid
            // @desc function to check if the given routes and coordinates are valid
            // @param {Array} routes - the array of route objects to check for validity
            // @return {Boolean} - true if the routes are valid, false if they are not
            function _areRoutesValid(routes) {
                // only proceed if the the given routes are
                // valid arrays of object with coordinates
                if(!routes || !Array.isArray(routes)) {
                    return false; // return false if not
                }


                // set default value for the
                // validity flag to be true
                var areRoutesValid = true;

                // only proceed if the the given routes are
                // valid arrays of object with coordinates
                routes.forEach(function(route, index) {
                    if(areRoutesValid) { try {
                        if(typeof route.type !== "string"
                        || typeof route.dcoords.lat !== "number"
                        || typeof route.dcoords.lng !== "number"
                        || typeof route.pcoords.lat !== "number"
                        || typeof route.pcoords.lng !== "number") {
                            areRoutesValid = false; // set flag to false
                        }}

                        // on error
                        catch(error) {
                            console.log(error); // print error to console
                            areRoutesValid = false; // set flag to false
                        }
                    }
                });

                // return validity flag
                return areRoutesValid;
            }


            // @name _getDistance
            // @desc function to calculate the distance between the 2 given coordinates
            // @note this method, formula has been simplfied to be faster, but less accurate
            // @param {Object} scoords - the start lat, lng coordinates to calculate the distance from
            // @param {Object} ecoords - the ending lat, lng coordinates to calculate the distance to
            // @param {Number} accuracy - the accuracy of the calculated distance (in metres)
            // @return {Number} - the calculated distance between the coordinates (in metres)
            function _getDistance(scoords, ecoords, accuracy) {
                // set default value for accuracy (in metres)
                accuracy = Math.floor(accuracy) || 1;

                // calculate the
                // required distance
                var distance =
                    Math.round(
                        Math.acos( // get arccosine of result
                            Math.sin( // get the sine of elat
                                ecoords.lat.toRad() // convert elat to radian
                            ) *
                            Math.sin( // get the sine of slat
                                scoords.lat.toRad() // convert slat to radian
                            ) +
                            Math.cos( // get the cosine of elat
                                ecoords.lat.toRad() // convert elat to radian
                            ) *
                            Math.cos( // get the cosine of slat
                                scoords.lat.toRad() // convert slat to radian
                            ) *
                            Math.cos( // get cosine of both slng and elng
                                // convert both slng and elng to radian
                                scoords.lng.toRad() - ecoords.lng.toRad()
                            )
                        ) * 6378137 // radius of the earth (in metres)
                    );

                // round off, floor and return the calculated distance
                return Math.floor(Math.round(distance / accuracy) * accuracy);
            }

            // @name _getLinePath
            // @desc function to get the line path for the given coordinates through the given routes
            // @param {Object} scoords - the start lat, lng coordinates to calculate the line path from
            // @param {Object} ecoords - the ending lat, lng coordinates to calculate the line path to
            // @param {Array} routes - the array of route objects between start and end coordinates
            // @return {Array} - an array of google.map.LatLng objects that represent the line path
            function _getLinePath(scoords, ecoords, routes) {
                var linePath = []; // create a new line path array

                // add google.map.LatLng that corresponds to the start coordinate
                linePath.push(new _google.maps.LatLng(scoords.lat, scoords.lng));

                // loop through each of the given route
                routes.forEach(function(route, index) {
                    // add google.map.LatLng that corresponds to each of the given route
                    linePath.push(new _google.maps.LatLng(route.coords.lat, route.coords.lng));
                });

                // add google.map.LatLng that corresponds to the end coordinate
                linePath.push(new _google.maps.LatLng(ecoords.lat, ecoords.lng));
                return linePath; // return the array of google.map.LatLng objects
            }

            // @name _getLineOpacity, _getLineGeodesic, _getLineWeight, _getLineColor
            // @desc functions to get the options for this line, which is to be used for re-draw
            // @return {Number, Boolean, String} - the value of the option based on what was required
            function _getLineOpacity()  { return (_isVisible ? 1 : 0); } // get the line stroke opacity
            function _getLineGeodesic() { return (_routes.length ? false : true); } // get if tje line is curved
            function _getLineWeight()   { return (CONFIG.breakpoint.isMobile ? 2 : 3); } // get the line stroke weight
            function _getLineColor()    { return (_isActive ? _colorHex.active : _colorHex.default); } // get line stroke color

            // @name _sortRoutes
            // @desc function to sorts an array of route objects by distance from a reference coordinate
            // @param {Array} routes - the array of route objects that need to be sorted by distance
            // @param {Object} scoords - the ref start coordinates to calculate the distance from
            // @retun {Array} - a sorted array copied from the original array of route objects
            function _sortRoutes(routes, scoords) {
                // create an empty array
                var sortedRoutes = [];

                // map existing routes to array with computed distance
                // between each route and the given start coordinate
               sortedRoutes = Object.keys(routes).map(function(key) {
                    var route = angular.copy(routes[key]); /* route.key = key; */
                    route.distance = _getDistance(scoords, routes[key].coords);
                    return route; // add distance to route to use for sorting
                }, this);

                // return the new array after sorting it using
                // distance from the given start coordinate
                return sortedRoutes.sort(function(a, b) {
                    return (a.distance - b.distance);
                });
            }

            // @name _parseRoutes
            // @desc function to recurse and parse given routes and modify
            //       it by replacing any missing information with default values
            // @param {String} routes - the routes to be parsed and checked for missing information
            // @return {String} - a copy of the parsed and modifed routes once the parsing is complete
            function _parseRoutes(routes) {
                // make a local copy of the routes
                var routes = angular.copy(routes);

                // the route only requires one set
                // of coordinates to draw the line
                routes.forEach(function(route, index) {
                    // copy the dot coorindates into a new
                    // key and delete the old set of keys
                    route.coords = angular.copy(route.dcoords);
                    delete route.dcoords; delete route.pcoords;
                });

                // sort the routes based on distance from start
                var sortedRoutes = _sortRoutes(routes, _scoords)
                var endDistance  = _getDistance(_scoords, _ecoords);

                // check if any of the route lies beyond the max allowed
                // distance of the end coordinate from start coordinate
                sortedRoutes.forEach(function(route, index) {
                    var routeDistance = _getDistance(_scoords, route.coords);
                    if(route.type !== "route" && routeDistance >= endDistance) {
                        // note: only applicable for non 'route' objects
                        sortedRoutes.splice(index, 1); // delete the route
                    }
                });

                // return the parsed and modified
                // routes after sorting by distance
                // form the given start coordinates
                return sortedRoutes;
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

            // @name _animateDraw
            // @desc function to animate and draw the line through the given path in the given duration
            // @param {Number} path - the array for the line path containing google.map.LatLng objects
            // @param {Number} duration - the duration for the animation in ms through the given path
            // @param {Function} update - the progress function called while the animation progresses
            // @param {Function} done - the callback function called when the animation has completed
            // @return {Function} - the function that can be called to cancel the current animation
            function _animateDraw(path, duration, update, done) {
                // only proceed if the path contains an array of
                // valid google.map.LatLng objects for the animation
                if(!Array.isArray(path) || !path.length) {
                    console.warn("line.factory.js: Cannot do draw animation with the given path:");
                    console.warn("path: ", (path ? path : "path is not defined."));
                    return null; // return null object on error
                }

                // only proceed if the given duration is valid
                if(!duration || typeof duration !== "number") {
                    console.warn("line.factory.js: Cannot do draw animation with the given options:");
                    console.warn("duration: ", (duration ? duration : "duration is not defined."));
                    return null; // return null object on error
                }

                // check if update and done are valid functions (assign defaults if not)
                if(typeof update !== "function") { update = function() { /* do nothing */ }; }
                if(typeof done   !== "function") { done   = function() { /* do nothing */ }; }

                // there needs to be 60 updates per second (60 fps)
                // so for -duration- seconds the no.of updates is
                var updates = parseInt((duration * 60) / 1000);

                // an array of values containing the
                // value to be set at each update
                // when the animation is running
                var values = [];

                // calculate the distance between the first and the last point
                var totalPoints   = path.length; // get the total no.of points in the path
                var totalDistance = 0;  // set default value for the maximum total distance of the line
                var thisDistances = []; // set reference to hold the distance of each route in the line

                // loop through each point in path
                path.forEach(function(point, index) {
                    // only proceed if this is not the last point
                    if((index + 1) >= totalPoints) { return false; }

                    var currPoint = point;           // get the current point in the path
                    var nextPoint = path[index + 1]; // and get the next point in the path

                    // calculate the distance between the current point and the next point in the path of the line
                    var thisDistance = _google.maps.geometry.spherical.computeDistanceBetween(currPoint, nextPoint);

                    thisDistances.push(thisDistance); // add this distance to the array
                    totalDistance += thisDistance;    // add this distance to the total
                });

                // loop through each point in path
                path.forEach(function(point, index) {
                    // only proceed if this is not the last point
                    if((index + 1) >= totalPoints) { return false; }

                    var currPoint = point;           // get the current point in the path
                    var nextPoint = path[index + 1]; // and get the next point in the path

                    // get the distance between the current point
                    // and the next point in the path of the line
                    var thisDistance = thisDistances[index];

                     // get the approximate no.of updates between the current point and the next point
                    var thisUpdates  = Math.floor(parseInt((thisDistance / totalDistance) * updates));

                    // calculate the intermediate values to be updated at
                    // each step, for when the animation runs (no easing)
                    for(var i = 1; i < thisUpdates; i++) {
                        var value = _google.maps.geometry.spherical.interpolate(currPoint, nextPoint, i / thisUpdates);
                        values.push(value); // add the calculated increment to the array
                    }

                    // add the final required
                    // increment to the array
                    values.push(nextPoint);
                });

                /*
                // print the no.of updates and the values to confirm the draw animation curve
                console.log("-----------------------------------------------------------------------");
                console.log("line.factory.js: No.of updates for the draw animation: " + values.length);
                console.log("values: ", values); console.log("----------------"); */

                /*
                // print the values for each updated frame
                values.forEach(function(value, index) {
                    if(index == 0) {
                        // if this is the first updated value
                        console.log("slat: ", _slatlng.lat(), " slng: ", _slatlng.lng());
                    }

                    // if this is an in-between updated value
                    console.log("lat: ", value.lat(), " lng: ", value.lng());

                    if(index == (values.length - 1)) {
                        // if this is the last updated value
                        console.log("elat: ", _elatlng.lat(), " elng: ", _elatlng.lng());
                    }
                }); */

                // create a new web worker to perform the animation (to be run in a seperate background thread)
                var animWorkerPath = CONFIG.path.scripts + "factories/line.factory/animation-draw.worker.js";
                if(CONFIG.environment.isProd) { animWorkerPath = animWorkerPath.replace(".js", ".min.js"); }
                var animationWorker = new Worker(animWorkerPath);

                // notify the worker to initialize the animation
                animationWorker.postMessage(JSON.stringify({
                    type: "animation.init", // the message type sent to the worker
                    duration: duration, // the duration of the animation
                    values: values // the values updated at each frame
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
                                update(event.value, event.step, event.updates);
                            }); break;
                        }

                        // function called on animation complete
                        case "animation.complete": {
                            requestAnimationFrame(function() {
                                done(event.value, event.step, event.updates);

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

                    LoggerService.error("line.factory.js: Cannot use web workers to perform the draw animation:");
                    LoggerService.error("worker.message: " + (event.message ? event.message : "message is not defined."));

                    requestAnimationFrame(function() {
                        // run the function called on animation complete
                        // with the final value and set the step as -ve
                        done(values[values.length - 1], -1, values.length);

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

            // @name _animateFade
            // @desc function to animate and fade the line from the given start to the end opacity
            // @param {Number} start - the start opacity (0 - 1) to animate and fade the line from
            // @param {Number} end - the ending opacity (0 - 1)  to animation and fade the line to
            // @param {Function} update - the progress function called while the animation progresses
            // @param {Function} done - the callback function called when the animation has completed
            // @return {Function} - the function that can be called to cancel the current animation
            function _animateFade(start, end, duration, update, done) {
                // only proceed if the given opacities are valid
                if(typeof start !== "number" || start < 0 || start > 1
                || typeof end   !== "number" || end   < 0 || end   > 1) {
                    console.warn("line.factory.js: Cannot do fade animation with the given opacities:");
                    console.warn("start: ", (start !== null ? start : "start is not defined."));
                    console.warn("end: ", (end !== null ? end : "end is not defined."));
                    return null; // return null object on error
                }

                // only proceed if the given duration is valid
                if(!duration || typeof duration !== "number") {
                    console.warn("line.factory.js: Cannot do fade animation with the given options:");
                    console.warn("duration: ", (duration ? duration : "duration is not defined."));
                    return null; // return null object on error
                }

                // check if update and done are valid functions (assign defaults if not)
                if(typeof update !== "function") { update = function() { /* do nothing */ }; }
                if(typeof done   !== "function") { done   = function() { /* do nothing */ }; }

                // create a new web worker to perform the animation (to be run in a seperate background thread)
                var animWorkerPath = CONFIG.path.scripts + "factories/line.factory/animation-fade.worker.js";
                if(CONFIG.environment.isProd) { animWorkerPath = animWorkerPath.replace(".js", ".min.js"); }
                var animationWorker = new Worker(animWorkerPath);

                // notify the worker to initialize the animation
                animationWorker.postMessage(JSON.stringify({
                    type: "animation.init", // the message type sent to the worker
                    duration: duration, // the duration of the animation
                    start: start, // the start value for the animation
                    end: end // the end value for the animation
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
                                update(event.value, event.step, event.updates);
                            }); break;
                        }

                        // function called on animation complete
                        case "animation.complete": {
                            requestAnimationFrame(function() {
                                done(event.value, event.step, event.updates);

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

                    LoggerService.error("line.factory.js: Cannot use web workers to perform the fade animation:");
                    LoggerService.error("worker.message: " + (event.message ? event.message : "message is not defined."));

                    requestAnimationFrame(function() {
                        // run the function called on animation complete
                        // with the final value and set the step as -ve
                        done(end, -1, parseInt((duration * 60) / 1000));

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

            // @name _onWindowResizeListener
            // @desc function to be executed on window resize event
            // @param (Event) event - the event that triggered this function
            var _onWindowResizeListener = debounce(function(event) {
                // manually trigger re-draw for the line if it is
                // visible and no animations are currently in progress
                if(_isVisible && _drawAnimation === null) { draw(); }
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
            /// @name init
            // @desc function called when a line object is initialized
            function init() {
                // note: nothing needs to be done here
                // the line is intialized automatically
            }

            // @name destroy
            // @desc function called when the line object is destroyed
            function destroy() {
                // cancel any existing draw animations
                // that might be currently in progress
                if(_drawAnimation !== null) { try {
                    _drawAnimation.cancel(); // cancel the animation
                    _drawAnimation = null; } // reset the reference
                    catch(error) { console.log(error); }
                }

                // cancel any existing fade animations
                // that might be currently in progress
                if(_fadeAnimation !== null) { try {
                    _fadeAnimation.cancel(); // cancel the animation
                    _fadeAnimation = null; } // reset the reference
                    catch(error) { console.log(error); }
                }

                // remove listener attached
                // to the window resize event
                _removeWindowResizeListener();
                _onWindowResizeListener = null;

                // reset all references
                // to objects and arrays
                _line.setMap(null);
                _line = null; _google = null; _routes = [];
                _scoords = { lat: 0, lng: 0 }; _slatlng = null;
                _ecoords = { lat: 0, lng: 0 }; _elatlng = null;
                _path = []; _stype = "default"; _etype = "default";

                // reset all flags to their default values
                _isActive = false; _isVisible = false;
            }

            // @name setIsActive
            // @desc function to set the is active flag for the line
            // @param {Boolean} isActive - the boolean flag value to be set
            function setIsActive(isActive) {
                if(typeof isActive !== "boolean") {
                    console.warn("line.factory.js: Cannot set isActive flag for the line with the given value:");
                    console.warn(isActive ? isActive : "isActive is not defined.");
                    return; // exit the function if not valid
                }

                 // set is active flag
                _isActive = isActive;

                // manually trigger re-draw for the line if it is
                // visible and no animations are currently in progress
                if(_isVisible && _drawAnimation === null) { draw(); }
            }

            // @name getIsActive
            // @desc function to get the is active flag for the line
            function getIsActive() {
                // return is active flag for the line
                return _isActive ? _isActive : false;
            }

            // @name draw
            // @desc function called when the line object is re-drawn
            function draw() { try {
                _line.setOptions({
                    visible: _isVisible, // the current line visibility
                    geodesic: _getLineGeodesic(), // flag to indicate curved line

                    strokeOpacity: _getLineOpacity(), // the current stroke opacity
                    strokeWeight:  _getLineWeight(),  // the current stroke width
                    strokeColor:   _getLineColor()    // the current stroke color
                });}

                // on draw function call error
                catch(error) { console.log(error); }
            }

            // @name onAdd
            // @desc function called when the line object is added to the map
            function onAdd() {
                // note: nothing needs to be done here the
                // line on add is performed on initialization
            }

            // @name onRemove
            // @desc function called when the line object is removed from the map
            function onRemove() {
                // note: nothing needs to be done here the
                // line on remove is performed on destruction
            }

            // @name show
            // @desc function called to show the line on the map
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function show() {
                return new Promise(function(resolve, reject) {
                    if(_isVisible) {
                        console.warn("line.factory.js: Cannot show a line that is already visible.");
                        return resolve(false); // resolve promise with false on error
                    }

                    // cancel any existing draw animations
                    // that might be currently in progress
                    if(_drawAnimation !== null) { try {
                        _drawAnimation.cancel(); // cancel the animation
                        _drawAnimation = null; } // reset the reference
                        catch(error) { console.log(error); }
                    }

                    // cancel any existing fade animations
                    // that might be currently in progress
                    if(_fadeAnimation !== null) { try {
                        _fadeAnimation.cancel(); // cancel the animation
                        _fadeAnimation = null; } // reset the reference
                        catch(error) { console.log(error); }
                    }

                    // set the is visible flag to true
                    _isVisible = true; draw();

                    // set duration based on the start and end types
                    var duration = _drawAnimDuration.slow; // default animation duration (slow)
                    if     (_stype == "factory" && _etype == "port"  )     { duration = _drawAnimDuration.fast;   } // factory to port (fast)
                    else if(_stype == "port"    && _etype == "dealership") { duration = _drawAnimDuration.fast;   } // port to dealer (fast)
                    else if(_stype == "port"    && _etype == "port"  )     { duration = _drawAnimDuration.slower; } // port to port (slower)

                    // perform the draw animation with the given options
                    _drawAnimation = _animateDraw(_path, duration,
                        // function called on animation progress
                        function(value, step, updates) { try {
                            // draw the line by updating the
                            // path array with the new value
                            var path = _line.getPath().getArray();
                            path.push(value); _line.setPath(path); }

                            // resolve the promise on animation error
                            catch(error) { console.log(error); return resolve(false); }
                        },

                        // function called on animation complete
                        function(value, step, updates) { try {
                            // check if the animation was completed or cancelled
                            if(step !== updates) { // if animation was cancelled
                                _line.setPath(_path); // complete the line path
                            }

                            // resolve the promise
                            // on animation complete
                            _drawAnimation = null;
                            return resolve(true); }

                            // resolve the promise on animation error
                            catch(error) { console.log(error); return resolve(false); }
                        }
                    );
                });
            }

            // @name hide
            // @desc function called to hide the line on the map
            // @return {Promise(Boolean)} - the resolved promise with a boolean success flag
            function hide() {
                return new Promise(function(resolve, reject) {
                    if(!_isVisible) {
                        console.warn("line.factory.js: Cannot hide a line that is already hidden.");
                        return resolve(false); // resolve promise with false on error
                    }

                    // cancel any existing draw animations
                    // that might be currently in progress
                    if(_drawAnimation !== null) { try {
                        _drawAnimation.cancel(); // cancel the animation
                        _drawAnimation = null; } // reset the reference
                        catch(error) { console.log(error); }
                    }

                    // cancel any existing fade animations
                    // that might be currently in progress
                    if(_fadeAnimation !== null) { try {
                        _fadeAnimation.cancel(); // cancel the animation
                        _fadeAnimation = null; } // reset the reference
                        catch(error) { console.log(error); }
                    }

                    // set default animation duration (fast)
                    var duration = _fadeAnimDuration.fast;

                    // perform the fade animation with the given options
                    _fadeAnimation = _animateFade(1, 0, duration,
                        // function called on animation progress
                        function(value, step, updates) { try {
                            // fade the line by updating the
                            // stroke opacity with the new value
                            _line.setOptions({
                                visible: _isVisible, // the current line visibility
                                geodesic: _getLineGeodesic(), // flag to indicate curved line

                                strokeOpacity:  value,            // the current stroke opacity
                                strokeWeight:  _getLineWeight(),  // the current stroke width
                                strokeColor:   _getLineColor()    // the current stroke color
                            });}

                            // resolve the promise on animation error
                            catch(error) { console.log(error); return resolve(false); }
                        },

                        // function called on animation complete
                        function(value, step, updates) { try {
                            // check if the animation was completed or cancelled
                            if(step !== updates) { // if animation was cancelled
                                /* empty block */
                            }

                            // set the line path back to the start
                            // and set the is visible flag to false
                            _line.setPath([_path[0], _path[0]]);
                            _isVisible = false; draw();

                            // resolve the promise
                            // on animation complete
                            _fadeAnimation = null;
                            return resolve(true); }

                            // resolve the promise on animation error
                            catch(error) { console.log(error); return resolve(false); }
                        }
                    );
                });
            }

            // ---------------------------------------------
            //   Constructor block
            // ---------------------------------------------
            /* -- note: checks for mandatory params -- */
            // check if the given options is valid
            if(!options || typeof options !== "object") {
                LoggerService.error("line.factory.js: Cannot create line without the required options:");
                LoggerService.error((options !== null) ? options : "options is not defined.");
                return null; // return empty instance on error
            }

            // check if the given google object is valid
            if(!options.google || !options.google.maps
            || typeof options.google.maps.Polyline !== "function"
            || typeof options.google.maps.geometry.spherical !== "object") {
                LoggerService.error("line.factory.js: Cannot create line with the given script object:");
                LoggerService.error((options.google !== null) ? options.google : "options.google is not defined.");
                return null; // return empty instance on error
            }

            // set the google script object
            _google = options.google;

            // check if the given start lat, lng coordinates are valid
            if(!options.scoords || !options.scoords.lat || !options.scoords.lng
            || typeof options.scoords.lat !== "number" || typeof options.scoords.lat !== "number") {
                LoggerService.error("line.factory.js: Cannot create line with the given start coords object:");
                LoggerService.error((options.scoords !== null) ? options.scoords : "options.scoords is not defined.");
                return null; // return empty instance on error
            }

            // set the line start coordinates
            _scoords = options.scoords; // and get lat, lng from coordinates
            _slatlng = new _google.maps.LatLng(_scoords.lat, _scoords.lng);

            // check if the given end lat, lng coordinates are valid
            if(!options.ecoords || !options.ecoords.lat || !options.ecoords.lng
            || typeof options.ecoords.lat !== "number" || typeof options.ecoords.lat !== "number") {
                LoggerService.error("line.factory.js: Cannot create line with the given end coords object:");
                LoggerService.error((options.ecoords !== null) ? options.ecoords : "options.ecoords is not defined.");
                return null; // return empty instance on error
            }

            // set the line end coordinates
            _ecoords = options.ecoords; // and get lat, lng from coordinates
            _elatlng = new _google.maps.LatLng(_ecoords.lat, _ecoords.lng);

            // check if the given route and coordinates are valid
            if(!options.routes || !_areRoutesValid(options.routes)) {
                LoggerService.error("line.factory.js: Cannot create line with the given array of route objects:");
                LoggerService.error((options.routes !== null) ? options.routes : "options.routes is not defined.");
                return null; // return empty instance on error
            }

            // extend number with a function to convert value to radian
            if (typeof(Number.prototype.toRad) === "undefined") {
                Number.prototype.toRad = function() {
                    return (this * (Math.PI / 180));
                };
            }

            // extend number with a function to convert value to degree
            if (typeof(Number.prototype.toDeg) === "undefined") {
                Number.prototype.toDeg = function() {
                    return (this * (180 / Math.PI));
                };
            }

            // parse the routes and strip
            // any irrelevant information
            // note: they are also sorted
            _routes = _parseRoutes(options.routes); /*
            console.log("-------------------------------");
            console.log("origin routes: ", options.routes);
            console.log("sorted routes: ", _routes); */

            // obtain the line path for the obtained routes
            // between the given start and ending coordinates
            _path = _getLinePath(_scoords, _ecoords, _routes); /*
            console.log("line path: ", _path); */

            // check if the given map object is a valid map
            if(!options.map || !options.map.mapTypes || !options.map.overlayMapTypes) {
                LoggerService.error("line.factory.js: Cannot create line with the given map object:");
                LoggerService.error((options.map !== null) ? options.map : "options.map is not defined.");
                return null; // return empty instance on error
            }

            /* -- note: checks for optional params -- */
            // check if valid type for the start and
            // the end coords for the line were given
            if(!options.stype || !options.etype
            || typeof options.stype !== "string"
            || typeof options.etype !== "string") {
                LoggerService.warn("line.factory.js: Cannot create line with the given coords types:");
                LoggerService.warn((options.stype !== null) ? options.stype : "options.stype is not defined.");
                LoggerService.warn((options.etype !== null) ? options.etype : "options.etype is not defined.");
                options.stype = "default"; options.etype = "default"; // set the default start and end types
            }

            // set the start and end types
            _stype = options.stype;
            _etype = options.etype;

            // check if a valid active flag has been set
            if(typeof options.isActive !== "boolean") {
                LoggerService.warn("line.factory.js: Cannot create line with the given isActive flag:");
                LoggerService.warn((options.isActive !== null) ? options.isActive : "options.isActive is not defined.");
                options.isActive = false; // set the is active flag to be false
            }

            // set the is active flag
            _isActive = options.isActive;

            // create a new google maps polyline
            _line = new _google.maps.Polyline({
                map: options.map, // the map the polyline is to be drawn on
                path: [_path[0], _path[0]], // the path followed by the line

                visible: _isVisible, // the line visibility on initialization
                geodesic: _getLineGeodesic(), // flag to indicate curved line

                strokeOpacity: _getLineOpacity(), // the default stroke opacity
                strokeWeight:  _getLineWeight(),  // the default stroke width
                strokeColor:   _getLineColor()    // the default stroke color
            });

            /*
            // add a listener to the window resize event
            // note: this is not required since re-draw
            // will not ne required on window resize
            _addWindowResizeListener(); */

            // ---------------------------------------------
            //   Instance block
            // ---------------------------------------------
            return new (function() {
                /* -- note: getting object prototype -- */
                var prototype = Object.getPrototypeOf(this);

                /* -- note: mandatorily inherited methods -- */
                prototype.init    = init;    // function called when a line object is initialized
                prototype.destroy = destroy; // function called when a line object is destroyed

                prototype.setIsActive = setIsActive; // function to get the is active flag for the line
                prototype.getIsActive = getIsActive; // function to get the is active flag for the line

                prototype.draw     = draw;     // function called when the line object is re-drawn
                prototype.onAdd    = onAdd;    // function called when the line object is added to the map
                prototype.onRemove = onRemove; // function called when the line object is removed from the map

                /* -- note: optionally inherited methods -- */
                this.show = show; // function called to show the line on the map
                this.hide = hide; // function called to hide the line on the map
            })();
        }

        // return internal class
        return Line;
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .factory("Line", Line); // set factory

})();
