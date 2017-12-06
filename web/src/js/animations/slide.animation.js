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
    console.log("animations/slide.animation.js loaded.");

    /**
        * @name animateSlideUpIn
        * @desc Function for the slide up in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideUpIn(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideUpIn", easing: "easeInOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // create and return the animation
        return new Animation("in", animation, AnimationService);
    }

    /**
        * @name animateSlideDownIn
        * @desc Function for the slide down in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideDownIn(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideDownIn", easing: "easeInOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // create and return the animation
        return new Animation("in", animation, AnimationService);
    }

    /**
        * @name animateSlideLeftIn
        * @desc Function for the slide right in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideLeftIn(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideLeftBigIn", easing: "easeInOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // create and return the animation
        return new Animation("in", animation, AnimationService);
    }

    /**
        * @name animateSlideRightIn
        * @desc Function for the slide right in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideRightIn(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideRightBigIn", easing: "easeInOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // create and return the animation
        return new Animation("in", animation, AnimationService);
    }

    /**
        * @name animateSlideUpOut
        * @desc Function for the slide up out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideUpOut(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideUpOut", easing: "easeOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        // create and return the animation
        return new Animation("out", animation, AnimationService);
    }

    /**
        * @name animateSlideDownOut
        * @desc Function for the slide down out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideDownOut(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideDownOut", easing: "easeOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        // create and return the animation
        return new Animation("out", animation, AnimationService);
    }

    /**
        * @name animateSlideLeftOut
        * @desc Function for the slide right out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideLeftOut(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideLeftBigOut", easing: "easeOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        // create and return the animation
        return new Animation("out", animation, AnimationService);
    }

    /**
        * @name animateSlideRightOut
        * @desc Function for the slide right out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Factory} Animation - The custom animation factory
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateSlideRightOut(CONFIG, Animation, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // object with animation
        // properties and options
        var animation = {
            name: "transition.slideRightBigOut", easing: "easeOutQuad",
            delay: CONFIG.animation.delay, duration: CONFIG.animation.duration
        };

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        // create and return the animation
        return new Animation("out", animation, AnimationService);
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("animateSlideUpIn",    animateSlideUpIn)    // set in directive
        .directive("animateSlideDownIn",  animateSlideDownIn)  // set in directive
        .directive("animateSlideLeftIn",  animateSlideLeftIn)  // set in directive
        .directive("animateSlideRightIn", animateSlideRightIn) // set in directive

        .directive("animateSlideUpOut",    animateSlideUpOut)    // set out directive
        .directive("animateSlideDownOut",  animateSlideDownOut)  // set out directive
        .directive("animateSlideLeftOut",  animateSlideLeftOut)  // set out directive
        .directive("animateSlideRightOut", animateSlideRightOut) // set out directive

        .animation(".animate-slide-up-in",    animateSlideUpIn)    // set in animation
        .animation(".animate-slide-down-in",  animateSlideDownIn)  // set in animation
        .animation(".animate-slide-left-in",  animateSlideLeftIn)  // set in animation
        .animation(".animate-slide-right-in", animateSlideRightIn) // set in animation

        .animation(".animate-slide-up-out",    animateSlideUpOut)     // set out animation
        .animation(".animate-slide-down-out",  animateSlideDownOut)   // set out animation
        .animation(".animate-slide-left-out",  animateSlideLeftOut)   // set out animation
        .animation(".animate-slide-right-out", animateSlideRightOut); // set out animation
})();
