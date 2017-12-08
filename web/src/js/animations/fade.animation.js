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
    console.log("animations/fade.animation.js loaded.");

    /**
        * @name animateFadeIn
        * @desc Function for the fade in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateFadeIn(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.fadeIn", easing: "easeInOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // create and return the animation
        return new Animation("in", animation, AnimationService);
    }

    /**
        * @name animateFadeOut
        * @desc Function for the fade out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateFadeOut(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.fadeOut", easing: "easeInOutQuad",
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
        .directive("animateFadeIn",  animateFadeIn)  // set in directive
        .directive("animateFadeOut", animateFadeOut) // set out directive

        .animation(".animate-fade-in",  animateFadeIn)   // set in animation
        .animation(".animate-fade-out", animateFadeOut); // set out animation
})();
