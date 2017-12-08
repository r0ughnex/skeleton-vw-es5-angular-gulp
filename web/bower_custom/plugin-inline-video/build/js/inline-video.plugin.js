(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
  * @plugins
**/

// -------------------------------------
//   Base - Event
// -------------------------------------
/**
  * @name event
  * @desc A base module that is used to create an event
          interface that represents events initialized
          by an app for any purpose.
**/

(function() {
    console.log("base/event.js loaded.");

    // @name CustomEvent
    // @desc the main function for the base
    // @param {String} event - the name of the event
    // @param {Object} params - the options for the event
    // @param {Event} - the created custom event object
    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    if (typeof window.CustomEvent != "function") {
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

})();

},{}],2:[function(require,module,exports){
"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
  * @plugins
**/

// -------------------------------------
//   Base - Query
// -------------------------------------
/**
  * @name query
  * @desc A base module to abstract document.querySelectorAll
          for increased performance and greater usability.
          query is attached to the window object.
**/
(function() {
    console.log("base/query.js loaded.");

    var doc = window.document,
    simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
    periodRe = /\./g,
    slice = [].slice,
    classes;

    // @name query
    // @desc the main function for the base
    // @param {String} selector
    // @param {Element} context (optional)
    // @return {Array}
    function query (selector, context) {
        context = context || doc;
        // Redirect simple selectors to the more performant function
        if(simpleRe.test(selector)){
            switch(selector.charAt(0)){
                case "#":
                    // Handle ID-based selectors
                    return [context.getElementById(selector.substr(1))];
                case ".":
                    // Handle class-based selectors
                    // Query by multiple classes by converting the selector
                    // string into single spaced class names
                    classes = selector.substr(1).replace(periodRe, " ");
                    return slice.call(context.getElementsByClassName(classes));
                default:
                    // Handle tag-based selectors
                    return slice.call(context.getElementsByTagName(selector));
            }
        }
        // Default to `querySelectorAll`
        return slice.call(context.querySelectorAll(selector));
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    window.query = query;

})();
},{}],3:[function(require,module,exports){
"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
  * @plugins
**/

// -------------------------------------
//   Base - Request Animation Frame
// -------------------------------------
/**
  * @name requestAnimationFrame
  * @desc A base module to window.requestAnimationFrame
          for creating a single cross browser version.
          requestAnimationFrame is attached to the
          window object.
**/
(function() {
    console.log("base/raf.js loaded.");

    var lastTime = 0;
    var vendors = ["ms", "moz", "webkit", "o"];

    // assign the correct vendor prefix to the window.requestAnimationFrame
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+"RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x]+"CancelAnimationFrame"]
                                   || window[vendors[x]+"CancelRequestAnimationFrame"];
    }

    // @name requestAnimationFrame
    // @desc the main function for the base
    // @param {Function} callback - The callback function
    // @return {Integer} requestID - the id passed to cancelAnimationFrame
    function requestAnimationFrame(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    }

    // @name cancelAnimationFrame
    // @desc the sub function for the base
    // @param {String} id - The requestID to cancel
    function cancelAnimationFrame(id) {
        clearTimeout(id);
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = requestAnimationFrame;
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = cancelAnimationFrame;
    }

})();
},{}],4:[function(require,module,exports){
"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
  * @plugins
**/

// base
require("../base/raf");
require("../base/event");
require("../base/query");

// -------------------------------------
//   Component - InlineVideo
// -------------------------------------
/**
  * @name inline-video.component
  * @desc The inline-video component for the app.
**/

(function() {
    var CONFIG = require("../inline-video.config"); // config
    console.log("components/inline-video.component.js loaded.");

    /**
      * @name InlineVideo
      * @desc Class for inline video component.
      * @param {Object} options - options for the component
      * @return {Object} - the instance of the the component class
    **/
    function InlineVideo(options) {
        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el = {  // reference to the various DOM elements
            main: null, // for main component DOM element

            image: {  // for the image elements used for component layout
                desktop: null, // component layout image for desktop
                tablet:  null, // component tablet image for tablet
                mobile:  null  // component mobile image for mobile
            },

            layout: null, // for the parent layout wrapper element
            canvas: null, // for the whitewater canvas element
            video: null,  // for the default video element
            gif: null     // for the fallback gif element
        }

        var _class = { // reference to the various applied classes
            main: "inline-video", // for main component DOM element

            image: { // for the image elements used in the component
                default: "inline-video__image", // the default class
                desktop: "inline-video__image--desktop", // desktop
                tablet:  "inline-video__image--tablet", // tablet
                mobile:  "inline-video__image--mobile" // mobile
            },

            layout: "inline-video__layout", // for the parent layout wrapper element
            canvas: "inline-video__canvas", // for the whitewater canvas element
            video: "inline-video__video",  // for the default video element
            gif: "inline-video__gif"     // for the fallback gif element
        };

        var _whitewater = { // reference to the whitewater video
            player: null, // reference to the whitewater player
            options: { loop: true }, // the whitewater options

            isLoading: false, // flag to indicate whitewater is loading
            hasLoaded: false  // flag to indicate whitewater had loaded
        };

        var _isReady   = false; // flag to indicate if the video is ready
        var _isLocked  = false; // flag to indicate if the video is locked
        var _isPlaying = false; // flag to indicate if the video is playing
        var _hasLoaded = false; // flag to indicate if the video has loaded

        var _removeVideoOnStop = false;  // flag to indicate if the video should be removed from the DOM when stopped
        var _removeCanvasOnStop = false; // flag to indicate if the canvas should be removed from the DOM when stopped

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _createLayout
        // @desc function to create a <div> layout wrapper for the component
        // @return {DOM} - the created device specific <div> layout element
        function _createLayout() {
            // create the layout element for the component
            var layout = document.createElement("div");

            // add the default layout classes
            layout.classList.add(_class.layout);

            // return the created element
            return layout;
        }

        // @name _createImage
        // @desc function to create a <img> element for the component
        // @param {String} key - the device specific key for the element
        // @return {DOM} - the created device specific <img> element
        function _createImage(key) {
            // create the image element for the component
            var image = document.createElement("img");

            // set the image attributes
            image.setAttribute("alt", "");
            image.setAttribute("src", options.source[key] + "layout.png");

            // set the first frame as the background image
            image.style.backgroundImage = "url('" + options.source[key] + "first.jpg')";

            // add the default and device specific image classes
            image.classList.add(_class.image.default);
            image.classList.add(_class.image[key]);

            // return the created element
            return image;
        }

        // @name _createVideo
        // @desc function to create a <video> element for the component
        // @param {String} key - the device specific key for the element
        // @return {DOM} - the created <video> element for the component
        function _createVideo(key) {
            // create the video element for the component
            var video = document.createElement("video");

            // set the video attributes
            video.setAttribute("alt", "");
            video.setAttribute("loop", "");
            video.setAttribute("muted", "");
            video.setAttribute("data-src", options.source[key] + "video.mp4");

            // set the first frame as the background image and poster image
            video.style.backgroundImage = "url('" + options.source[key] + "first.jpg')";
            video.setAttribute("poster", options.source[key] + "first.jpg");

            // add the default video classes
            video.classList.add(_class.video);

            // return the created element
            return video;
        }

        // @name _createCanvas
        // @desc function to create a <canvas> element for the component
        // @param {String} key - the device specific key for the element
        // @return {DOM} - the created <canvas> element for the component
        function _createCanvas(key) {
            // create the canvas element for the component
            var canvas = document.createElement("canvas");

            // set the canvas attributes
            canvas.setAttribute("alt", "");
            canvas.setAttribute("data-src", options.source[key]);

            // set the first frame as the background image
            canvas.style.backgroundImage = "url('" + options.source[key] + "first.jpg')";

            // add the default canvas classes
            canvas.classList.add(_class.canvas);

            // return the created element
            return canvas;
        }

        // @name _createGif
        // @desc function to create a <img> gif element for the component
        // @param {String} key - the device specific key for the element
        // @return {DOM} - the created <img> gif element for the component
        function _createGif(key) {
            // create the gif element for the component
            var gif = document.createElement("img");

            // set the gif attributes
            gif.setAttribute("alt", "");
            gif.setAttribute("data-src", options.source[key] + "video.gif");

            // set the first frame as the background image
            gif.style.backgroundImage = "url('" + options.source[key] + "first.jpg')";

            // add the default gif classes
            gif.classList.add(_class.gif);

            // return the created element
            return gif;
        }

        // @name _onInlineVideoReady
        // @desc listener function for on ready event for the inline video
        function _onInlineVideoReady() {
            _isReady = true; // set the video ready flag and create a ready event
            var event = new CustomEvent("inline-video.onReady", { detail: null });
            _el.main.dispatchEvent(event); // dispatch created event on the main element
        }

        // @name _onInlineVideoLoad
        // @desc listener function for on load event for the inline video
        function _onInlineVideoLoad() {
            _hasLoaded = true; // set the video load flag and create a load event
            var event = new CustomEvent("inline-video.onLoad", { detail: null });
            _el.main.dispatchEvent(event); // dispatch created event on the main element
        }

        // @name _onInlineVideoPlay
        // @desc listener function for on play event for the inline video
        function _onInlineVideoPlay() {
            _isPlaying = true; // set the video play flag and create a play event
            var event = new CustomEvent("inline-video.onPlay", { detail: null });
            _el.main.dispatchEvent(event); // dispatch created event on the main element
        }

        // @name _onInlineVideoStop
        // @desc listener function for on stop event for the inline video
        function _onInlineVideoStop() {
            _isPlaying = false; // reset the video play flag and create a stop event
            var event = new CustomEvent("inline-video.onStop", { detail: null });
            _el.main.dispatchEvent(event); // dispatch created event on the main element
        }

        // @name _addElementToDOM
        // @desc function to add the given element to the main DOM element
        // @param {DOM} element - the element that needs to be added to the DOM
        function _addElementToDOM(element) {
            // add the element to the main element
            // if a valid parent node does not exist
            var parent = element.parentNode;
            if(!parent || !parent.nodeName || !parent.nodeType) {
                _el.main.appendChild(element);
            }
        }

        // @name _removeElementFromDOM
        // @desc function to remove the given element from the main DOM element
        // @param {DOM} element - the element that needs to be removed from the DOM
        function _removeElementFromDOM(element) {
            // remove the element from the main element
            // if a valid parent node does exist
            var parent = element.parentNode;
            if(parent && parent.nodeName && parent.nodeType) {
                _el.main.removeChild(element);
            }
        }

        // @name _onVideoLoad
        // @desc listener function for on load event for the video
        function _onVideoLoad(event) {
            _removeOnVideoLoad(); // remove the on load event listener for video
            _onInlineVideoLoad(); // dispatch on load event for the inline video
        }

        // @name _addOnVideoLoad
        // @desc function to add on load event listener to video
        function _addOnVideoLoad() {
            _el.video.addEventListener("canplay", _onVideoLoad);
        }

        // @name _removeOnVideoLoad
        // @desc function to remove on load event listener from video
        function _removeOnVideoLoad() {
            _el.video.removeEventListener("canplay", _onVideoLoad);
        }

        // @name _playVideo
        // @desc function to play the <video> video
        function _playVideo() {
            if(_el.video) {
                // if the flag to remove the video
                // from the DOM on stop has been set
                if(_removeVideoOnStop) {
                    // add the element to the DOM
                    _addElementToDOM(_el.video);
                }

                // play the video if a source exists
                var source = _el.video.getAttribute("src");
                if(source && source.length) {
                    // play the video
                    _el.video.play();
                }

                // else set the video source and
                // play the video once it is set
                else {
                    // remove previous on load event listener
                    // and add a new on load event listener
                    _removeOnVideoLoad(); _addOnVideoLoad();

                    source = _el.video.getAttribute("data-src");
                    _el.video.setAttribute("src", source);
                    _el.video.removeAttribute("data-src");
                    _el.video.volume = 0; // mute video
                    _el.video.play(); // play the video
                }
            }
        }

        // @name _playVideo
        // @desc function to stop the <video> video
        function _stopVideo() {
            if(_el.video) {
                // stop the video if a source exists
                var source = _el.video.getAttribute("src");
                if(source && source.length) {
                    // stop the video
                    _el.video.pause();
                }

                // if the flag to remove the video
                // from the DOM on stop has been set
                if(_removeVideoOnStop) {
                    // remove the element from the DOM
                    _removeElementFromDOM(_el.video);
                }
            }
        }

        // @name _onCanvasLoad
        // @desc listener function for on load event for the canvas
        function _onCanvasLoad(event) {
            _whitewater.player.play(); // play the whitewater video with the player
            _whitewater.isLoading = false; // set whitewater loading flag as false
            _whitewater.hasLoaded = true; // set whitewater has loaded flag as true
            _removeOnCanvasLoad(); // remove the on load event listener for canvas
            _onInlineVideoLoad();  // dispatch on load event for the inline video
        }

        // @name _addOnCanvasLoad
        // @desc function to add on load event listener to canvas
        function _addOnCanvasLoad() {
            _el.canvas.addEventListener("whitewaterload", _onCanvasLoad);
        }

        // @name _removeOnCanvasLoad
        // @desc function to remove on load event listener from canvas
        function _removeOnCanvasLoad() {
            _el.canvas.removeEventListener("whitewaterload", _onCanvasLoad);
        }

        // @name _playCanvas
        // @desc function to play the <canvas> video
        function _playCanvas() {
            if(_el.canvas) {
                // if the flag to remove the canvas
                // from the DOM on stop has been set
                if(_removeCanvasOnStop) {
                    // add the element to the DOM
                    _addElementToDOM(_el.canvas);
                }

                // play the video if player exists
                // and the video assets have loaded
                if(_whitewater.player != null
                    && _whitewater.hasLoaded) {
                    _whitewater.player.play();
                }

                // add listener if the video is loading
                else if(_whitewater.player != null
                        && _whitewater.isLoading) {
                    // remove previous on load event listener
                    // and add a new on load event listener
                    _removeOnCanvasLoad(); _addOnCanvasLoad();
                }

                // else set the video source, create a new
                // whitewater player and play once it is created
                else {
                    var source = _el.canvas.getAttribute("data-src"); // get the video source
                    _whitewater.player = new Whitewater(_el.canvas, source, _whitewater.options);
                    _el.canvas.removeAttribute("data-src"); // remove the attribute once set

                    _whitewater.isLoading = true; // set whitewater loading flag as true
                    _whitewater.hasLoaded = false; // set whitewater has loaded flag as true

                    // create a new whitewater player and add a load event listener
                    _el.canvas.addEventListener("whitewaterload", _onCanvasLoad);
                }
            }
        }

        // @name _stopCanvas
        // @desc function to play the <canvas> video
        function _stopCanvas() {
            if(_el.canvas) {
                // stop the video if player exists
                // and the video assets have loaded
                if(_whitewater.player != null
                    && _whitewater.hasLoaded) {
                    _whitewater.player.pause();
                }

                // if the flag to remove the canvas
                // from the DOM on stop has been set
                if(_removeCanvasOnStop) {
                    // remove the element from the DOM
                    _removeElementFromDOM(_el.canvas);
                }
            }
        }

        // @name _onGifLoad
        // @desc listener function for on load event for the gif
        function _onGifLoad(event) {
            _removeOnGifLoad(); // remove the on load event listener for gif
            _onInlineVideoLoad(); // dispatch on load event for the inline gif
        }

        // @name _addOnGifLoad
        // @desc function to add on load event listener to gif
        function _addOnGifLoad() {
            _el.gif.addEventListener("load", _onGifLoad);
        }

        // @name _removeOnGifLoad
        // @desc function to remove on load event listener from gif
        function _removeOnGifLoad() {
            _el.gif.removeEventListener("load", _onGifLoad);
        }

        // @name _playGif
        // @desc function to play the <img> gif video
        function _playGif() {
            if(_el.gif) {
                // add the element to the DOM
                _addElementToDOM(_el.gif);

                // play the gif if a source exists
                var source = _el.gif.getAttribute("src");
                if(source && source.length) {
                    /* no play required */
                }

                // else set the gif source and
                // play the gif once it is set
                else {
                    // remove previous on load event listener
                    // and add a new on load event listener
                    _removeOnGifLoad(); _addOnGifLoad();

                    source = _el.gif.getAttribute("data-src");
                    _el.gif.setAttribute("src", source);
                    _el.gif.removeAttribute("data-src");
                    /* no play required */
                }
            }
        }

        // @name _stopGif
        // @desc function to play the <img> gif video
        function _stopGif() {
            if(_el.gif) {
                // stop the gif if a source exists
                var source = _el.gif.getAttribute("src");
                if(source && source.length) {
                    /* no stop required */
                }

                // remove the element from the DOM
                _removeElementFromDOM(_el.gif);
            }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name isReady, isLocked, isPlaying, hasLoaded
        // @desc functions to check if the video is ready, locked, playing (and) loaded
        // @return {Boolean} - returns true / false if video is ready, locked, playing (and) loaded
        function isReady()   { return _isReady;   }
        function isLocked()  { return _isLocked;  }
        function isPlaying() { return _isPlaying; }
        function hasLoaded() { return _hasLoaded; }

        // @name lock
        // @desc function to lock the video ( video cannot be played )
        function lock() {
            // only proceed if the video
            // is currenly not locked
            if(!_isLocked) {
                _isLocked = true;
                console.log("INLINE VIDEO MESSAGE: The inline video is now locked and cannot be played.");
            }
        }

        // @name unlock
        // @desc function to unlock the video ( video can be played )
        function unlock() {
            // only proceed if the video
            // is currenly already locked
            if(_isLocked) {
                _isLocked = false;
                console.log("INLINE VIDEO MESSAGE: The inline video is now unlocked and can be played.");
            }
        }

        // @name play
        // @desc functions to play the inline video
        function play() {
            // only proceed if the video
            // is currenly not playing
            // and has not been locked
            if(!_isPlaying && !_isLocked) {
                if(_el.video) { _playVideo(); }
                else if(_el.gif) { _playGif(); }
                else if(_el.canvas) { _playCanvas(); }

                // dispatch the video play event
                _onInlineVideoPlay();
            }
        }

        // @name stop
        // @desc functions to stop the inline video
        function stop() {
            // only proceed if the video
            // is currenly already playing
            if(_isPlaying) {
                if(_el.video) { _stopVideo(); }
                else if(_el.gif) { _stopGif(); }
                else if(_el.canvas) { _stopCanvas(); }

                 // dispatch the video stop event
                _onInlineVideoStop();
            }
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // check if the component has valid options
        // element - should be a valid DOM element
        if(!options || !options.element
            || !options.element.nodeName
            || !options.element.nodeType) {
            console.log("INLINE VIDEO ERROR: Cannot create inline video with invalid options.");
            return null;  // return null if invalid
        }

        // check if the component has valid options
        // source  - should contain valid folder paths for videos
        //           source.desktop - folder path for desktop video
        //           source.tablet  - folder path for tablet video
        //           source.mobile  - folder path for mobile video
        if(!options || !options.source
            || !options.source.desktop || !options.source.desktop.length
            || !options.source.tablet  || !options.source.tablet.length
            || !options.source.mobile  || !options.source.mobile.length) {
            console.log("INLINE VIDEO ERROR: Cannot create inline video with invalid options.");
            return null;  // return null if invalid
        }

        // check if flags to indicate if the video (and) canvas
        // should be removed from the DOM when stopped have been set
        if(options.removeVideoOnStop == true) { _removeVideoOnStop = true;  }
        if(options.removeCanvasOnStop == true) { _removeCanvasOnStop = true; }

        // get the main DOM element and
        // add the default element class
        _el.main = options.element;
        _el.main.classList.add(_class.main);

        // create all the image elements
        // and the parent layout wrapper
        _el.image.desktop = _createImage("desktop");
        _el.image.tablet  = _createImage("tablet");
        _el.image.mobile  = _createImage("mobile");
        _el.layout = _createLayout();

        // check if the device is a mobile
        if(CONFIG.device.isPhone) {
            if(CONFIG.device.isAndroidOld
                || CONFIG.device.isIOSOld) {
                _el.gif = _createGif("mobile");  } // create gif for older mobiles
            else { _el.canvas = _createCanvas("mobile"); } // create canvas for newer mobiles
        }

        // else check if the device is a tablet
        else if(CONFIG.device.isTablet) {
            if(CONFIG.device.isAndroidOld
                || CONFIG.device.isIOSOld) {
                _el.gif = _createGif("tablet");  } // create gif for older tablets
            else { _el.canvas = _createCanvas("tablet"); } // create canvas for newer tablets
        }

        // else the default device is a desktop
        else { _el.video = _createVideo("desktop"); } // create video for desktop

        // clear out any previous markup
        // within the main DOM element
        _el.main.innerHtml = "";

        // append all the image elements
        // and the parent layout wrapper
        _el.layout.appendChild(_el.image.desktop);
        _el.layout.appendChild(_el.image.tablet);
        _el.layout.appendChild(_el.image.mobile);
        _el.main.appendChild(_el.layout);

        // append the canvas, video and gif elements
        // ( note: elements are also appended during play )
        if(_el.canvas && !_removeCanvasOnStop) { _el.main.appendChild(_el.canvas); }
        if(_el.video && !_removeVideoOnStop)   { _el.main.appendChild(_el.video);  }

        // dispatch the video ready event
        setTimeout(_onInlineVideoReady, CONFIG.timeout.scope);

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        return {
            play: play, // function to play the inline video
            stop: stop, // function to stop the inline video

            lock: lock, // function to lock the inline video ( video can be played )
            unlock: unlock, // function to unlock the inline video ( video cannot be played )

            isReady  : isReady,   // function to check if the video is ready
            isLocked : isLocked,  // function to check if the video is locked
            isPlaying: isPlaying, // function to check if the video is playing
            hasLoaded: hasLoaded  // function to check if the video has loaded
        };
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    module.exports = InlineVideo;

})();


},{"../base/event":1,"../base/query":2,"../base/raf":3,"../inline-video.config":5}],5:[function(require,module,exports){
"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
  * @plugins
  * require("mobile-detect");
**/

// base
require("./base/query");

// -------------------------------------
//   Inline Video Config
// -------------------------------------
/**
  * @name inline-video.config
  * @desc The main js file that contains the
          config options and functions for the app.
**/
(function() {
    console.log("inline-video.config.js loaded.");

    /**
      * @name BuildDetect
      * @desc Class to detect the current build.
      * @param {String} host - the window location host
      * @return {Object} - the instance of the build class
    **/
    function BuildDetect(host) {
        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var bd = this; // to capture the content of this
        bd.isProd = true; // flag turn dev mode on/off ( will be modified by gulp )
        bd.isDeploy = true; // flag turn live mode on/off ( will be modified by gulp )

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name isMobile
        // @desc to detect mobile build
        // @return {Boolean} - true or false
        function isMobile() {
            return host.indexOf("m.localhost")  != -1
                || host.indexOf("m.amazonaws")  != -1

                || host.indexOf("m.skoda")      != -1
                || host.indexOf("m.mcdonalds")  != -1
                || host.indexOf("m.volkswagen") != -1;
        }

        // @name isDesktop
        // @desc to detect desktop build
        // @return {Boolean} - true or false
        function isDesktop() { return !isMobile(); }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // check if the given host is valid
        if(host == null || typeof host == "undefined") {
            host = window.location.host;
        }

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        bd.isMobile  = isMobile();  // to detect mobile build
        bd.isDesktop = isDesktop(); // to detect desktop build
    }

    /**
      * @name BreakpointDetect
      * @desc Class to detect the current breakpoint.
      * @return {Object} - the instance of the breakpoint class
    **/
    function BreakpointDetect() {
        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var br = this; // to capture the content of this
        br.value = null; // the current breakpoint value

        // flags to indicate various browser breakpoints
        br.isDesktopLarge = false; br.isDesktop = false; // desktop
        br.isTablet = false; br.isTabletSmall = false;   // tablet
        br.isMobile = false; br.isMobileSmall = false;   // mobile

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _isMobileSmall, _isMobilem _isTabletSmall,
        // @name _isTablet, _isDesktop, _isDesktopLarge
        // @desc to detect various browser breakpoints
        // @return {Boolean} - true or false
        function _isDesktopLarge() { return  br.value == "desktop-lg-up"; }
        function _isDesktop()      { return  _isDesktopLarge() || br.value == "desktop"; }

        function _isTablet()       { return  _isTabletSmall() || br.value == "tablet"; }
        function _isTabletSmall()  { return  br.value == "tablet-sm"; }

        function _isMobile()       { return  _isMobileSmall() || br.value == "mobile"; }
        function _isMobileSmall()  { return  br.value == "mobile-sm"; }

        // @name _updateValues
        // @desc function to update breakpoint value and flags
        function _updateValues() {
            // update the breakpoint value
            br.value = window.getComputedStyle(query('body')[0], ':before')
                           .getPropertyValue('content').replace(/\"/g, '');

            // update all the breakpoint flags
            if(_isDesktopLarge()) { br.isDesktopLarge = true; } else { br.isDesktopLarge = false; }
            if(_isDesktop())      { br.isDesktop      = true; } else { br.isDesktop      = false; }

            if(_isTablet())       { br.isTablet       = true; } else { br.isTablet       = false; }
            if(_isTabletSmall())  { br.isTabletSmall  = true; } else { br.isTabletSmall  = false; }

            if(_isMobile())       { br.isMobile       = true; } else { br.isMobile       = false; }
            if(_isMobileSmall())  { br.isMobileSmall  = true; } else { br.isMobileSmall  = false; }
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // add window resize event listener
        // to update the breakpoint value and fals
        window.addEventListener("resize", function(event) {
            _updateValues();
        });

        // update the breakpoint value and flags
        // at least once after initialization
        _updateValues();

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
      * @name CONFIG
      * @desc Constant that contains the config options and values for the app.
      * @return {Object} - all the possible config options and values for the app
    **/
    function CONFIG() {
        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _md = new MobileDetect(navigator.userAgent); // detect mobile
        var _bd = new BuildDetect(window.location.host); // detect build
        var _os = _md.os(); // detect mobile OS

        var _src = "/src/";   // src path
        var _dist = "/dist/"; // dist path
        var _deploy = "";     // deploy path

        var _mcdonalds = ""; // path for mcdonals
        var _volkswagen = ""; // path for volkswagen

        var _url = "/inline-video"; // app base url path ( to be used with the app root path )
        var _root = window.location.protocol + "//" + window.location.hostname; // app root path

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var breakpoint = new BreakpointDetect(); // detect breakpoint

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name isPhone, isTablet, isMobile, isIOS, isAndroid
        // @desc functions to detect mobile device and os
        // @return {Boolean} - returns true or false
        function isPhone()  { return _md.phone()  != null; } // only phones
        function isTablet() { return _md.tablet() != null || _bd.isMobile; } // only tablets
        function isMobile() { return _md.mobile() != null || _bd.isMobile; } // phones and tablets

        function isIOS()     { return _os ? (_os.toLowerCase().indexOf("ios") != -1) : false; } // ios
        function isAndroid() { return _os ? (_os.toLowerCase().indexOf("android") != -1) : false; } // android

        function isIOSOld()     { return _os ? (isIOS() && parseFloat(_md.version("iOS")) < 9) : false; } // ios old
        function isAndroidOld() { return _os ? (isAndroid() && parseFloat(_md.version("Android")) < 6) : false; } // android old

        // @name isFirefox, isSafari, isChrome
        // @desc function to detect firefox, safari and chrome
        // @return {Boolean} - returns true or false base on the check
        function isFirefox() { return (!isNaN(_md.version("Firefox"))); }
        function isChrome()  { return (!isNaN(_md.version("Chrome")));  }
        function isSafari()  { return (!isNaN(_md.version("Safari")) && !isChrome()); }

        // @name getIEVersion
        // @desc function to get internet explorer version
        // @return {Boolean|Number} - returns version number or false
        function getIEVersion() {
            var ua = navigator.userAgent;

            var msie = ua.indexOf("MSIE ");
            if (msie > 0) {
                // IE 10 or older - return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
            }

            var trident = ua.indexOf("Trident/");
            if (trident > 0) {
                // IE 11 - return version number
                var rv = ua.indexOf("rv:");
                return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
            }

            var edge = ua.indexOf("Edge/");
            if (edge > 0) {
                // IE 12+ - return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
            }

            // other browsers
            return false;
        }

        // @name isIE
        // @desc function to detect internet explorer
        // @return {Boolean} - returns true or false
        function isIE() {
            try { return parseInt(getIEVersion()) > 0; }
            catch(error) { /*console.log(error);*/ return false; }
        }

        // @name isIEOld
        // @desc function to detect old internet explorer
        // @return {Boolean} - returns true or false
        function isIEOld() { /*
            try { return parseInt(getIEVersion()) <= 10; } */
            try { return parseInt(getIEVersion()) <= 11; }
            catch(error) { /* console.log(error); */ return false; }
        }

        // @name isLocalHost, isAmazonHost
        // @desc functions to check for the server host environment
        // @return {Boolean} - returns true or false based on environment
        function isLocalHost()      { return (window.location.host).indexOf("localhost:")  != -1; }
        function isAmazonHost()     { return (window.location.host).indexOf(".amazonaws")  != -1; }

        // @name isSkodaHost, isMcDonaldsHost, isVolkswagenHost
        // @desc functions to check for the server host environment
        // @return {Boolean} - returns true or false based on environment
        function isSkodaHost()      { return (window.location.host).indexOf(".skoda")      != -1; }
        function isMcDonaldsHost()  { return (window.location.host).indexOf(".mcdonalds")  != -1; }
        function isVolkswagenHost() { return (window.location.host).indexOf(".volkswagen") != -1; }

        // @name isSkodaProd, isSkodaStage
        // @desc functions to check for the server host environment
        // @return {Boolean} - returns true or false based on environment
        function isSkodaProd()  { return (window.location.host).indexOf("au.skoda.com.au") != -1; }
        function isSkodaStage() { return (isSkodaHost() && !isSkodaProd()); }

        // @name isVolkswagenProd, isVolkswagenStage
        // @desc functions to check for the server host environment
        // @return {Boolean} - returns true or false based on environment
        function isVolkswagenProd()  { return (window.location.host).indexOf("au.volkswagen.com.au") != -1; }
        function isVolkswagenStage() { return (isVolkswagenHost() && !isVolkswagenProd()); }

        // @name getUrlPath, getRootPath
        // functions to get the path for app url and root
        // @return {String} - returns the path
        function getUrlPath()  { return _url + (isLocalHost() ? "" : ""); }
        function getRootPath() { return _root + (isLocalHost() ? (":" + window.location.port) : ""); }

        // @name getSkodaPath
        // function to get the skoda path
        // @return {String} - returns the skoda path
        function getSkodaPath() {
            if(isSkodaHost()) { return ""; }
            else { return "https://stage-au.skodaaustralia.net"; }
        }

        // @name getVolkswagenPath
        // functions to get the volkswagen path
        // @return {String} - returns the volkswagen path
        function getVolkswagenPath() {
            if(isVolkswagenHost()) { return ""; }
            else { return "https://au.volkswagen.tribalstage.com"; }
        }

        // @name getViewsPath
        // function to get the path for views
        // @return {String} - returns the path
        function getViewsPath() {
            var viewsPath = "static/views/";
            return !_bd.isProd ? _src + viewsPath : _dist + viewsPath;
        }

        // @name getTemplatesPath
        // function to get the path for templates
        // @return {String} - returns the path
        function getTemplatesPath() {
            var templatesPath = "static/templates/";
            return !_bd.isProd ? _src + templatesPath : _dist + templatesPath;
        }

        // @name getDataPath
        // function to get the path for data
        // @return {String} - returns the path
        function getDataPath() {
            var dataPath = "data/";
            return !_bd.isProd ? _src + dataPath : _dist + dataPath;
        }

        // @name getImagesPath
        // function to get the path for images
        // @return {String} - returns the path
        function getImagesPath() {
            var imagesPath = "assets/images/";
            return !_bd.isProd ? _src + imagesPath : _dist + imagesPath;
        }

        // @name getVideosPath
        // function to get the path for videos
        // @return {String} - returns the path
        function getVideosPath() {
            var videosPath = "assets/videos/";
            return !_bd.isProd ? _src + videosPath : _dist + videosPath;
        }

        // @name getScriptsPath
        // function to get the path for scripts
        // @return {String} - returns the path
        function getScriptsPath() {
            var scriptsPath = "js/";
            return !_bd.isProd ? _src + scriptsPath : _dist + scriptsPath;
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        // if app is in deployment mode
        if(_bd.isDeploy) {
            if(isMcDonaldsHost())  { _deploy = _mcdonalds;  } // if deployed to mcdonalds
            if(isVolkswagenHost()) { _deploy = _volkswagen; } // if deployed to volkswagen
            _src = _dist = _deploy; // all deploy paths are the same ( on every host environment )
            _url = ""; // the url is taken care of by the base href value configured in the gulp framework
        }

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        return {
            // device
            device: {
                isPhone:  isPhone(),  // functions to detect mobile device and os
                isTablet: isTablet(), // functions to detect mobile device and os
                isMobile: isMobile(), // functions to detect mobile device and os

                isIOS:     isIOS(),     // functions to detect mobile device and os
                isAndroid: isAndroid(), // functions to detect mobile device and os

                isIOSOld:     isIOSOld(),    // functions to detect mobile device and os
                isAndroidOld: isAndroidOld() // functions to detect mobile device and os
            },

            // browser
            browser: {
                isFirefox: isFirefox(), // function to detect firefox
                isChrome:  isChrome(),  // function to detect chrome
                isSafari:  isSafari(),  // function to detect safari

                isIE:    isIE(),   // function to detect internet explorer
                isIEOld: isIEOld() // function to detect old internet explorer
            },

            // breakpoint
            breakpoint: breakpoint, // functions to detect the current breakpoint

            // environment
            environment: {
                isProd:   _bd.isProd,   // functions to check for the server host environment
                isDeploy: _bd.isDeploy, // functions to check for the server host environment

                isLocalHost:  isLocalHost(),     // functions to check for the server host environment
                isAmazonHost: isAmazonHost(),    // functions to check for the server host environment

                isSkodaHost:      isSkodaHost(),      // functions to check for the server host environment
                isMcDonaldsHost:  isMcDonaldsHost(),  // functions to check for the server host environment
                isVolkswagenHost: isVolkswagenHost(), // functions to check for the server host environment

                isSkodaProd:       isSkodaProd(),      // functions to check for the server host environment
                isSkodaStage:      isSkodaStage(),     // functions to check for the server host environment
                isVolkswagenProd:  isVolkswagenProd(), // functions to check for the server host environment
                isVolkswagenStage: isVolkswagenStage() // functions to check for the server host environment
            },

            // path
            path: {
                url:  getUrlPath(),  // functions to get the path for app url and root
                root: getRootPath(), // functions to get the path for app url and root

                skoda:      getSkodaPath(),      // function to get the skoda path
                volkswagen: getVolkswagenPath(), // function to get the volkswagen path

                views:     getViewsPath(),     // function to get the path for views
                templates: getTemplatesPath(), // function to get the path for templates

                data:    getDataPath(),   // function to get the path for data
                images:  getImagesPath(), // function to get the path for images
                videos:  getVideosPath(), // function to get the path for videos
                scripts: getScriptsPath() // function to get the path for scripts
            },

            // animation
            animation: {
                // duration and delay
                // used in js animations
                delay:    250, // delay in ms
                duration: 500, // duration in ms

                durationSlow:    (500 * 1.3), // duration in ms
                durationFast:    (500 * 0.6), // duration in ms
                durationInstant: (500 * 0.4)  // duration in ms
            },

            // timeout
            timeout: {
                // timeouts used for
                // manual scope and
                // animation updates
                scope:     250, // timeout scope in ms
                animation: 550  // timeout animation in ms
            }
        };
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // export the module
    module.exports = new CONFIG();

})();
},{"./base/query":2}],6:[function(require,module,exports){
"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
  * @plugins
  * require("mobile-detect");
**/

// base
require("./base/raf");
require("./base/event");
require("./base/query");

// components
var InlineVideo = require("./components/inline-video.component");
window.InlineVideo = InlineVideo; // set component in global namespace

// -------------------------------------
//   Inline Video Plugin
// -------------------------------------
/**
  * @name inline-video.plugin
  * @desc The main js file that contains the run
          options and config options for the app.
**/
(function() {
    var CONFIG = require("./inline-video.config"); // config
    console.log("inline-video.plugin.js loaded."); // loaded

    // function to check if the given element is in view
    function isElementInView(element) {
        var classList = element.classList;
        var style = getComputedStyle(element);
        var rect = element.getBoundingClientRect();

        return (
            (style["display"] != "none") &&
            rect.left >= (0 - (rect.width / 2)) &&
            rect.right <= ((window.innerWidth || _elHtml.clientWidth) + (rect.width / 2)) &&

            rect.top >= (0 - (rect.height / 2)) &&
            rect.bottom <= ((window.innerHeight || _elHtml.clientHeight) + (rect.height / 2))
        );
    }

    // get the inline test video elements
    var elements = query(".inline-video--test");
    var components = []; // create array for the videos

    // only proceed if test video elements exist
    elements.forEach( function(element, index) {
        // create a new reference for
        // the inline video component
        var video = null;

        // add an inline video on ready event listener to the element
        // ( note: this needs to be attached before the inline video component is created )
        element.addEventListener("inline-video.onReady", function(event) {
            console.log("inline-video.onReady callback triggered.");
            console.log("video.isReady(): " + video.isReady());
            console.log(event);
        });

        // add an inline video on load event listener to the element
        // ( note: the video is loaded only after video.play() is called for the first time )
        element.addEventListener("inline-video.onLoad", function(event) {
            console.log("inline-video.onLoad callback triggered.");
            console.log("video.hasLoaded(): " + video.hasLoaded());
            console.log(event);
        });

        // initiate the inline video component
        video = new InlineVideo({
            element: element, // set the component element

            source: { // set the component source folder
                desktop: CONFIG.path.videos + "desktop/", // desktop
                tablet:  CONFIG.path.videos + "tablet/",  // tablet
                mobile:  CONFIG.path.videos + "mobile/"   // mobile
            },

            // flags to indicate if the video (and) canvas
            // should be removed from the DOM when stopped
            removeVideoOnStop: false, // default flag value
            removeCanvasOnStop: false // default flag value
        });

        // add an inline video on play event listener to the element
        element.addEventListener("inline-video.onPlay", function(event) {
            console.log("inline-video.onPlay callback triggered.");
            console.log("video.isPlaying(): " + video.isPlaying());
            console.log(event);
        });

        // add an inline video on stop event listener to the element
        element.addEventListener("inline-video.onStop", function(event) {
            console.log("inline-video.onStop callback triggered.");
            console.log("video.isPlaying(): " + video.isPlaying());
            console.log(event);
        });

        // push the video and the element into array
        components.push({ element: element, video: video });

    });

    // check if there are test videos
    if(components && components.length) {
        // attach video play and stop to the window scroll
        window.addEventListener("scroll", function() {

            // loop through all the video components
            components.forEach(function(component, index) {
                var video = component.video; // get component video
                var element = component.element; // get component element

                // check if the element is in view
                if(isElementInView(element)) {
                    // play the video if the element
                    // is in view and is not playing
                    if(!video.isPlaying()) {
                        /* video.unlock(); */
                        video.play();
                    }
                } else {
                    // stop the video if the element
                    // is in not view and is playing
                    if(video.isPlaying()) {
                        /* video.lock(); */
                        video.stop();
                    }
                }
            });

        });

        // trigger window scroll once on load
        setTimeout(function() { // with a small timeout
            var event = new CustomEvent("scroll"); // create event
            window.dispatchEvent(event); // dispatch created event
        }, CONFIG.timeout.scope);
    }


})();
},{"./base/event":1,"./base/query":2,"./base/raf":3,"./components/inline-video.component":4,"./inline-video.config":5}]},{},[6]);
