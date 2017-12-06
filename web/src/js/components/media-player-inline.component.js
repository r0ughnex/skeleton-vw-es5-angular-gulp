"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("angular-youtube-mb");
**/

// base
require("../base/debounce");

// -------------------------------------
//   Component - Media Player Inline
// -------------------------------------
/**
    * @name media-player-inline.component
    * @desc The media player inline component for the app.
**/
(function() {
    console.log("components/media-player-inline.component.js loaded.");

    /**
        * @name MediaPlayerInlineController
        * @desc Class for the media-player-inline controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} PageService - The custom page service
        * @param {Service} LoggerService - The custom logger service
        * @return {Object} - The instance of the controller class
    **/
    function MediaPlayerInlineController($scope, $element, CONFIG, ScopeService, PageService, LoggerService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _player   = null; // reference to the video player
        var _elPage   = null; // reference to the current page DOM
        var _elHtml   = null; // reference to the current html DOM
        var _elPlayer = null; // reference to the video player DOM

        var _scrollStart = -1; // the scroll top when the listeners start
        var _scrollThresholdMin = 200; // the min difference in scroll threshold

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl    = this;   // to capture the context of this
        ctrl.CONFIG = CONFIG; // reference to the config constant

        ctrl.isReady   = false; // flag to indicate the video is ready
        ctrl.isPlaying = false; // flag to indicate the video is playing

        // options for the youtube iframe api
        ctrl.options = {
            rel: 0, // indicates whether the player should show related videos
            color: "white", // specifies the color scheme that will be used in the player
            autohide: 1, // indicates whether the video controls will automatically hide
            showinfo: 1, // setting to 0 causes the player to not display information before play
            init_delay: 1000, // delay used in the initialisation of the player ( prevents stutter )
            cc_load_policy: 0, // setting to 0 causes closed captions to not be shown by default
            iv_load_policy: 3, // setting to 3 causes video annotations to not be shown by default
            modestbranding: 1, // lets you use a YouTube player that does not show a YouTube logo
            start: ctrl.startAt, // lets you specify a start point for the videe playback in secs
            autoplay: !CONFIG.device.isMobile // specifies whether the video will autoplay on load
        };

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            _parseAttributes(ctrl); // parse bound attributes
            ctrl.data = _parseData(ctrl.data); // parse bound data
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            // set video is ready on post
            // link is a slight init delay
            // ( to prevent animation stutter )
            setTimeout(function(){
                ctrl.isReady = true; // set ready flag
                ScopeService.digest($scope); // update scope
            }, ctrl.options.init_delay);

            // set the video player
            // and the page DOM element
            _elPlayer = $element[0];
            _elHtml = PageService.getHtml();
            _elPage = PageService.getPage();
        }

        // @name _parseAttributes
        // @desc function to parse the bound attributes and
        //       replace any missing information with default values
        // @params {Object} ctrl - the controller attributes are bound to
        function _parseAttributes(ctrl) {
            // parse the component start at (secs)
            ctrl.startAt = parseInt(ctrl.startAt);
            if(isNaN(ctrl.startAt) || typeof ctrl.startAt !== "number") {
                ctrl.startAt = 0; // default value for start at is 0 (secs)
            }

            // update the start at in options
            ctrl.options.start = ctrl.startAt;

            // parse the component type
            switch(ctrl.type) {
                case "alt": { ctrl.type = "alt";     break; } // type - alt
                default:    { ctrl.type = "default"; break; } // type - default
            }
        }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            // check if data cta exist else
            // create a empty cta object
            if(!data.cta) {  data.cta = {}; }

            // parse the data cta target
            // ( the target is always a new tab )
            data.cta.target = "_blank";

            // parse the data cta url
            // ( the url is always the video url )
            data.cta.url = "https://www.youtube.com/watch?v=" + data.video;

            // parse the data cta title
            var title = "Play " + ((data.headline && data.headline.length) ? (data.headline + " video") : "video").toLowerCase();
            if(!data.cta.title || !data.cta.title.length) { data.cta.title = title; }

            // return the parsed data
            return data;
        }

        // @name _isPlayerInView
        // @desc function to check if the given player is in view
        // @param {DOMElement} htmlElem - the html DOM element
        // @param {DOMElement} playerElem - the player DOM element
        // @return {Boolean} - true or false depending on check
        function _isPlayerInView(htmlElem, playerElem) {
            var htmlRect = htmlElem.getBoundingClientRect(); // get the html bounds
            var playerRect = playerElem.getBoundingClientRect(); // get the player bounds

            return (
                ((playerRect.top + (playerRect.height / 3)) >= 0) &&
                ((playerRect.left + (playerRect.width / 3)) >= 0) &&
                ((playerRect.right - (playerRect.width / 3)) <= (window.innerWidth || htmlRect.width)) &&
                ((playerRect.bottom - (playerRect.height / 3)) <= (window.innerHeight || htmlRect.height))
            );
        }

        // @name _hasUserScrolledAway
        // @desc function to check if the user has scroll away from the player
        // @param {DOMElement} pageElem - the page DOM element
        // @param {DOMElement} playerElem - the player DOM element
        // @return {Boolean} - true or false depending on check
        function _hasUserScrolledAway(pageElem, playerElem) {
            // check if scroll start is valid
            if(_scrollStart < 0) { return false; }

            var playerRect = playerElem.getBoundingClientRect(); // get the player bounds
            var scrollThreshold = (playerRect.height / 2); // get the scroll threshold

            // check if scroll threshold is
            // less than the allowed minimum
            if(scrollThreshold < _scrollThresholdMin) {
                scrollThreshold = _scrollThresholdMin;
            }

            var scrolltop = pageElem.scrollTop; // get the current scroll top
            var scrolledDiff = Math.abs(scrolltop - _scrollStart); // get the scrolled difference
            if (scrolledDiff > scrollThreshold) {
                // if scrolled difference is
                // greater than the allowed threshold
                return true;
            } else {
                // if scrolled difference is
                // less than the allowed threshold
                return false;
            }
        }

        // @name _onScrollListener
        // @desc function to be executed on page scroll event
        // @param (Event) event - the event that triggered this function
        var _onScrollListener = debounce(function(event) {
            // stop the video if the player
            // if the user has scrolled away
            // in not in the current viewport
            try { if(_hasUserScrolledAway(_elPage, _elPlayer) &&
                    !_isPlayerInView(_elHtml, _elPlayer)) { stopVideo(); }}

            // remove scroll listener on error
            catch(error) { console.log(error); _removeScrollListener(); }
        }, CONFIG.timeout.scope / 4);

        // @name _addScrollListener
        // @desc function to add scroll listener
        function _addScrollListener() {
            _scrollStart = _elPage.scrollTop; // set scroll start
            _elPage.addEventListener("scroll", _onScrollListener);
        }

        // @name _removeScrollListener
        // @desc function to remove scroll listener
        function _removeScrollListener() {
            _scrollStart = -1; // reset scroll start
            _elPage.removeEventListener("scroll", _onScrollListener);
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name playVideo
        // @desc function to play the video
        // @param (Event) event - the event that triggered this function
        function playVideo(event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // play the video only
            // if it is not playing
            if(!ctrl.isPlaying) {
                // set playing flag
                ctrl.isPlaying = true;

                // try playing the video
                try { if(_player) { _player.playVideo(); } }
                catch(error) { console.log(error); }

                // add scroll listener once
                // the video starts playing
                _addScrollListener();
            }
        }

        // @name stopVideo
        // @desc function to stop the video
        // @param (Event) event - the event that triggered this function
        function stopVideo(event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // stop the video only
            // if it is playing
            if(ctrl.isPlaying) {
                // reset playing flag
                ctrl.isPlaying = false;

                // try stopping the video
                try { if(_player) { _player.stopVideo(); } }
                catch(error) { console.log(error); }
            }

            // remove scroll listener once
            // the video stops playing
            _removeScrollListener();
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit   = _onInit;     // function for on init
        ctrl.$postLink = _onPostLink; // function for on post link

        // when the youtube player is buffering
        $scope.$on("youtube.player.buffering", function ($event, player) {
            _player = player; // set player reference
            playVideo();      // and manually trigger play
        });

        // when the youtube player is playing
        $scope.$on("youtube.player.playing", function ($event, player) {
            _player = player; // set player reference
            playVideo();      // and manually trigger play
        });

        // when the youtube player has ended
        $scope.$on("youtube.player.ended", function ($event, player) {
            _player = player; // set player reference
            stopVideo();      // and manually trigger stop
        });

        // when the youtube player has error
        $scope.$on("youtube.player.error", debounce(function(event, player) {
            _player = player; // set player reference
            var video = ctrl.data.video ? ctrl.data.video : null; // get the video that errored
            LoggerService.error("media-player-inline.component.js: Invalid YouTube video id detected:");
            LoggerService.error("data.video: " + ((video && video.length) ? video : "data.video is not defined"));
        }, CONFIG.timeout.scope));

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            // remove the scroll listener
            // when the scope is destroyed
            _removeScrollListener();

            // remove the player event listeners
            $scope.off("youtube.player.buffering");
            $scope.off("youtube.player.playing");
            $scope.off("youtube.player.ended");
            $scope.off("youtube.player.error");
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.playVideo = playVideo; // function to play the video
        ctrl.stopVideo = stopVideo; // function to stop the video
    }

    /**
        * @name MediaPlayerInlineTemplate
        * @desc Class for the media-player-inline template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function MediaPlayerInlineTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "media-player-inline.template.html";
    }

    /**
        * @name mediaPlayerInline
        * @desc Function for the media-player-inline component.
        * @return {Object} - The instance of the component function
    **/
    var mediaPlayerInline = function() {
        return {
            controller: MediaPlayerInlineController,
            templateUrl: MediaPlayerInlineTemplate,
            bindings: { data: "<", startAt: "@", type: "@"  }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("mediaPlayerInline", mediaPlayerInline); // set component
})();
