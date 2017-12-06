"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Directive - Dominant Color
// -------------------------------------
/**
    * @name dominant-color.directive
    * @desc A directive that is used to determine the dominant
            color of the image, and assign it as the background
            colour for the attached DOM element. (note: for this
            directive to work, make sure the flag hasDOMColors in the
            options within the file /gulp/config.js has been set to true)
**/
(function() {
    console.log("directives/dominant-color.directive.js loaded.");

    /**
        * @name DominantColorController
        * @desc Class for the dominant color controller.
        * @param {Service} $element - Service in module
        * @param {Service} $attrs - Service in module
        * @param {Service} DominantColorService - The custom dominant color service
        * @return {Object} - The instance of the controller class
    **/
    function DominantColorController($scope, $element, $attrs, DominantColorService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el = null; // reference to the directive DOM element
        var _imagePath = ""; // reference to the path of the image
        var _dominantColors =  null // reference to all the dominant colours

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl = this; // to capture the content of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() { /* empty block */ }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() {
            _el = $element[0]; // get the directive DOM element
            _imagePath = $attrs ? $attrs.dominantColor : null; // get the image path

            // get the image name from the path
            var imageData = _imagePath.split("/");
            var imageName = imageData[imageData.length - 1];

            // get the dominant color from the service
            // for the image with the given name
            DominantColorService.getColor(imageName).then(
                // on success callback
                function(color) {
                    // check if the obtained color is valid
                    if(DominantColorService.isColorValid(color)) {
                        // set the background color if it is
                        _el.style.backgroundColor = color;
                        return true; // exit the function
                    }

                    // get the default color set on the element if the
                    // corresponding attribute has been given a value
                    var defaultColor = _el.getAttribute("default-color");

                    // check if the set default color is valid
                    if(DominantColorService.isColorValid(defaultColor)){
                        // set the background color if it is
                        _el.style.backgroundColor = defaultColor;
                        return true; // exit the function
                    }

                     // exit the function
                    return false;
                },

                // on error callback
                function(error) { console.log(error); /* do nothing */ }
            );
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit   = _onInit;     // function for on init
        ctrl.$postLink = _onPostLink; // function for on post link

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() { /* empty block */ });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        /* empty block */
    }

    /**
        * @name dominantColor
        * @desc Function for the dominant color directive.
        * @example <img dominant-color="path/to/image/name.format"/>
        * @return {Object} - The instance of the directive function
    **/
    var dominantColor = function() {
        return {
            retrict: "A",
            scope: false,
            bindToController: true,
            controller: DominantColorController
        };
    };

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("dominantColor", dominantColor); // set directive

})();
