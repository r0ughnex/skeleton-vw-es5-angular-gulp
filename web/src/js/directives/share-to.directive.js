"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Directive - Share To
// -------------------------------------
/**
    * @name share-to.directive
    * @desc A directive that is used to share content to the
            given social media platform when the user clicks
            on the element to which it is attached to.
**/
(function() {
    console.log("directives/share-to.directive.js loaded.");

    /**
        * @name ShareToController
        * @desc Class for the share to controller.
        * @param {Service} $element - Service in module
        * @param {Service} $attrs - Service in module
        * @param {Service} FbService - The custom facebook sdk service
        * @return {Object} - The instance of the controller class
    **/
    function ShareToController($scope, $element, $attrs, FbService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el = null; // reference to the directive DOM element

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
            // get the directive DOM element
            _el = $element[0];

            // get the node name of the DOM element
            var nodeName = null;
            try { nodeName = _el.nodeName.toLowerCase(); }
            catch(error) { console.log(error); /* do nothing */ }

            // add click event listener to the DOM
            // element if it is an html anchor element
            if( nodeName == "a") { _addOnClickListener(_el); }
            else { _removeOnClickListener(_el); }
        }

        // @name _onClickListener
        // @desc listener function for click events on the given element
        // @params {Event} event - the click event that triggered the listener
        function _onClickListener(event) {
            if(event) {
                // prevent default events
                event.preventDefault();
                event.stopPropagation();
            }

            try {
                // get the social media platform
                // and the data to be shared
                var shareTo = $attrs.shareTo;
                var shareData = {
                    url  : $attrs.href, // the share url
                    title: $attrs.title, // the share title
                    copy : $attrs.shareCopy, // the share copy
                    image: $attrs.shareImage, // the share image
                    caption: $attrs.shareCaption // the share caption
                };

                // share data based on platform
                switch(shareTo.toLowerCase()) {
                    case "facebook": { FbService.share(shareData); break; } // facebook
                    default: { /*do nothing*/ break; } // default
                }
            } catch(error) { console.log(error); }
        }

        // @name _addOnClickListener
        // @desc function to add listener for click events on the given element
        // @params {DOM} element - the element on which the listener is to be added
        function _addOnClickListener(elem) {
            elem.addEventListener("click", _onClickListener);
        }

        // @name _removeOnClickListener
        // @desc function to remove listener for click events on the given element
        // @params {DOM} element - the element on which the listener is to be removed
        function _removeOnClickListener(elem) {
            elem.removeEventListener("click", _onClickListener);
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
        * @name shareTo
        * @desc Function for the share to directive.
        * @example <a share-to="social-platform-name"></a>
        * @return {Object} - The instance of the directive function
    **/
    var shareTo = function() {
        return {
            retrict: "A",
            scope: false,
            bindToController: true,
            controller: ShareToController
        };
    };

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .directive("shareTo", shareTo); // set directive

})();
