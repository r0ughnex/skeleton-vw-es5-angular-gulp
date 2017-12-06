"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Worker - Animation Move
// -------------------------------------
/**
    * @name animation-move.worker (used with factories/map.factory.js)
    * @desc The web worker for the app that contains functions to animate
            and move the the center of the map to the marker with given
            index (zero based) in the given duration.
**/

/* (function() { *//*
    console.log("factories/map.factory/animation-move.worker.js loaded."); */

    // ---------------------------------------------
    //   Private members
    // ---------------------------------------------
    var _values  = []; // an array of values containing the value to be set at each animation frame update
    var _updates = 0;  // reference to the the no.of animation frame pdates required in the given duration

    var _duration = 0; // reference to the total running duration of the animation (in ms)
    var _timeout  = 0; // reference to the delay for each frame updated in the animation (in ms)
    var _counter  = 0; // reference to the no.of recursions that have complete in the animation

    var _end     = null; // reference to the end value for the animation to complete to
    var _start   = null; // reference to the start value for the animation to begin from
    var _current = null; // reference to the value used with the current update in the animation frame
    var _isCancelled = true; // boolean flag to indicate if flag to indicate if the animation has been cancelled

    // ---------------------------------------------
    //   Public members
    // ---------------------------------------------
    /* empty block */

    // ---------------------------------------------
    //   Private methods
    // ---------------------------------------------
    // @name _easeInOutQuad
    // @desc function to get easing for the given animation parameters
    // @param {Number} time - the current time in the animation tween timeline
    // @param {Number} from - the start value of the variable to do animation from
    // @param {Number} change - the change in value of the variable in the animation
    // @param {Number} duration - the total duration of the animation tween timeline
    // @return {Number} - the current updated value with easing applied for the animation
    function _easeInOutQuad (time, from, change, duration) {
        if ((time /= duration / 2) < 1) return change / 2 * time * time + from;
        return -change / 2 * ((--time) * (time - 2) - 1) + from;
    }

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

    // @name _doMoveAnimation
    // @desc function to run the animation in a continuous recursive loop
    function _doMoveAnimation() {
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
            if(!_isCancelled) { setTimeout(_doMoveAnimation, _timeout); }
            else { _endMoveAnimation(); } // end animation if it has
        }

        // check if animation is complete and
        // and trigger the callback function
        else { _endMoveAnimation(); }
    }

    // @name _endMoveAnimation
    // @desc function to call when the animation is completed or cancelled
    function _endMoveAnimation() {
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
        // check if the given
        // options are valid
        if(!options || typeof options.duration !== "number"
        || typeof options.end !== "object" || typeof options.start !== "object"
        || typeof options.end.x !== "number" || typeof options.end.y !== "number"
        || typeof options.start.x !== "number" || typeof options.start.y !== "number") {
            var errorMessage = "animation-move.worker.js: Cannot initialize the web worker with the given options.";
            throw new Error(errorMessage); // throw an error with custom message
            return false; // only proceed if there were no custom errors thrown
        }

        // get the total duration
        // for the animation to run
        _duration = options.duration;

        // there needs to be 60 updates per second (60 fps) and
        // so for -duration- milliseconds the no.of updates are
        _updates = parseInt((_duration * 60) / 1000);

        _end      = options.end;   // get the end value for the animation
        _start    = options.start; // get the start value for the animation
        _timeout  = (_duration / _updates); // get the timeout for each update

        // calculate the intermediate values to be updated at
        // each step, for when the animation runs (with easing)
        _values = []; // reset before new values are calculated
        for(var i = 1; i < _updates; i++) {
            var x = parseFloat(_easeInOutQuad(i, _start.x, _end.x - _start.x, _updates).toFixed(5));
            var y = parseFloat(_easeInOutQuad(i, _start.y, _end.y - _start.y, _updates).toFixed(5));
            _values.push({ x: x, y: y }); // add the calculated increment to the array
        }

        // add the final required
        // increment to the array
        _values.push({ x: _end.x, y: _end.y });

        /*
        // print the no.of updates and the values to confirm the move animation curve
        console.log("---------------------------------------------------------------------------------");
        console.log("animation-move.worker.js: No.of updates for the move animation: " + _values.length);
        console.log("values: ", _values); console.log("-----------------"); */

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

        // reset all references
        // to objects and arrays
        _end     = null; _duration = 0;
        _start   = null; _timeout  = 0;
        _current = null; _counter  = 0;

        // reset all flags to
        // their default values
        _isCancelled = true;
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
                    start: event.start,
                    end: event.end
                }); break;
            }

            // function called on animation start
            case "animation.start": {
                _isCancelled = false;
                _doMoveAnimation();
                break;
            }

            // function called on animation cancel
            case "animation.cancel": {
                _isCancelled = true;
                _endMoveAnimation();
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
