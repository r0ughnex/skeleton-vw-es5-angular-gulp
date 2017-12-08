"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Angular Animation Configuration
// -------------------------------------
(function() {
    console.log("animations/height.animation.js loaded.");

    // @name _animateThis
    // @desc function to perform animation on the given element
    // @param {DOM} elem - the element to perform the animation on
    // @param {String} type - the type of animation "in" (or) "out"
    // @param {Constant} config - the app delay and duration config
    // @param {Function} done - animation complete callback function
    function _animateThis(elem, type, config, done) {
        // get the DOM element
        elem = elem.length ? elem[0] : elem;

        // introduce delay in the animation
        // based on set delay attributes
        var index = 0;
        try { index = parseFloat(elem.getAttribute(type == "in" ? "enter-delay" : "leave-delay")); }
        catch(error) { index = 0; } // if index does not exist
        if(index < 0) { index = 0; } // if index is negative

        // change the duration of the animation
        // based on set speed attributes
        var speed = null;
        try { speed = elem.getAttribute(type == "in" ? "enter-speed" : "leave-speed");
            if(Boolean(speed)) { switch(speed) {
                case "instant": { speed = 0.4; break; }
                case "fast": { speed = 0.6; break; }
                case "slow": { speed = 1.3; break; }
                default: { speed = 1; break; }
            }} else { speed = null; }
        } catch(error) { speed = 1; }

        // get all the animation enter and leave class values
        var animateEnterBeginClass    = elem.getAttribute("enter-begin-class");
        var animateLeaveBeginClass    = elem.getAttribute("leave-begin-class");
        var animateEnterCompleteClass = elem.getAttribute("enter-complete-class");
        var animateLeaveCompleteClass = elem.getAttribute("leave-complete-class");

        // set initial element state
        Velocity(elem,
            { opacity: type == "in" ? "0" : "1" },
            { display: null, duration: 0 }
        );

        // get and reset some initial styles of element
        // before animation begin ( for smoother animation )
        var display, paddingTop, paddingBottom;
        if(type == "in" && index > 0 ) {
            var style = getComputedStyle(elem);
            paddingBottom = parseFloat(style["padding-bottom"].replace("px","")); elem.style.paddingBottom = 0;
            paddingTop = parseFloat(style["padding-top"].replace("px","")); elem.style.paddingTop = 0;
            display = style["display"]; elem.style.display = "none";
        }

        // perform animation on the element
        Velocity(elem, type  == "in" ? "slideDown" : "slideUp",
            {
                display: null,
                easing: "easeInOutQuad",
                delay: config.animation.delay ? index * config.animation.delay : 0,
                duration: speed ? config.animation.duration * speed : config.animation.duration,

                // animation begin
                begin: function() {
                    // reset initial element state
                    Velocity(elem,
                        { opacity: type == "in" ? "1" : "0" },
                        {
                            display: null, easing: "easeInOutQuad", queue: false,
                            duration: speed ? config.animation.duration * speed : config.animation.duration
                        }
                    );

                    // reset back the set initial styles of the element
                    // on animation begin ( for smoother animation )
                    if(type == "in" && index > 0 ) {
                        elem.style.paddingBottom = "";
                        elem.style.paddingTop = "";
                        elem.style.display = "";
                    }

                    // check if any classes need to be added
                    // to (or) removed from the element on begin
                    try {
                        if(type == "in") {
                            if(Boolean(animateEnterBeginClass)) { elem.classList.add(animateEnterBeginClass);    }
                            if(Boolean(animateLeaveBeginClass)) { elem.classList.remove(animateLeaveBeginClass); }
                        } else {
                            if(Boolean(animateLeaveBeginClass)) { elem.classList.add(animateLeaveBeginClass);    }
                            if(Boolean(animateEnterBeginClass)) { elem.classList.remove(animateEnterBeginClass); }
                        }

                        if(Boolean(animateEnterCompleteClass)) { elem.classList.remove(animateEnterCompleteClass); }
                        if(Boolean(animateLeaveCompleteClass)) { elem.classList.remove(animateLeaveCompleteClass); }
                    }

                    // catch any animation errors
                    catch(error) { console.log(error); }
                },

                // animation complete
                complete: function() {
                    // reset back the set initial styles of the element
                    // on animation complete ( if it did not reset on begin )
                    if(type == "in" && index > 0 ) {
                        elem.style.paddingBottom = "";
                        elem.style.paddingTop = "";
                        elem.style.display = "";
                    }

                    // check if any classes need to be added
                    // to (or) removed from the element on complete
                    try {
                        if(type == "in") {
                            if(Boolean(animateEnterCompleteClass)) { elem.classList.add(animateEnterCompleteClass);    }
                            if(Boolean(animateLeaveCompleteClass)) { elem.classList.remove(animateLeaveCompleteClass); }
                        } else {
                            if(Boolean(animateLeaveCompleteClass)) { elem.classList.add(animateLeaveCompleteClass);    }
                            if(Boolean(animateEnterCompleteClass)) { elem.classList.remove(animateEnterCompleteClass); }
                        }

                        if(Boolean(animateEnterBeginClass)) { elem.classList.remove(animateEnterBeginClass); }
                        if(Boolean(animateLeaveBeginClass)) { elem.classList.remove(animateLeaveBeginClass); }
                    }

                    // catch any animation errors
                    catch(error) { console.log(error); }

                    // check if there is a valid done function
                    if(done && typeof done == "function") {
                        done(); // trigger the done function
                    } return true; // return true
                } // animation complete end
            }
        );
    }

    /**
        * @name animateHeightIn
        * @desc Function for the height in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateHeightIn(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        return {
            restrict: "A",

            link: function(scope, elem) {
                // perform animation on the element
                _animateThis(elem, "in", CONFIG, function(){ /*do nothing*/ });
            },

            enter: function(elem, done) {
                // perform animation on the element
                _animateThis(elem, "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            removeClass: function(elem, className, done) {
                // only animate when ng-hide is removed
                if(className != "ng-hide") { return false; }

                // perform animation on the element
                _animateThis(elem, "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            }
        };
    }

    /**
        * @name animateHeightOut
        * @desc Function for the height out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateHeightOut(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        return {
            restrict: "A",

            link: function(scope, elem) {
                // perform animation on the element
                _animateThis(elem, "out", CONFIG, function(){ /*do nothing*/ });

            },

            leave: function(elem, done) {
                // perform animation on the element
                _animateThis(elem, "out", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            addClass: function(elem, className, done) {
                // only animate when ng-hide is added
                if(className != "ng-hide") { return false; }

                // perform animation on the element
                _animateThis(elem, "out", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            }
        };
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("animateHeightIn",  animateHeightIn)  // set in directive
        .directive("animateHeightOut", animateHeightOut) // set out directive

        .animation(".animate-height-in",  animateHeightIn)   // set in animation
        .animation(".animate-height-out", animateHeightOut); // set out animation
})();
