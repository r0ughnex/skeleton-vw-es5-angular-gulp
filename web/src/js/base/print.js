"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Base - Print
// -------------------------------------
/**
    * @name print
    * @desc A base module to abstract console.log done
            to ensure that gulp tasks cannot strip
            them out on compile. print is attached
            to the window object.
**/
(function() {
    console.log("base/print.js loaded.");

    // @name print
    // @desc the main log function for the base
    // @param {String} selector
    // @param {String} value
    // @return {Boolean}
    function print(value1, value2) {
        // assign to local var
        var print = console;

        // find the key log
        for(var key in print) {
            if(key === "log"){
                // log the given values and return true or false based on check
                if(value1 && value2) { print[key](value1, value2); return true; }
                else if(value1) { print[key](value1); return true; }
            }
        }

        // default return
        // value is false
        return false;
    }

    // @name prompt
    // @desc the main warn function for the base
    // @param {String} selector
    // @param {String} value
    // @return {Boolean}
    function prompt(value1, value2) {
        // assign to local var
        var prompt = console;

        // find the key log
        for(var key in prompt) {
            if(key === "warn"){
                // log the given values and return true or false based on check
                if(value1 && value2) { prompt[key](value1, value2); return true; }
                else if(value1) { prompt[key](value1); return true; }
            }
        }

        // default return
        // value is false
        return false;
    }

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    window.print  = print;
    window.prompt = prompt;

})();
