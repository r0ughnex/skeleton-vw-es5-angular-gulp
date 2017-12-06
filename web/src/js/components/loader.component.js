"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("nanobar");
**/

// base
require("../base/raf");
require("../base/query");

// -------------------------------------
//   Component - Loader
// -------------------------------------
/**
    * @name loader.component
    * @desc The loader component for the app.
**/
(function() {
    console.log("components/loader.component.js loaded.");

    /**
        * @name LoaderController
        * @desc Class for the loader controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} LoaderService - The custom loader service
        * @return {Object} - The instance of the controller class
    **/
    function LoaderController($scope, $element, CONFIG, ScopeService, LoaderService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el = { // reference to the DOM element
            main:   null, // the main parent DOM element
            loader: null  // the loader child DOM element
        };

        var _class = { // the classes that need to be applied
            loader:  "loader", // to the loader DOM element by default
            wrapper: "loader-wrapper",  // to the loader wrapper DOM element
            visible: "loader--visible", // to indicate the loader is visible
            loading: "loader--loading"  // to indicate the loader is loading
        };

        var _percent = { // the percentage of various progress points on the loader
            start: 0, slow: 55, stop: 95, // start, slow and stop progress points on the loader
            end: 100, current: 0 // the end and the current progress points on the loader component
        };

        var _duration = { // the duration for various operations for the loader
            load : (4000 / _percent.end), // default duration of loading time for the loader
            slow : (2000 / (_percent.end - _percent.slow)), // default duration of slowing time

            anim_show: (CONFIG.animation.duration * (1 + 0.25)), // default show animation duration for the loader
            anim_hide: (CONFIG.animation.duration * (1 + 1.25))  // default hide animation duration for the loader
        };

        var _timer   = null; // reference to the loader timer
        var _nanobar = null; // reference to the nanobar object

        var _showTimer = null; // reference to the show timer
        var _hideTimer = null; // reference to the hide timer

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl       = this;   // to capture the context of this
        ctrl.CONFIG    = CONFIG; // reference to the config constant
        ctrl.isLoading = false;  // flag to indicate if the loader is loading

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            // set the loader scope on init
            LoaderService.setScope($scope);

            // set the loader component on init
            LoaderService.setLoader(ctrl);
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() { /* empty block */ }

        // @name _progress
        // @desc function to increase the loader progress
        function _progress() {
            // increase loader progress upto it's
            // stop percent value at a set timeout
            _timer = setTimeout(function() {
                requestAnimationFrame(function() {   // request a new animationframe
                    _nanobar.go(++_percent.current); // and increase loader progress
                });

                if(_percent.current >= _percent.stop) {
                    clearTimeout(_timer); // stop progressing if at stop point
                } else { _progress(); }   // continue progress if not at stop point
            }, (_percent.current < _percent.slow) ? _duration.load : _duration.slow);
        };

        // @name _end
        // @desc function to end the loader progress
        function _end() {
            clearInterval(_timer); // clear any set intervals
            _percent.current = 0;  // reset current percentage to 0

            requestAnimationFrame(function() { // request a new animationframe
                _nanobar.go(_percent.end);     // and set loader progress to end
            });
        };


        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name show
        // @desc function to show the loader
        // @return {Promise(Boolean)} - the promise with resolve as true or false
        function show() {
            return new Promise(function(resolve, reject) {
                // only proceed if the loader
                // is not currently visible
                if(ctrl.isLoading) {
                    console.warn("loader.component.js: The loader is already visible and loading.");
                    return resolve(false); // resolve the promimse with false immediately
                }

                ctrl.isLoading = true; // set visible flag as true
                ScopeService.digest($scope); // update the loader controller scope
                _el.loader.classList.add(_class.visible); // add the visible class

                // clear the previous timer
                // and start loader progress
                clearTimeout(_showTimer);
                clearInterval(_timer);
                _progress();

                // resolve the promise with true
                // when the animation completes
                _showTimer = setTimeout(function() {
                    return resolve(true);
                }, _duration.anim_show);
            });
        };

        // @name hide
        // @desc function to hide the loader
        // @return {Promise(Boolean)} - the promise with resolve as true or false
        function hide() {
            return new Promise(function(resolve, reject) {
                // only proceed if the loader
                // is already currently visible
                if(!ctrl.isLoading) {
                    console.warn("loader.component.js: The loader is already hidden and not loading.");
                    return resolve(false); // resolve the promimse with false immediately
                }

                // clear the previous timer
                // and end the loader progress
                clearTimeout(_hideTimer);
                clearInterval(_timer);
                _end();

                ctrl.isLoading = false; // set visible flag as false
                ScopeService.digest($scope); // update the loader controller scope
                _el.loader.classList.remove(_class.visible); // remove visible class

                // resolve the promise with true
                // when the animation completes
                _hideTimer = setTimeout(function() {
                    return resolve(true);
                }, _duration.anim_hide);
            });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit   = _onInit;     // function for on init
        ctrl.$postLink = _onPostLink; // function for on post link

        // get the main parent wrapper element
        _el.main = query("." + _class.wrapper, $element[0])[0];
        _el.main.innerHTML = ""; // clear the parent html content

        // create a nanobar loader on the main parent element
        _nanobar = new Nanobar({ classname: _class.loader, target: _el.main });

        // get the child loader element from the main parent
        _el.loader = query("." + _class.loader, _el.main)[0];

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            // remove the timers attached to the component
            clearTimeout(_showTimer);
            clearTimeout(_hideTimer);
            clearTimeout(_timer);

            // reset all references to objects and arrays
            _el.main = null; _el.loader = null;
            _nanobar = null;

            // reset all indices to their default values
            _percent.current = 0;
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.show = show; // function to show the loader
        ctrl.hide = hide; // function to hide the loader
    }

    /**
        * @name LoaderTemplate
        * @desc Class for the loader template.
        * @param {Constant} CONFIG - App CONFIG values
        * @return {Object} - The instance of the template class
    **/
    function LoaderTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "loader.template.html";
    }

    /**
        * @name loader
        * @desc Function for the loader component.
        * @return {Object} - The instance of the component function
    **/
    var loader = function() {
        return {
            controller: LoaderController,
            templateUrl: LoaderTemplate
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("loader", loader); // set component
})();
