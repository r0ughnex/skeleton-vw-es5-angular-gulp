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
    console.log("animations/translate.animation.js loaded.");

    // @name _animateThis
    // @desc function to perform animation on the given element.
    // @param {DOM} elem - the element to perform the animation on
    // @param {String} dir - the dir of animation "left" (or) "right"
    // @param {String} type - the type of animation "in" (or) "out"
    // @param {Constant} config - the app delay and duration config
    // @param {Function} done - animation complete callback function
    // @return {Object} - the instance of the animation function
    function _animateThis(elem, dir, type, config, done) {
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
            { translateX: type == "in" ? (dir == "right" ? "100%" : "-100%") : "0%" },
            { display: null, duration: 0 }
        );

        // perform animation on the element
        Velocity(elem,
            { translateX: type == "in" ? "0%" : (dir == "right" ? "100%" : "-100%") },
            {
                display: null,
                easing: "easeInOutQuad",
                delay: config.animation.delay ? index * config.animation.delay : 0,
                duration: speed ? config.animation.duration * speed : config.animation.duration,

                // animation begin
                begin: function() {
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
        * @name animateTranslateIn
        * @desc Function for the translate in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateTranslateIn(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // @name _getDirection
        // @desc function to the animation direction for the given element
        // @param {DOM} elem - the element to get the animation direction for
        // @return {String} - the direction of animation for the given element
        function _getDirection(elem) {
            elem = elem[0] ? elem[0] : elem; // get the raw DOM element
            return elem.getAttribute("enter-direction"); // get enter direction
        }

        // _isDirectionValid
        // @desc function to check if the given direction is valid
        // @param {String} direction - the given direction to be checked
        // @return {Boolean} - true if the direction is valid, false if not
        function _isDirectionValid(direction) { try {
            switch(direction.toLowerCase()) {
                // for valid direction values return true
                case "left": case "right": { return true; break;  }

                // default is false
                default: { return false; break; }
            }}

            // on error return false
            catch(error) { console.log(error); return false; }
        }

        return {
            restrict: "A",

            link: function(scope, elem) {
                // only proceed with the animation
                // when a valid direction is given
                var direction = _getDirection(elem);
                if(!_isDirectionValid(direction)) { return false; }

                // perform animation on the element
                _animateThis(elem, direction, "in", CONFIG, function(){ /*do nothing*/ });
            },

            enter: function(elem, done) {
                // only proceed with the animation
                // when a valid direction is given
                var direction = _getDirection(elem);
                if(!_isDirectionValid(direction)) { return false; }

                // perform animation on the element
                _animateThis(elem, direction, "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            removeClass: function(elem, className, done) {
                // only animate when ng-hide is removed
                if(className != "ng-hide") { return false; }

                // only proceed with the animation
                // when a valid direction is given
                var direction = _getDirection(elem);
                if(!_isDirectionValid(direction)) { return false; }

                // perform animation on the element
                _animateThis(elem, direction, "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            }
        };
    }

    /**
        * @name animateTranslateOut
        * @desc Function for the translate out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateTranslateOut(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        // @name _getDirection
        // @desc function to the animation direction for the given element
        // @param {DOM} elem - the element to get the animation direction for
        // @return {String} - the direction of animation for the given element
        function _getDirection(elem) {
            elem = elem[0] ? elem[0] : elem; // get the raw DOM element
            return elem.getAttribute("leave-direction"); // get leave direction
        }

        // _isDirectionValid
        // @desc function to check if the given direction is valid
        // @param {String} direction - the given direction to be checked
        // @return {Boolean} - true if the direction is valid, false if not
        function _isDirectionValid(direction) { try {
            switch(direction.toLowerCase()) {
                // for valid direction values return true
                case "left": case "right": { return true; break;  }

                // default is false
                default: { return false; break; }
            }}

            // on error return false
            catch(error) { console.log(error); return false; }
        }

        return {
            restrict: "A",

            link: function(scope, elem) {
                // only proceed with the animation
                // when a valid direction is given
                var direction = _getDirection(elem);
                if(!_isDirectionValid(direction)) { return false; }

                // perform animation on the element
                _animateThis(elem, direction, "out", CONFIG, function(){ /*do nothing*/ });
            },

            leave: function(elem, done) {
                // only proceed with the animation
                // when a valid direction is given
                var direction = _getDirection(elem);
                if(!_isDirectionValid(direction)) { return false; }

                // perform animation on the element
                _animateThis(elem, direction, "out", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            addClass: function(elem, className, done) {
                // only animate when ng-hide is added
                if(className != "ng-hide") { return false; }

                // only proceed with the animation
                // when a valid direction is given
                var direction = _getDirection(elem);
                if(!_isDirectionValid(direction)) { return false; }

                // perform animation on the element
                _animateThis(elem, direction, "out", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            }
        };
    }

    /**
        * @name animateTranslateRightIn
        * @desc Function for the translate right in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateTranslateRightIn(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        return {
            restrict: "A",

            link: function(scope, elem) {
                // perform animation on the element
                _animateThis(elem, "right", "in", CONFIG, function(){ /*do nothing*/ });
            },

            enter: function(elem, done) {
                // perform animation on the element
                _animateThis(elem, "right", "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            removeClass: function(elem, className, done) {
                // only animate when ng-hide is removed
                if(className != "ng-hide") { return false; }

                // perform animation on the element
                _animateThis(elem, "right", "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            }
        };
    }

    /**
        * @name animateTranslateRightOut
        * @desc Function for the translate right out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateTranslateRightOut(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        return {
            restrict: "A",

            link: function(scope, elem) {
                // perform animation on the element
                _animateThis(elem, "right", "out", CONFIG, function(){ /*do nothing*/ });

            },

            leave: function(elem, done) {
                // perform animation on the element
                _animateThis(elem, "right", "out", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            addClass: function(elem, className, done) {
                // only animate when ng-hide is added
                if(className != "ng-hide") { return false; }

                // perform animation on the element
                _animateThis(elem, "right", "out", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            }
        };
    }

    /**
        * @name animateTranslateLeftIn
        * @desc Function for the translate left in animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateTranslateLeftIn(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        return {
            restrict: "A",

            link: function(scope, elem) {
                // perform animation on the element
                _animateThis(elem, "left", "in", CONFIG, function(){ /*do nothing*/ });
            },

            enter: function(elem, done) {
                // perform animation on the element
                _animateThis(elem, "left", "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            removeClass: function(elem, className, done) {
                // only animate when ng-hide is removed
                if(className != "ng-hide") { return false; }

                // perform animation on the element
                _animateThis(elem, "left", "in", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            }
        };
    }

    /**
        * @name animateTranslateLeftOut
        * @desc Function for the translate right out animation.
        * @param {Constant} CONFIG - The app config constant
        * @param {Service} AnimationService - The custom animation service
        * @return {Object} - The instance of the animation function
    **/
    function animateTranslateLeftOut(CONFIG, AnimationService) {
        "ngInject"; // tag this function for dependancy injection

        return {
            restrict: "A",

            link: function(scope, elem) {
                // perform animation on the element
                _animateThis(elem, "left", "out", CONFIG, function(){ /*do nothing*/ });

            },

            leave: function(elem, done) {
                // perform animation on the element
                _animateThis(elem, "left", "out", CONFIG, done);

                // onDone, onCancel callback
                return function(isCancelled) {
                    if(isCancelled) { AnimationService.animateFinish(elem, done); }
                }
            },

            addClass: function(elem, className, done) {
                // only animate when ng-hide is added
                if(className != "ng-hide") { return false; }

                // perform animation on the element
                _animateThis(elem, "left", "out", CONFIG, done);

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
        .directive("animateTranslateIn",      animateTranslateIn)      // set in directive
        .directive("animateTranslateLeftIn",  animateTranslateLeftIn)  // set in directive
        .directive("animateTranslateRightIn", animateTranslateRightIn) // set in directive

        .directive("animateTranslateOut",      animateTranslateOut)      // set out directive
        .directive("animateTranslateLeftOut",  animateTranslateLeftOut)  // set out directive
        .directive("animateTranslateRightOut", animateTranslateRightOut) // set out directive

        .animation(".animate-translate-in",       animateTranslateIn)      // set in animation
        .animation(".animate-translate-left-in",  animateTranslateLeftIn)  // set in animation
        .animation(".animate-translate-right-in", animateTranslateRightIn) // set in animation

        .animation(".animate-translate-out",       animateTranslateOut)       // set out animation
        .animation(".animate-translate-left-out",  animateTranslateLeftOut)   // set out animation
        .animation(".animate-translate-right-out", animateTranslateRightOut); // set out animation
})();
