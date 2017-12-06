"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Worker - Animation Draw
// -------------------------------------
/**
    * @name animation-draw.worker (used with factories/line.factory.js)
    * @desc The web worker for the app that contains functions to animate
            and draw the line through the given path in the given duration.
**/

/* (function() { *//*
    console.log("factories/line.factory/animation-draw.worker.js loaded."); */

    // ---------------------------------------------
    //   Private members
    // ---------------------------------------------
    var _values  = []; // an array of values containing the value to be set at each animation frame update
    var _updates = 0;  // reference to the the no.of animation frame pdates required in the given duration

    var _duration = 0; // reference to the total running duration of the animation (in ms)
    var _timeout  = 0; // reference to the delay for each frame updated in the animation (in ms)
    var _counter  = 0; // reference to the no.of recursions that have complete in the animation

    var _current = null; // reference to the value used with the current update in the animation frame
    var _isCancelled = true; // boolean flag to indicate if flag to indicate if the animation has been cancelled

    // ---------------------------------------------
    //   Public members
    // ---------------------------------------------
    /* empty block */

    // ---------------------------------------------
    //   Private methods
    // ---------------------------------------------
    // @name _update
    // @desc function called on animation progress
    // @param {Object} value - the value that needs to be updated on this update
    // @oaram {Number} step  - the current step frame updated in the animation
    // @param {Number} updates - the total no.of updates in the animation
    function _update(value, step, updates) {
        // notify the main thread to execute
        // the function for animation progress
        self.postMessage(JSON.stringify({
            type: "animation.progress", // the message type sent to the main thread
            updates: updates, // the value that needs to be updated on this update
            value: value, // the current step frame updated in the animation
            step: step // the total no.of update in the animation
        }));
    }

    // @name _done
    // @desc function called on animation complete
    // @param {Object} value - the value that needs to be updated on this update
    // @oaram {Number} step  - the current step frame updated in the animation
    // @param {Number} updates - the total no.of updates in the animation
    function _done(value, step, updates) {
        // notify the main thread to execute
        // the function for animation complete
        self.postMessage(JSON.stringify({
            type: "animation.complete", // the message type sent to the main thread
            updates: updates, // the value that needs to be updated on this update
            value: value, // the current step frame updated in the animation
            step: step // the total no.of update in the animation
        }));
    }

    // @name _doDrawAnimation
    // @desc function to run the animation in a continuous recursive loop
    function _doDrawAnimation() {
        // update reference to the current value and
        // use it to trigger the update function
        // for the the animation in the frame
        _current = _values[_counter];

        // trigger update function with the current
        // value and no.of updates in animation loop
        _update(_current, _counter + 1, _updates);
        _counter++; // update the loop counter

        // check if animation is complete and
        // perform animation again if it is not
        if(_counter < _updates) {
            // check if the animation has been cancelled or not
            if(!_isCancelled) { setTimeout(_doDrawAnimation, _timeout); }
            else { _endDrawAnimation(); } // end animation if it has
        }

        // check if animation is complete and
        // and trigger the callback function
        else { _endDrawAnimation(); }
    }

    // @name _endDrawAnimation
    // @desc function to call when the animation is completed or cancelled
    function _endDrawAnimation() {
        // trigger callback function with the current
        // values and no.of updates in animation loop
        _done(_current, _counter, _updates);
    }

    // ---------------------------------------------
    //   Public methods
    // ---------------------------------------------
    // @name init
    // @desc function called when the animation is initialized
    // @param {Object} options - the options used for initialization
    function init(options) {
        // check if the given options are valid
        if(!options || typeof options.duration !== "number"
        || !Array.isArray(options.values) || !options.values.length) {
            var errorMessage = "animation-draw.worker.js: Cannot initialize the web worker with the given options.";
            throw new Error(errorMessage); // throw an error with custom message
            return false; // only proceed if there were no custom errors thrown
        }

        _values  = options.values; // get the array containing the values to be set at each update
        _updates = _values.length; // get the total the no.of updates required for the animation

        _duration = options.duration; // get the total duration for the animation to run
        _timeout  = (_duration / _updates) // get the timeout for each animation update

        _counter = 0; // reset the animation loop counter back to zero
        _current = null; // reset the value used in the current update
        _isCancelled = true; // reset the animation is cancelled flag
    }

    // @name destroy
    // @desc function called when the animation is destroyed
    function destroy() {
        // reset all references
        // to objects and arrays
        _values = []; _updates = 0;
        _duration = 0; _timeout  = 0;

        _counter = 0; // reset the animation loop counter back to zero
        _current = null; // reset the value used in the current update
        _isCancelled = true; // reset the animation is cancelled flag
    }

    // @name onMessage
    // @desc function for the worker to receive message from the thread
    // @param {Event} event - the event associated with the received message
    function onMessage(event) {
        // only proceed if a valid
        // event and event type exist
        if(!event) { return false; }
        try { event = JSON.parse(event.data); }
        catch(error) { event = { }; /* reset */ }

        if(!event.type) { return false; } /*
        console.log("onMessage: ", event); */

        // determine the function to be
        // run based on the event type
        switch(event.type) {
            // function called on animation init
            case "animation.init": {
                init({
                    duration: event.duration,
                    values: event.values
                }); break;
            }

            // function called on animation start
            case "animation.start": {
                _isCancelled = false;
                _doDrawAnimation();
                break;
            }

            // function called on animation cancel
            case "animation.cancel": {
                _isCancelled = true;
                _endDrawAnimation();
                destroy();
                break;
            }
        }
    }

    // ---------------------------------------------
    //   Constructor block
    // ---------------------------------------------
    /* empty block */

    // ---------------------------------------------
    //   Instance block
    // ---------------------------------------------
    self.onmessage   = onMessage; /*  // function for the worker to receive messages from the thread
    self.postMessage = postMessage */ // function for the worker to post messages to the main thread

/* })(); */
