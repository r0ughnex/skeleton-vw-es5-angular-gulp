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
    console.log("animations/expand.animation.js loaded.");

    /**
        * @name animateExpandIn
        * @desc Function for the expand in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateExpandIn(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.expandIn", easing: "easeInOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // create and return the animation
        return new Animation("in", animation, AnimationService);
    }

    /**
        * @name animateExpandOut
        * @desc Function for the expand out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateExpandOut(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.expandOut", easing: "easeInOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // create and return the animation
        return new Animation("out", animation, AnimationService);
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("animateExpandIn",  animateExpandIn)  // set in directive
        .directive("animateExpandOut", animateExpandOut) // set out directive

        .animation(".animate-expand-in",  animateExpandIn)   // set in animation
        .animation(".animate-expand-out", animateExpandOut); // set out animation
})();
