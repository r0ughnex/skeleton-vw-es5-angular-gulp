"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Component - Ming Zing Tiles
// -------------------------------------
/**
    * @name ming-zing-tiles.component
    * @desc The ming zing tiles component for the app.
**/
(function() {
    console.log("components/ming-zing-tiles.component.js loaded.");

    /**
        * @name MingZingTilesController
        * @desc Class for the ming-zing-tiles controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the controller class
    **/
    function MingZingTilesController($scope, $element, CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var ctrl    = this;   // to capture the context of this
        ctrl.CONFIG = CONFIG; // reference to the config constant

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        // @name _onInit
        // @desc function for on init
        function _onInit() {
            _parseAttributes(ctrl); // parse the bound attributes
            ctrl.data = _parseData(ctrl.data); // parse bound data
        }

        // @name _onPostLink
        // @desc function for on post link
        function _onPostLink() { /* empty block */ }

        // @name _parseAttributes
        // @desc function to parse the bound attributes and
        //       replace any missing information with default values
        // @params {Object} ctrl - the controller attributes are bound to
        function _parseAttributes(ctrl) { /* empty block */ }

        // @name _parseData
        // @desc function to parse the bound data and
        //       replace any missing information with default values
        // @params {Object} data - the bound data that needs to parsed
        // @return {Object} - the copy of the bound data after being parsed
        function _parseData(data) {
            // make a local copy of the data
            var data = angular.copy(data);

            // all ming zing tiles
            // contain the same data
            data = [
                {
                    headline: "MORE",
                    copy: "Home is where the heart is for the Keenan family. And theirs happens to be a 1975 Kombi!",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-1.jpg'
                },
                {
                    copy: "Michael’s been bitten by the Superbug! This 1973 model is the second in his Volkswagen journey.",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-2.jpg'
                },
                {
                    headline: "THAN",
                    copy: "What started off as a project car, has now turned into a full-time passion for Chris.",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-3.jpg'
                },
                {
                    copy: "For a special weekend away, photographer Shayben took his Golf R to the fresh flakes of Mount Kosciuszko.",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-4.jpg'
                },
                {
                    copy: "Since purchasing his Amarok, Erik’s been going to places he’s only dreamed of.",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-5.jpg'
                },
                {
                    headline: "A",
                    copy: "Phil’s Tiguan was the perfect fit for his new family. Even better for those off-road adventures.",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-6.jpg'
                },
                {
                    copy: "Johnny’s taken his love of the open road to the next level since linking up with the GTI and R Club of Melbourne.",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-7.jpg'
                },
                {
                    headline: "CAR",
                    copy: "Wade and his mate share a lot in common... Just like their love of Golfs!",
                    image: CONFIG.path.images + 'm5/m5-mzt-brand-image-8.jpg'
                }
            ];

            // return the parsed data
            return data;
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name blueTile
        // @desc function to blur the given tile
        // @param {Object} tile - the given tile to be blurred
        // @param {Event} event - the event that triggered the function
        function blurTile(tile, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // blur the given tile (if it is in focus)
            if(tile.isFocussed) { tile.isFocussed = false; }
        }

        // @name focusTile
        // @desc function to focus the given tile
        // @param {Object} tile - the given tile to be focussed
        // @param {Event} event - the event that triggered the function
        function focusTile(tile, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // focus the given tile (if it is not focussed)
            if(!tile.isFocussed) { tile.isFocussed = true; }
        }

        // @name blueTile
        // @desc function called when a tile is clicked
        // @param {Object} tile - the given tile to be blurred
        // @param {Event} event - the event that triggered the function
        function onTileClick(tile, event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            // blur all the other tiles
            ctrl.data.forEach(function(tile) {
                blurTile(tile);
            });

            // focus the given tile
            focusTile(tile);
        }

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
        ctrl.blurTile    = blurTile;    // function to blur the given tile
        ctrl.focusTile   = focusTile;   // function to focus the given tile
        ctrl.onTileClick = onTileClick; // function called when a tile is clicked
    }

    /**
        * @name MingZingTilesTemplate
        * @desc Class for the ming-zing-tiles template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the  template class
    **/
    function MingZingTilesTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "ming-zing-tiles.template.html";
    }

    /**
        * @name mingZingTiles
        * @desc Function for the ming-zing-tiles component.
        * @return {Object} - The instance of the component function
    **/
    var mingZingTiles = function() {
        return {
            controller: MingZingTilesController,
            templateUrl: MingZingTilesTemplate,
            bindings: { /* empty block */ }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("mingZingTiles", mingZingTiles); // set component
})();
