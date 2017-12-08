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

// -------------------------------------
//   Service - Animation
// -------------------------------------
/**
    * @name animation.service
    * @desc The helper animation service for the app
            that contains functions to perform angular
            based enter and leave animations with velocity.
**/
(function() {
    console.log("services/animation.service.js loaded.");

    /**
        * @name AnimationService
        * @desc Class for the animation service.
        * @param {Service} $animate - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the service class
    **/
    function AnimationService($animate, CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the context of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name animateIn
        // @desc function to animate an element in
        // @param {Object} animation - the animation properties
        // @param {DOM} elem - the DOM element to animate
        // @param {Function} callback - the callback function
        function animateIn(animation, elem, callback) {
            // only proceed if valid animation
            // and elem have been specified
            if(!animation || typeof animation == "undefined"
                || !elem  || typeof elem == "undefined") {
                // check if there is a valid callback function
                if(callback && typeof callback == "function") {
                    callback(); // trigger the callback function
                } return false; // return false
            }

            // get the DOM element
            elem = elem.length ? elem[0] : elem;

            // check if the animation has a delay
            if(animation.delay) {
                // then set initial state
                // of the element to be hidden
                requestAnimationFrame(function() { Velocity(elem,
                    { opacity : 0 },
                    { display: null, duration: 0 }
                ); });
            }

            // introduce delay in the animation
            // based on set delay attributes
            var index = 0;
            try { index = parseFloat(elem.getAttribute("enter-delay")); }
            catch(error) { index = 0; } // if index does not exist
            if(index < 0) { index = 0; } // if index is negative

            // change the duration of the animation
            // based on set speed attributes
            var speed = null;
            try { speed = elem.getAttribute("enter-speed");
                if(Boolean(speed)) { switch(speed) {
                    case "instant": { speed = 0.4; break; }
                    case "fast": { speed = 0.6; break; }
                    case "slow": { speed = 1.3; break; }
                    default: { speed = 1; break; }
                }} else { speed = null; }
            } catch(error) { speed = 1; }

            // check if the animation
            // has a default queue value
            if(animation.queue == null
                || typeof animation.queue == "undefined") {
                animation.queue = ""; // else remove queuing
            }

            // get all the animation enter and leave class values
            var animateEnterBeginClass    = elem.getAttribute("enter-begin-class");
            var animateLeaveBeginClass    = elem.getAttribute("leave-begin-class");
            var animateEnterCompleteClass = elem.getAttribute("enter-complete-class");
            var animateLeaveCompleteClass = elem.getAttribute("leave-complete-class");

            // perform animation
            requestAnimationFrame(function() { Velocity(elem, animation.name,
                {  // animation object
                    display: null,
                    queue: animation.queue,
                    easing: animation.easing,

                    delay: animation.delay ? index * animation.delay : 0,
                    duration: speed ? animation.duration * speed : animation.duration,

                    // animation begin
                    begin: function() {
                        // check if any classes need to be added
                        // to (or) removed from the element on begin
                        try {
                            if(Boolean(animateEnterBeginClass))    { elem.classList.add(animateEnterBeginClass);       }
                            if(Boolean(animateLeaveBeginClass))    { elem.classList.remove(animateLeaveBeginClass);    }
                            if(Boolean(animateEnterCompleteClass)) { elem.classList.remove(animateEnterCompleteClass); }
                            if(Boolean(animateLeaveCompleteClass)) { elem.classList.remove(animateLeaveCompleteClass); }
                        }

                        // catch any animation errors
                        catch(error) { console.log(error); }
                    },

                    // animation complete
                    complete: function() {
                        // check if any classes need to be added
                        // to (or) removed from the element on complete
                        try {
                            if(Boolean(animateEnterCompleteClass)) { elem.classList.add(animateEnterCompleteClass);    }
                            if(Boolean(animateEnterBeginClass))    { elem.classList.remove(animateEnterBeginClass);    }
                            if(Boolean(animateLeaveBeginClass))    { elem.classList.remove(animateLeaveBeginClass);    }
                            if(Boolean(animateLeaveCompleteClass)) { elem.classList.remove(animateLeaveCompleteClass); }
                        }

                        // catch any animation errors
                        catch(error) { console.log(error); }

                        // check if there is a valid callback function
                        if(callback && typeof callback == "function") {
                            callback(); // trigger the callback function
                        } return true; // return true
                    } // animation complete end
                } // animation object end
            ); }); // perform animation end
        };

        // @name animateOut
        // @desc function to animate an element out
        // @param {Object} animation - the animation properties
        // @param {DOM} elem - the DOM element to animate
        // @param {Function} callback - the callback function
        function animateOut(animation, elem, callback) {
            // only proceed if valid animation
            // and elem have been specified
            if(!animation || typeof animation == "undefined"
                || !elem  || typeof elem == "undefined") {
                // check if there is a valid callback function
                if(callback && typeof callback == "function") {
                    callback(); // trigger the callback function
                } return false; // return false
            }

            // get the DOM element
            elem = elem.length ? elem[0] : elem;

            // check if the animation has a delay
            if(animation.delay) {
                // then set initial state
                // of the element to be visible
                requestAnimationFrame(function() { Velocity(elem,
                    { opacity : 1 },
                    { display: null, duration: 0 }
                ); });
            }

            // introduce delay in the animation
            // based on set delay attributes
            var index = 0;
            try { index = parseFloat(elem.getAttribute("leave-delay")); }
            catch(error) { index = 0; } // if index does not exist
            if(index < 0) { index = 0; } // if index is negative

            // change the duration of the animation
            // based on set speed attributes
            var speed = null;
            try { speed = elem.getAttribute("leave-speed");
                if(Boolean(speed)) { switch(speed) {
                    case "instant": { speed = 0.4; break; }
                    case "fast": { speed = 0.6; break; }
                    case "slow": { speed = 1.3; break; }
                    default: { speed = 1; break; }
                }} else { speed = null; }
            } catch(error) { speed = 1; }

            // check if the animation
            // has a default queue value
            if(animation.queue == null
                || typeof animation.queue == "undefined") {
                animation.queue = ""; // else remove queuing
            }

            // get all the animation enter and leave class values
            var animateEnterBeginClass    = elem.getAttribute("enter-begin-class");
            var animateLeaveBeginClass    = elem.getAttribute("leave-begin-class");
            var animateEnterCompleteClass = elem.getAttribute("enter-complete-class");
            var animateLeaveCompleteClass = elem.getAttribute("leave-complete-class");

            // perform animation
            requestAnimationFrame(function() { Velocity(elem, animation.name,
                {  // animation object
                    display: null,
                    queue: animation.queue,
                    easing: animation.easing,

                    delay: animation.delay ? index * animation.delay : 0,
                    duration: speed ? animation.duration * speed : animation.duration,

                    // animation begin
                    begin: function() {
                        // check if any classes need to be added
                        // to (or) removed from the element on begin
                        try {
                            if(Boolean(animateLeaveBeginClass))    { elem.classList.add(animateLeaveBeginClass);       }
                            if(Boolean(animateEnterBeginClass))    { elem.classList.remove(animateEnterBeginClass);    }
                            if(Boolean(animateEnterCompleteClass)) { elem.classList.remove(animateEnterCompleteClass); }
                            if(Boolean(animateLeaveCompleteClass)) { elem.classList.remove(animateLeaveCompleteClass); }
                        }

                        // catch any animation errors
                        catch(error) { console.log(error); }
                    },

                    // animation complete
                    complete: function() {
                        // check if any classes need to be added
                        // to (or) removed from the element on complete
                        try {

                            if(Boolean(animateLeaveCompleteClass)) { elem.classList.add(animateLeaveCompleteClass);    }
                            if(Boolean(animateEnterBeginClass))    { elem.classList.remove(animateEnterBeginClass);    }
                            if(Boolean(animateLeaveBeginClass))    { elem.classList.remove(animateLeaveBeginClass);    }
                            if(Boolean(animateEnterCompleteClass)) { elem.classList.remove(animateEnterCompleteClass); }
                        }

                        // catch any animation errors
                        catch(error) { console.log(error); }

                        // check if there is a valid callback function
                        if(callback && typeof callback == "function") {
                            callback(); // trigger the callback function
                        } return true; // return true
                    } // animation complete end
                } // animation object end
            ); }); // perform animation end
        };

        // @name animateFinish
        // @desc function to finish animation on an element
        // @param {DOM} elem - the DOM element to animate
        // @param {Function} callback - the callback function
        function animateFinish(elem, callback) {
            // only proceed if valid
            // elem has been specified
            if(!elem || typeof elem == "undefined") {
                // check if there is a valid callback function
                if(callback && typeof callback == "function") {
                    callback(); // trigger the callback function
                } return false; // return false
            }

            // access the DOM elem
            elem = elem.length ? elem[0] :elem;

            // finish all animations on the elem
            requestAnimationFrame(function() { Velocity(elem, "finish", true); });

            // check if there is a valid callback function
            if(callback && typeof callback == "function") {
                callback(); // trigger the callback function
            } return true; // return true
        };

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.animateIn     = animateIn;     // function to animate an element in
        service.animateOut    = animateOut;    // function to animate an element out
        service.animateFinish = animateFinish; // function to finish animation on an element
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("AnimationService", AnimationService); // set service

})();
