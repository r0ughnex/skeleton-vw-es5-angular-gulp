"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Service - Scope
// -------------------------------------
/**
    * @name scope.service
    * @desc The helper scope service for the app
            that contains scope related functions
            to safely digest and apply angular scope.
**/
(function() {
    console.log("services/scope.service.js loaded.");

    /**
        * @name ScopeService
        * @desc Class for the scope service.
        * @return {Object} - The instance of the service class
    **/
    function ScopeService() {
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
        // @name _isScopeSafe
        // @desc function to check if scope is being applied or digested
        // @param {$scope} scope - the scope that needs to be checked
        // @return {Boolean} - inidicates whether scope is safe
        var _isScopeSafe = function(scope) { try {
            var phase = scope.$root.$$phase;
            return (phase != "$apply" && phase != "$digest"); }
            catch(error) { console.log(error); return false;  }
        };

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name digest
        // @desc function to digest the scope if it is not already applied
        // @param {$scope} scope - the scope that needs to be digested
        // @return {Boolean} - inidicates if the scope was digested
        var digest = function(scope) {
            try { if(_isScopeSafe(scope)) { scope.$digest(); } return true; }
            catch(error) { console.log(error); return false; }
        };

        // @name apply
        // @desc function to apply the scope if it is not already applied
        // @param {$scope} scope - the scope that needs to be applied
        // @return {Boolean} - inidicates if the scope was applied
        var apply = function(scope) {
            try { if(_isScopeSafe(scope)) { scope.$apply(); } return true; }
            catch(error) { console.log(error); return false; }
        };

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.digest = digest; // function to check if scope is being applied or digested
        service.apply  = apply;  // function to digest the scope if it is not already applied
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("ScopeService", ScopeService); // set service

})();
