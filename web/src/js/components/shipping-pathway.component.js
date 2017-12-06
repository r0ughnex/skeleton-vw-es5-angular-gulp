"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("velocity");
**/

// base
require("../base/raf");
require("../base/query");
require("../base/promise");
require("../base/debounce");

// -------------------------------------
//   Component - Shipping Pathway
// -------------------------------------
/**
    * @name shipping-pathway.component
    * @desc The shipping pathway component for the app.
**/
  (function() {
    console.log("components/shpwy.component.js loaded.");

    /**
        * @name ShippingPathwayController
        * @desc Class for the shipping pathway controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Service} $state - Service in module
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} PageService - The custom page service
        * @param {Service} LoggerService - The custom logger service
        * @param {Service} ShippingService - The custom shipping service
        * @param {Service} GoogleMapsService - The custom google maps service
        * @param {Factory} Map - The custom extendable map factory
        * @return {Object} - The instance of the controller class
    **/
    function ShippingPathwayController($scope, $element, $state, CONFIG, ScopeService, PageService,
                                       LoggerService, ShippingService, GoogleMapsService, Map) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el     = null; // reference to the DOM element
        var _elPage = null; // reference to the current page DOM
        var _elHtml = null; // reference to the current html DOM
        var _elMap  = null; // reference to the DOM for the google maps

        var _mapFieldTextLoading  =  "Tracking my journey";       // default loading text
        var _mapFieldTextError    =  "Error tracking my journey"; // default error text

        var _userId     = ""; // reference to the current user id
        var _modelName  = ""; // reference the vehicle model name
        var _modelImage = ""; // reference the vehicle model image

        var _onScrollTimer = null; // reference tot he on scroll timer
        var _onScrollListener = null; // reference to the on scroll listener

        var _query = { // reference to the different queries used select DOM elements
            map: ".shpwy__map-area__map" // query for selecting the google map element
        };

        var _map = null;  // reference to the custom map object initialized on the map area
        var _startAt = 1; // reference to the journey start position for the current user (one based)
        var _animationQueue = []; // reference to the queue to which the interaction animations are queued
        var _isAnimQueueRunning = false; // flag to indicate if any of the animation in the queue are running

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl    = this;   // to capture the context of this
        ctrl.CONFIG = CONFIG; // reference to the config constant

        ctrl.isLoading = true;  // flag to indicate if is the data is loading
        ctrl.isReady   = false; // flag to indicate if is the component is ready

        ctrl.mapMarkers    = []; // reference to the map markers on display on the map area
        ctrl.mapFieldTexts = []; // reference to the field texts on display on the map area

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            _parseAttributes(ctrl); // parse the bound attributes
            ctrl.data = _parseData(ctrl.data); // parse bound data

            // set the loading text as the
            // default field text on init
            _setMapFieldText(_mapFieldTextLoading);
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            // get the DOM elements
            _el = $element[0];
            _elHtml = PageService.getHtml();
            _elPage = PageService.getPage();
            _elMap  = query(_query.map, _el)[0];

            // show the loader on start
            _showLoader().then(function() {
                // get the shipping data for the given name and id
                ShippingService.getData(_modelName, _userId).then(function(response) {
                    console.log("------------------------------------------------------------------------------");
                    console.log("shpwy.component.js: Parsed response from the service for the shipping data is:");
                    console.log(response);

                    // set the map markers from the response
                    ctrl.mapMarkers = response &&
                                      response.markers ?
                                      response.markers : [];

                    // update the component scope
                    ScopeService.digest($scope);

                    // check if markers exist
                    if(ctrl.mapMarkers.length) {
                        // check if the given start at value is valid
                        if((_startAt - 1) >= ctrl.mapMarkers.length) {
                            // note: default in this case is the maximum value
                            // and not the start value like in all other cases
                            _startAt = ctrl.mapMarkers.length; // reset to default if not
                            LoggerService.error("shpwy.component.js: Invalid start-at position index detected.");
                            LoggerService.error("shpwy.component.js: The start-at value has been reset to: " + _startAt);
                        }

                        // get the google map styles required by the component
                        GoogleMapsService.getStyles().then(function(styles) {
                            console.log("shpwy.component.js: Google map custom styles object loaded.");

                            // get the google map scripts required by the component
                            GoogleMapsService.getScripts().then(function(google) {
                                console.log("shpwy.component.js: Google map custom scripts object loaded.");

                                // only proceed if google maps exist
                                if(google !== null && google.maps) {
                                    // initialize a new custom map
                                    // with loaded styles and data
                                    _map = new Map({
                                        elem:    _elMap,  // set map element
                                        styles:  styles,  // set map style object
                                        google:  google,  // set map script object

                                        startAt: _startAt, // set the current start at index
                                        markers: ctrl.mapMarkers, // set all the map markers

                                        image: _modelImage, // set the image for the marker
                                        speed:  window.getGoogleMapsSpeed() // set map speed
                                    });

                                    console.log("shpwy.component.js: Custom map object initialized on the map area.");
                                    console.log(_map);

                                    // if a valid map object was not
                                    // initialized on the map area
                                    if(!_map || typeof _map.preloadTiles !== "function") {
                                        if(_isComponentInView()) {
                                            // if the component is in view
                                            console.log("shpwy.component.js: The shpwy component is in view.");
                                            _onPostLinkMapError(); // trigger the on post link error function
                                        }

                                        else {
                                            // if the component is in not view
                                            console.warn("shpwy.component.js: The shpwy component is not in view.");
                                            _addScrollListener(_onPostLinkMapError); // add scroll listener to the page
                                        }
                                    } // nested if end

                                    // else preload all the map tiles to
                                    // ensure smoother pan animations
                                    else { _map.preloadTiles().then(function() {
                                        if(_isComponentInView()) {
                                            // if the component is in view
                                            console.log("shpwy.component.js: The shpwy component is in view.");
                                            _onPostLinkSuccess(); // trigger the on post link success function
                                        } // nested if end

                                        else {
                                            // if the component is in not view
                                            console.warn("shpwy.component.js: The shpwy component is not in view.");
                                            _addScrollListener(_onPostLinkSuccess); // add scroll listener to the page
                                        } // nested else end
                                    });} // nested else end
                                } // main if end

                                // if the maps doesn't exist set
                                // error message on the map field
                                else { _onPostLinkMapError(); } // main else end
                            }); // GoogleMapsService.getScripts end
                        }); // GoogleMapsService.getStyles end
                    }

                    // if the markers don't exist set
                    // error message on the map field
                    else { _onPostLinkDataError(); }
                }); // ShippingService.getData end
            });
        }

        // @name _onPostLinkSuccess
        // @desc function to be executed on post link success
        function _onPostLinkSuccess() {
            console.log("shpwy.component.js: The custom onPostLinkSuccess() trigger in progress.");

            // get the marker at the given start position
            var startIndex  = _startAt - 1; // start index
            var startMarker = ctrl.mapMarkers[startIndex];

            // hide the loader on complete
            _hideLoader().then(function() {
                console.log("shpwy.component.js: The custom onPostLinkSuccess() trigger complete.");

                // note: the timeout is for smoother map draw animations
                setTimeout(function() { /* requestAnimationFrame(function() { */
                    // show all the dots added to the map
                    _map.showDots(); // show the dots

                    // note: the timeout is for smoother map draw animations
                    setTimeout(function() { /* requestAnimationFrame(function() { */

                        // show all the lines added to the map
                        _map.showLines().then(function() {
                            // show the pin at the given start position
                            _map.showPin(startIndex).then(function() {
                                // set the component as ready
                                _setReady().then(function() {
                                    // set map field text from the marker that
                                    // corresponds to the given start position
                                    _setMapFieldText(startMarker.name);
                                }); // _setReady end
                            }); // _map.showPin end
                        }); // _map.showLines end

                    /* }); */ }, ((startIndex < 2) ? CONFIG.timeout.scope : 0)); // delay for lines
                /* }); */ }, CONFIG.timeout.animation); // the delay before the dot animation starts
            });
        }

        // @name _onPostLinkDataError
        // @desc function to be executed on post link data error
        function _onPostLinkDataError() {
            // set the component as not ready
            _setNotReady().then(function() {
                _setMapFieldText(_mapFieldTextError); // set error message on the map field
                LoggerService.error("shpwy.component.js: Error loading required shipping data from server.");
            }); // _setReady end
        }

        // @name _onPostLinkMapError
        // @desc function to be executed on post link map error
        function _onPostLinkMapError() {
            // set the component as not ready
            _setNotReady().then(function() {
                _setMapFieldText(_mapFieldTextError); // set error message on the map field
                LoggerService.error("shpwy.component.js: Error loading google scripts and map from server.");
            }); // _setReady end
        }

        // @name _parseAttributes
        // @desc function to parse the bound attributes and
        //       replace any missing information with default values
        // @params {Object} ctrl - the controller attributes are bound to
        function _parseAttributes(ctrl) {
            // parse the component start at index value
            // the start at index is one based (not zero
            // based), so it's value can never be less that 1
            _startAt = parseInt(ctrl.startAt); // parse the start at
            if(isNaN(_startAt) || _startAt < 1) { _startAt = 1; } // (one based)
            console.log("---------------------------------------------------------");
            console.log("shpwy.component.js: The start-at value has been set at: " + _startAt);
        }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);
            var vehicle = data.vehicle ? data.vehicle : null;

            // printing the vehicle information for
            // verification while in development mode
            if(!CONFIG.environment.isProd) {
                console.log("shpwy.component.js: Vehicle data bound to the component is:");
                Object.keys(vehicle).forEach(function(key) {
                    console.log(key + ": " + vehicle[key]);
                });
            }

            // get the vehicle model name
            // and the current hub user id
            var params  = $state.params;
            _userId     = params["id"] ? params["id"] : "";
            _modelName  = vehicle["model_name"]  ? vehicle["model_name"]  : "";
            _modelImage = vehicle["model_image"] ? vehicle["model_image"] : "";

            // check if the vehicle name
            // is a string of valid length
            if(!_modelName || !_modelName.length) {
               _modelName = "Golf" // set a default vehicle name for the user
               data.vehicle["model_name"] = _modelName; // set name back to object
            }

            // check if the vehicle image
            // is a string with valid URL
            if(_modelImage.indexOf("http://")  === -1
            && _modelImage.indexOf("https://") === -1) {
                // set a valid placeholder for the image if is not a valid URL
                _modelImage = "https://via.placeholder.com/800x450.jpg/ffffff/808890";
                data.vehicle["model_image"] = _modelImage; // set image back to object
            }

            // return the parsed data
            return data;
        }

        // @name _isComponentInView
        // @desc function to check if the shpwy component is in view
        // @return {Boolean} - true if the component is in view, false if not
        function _isComponentInView() {
            var style = getComputedStyle(_el); // get the computed style
            var rect  = _el.getBoundingClientRect(); // get bounding rect

            return (
                (style["display"] != "none") && // check if display was set to none
                rect.left >= (0 - (rect.width / 2)) && // check the horizontal bounds
                rect.right <= ((window.innerWidth || _elHtml.clientWidth) + (rect.width / 2)) &&

                rect.top >= (0 - (rect.height / 2)) && // check the vertical bounds
                rect.bottom <= ((window.innerHeight || _elHtml.clientHeight) + (rect.height / 2))
            );
        }

        // @name _addScrollListener
        // @desc function to add a scroll listener to the page
        // @param {Function} - the scroll listener function to be added
        function _addScrollListener(onScrollListener) {
            // only proceed if a valid function was given
            if(typeof onScrollListener !== "function") {
                return; // exit the function if not valid
            }

            // clear previously set timer
            if(_onScrollTimer !== null) {
                clearTimeout(_onScrollTimer); // clear the timer
                _onScrollTimer = null; // reset it back to null
            }

            // add a debounce to the given listener function and
            // store a reference to it, so as it can be removed
            _onScrollListener = debounce(function(event) {
                // if the component is in view
                if(_isComponentInView()) {
                    // remove the scroll listener immediately
                    _removeScrollListener(_onScrollListener);

                    // trigger the function after a set timeout to
                    // ensure that the user can see the event happen
                    _onScrollTimer = setTimeout(function() {
                        onScrollListener(); // the trigger
                    }, CONFIG.animation.durationSlow);
                }

                // if the component is not in view
                else { /* empty block */ }
            }, CONFIG.timeout.scope / 4);

            // add the scroll listener to the page scroll event
            // note: the event is also added to window resize
            console.warn("shpwy.component.js: Adding custom _onScrollListener() to the page.");
            _elPage.addEventListener("scroll", _onScrollListener); // add page scroll listener
            window.addEventListener("resize", _onScrollListener);  // add view resize listener
        }

        // @name _removeScrollListener
        // @desc function to remove the scroll listener from the page
        // @param {Function} - the scroll listener function to be removed
        function _removeScrollListener(onScrollListener) {
            // remove the scroll listener from the page scroll event
            // note: the event is also removed from window resize
            console.warn("shpwy.component.js: Removing custom _onScrollListener() from the page.");
            _elPage.removeEventListener("scroll", onScrollListener); // remove page scroll listener
            window.removeEventListener("resize", onScrollListener);  // remove view resize listener
        }

        // @name _setMapFieldText
        // @desc function to set the given text as the field text on the map area
        // @param {String} text - the field text that needs to be set on the map area
        // @return {Promise(Boolean)} - the promise with a flag indicating success or failure
        function _setMapFieldText(text) {
            return new Promise(function(resolve, reject) {
                // check if the given text is a valid string or now
                if(!text || typeof text !== "string" || !text.length) {
                    console.log("shpwy.component.js: Cannot set the map field with the given text: " + text);
                    return resolve(false); // only proceed if it is a valid string
                }

                // shift the array of texts by N (length) times
                // because only one field text should be active
                ctrl.mapFieldTexts.forEach( function(ftext, index) {
                    // remove the first element
                    // on each for iteration and
                    // update component scope to
                    // trigger ngRepeat animations
                    ctrl.mapFieldTexts.shift();
                    ScopeService.digest($scope);
                });

                // push the given field text into the array of texts
                // and the resolve promise once the animation completes
                ctrl.mapFieldTexts.push(text); ScopeService.digest($scope);
                setTimeout(function() { return resolve(true); }, CONFIG.animation.duration);
            });
        }

        // @name _showLoader
        // @desc function to show the shipping pathway component loader
        // @return {Promise(Boolean)} - the promise with a flag indication success or failure
        function _showLoader() {
            return new Promise(function(resolve, reject) {
                // check if the loader
                // is already visible
                if(ctrl.isLoading) {
                    console.log("shpwy.component.js: Cannot show the loader because it is already visible.");
                    resolve(false); // only proceed if the loader is not visible
                }

                // set the loading text on the map field
                _setMapFieldText(_mapFieldTextLoading).then(function() {
                    // set the loader as visible and update component scope
                    // and the resolve promise once the animation completes
                    ctrl.isLoading = true; ScopeService.digest($scope);
                    setTimeout(function() { return resolve(true); }, CONFIG.animation.duration / 1);
                });
            });
        }

        // @name _hideLoader
        // @desc function to hide the shipping pathway component loader
        // @return {Promise(Boolean)} - the promise with a flag indication success or failure
        function _hideLoader() {
            return new Promise(function(resolve, reject) {
                // check if the loader
                // is already hidden
                if(!ctrl.isLoading) {
                    console.log("shpwy.component.js: Cannot hide the loader because it is already hidden.");
                    resolve(false); // only proceed if the loader is not hidden
                }

                // set the loader as hidden and update component scope
                // and the resolve promise once the animation completes
                ctrl.isLoading = false; ScopeService.digest($scope);
                setTimeout(function() { return resolve(true); }, CONFIG.animation.duration / 1);
            });
        }

        // @name _setReady
        // @desc function to set the shipping pathway component as ready
        // @return {Promise(Boolean)} - the promise with a flag indication success or failure
        function _setReady() {
            return new Promise(function(resolve, reject) {
                // check if component
                // is already ready
                if(ctrl.isReady) {
                    console.log("shpwy.component.js: Cannot set ready because component is already ready.");
                    resolve(false); // only proceed if the component is not ready
                }

                // set the component as ready and update component scope
                // and the resolve promise once the animation completes
                ctrl.isReady = true; ScopeService.digest($scope);
                setTimeout(function() { return resolve(true); }, CONFIG.animation.duration / 2);
            });
        }

        // @name _setNotReady
        // @desc function to set the shipping pathway component as not ready
        // @return {Promise(Boolean)} - the promise with a flag indication success or failure
        function _setNotReady() {
            return new Promise(function(resolve, reject) {
                // check if the component
                // is already not ready
                if(!ctrl.isReady) {
                    console.log("shpwy.component.js: Cannot set ready because component is already not ready.");
                    resolve(false); // only proceed if the component is ready
                }

                // set component as not ready and update component scope
                // and the resolve promise once the animation completes
                ctrl.isReady = false; ScopeService.digest($scope);
                setTimeout(function() { return resolve(true); }, CONFIG.animation.duration / 2);
            });
        }

        // @name _enqueueAnimation
        // @desc function to add the given marker index to the animation queue
        // @param {Number} index - the marker index to be added to the queue (zero based)
        function _enqueueAnimation(index) {
            // only proceed if the index is a valid number
            if(typeof index !== "number") { return false; }

            var currQueueIndex = index; // get the current index to be added to the animation queue
            var prevQueueIndex = _animationQueue.length  // get the previous index already in queue
                               ? _animationQueue[_animationQueue.length - 1] : _map.getVisibleIndex();

            // only proceed if the current index is not the same
            // as the previous index added to the animation queue
            if(currQueueIndex === prevQueueIndex) { return false; }

            // if the current and the previous indices differ by a margin
            // greater than 1, then add all the indices that come inbetween
            if(currQueueIndex > prevQueueIndex && (currQueueIndex - prevQueueIndex) !== 1) {
                for(var i = prevQueueIndex; (currQueueIndex - i) !== 1; i++) {
                    _enqueueAnimation(i + 1);
                }
            }

            // if the previous and the current indices differ by a margin
            // greater than 1, then add all the indices that come inbetween
            if(prevQueueIndex > currQueueIndex && (prevQueueIndex - currQueueIndex) !== 1) {
                for(var i = prevQueueIndex; (i - currQueueIndex) !== 1; i--) {
                    _enqueueAnimation(i - 1);
                }
            }

            // add the index to the queue
            _animationQueue.push(index);

            // check if animations in
            // the queue are running
            if(!_isAnimQueueRunning) {
                // execute the animation
                // queue if they are not
                _executeAnimationQueue();
            } return true;
        }

        // @name _dequeueAnimation
        // @desc function to remove the given no.of marker indices from the animation queue
        // @param {Number} count - the count for the no.of indices to be removed from the queue
        function _dequeueAnimation(count) {
            // only proceed if the count is a valid number
            if(typeof count !== "number") { return false; }

            // only proceed if the queue is not empty
            if(!_animationQueue.length) { return false; }

            for(var i = 0; i < count; i++) {
                // remove the given no.of
                //  items from the queue
                try { _animationQueue.shift(); }
                catch(error) { console.log(error); }
            } return true;
        }

        // @name _executeAnimationQueue
        // @desc function to execute the animation on the marker indices in the queue
        function _executeAnimationQueue() {
            // only proceed if the queue is not empty
            if(!_animationQueue.length) {
                _isAnimQueueRunning = false;
                return false;
            }

            // set animation flag to true
            _isAnimQueueRunning = true;

            // function to get the next next index
            // for the given current and next index
            function getNextNextIndex(currIndex, nextIndex) {
                // only proceed if the current
                // and the next indices are valid
                if(typeof currIndex !== "number"
                || typeof nextIndex !== "number"
                || currIndex === nextIndex) {
                    return -1;
                }

                // return next next index based on which of
                // the 2 given index is greater than the other
                if(nextIndex >= currIndex) { return (nextIndex + 1); }
                if(currIndex >  nextIndex) { return (nextIndex - 1); }
            }

            // function to finish the animation for the
            // given index in execution in the queue
            function finishAnimationQueue(index) {
                // only proceed if the given index is valid
                if(typeof index !== "number") { return false; }

                // remove the index from
                // the animation queue
                _dequeueAnimation(1);

                // execute the queue again
                // if there are more indices
                if(_animationQueue.length) {
                    _executeAnimationQueue();
                    return true;
                }

                // else show the pin at the given index
                _map.showPin(index).then(function() {
                    // execute the queue again
                    // if there are more indices
                    if(_animationQueue.length) {
                        _executeAnimationQueue();
                        return true;
                    }

                    else {
                        // set animation flag to false
                        _isAnimQueueRunning = false;
                        return true;
                    }
                });  // _map.showPin end
            }

            var currIndex = _map.getActiveIndex(); // get the current active index
            var visbIndex = _map.getVisibleIndex(); // get the current visible index
            var nextIndex     = _animationQueue[0]; // get the next index to move to
            var nextNextIndex = getNextNextIndex(currIndex, nextIndex); // get next next index
            var nextFieldText = ctrl.mapMarkers[nextIndex].name; // get the next map field text

            console.log("----------------------------------------------------------------")
            console.log("shpwy.component.js: Executing snippets to run the animation for:");
            console.log("currIndex: " + currIndex + ", visbIndex: " + visbIndex + ", nextIndex: " + nextIndex + ", nextNextIndex: " + nextNextIndex);

            var matchedIndex = -1; // set default matched index
            _animationQueue.forEach(function(thisIndex, index) {
                // loop through the animation queue
                // to find any duplicate indices
                if(index !== 0
                && (thisIndex === currIndex
                 || thisIndex === nextIndex)) {
                    matchedIndex = index; // index of the duplicate
                    nextIndex = thisIndex; // set next to duplicate
                }
            });

            // remove all indices inbetween the next and the duplicate
            if(matchedIndex !== -1) { _dequeueAnimation(matchedIndex); }

            // set map field text before move animation begins
            _setMapFieldText(nextFieldText).then(function() {
                // hide the currently visible pin first
                _map.hidePin(visbIndex); // hide the pin

                // if the map can move from the current marker to next
                if(_map.canMoveToMarker(currIndex, nextIndex)) {

                    // if the map can move from next marker to next next
                    if(_map.canMoveToMarker(nextIndex, nextNextIndex)) {

                        // then move from the current to the next marker
                        _map.moveToMarker(nextIndex).then(function() {
                            // finish the animation queue
                            finishAnimationQueue(nextIndex);
                        }); // _map.moveToMarker end

                    } // nested if end

                    // if the map can move from the current marker to next next
                    else if(_map.canMoveToMarker(currIndex, nextNextIndex)) {

                        // then move from the current to the next next marker
                         _map.moveToMarker(nextNextIndex).then(function() {
                            // finish the animation queue
                            finishAnimationQueue(nextIndex);
                        }); // _map.moveToMarker end

                    } // nested else end

                    // if the map cannot move from
                    // the current to next next
                    else {

                        // then move from the current to the next marker
                        _map.moveToMarker(nextIndex).then(function() {
                            // finish the animation queue
                            finishAnimationQueue(nextIndex);
                        }); // _map.moveToMarker end

                    }

                } // main if end

                // if the map cannot move
                // from the current to next
                else {

                    // finish the animation queue
                    finishAnimationQueue(nextIndex);

                } // main else end
            }); // _setMapFieldText end
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name onCarouselUpdate
        // @desc function for on carousel update
        // @param {Number} index - the active index of the carousel (zero based)
        function onCarouselUpdate(index) {
            // only proceed if given index is a valid number
            if(typeof index !== "number") { return false; }

            // check if the given index contains a valid value
            if(index < 0 || index > (ctrl.mapMarkers.length - 1)) {
                return false; // only proceed if it does
            }

            // enqueue the given index
            _enqueueAnimation(index);
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit   = _onInit;     // function for on init
        ctrl.$postLink = _onPostLink; // function for on post link
        ctrl.onCarouselUpdate = onCarouselUpdate; // function for on carousel update

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            // remove the listener on the window scroll event
            _removeScrollListener(_onScrollListener);
            _onScrollListener = null;

            // clear the timer on the window scroll event
            clearTimeout(_onScrollTimer);
            _onScrollTimer = null;

            // reset all references to objects and arrays
            _el = null; _elPage = null;
            _map.destroy(); _map = null;
            _elHtml = null; _elMap  = null;

            // reset all indices to their default values
            _startAt = 1;
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name ShippingPathwayTemplate
        * @desc Class for the shipping pathway template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function ShippingPathwayTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "shipping-pathway.template.html";
    }

    /**
        * @name shippingPathway
        * @desc Function for the shipping pathway component.
        * @return {Object} - The instance of the component function
    **/
    var shippingPathway = function() {
        return {
            controller: ShippingPathwayController,
            templateUrl: ShippingPathwayTemplate,
            bindings: { data: "<", startAt: "@" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("shippingPathway", shippingPathway); // set component
})();

