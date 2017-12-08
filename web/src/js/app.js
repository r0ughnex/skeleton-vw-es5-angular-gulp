"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("mobile-detect");
    * require("velocity");
    * require("nanobar");

    * require("lory");
    * require("swiper");
    * require("youtube-iframe-api");
    * require("plugin-inline-video");

    * require("angular");
    * require("angular-touch");
    * require("angular-animate");
    * require("angular-sanitize");
    * require("angular-ui-router");

    * require("ng-fastclick");
    * require("angular-youtube-mb");
**/

// start
console.warn("app.js: Loading require() script modules in progress.");

// polyfills
require("./polyfills/array.find");
require("./polyfills/array.from");
require("./polyfills/array.includes");
require("./polyfills/array.findIndex");
require("./polyfills/string.includes");

// base
require("./base/raf");
require("./base/query");
require("./base/event");
require("./base/print");
require("./base/promise");
require("./base/debounce");
require("./base/template");

// config
var CONFIG = require("./config");
console.warn("app.js: Loaded require() module config options are:");
console.log(CONFIG);

// -------------------------------------
//   App
// -------------------------------------
/**
    * @name app
    * @desc The main js file that contains the run
            options and config options for the app.
**/
(function() {
    console.log("app.js loaded.");

    /**
        * @name setConfigOptions
        * @desc Function to set config options.
        * @param {Provider} $touchProvider - Provider for $touch in module
        * @param {Provider} $compileProvider - Provider for $compile in module
        * @param {Provider} $animateProvider - Provider for $animate in module
        * @param {Provider} $httpProvider - Provider for $http in module
    **/
    function setConfigOptions($touchProvider, $compileProvider, $animateProvider, $httpProvider) {
        "ngInject"; // tag this function for dependency injection

        // set this as true to enable ngTouch's custom ngClick
        // directive. If enabled eliminates the 300ms delay
        // for click events on browser for touch-devices.
        $touchProvider.ngClickOverrideEnabled(true);

        // disable / enable the app debug mode. This will be enabled
        // in dev mode ( required for counting watchers ) and will
        // be disabled by gulp in prod / deploy mode
        $compileProvider.debugInfoEnabled(true);

        // only animate elements prefixed with this class name
        $animateProvider.classNameFilter(/animate-/);

        // JS based animations
        // are prefixed with "animate-"

        // CSS based animations
        // are prefixed with "animation-"

        // JS based animations are only meant
        // to be used with angular ngAnimate

        // batch multiple $http responses into one $digest
        $httpProvider.useApplyAsync(true);
    }

    /**
        * @name setStateOptions
        * @desc Function to set state options.
        * @param {Provider} $locationProvider - Provider in module
        * @param {Provider} $urlRouterProvider - Provider in module
        * @param {Provider} $stateProvider - Provider in module
        * @param {Constant} CONFIG - The app config constant
    **/
    function setStateOptions($locationProvider, $urlRouterProvider, $stateProvider, CONFIG) {
        "ngInject"; // tag this function for dependency injection

        // use the html5 history mode (except when running on aws s3 environemnt)
        $locationProvider.html5Mode(CONFIG.environment.isAmazonHost ? false : true);

        // default state is app.modules (if no state has been set)
        $urlRouterProvider.otherwise(CONFIG.path.url + "/modules");

        // remove the preset location hash prefix
        $locationProvider.hashPrefix("");

        // states for each routes
        $stateProvider
            // state - app
            .state("app", {
                // options configured for
                // views within this state
                views: {
                    // the parent
                    // main view
                    "main": {
                        templateUrl: CONFIG.path.views + "main.view.html"/*,
                        controller: "AppController",
                        contollerAs: "$ctrl_app"*/
                    },

                    // nested view
                    "page@app":   { template: "" }
                }
            })

            // state - app - modules
            .state("app.modules", {
                // the app route url for
                // this configured state
                url: CONFIG.path.url + "/modules",

                // options configured for
                // views within this state
                views: {
                    // the nested
                    // child view
                    "page@app":   {
                        templateUrl: CONFIG.path.views + "page_modules.view.html"/*,
                        controller: "ModulesController",
                        contollerAs: "$ctrl_page"*/
                    }
                }
            })

            // state - app - samples
            .state("app.samples", {
                // the app route url for
                // this configured state
                url: CONFIG.path.url + "/samples",

                // options configured for
                // views within this state
                views: {
                    // the nested
                    // child view
                    "page@app":   {
                        templateUrl: CONFIG.path.views + "page_samples.view.html"/*,
                        controller: "SamplesController",
                        contollerAs: "$ctrl_page"*/
                    }
                }
            });
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // create the the app module
    angular.module("volkswagen.app", ["ngTouch", "ngAnimate", "ngSanitize", "ui.router", "ng-fastclick"])
        .constant("CONFIG", CONFIG) // set config contant
        .config(setConfigOptions)   // set config options
        .config(setStateOptions);   // set state options

})();

// filters
require("./filters/trust-url.filter");
require("./filters/trust-html.filter");
require("./filters/strip-html.filter");
require("./filters/title-case.filter");

// factories
require("./factories/animation.factory");

// services
require("./services/scope.service");
require("./services/data.service");
require("./services/page.service");

require("./services/loader.service");
require("./services/animation.service");
require("./services/dominant-color.service");

// animations
require("./animations/fade.animation");
require("./animations/slide.animation");
require("./animations/height.animation");
require("./animations/expand.animation");
require("./animations/translate.animation");

// controllers
require("./controllers/app.controller");
require("./controllers/modules.controller");
require("./controllers/samples.controller");

// directives
require("./directives/dominant-color.directive");

// components
require("./components/loader.component");
require("./components/footer.component");
require("./components/teaser-image-small.component");

// complete
console.warn("app.js: Loading require() script modules complete.");

