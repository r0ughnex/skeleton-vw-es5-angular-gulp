"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Animation Factory
// -------------------------------------
/**
    * @name animation.factory
    * @desc The extendable animation factory for the app that contains
            functions to create re-usable animations with ngAnimate.
**/
(function() {
    console.log("factories/animation.factory.js loaded.");

    /**
        * @name Animation
        * @desc Class for the animation factory.
        * @param {Object} animation - The animation properties and options
        * @param {Service} service - The custom animation service
        * @return {Object} - The instance of the factory class
    **/
    function Animation() {

        /**
            * @name Animation
            * @desc Class for the animation factory with custom constructors.
            * @param {String} type - the current animation type, in or out
            * @param {Object} animation - the custom animation properties
            * @param {Service} service - the custom animation service
            * @return {Object} - the instance of the internal class
        **/
        var Animation = function(type, animation, service) {

            // ---------------------------------------------
            //   Private members
            // ---------------------------------------------
            var _animateKeys = []; // array of animate keys
            var _animateThis = null; // the animate function

            // ---------------------------------------------
            //   Public members
            // ---------------------------------------------
            /* empty block */

            // ---------------------------------------------
            //   Private methods
            // ---------------------------------------------
            /* empty block */

            // ---------------------------------------------
            //   Public methods
            // ---------------------------------------------
            /* empty block */

            // ---------------------------------------------
            //   Constructor block
            // ---------------------------------------------
            // check if valid type, animation
            // and service have been defined
            if(type == null || typeof type == "undefined"
                || animation == null || typeof animation == "undefined"
                || service == null || typeof service == "undefined") {
                return null; // return null if not
            }

            // set animation function based on type
            switch (type.toLowerCase()) {
                // in animation
                case "in": {
                    _animateKeys = ["enter", "removeClass"];
                    _animateThis = service.animateIn; break;
                }

                // out animation
                case "out": {
                    _animateKeys = ["leave", "addClass"];
                    _animateThis = service.animateOut; break;
                }

                // return null if nothing matched
                default: { return null; }
            }

            // create a return object
            var returnObj = {};

            // add enter or leave animation
            returnObj[_animateKeys[0]] = function(elem, done) {
                _animateThis(animation, elem, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { service.animateFinish(elem, done); }
                }
            };

            // add addClass or removeClass animation
            returnObj[_animateKeys[1]] = function(elem, className, done) {
                // only animate when ng-hide is added (or) removed
                if(className != "ng-hide") { return false; }
                _animateThis(animation, elem, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { service.animateFinish(elem, done); }
                }
            };

            // add restrict and link attributes
            returnObj["restrict"] = "A";
            returnObj["link"] = function (scope, elem) {
                _animateThis(animation, elem, function(){ /*do nothing*/ });
            }

            // ---------------------------------------------
            //   Instance block
            // ---------------------------------------------
            // return the return object
            return returnObj;
        };

        // return internal class
        return Animation;
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .factory("Animation", Animation); // set factory

})();
