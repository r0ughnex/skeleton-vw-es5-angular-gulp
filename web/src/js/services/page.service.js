"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
    * require("velocity");
**/

// base
require("../base/raf");
require("../base/query");
require("../base/promise");

// -------------------------------------
//   Service - Page
// -------------------------------------
/**
    * @name page.service
    * @desc The helper page service for the app that contains
            functions related to obtaining elements in the
            page and actions to change position of view.
**/
(function() {
    console.log("services/page.service.js loaded.");

    /**
        * @name PageService
        * @desc Class for the page service.=
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the service class
    **/
    function PageService(CONFIG) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _scrollEase = "easeInOut"; // easing used on the scroll animation
        var _scrollDuration = CONFIG.animation.durationSlow; // duration used on the scroll animation

        // ---------------------------------------------
        //   Public members
        // ---------------------------------------------
        var service = this; // to capture the content of this

        // ---------------------------------------------
        //   Private methods
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name getHtml
        // @desc function to get the html element in the document
        // @return {DOM} - the html DOM element in the current document
        function getHtml() {
            return query("html")[0];
        }

        // @name getBody
        // @desc function to get the body element in the document
        // @return {DOM} - the body DOM element in the current document
        function getBody() {
            try { return query("body")[0]; }
            catch(error) { console.log(error); return null; }
        }

        // @name getHeader
        // @desc function to get the header element in the document
        // @return {DOM} - the header DOM element in the current document
        function getHeader() {
            try { return query("header")[0]; }
            catch(error) { console.log(error); return null; }
        }

        // @name getFooter
        // @desc function to get the footer element in the document
        // @return {DOM} - the footer DOM element in the current document
        function getFooter() {
            try { return query("footer")[0]; }
            catch(error) { console.log(error); return null; }
        }

        // @name getPage
        // @desc function to get the page element in the document
        // @return {DOM} - the page DOM element in the current document
        function getPage() {
            try { return query(".app__page")[0]; }
            catch(error) { console.log(error); return null; }
        }

        // @name getPageContent
        // @desc function to get the page content element in the document
        // @param {DOM} page - the page DOM element in the current document
        // @return {DOM} - the page content DOM element in the current document
        function getPageContent(page) {
            // make sure the page is valid
            try { page = page ? page : getPage();
            return query(".app__page__content", page)[0]; }
            catch(error) { console.log(error); return null; }
        }

        // @name scrollToElem
        // @desc function to scroll the page to the given element
        // @param {DOM} elem - the DOM element to scroll the page to
        // @param {Number} duration - the duration of scroll animation in ms
        // @param {Number} offset - the offset of the page scroll position in px
        // @param {DOM} page - the DOM element of the page that needs to be scrolled
        // @return {Promise(Boolean)} - a promise containing true or false on complete
        function scrollToElem(elem, duration, offset, page) {
            // make sure the page is valid
            page = page ? page : getPage();
            var content = getPageContent(page);

            // make sure duration and offset is valid
            duration = parseFloat(duration);
            offset   = parseFloat(offset);

            // get the scroll distance and scroll duration
            var elemRect = elem.getBoundingClientRect();
            var distance = Math.abs(elemRect.top);

            // get the scroll offset
            if(isNaN(offset)) { try {
                var contentStyle = getComputedStyle(content);
                offset = -(parseFloat(contentStyle.paddingTop.replace("px", "")));  }
                catch(error) { console.log(error); contentStyle = null, offset = 0; }
            }

            return new Promise(function(resolve, reject) { try {
                // request animation frame and
                // animate scroll to the given element
                requestAnimationFrame(function() {
                    Velocity(elem, "scroll",
                        {
                            container: page,     // container
                            offset: offset - 0,  // scroll offset
                            easing: _scrollEase, // scroll easing

                            // use the appropriate scroll duration
                            duration: (!isNaN(duration) && duration > 0)
                                      ? duration : _scrollDuration,

                            // run callback function on complete
                            complete: function() { return resolve(true); }
                        }
                    );
                });}

                // return promise with
                // false on error
                catch(error) {
                    console.log(error);
                    return resolve(false);
                }
            });
        }

        // @name scrollToTop
        // @desc function to scroll the page to the top of the page
        // @param {Number} duration - the duration of scroll animation in ms
        // @param {Number} offset - the offset of the page scroll position in px
        // @return {Promise(Boolean)} - a promise containing true or false on complete
        function scrollToTop(duration, offset) {
            return new Promise(function(resolve, reject) { try {
                // get the first element on the
                // page and scroll to the element
                var page = getPage();
                var elem = page.firstElementChild;
                return resolve(scrollToElem(elem, duration, offset, page)); }

                // return promise with
                // false on error
                catch(error) {
                    console.log(error);
                    return resolve(false);
                }
            });
        }

        // @name scrollToId
        // @desc function to scroll the page to the element with given id
        // @param {String} id - the id of the DOM element to scroll page to
        // @param {Number} duration - the duration of scroll animation in ms
        // @param {Number} offset - the offset of the page scroll position in px
        // @return {Promise(Boolean)} - a promise containing true or false on complete
        function scrollToId(id, duration, offset) {
            return new Promise(function(resolve, reject) { try {
                // get the element with the given
                // id and scroll to the element
                var page = getPage();
                var elem = query("#" + id)[0];
                return resolve(scrollToElem(elem, duration, offset, page)); }

                // return promise with
                // false on error
                catch(error) {
                    console.log(error);
                    return resolve(false);
                }
            });
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        /* empty block */

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        service.getHtml   = getHtml;   // function to get the html element in the document
        service.getBody   = getBody;   // function to get the body element in the document
        service.getHeader = getHeader; // function to get the header element in the document
        service.getFooter = getFooter; // function to get the footer element in the document

        service.getPage        = getPage;        // function to get the page element in the document
        service.getPageContent = getPageContent; // function to get the page content element in the document

        service.scrollToElem = scrollToElem; // function to scroll the page to the given element
        service.scrollToTop  = scrollToTop;  // function to scroll the page to the top of the page
        service.scrollToId   = scrollToId;   // function to scroll the page to the element with given id
    }

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .service("PageService", PageService); // set service

})();
