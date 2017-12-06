"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// base
require("../base/query");
require("../base/promise");

// -------------------------------------
//   Component - Api Tester
// -------------------------------------
/**
    * @name api-tester.component
    * @desc The api tester component for the app.
**/
  (function() {
    console.log("components/api-tester.component.js loaded.");

    /**
        * @name ApiTesterController
        * @desc Class for the api tester controller.
        * @param {Service} $scope - Service in module
        * @param {Service} $element - Service in module
        * @param {Service} $http - Service in module
        * @param {Service} ScopeService - The custom scope service
        * @param {Service} PageService - The custom page service
        * @param {Service} LoggerService - The custom logger service
        * @param {Service} ShippingService - The custom shipping service
        * @param {Service} GoogleMapsService - The custom google maps service
        * @param {Factory} Map - The custom extendable map factory
        * @return {Object} - The instance of the controller class
    **/
    function ApiTesterController($scope, $element, $http, CONFIG, ScopeService, PageService) {
        "ngInject"; // tag this function for dependancy injection

        // ---------------------------------------------
        //   Private members
        // ---------------------------------------------
        var _el     = null; // reference to the DOM element
        var _elPage = null; // reference to the current page DOM
        var _elHtml = null; // reference to the current html DOM

        var _promiseQueue = [ ]; // queue containing the returned promise from the api test calls
        var _contentResponses = { }; // object containing an array of responses from the content apis
        var _isPromiseQueueRunning = false; // boolean flag to indicate if the promise queue is running

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
        function _onPostLink() {
            // get the DOM elements
            _el = $element[0];
            _elHtml = PageService.getHtml();
            _elPage = PageService.getPage();

            setTimeout(function() {
                // loop through the filtered list of apis
                ctrl.data.apis.forEach(function(api, index) {
                    var oldApi = CONFIG.path.volkswagen; // set prefix for the old api
                    var newApi = CONFIG.path.volkswagen; // set prefix for the new api

                    // determine action based
                    // on the type of the api
                    switch(api.type) {
                        // if type is content
                        case "content":  {
                            oldApi += "/welcome/api/content?id={{id}}";       // add the suffix for the old api
                            newApi += "/welcome-proto/api/content?id={{id}}"; // add the suffix for the new api

                            // set the default request and response count
                            var count = { request: 2, response: 0 };

                            _enqueuePromise(function() {
                                return new Promise(function(resolve, reject) {
                                    // outer timeout for
                                    // a smoother animation
                                    setTimeout(function() {
                                        // set start time before the outer request is sent
                                        var time  = { start: new Date(), end: null };

                                        _setApiLoading(api, true);   // set loading as true
                                        _setApiSuccess(api, false);  // set success as false
                                        _setApiError(api, false);    // set the error as false
                                        ScopeService.digest($scope); // update component scope

                                        // send an outer request for data from the old api
                                        $http.get(oldApi.replace("{{id}}", api.id)).then(
                                            // on request success
                                            function(response) {
                                                _handleContentResponse("old", api, response, count, time);
                                                // if the response count has reached the maximum allowed
                                                // count for this request, then resolve promise with true
                                                if(count.response >= count.request) { return resolve(true); }

                                            },

                                            // on request error
                                            function(error) {
                                                _handleContentError("old", api, error, count, time);
                                                return resolve(false); // resolve promise with false
                                            }
                                        );

                                        // inner timeout for
                                        // a delay in compare
                                        setTimeout(function() {
                                            // send an inner request for data from the old api
                                            $http.get(newApi.replace("{{id}}", api.id)).then(
                                                // on request success
                                                function(response) {
                                                    _handleContentResponse("new", api, response, count, time);
                                                    // if the response count has reached the maximum allowed
                                                    // count for this request, then resolve promise with true
                                                    if(count.response >= count.request) { return resolve(true); }
                                                },

                                                // on request error
                                                function(error) {
                                                    _handleContentError("new", api, error, count, time);
                                                    return resolve(false); // resolve promise with false
                                                }
                                            );
                                        }, CONFIG.timeout.scope); // inner setTimeout()
                                    }, CONFIG.timeout.animation); // outer setTimeout()
                                }); // end of new Promise()
                            }).then(function(enqueueResponse) { /*
                                print("enqueue response:", enqueueResponse); */
                            }); // end of _enqueuePromise()

                            break;

                        }  // end of case "content"
                    } // end of the main switch()

                }); // ctrl.data.apis.forEach
            }, 1); // end of main setTimeout()
        }

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

            // check if a valid list of apis
            // have been given in the data
            if(!Array.isArray(data.apis)) {
                data.apis = [];
            }

            // filter the apis based on the server
            // and the current server environment
            var apis = data.apis.filter(function(api) {
                if(CONFIG.isVolkswagenProd) {
                    // filter 'production' server apis if
                    // this is the production environment
                    return (api.server === "production");
                } else {
                    // filter 'staging' server apis on
                    // all the other server environments
                    return (api.server === "staging" ||
                            api.server === "all");
                }
            });

            // set the default status for the apis
            apis.forEach(function(api, index) {
                // check for 'all' server apis
                if(api.server === "all") {
                    if(CONFIG.isVolkswagenProd) {
                        // set the api server as 'production'
                        // if this is production environment
                        api.server = "production";
                    } else {
                        // set the api server as 'staging' on
                        // all the other server environments
                        api.server = "staging";
                    }
                }

                _setApiLoading(api, false); // set loading as false
                _setApiSuccess(api, false); // set success as false
                _setApiError(api, false);   // set the error as false
            });

            // set the filtered list
            // of apis back in data
            data.apis = apis;

            // return the parsed data
            return data;
        }

        // @name _setApiTime
        // @desc function to set the end time for the api
        // @param {Object} api - the api to set the end time for
        // @param {Object} time - the object containing the start time
        function _setApiTime(api, time) {
            time.end = new Date();
            api.time = ((time.end.getTime() - time.start.getTime()) / 1000);
            print("api test time:", api.time.toFixed(2) + " seconds");
        }

        // @name _setApiError
        // @desc function to set the error status of the api
        // @param {Object} api - the api to set the error status for
        // @param {Boolean} flag - the boolean flag to be set as the status
        function _setApiError(api, flag) {
            if(api.isError !== flag) {
                api.isError = flag;
            }
        }

        // @name _setApiSuccess
        // @desc function to set the success status of the api
        // @param {Object} api - the api to set the success status for
        // @param {Boolean} flag - the boolean flag to be set as the status
        function _setApiSuccess(api, flag) {
             if(api.isSuccess !== flag) {
                api.isSuccess = flag;
            }
        }

        // @name _setApiLoading
        // @desc function to set the loading status of the api
        // @param {Object} api - the api to set the loading status for
        // @param {Boolean} flag - the boolean flag to be set as the status
        function _setApiLoading(api, flag) {
             if(api.isLoading !== flag) {
                api.isLoading = flag;
            }
        }

        // @name _isEqualArray
        // @desc function to recursively test if the given two arrays are equivalent
        // @param {Array} a - the first given array to be checked for equivalency for
        // @param {Array} b - the second given array to be checked for equivalency with
        // @param {String} pkey - the optional parent object key the given arrays are from
        // @return {Boolean} isEqualArray - the boolean flag indicating if the arrays are equivalent
        function _isEqualArray(a, b, pkey) { try {/*
            print("a:", a);
            print("b:", b);
            print("pkey", pkey)*/

            // only proceed if both items are valid arrays
            if(!Array.isArray(a) || !Array.isArray(b)) {
                prompt("----------------------------------------");
                prompt("array test failed: typeof a !== typeof b");
                prompt("----------------------------------------");
                if(pkey) { print("parent key:", pkey); }
                print("typeof a:", typeof a);
                print("typeof b:", typeof b);
                return false;
            }

            // loop through each item in the arrays
            var c = ((a.length >= b.length) ? a : b);
            for(var i = 0; i < c.length; i++) {
                var key = i;      // the inner item key
                var _a  = a[key]; // the first inner item
                var _b  = b[key]; // the second inner item

                // recurse check on the inner items
                if(!_isEqual(_a, _b, key)) {
                    // exit loop if the check on the
                    // inner items comes back as false
                    return false;
                }
            }

            // return true otherwise
            return true; }

            // return false if there were errors
            catch(error) { console.log(error); return false; }
        }


        // @name _isEqualObject
        // @desc function to recursively test if the given two objects are equivalent
        // @param {Object} a - the first given object to be checked for equivalency for
        // @param {Object} b - the second given object to be checked for equivalency with
        // @param {String} pkey - the optional parent object key the given objects are from
        // @return {Boolean} isEqualObject - the boolean flag indicating if the objects are equivalent
        function _isEqualObject(a, b, pkey) { try {/*
            print("a:", a);
            print("b:", b);
            print("pkey", pkey)*/

            // only proceed if both items are valid objects
            if(typeof a !== "object" || typeof b !== "object") {
                prompt("-----------------------------------------");
                prompt("object test failed: typeof a !== typeof b");
                prompt("-----------------------------------------");
                if(pkey) { print("parent key:", pkey); }
                print("typeof a:", typeof a);
                print("typeof b:", typeof b);
                return false;
            }

            // loop through each item in the objects
            var ksa = Object.keys(a); var ksb = Object.keys(b);
            var keys = ((ksa.length >= ksb.length) ? ksa : ksb);
            for(var i = 0; i < keys.length; i++) {
                var key = keys[i]; // the inner item key
                var _a  = a[key];  // the first inner item
                var _b  = b[key];  // the second inner item

                // recurse check on the inner items
                if(!_isEqual(_a, _b, key)) {
                    // exit loop if the check on the
                    // inner items comes back as false
                    return false;
                }
            }

            // return true otherwise
            return true; }

            // return false if there were errors
            catch(error) { console.log(error); return false; }
        }

        // @name _isEqual
        // @desc function to recursively test if the given two entities are equivalent
        // @param {*} a - the first given item / entity to be checked for equivalency for
        // @param {*} b - the second given item / entity to be checked for equivalency with
        // @param {String} pkey - the optional parent object key the given entities are from
        // @return {Boolean} isEqual - the boolean flag indicating if the entities are equivalent
        function _isEqual(a, b, ckey) { try {/*
            print("a:", a);
            print("b:", b);
            print("ckey", ckey)*/

            // only proceed if both items are of same type
            if(typeof a !== typeof b) {
                prompt("------------------------------------------");
                prompt("compare test failed: typeof a !== typeof b");
                prompt("------------------------------------------");
                if(ckey) { print("current key:", ckey); }
                print("typeof a:", typeof a);
                print("typeof b:", typeof b);
                return false;
            }

            // if the items are arrays
            else if(Array.isArray(a)) { /*
                // recursively check if both
                // the arrays are equivalent
                print("continue: Array.isArray(a)"); */
                if(!_isEqualArray(a, b, ckey)) { return false; }
            }

            // if the items are objects
            else if(typeof a === "object") { /*
                // recursively check if both
                // the objects are equivalent
                print("continue: typeof a === 'object'"); */
                if(!_isEqualObject(a, b, ckey)) { return false; }
            }

            // everything else
            else if(a !== b) {
                // return false if they are not equivalent
                prompt("----------------------------");
                prompt("compare test failed: a === b");
                prompt("----------------------------");
                if(ckey) { print("current key:", ckey); }
                print("a:", a);
                print("b:", b);
                return false;
            }

            // return true otherwise
            return true; }

            // return false if there were errors
            catch(error) { console.log(error); return false; }
        }

        // @name _isResponseTemplateValid
        // @desc function to determine if the template from the given response is valid
        // @param {Object} response - the response that contains the template to be checked
        // @return {Boolean} isResponseTemplateValid - the boolean flag indicating validity of the template
        function _isResponseTemplateValid(response) { try {
            var template = response.data.user.template;
            return (typeof template === "string" &&
                    template !== "error" &&
                    template.length > 1); }

            // return false, if there are errors
            catch(error) { return false; }
        }

        // @name _isResponseContentValid
        // @desc function to determine if the content from the given response is valid
        // @param {Object} response - the response that contains the content to be checked
        // @return {Boolean} isResponseContentValid - the boolean flag indicating validity of the content
        function _isResponseContentValid(response) { try {
            var content = response.data.template.content;
            return (typeof content === "object" &&
                    Object.keys(content).length > 2); }

            // return false, if there are errors
            catch(error) { return false; }
        }

        // @name _isResponseContentSamed
        // @desc function to determine if the content from the given responses are same
        // @param {Object} responseA - the first response that contains the content to be checked
        // @param {Object} responseB - the second response that contains the content to be checked
        // @return {Boolean} isResponseContentSame - the boolean flag indicating equivalency of the contents
        function _isResponseContentSame(responseA, responseB) { try {
            var contentA = responseA.data.template.content;
            var contentB = responseB.data.template.content;
            return _isEqual(contentA, contentB, null); }

            // return false, if there are errors
            catch(error) { return false; }
        }

        // @name _handleContentResponse
        // @desc function to handle the given content type response
        // @param {String} type - the type of the response, i.e. new or old
        // @param {Object} api - the api that the content response belongs to
        // @param {Object} response - the content response that needs to be handled
        // @param {Count} count - the current count for the response from the given api
        // @param {Object} time - the object containing the api response start time
        function _handleContentResponse(type, api, response, count, time) {
            // only proceed if the api
            // does not contain errors
            if(api.isError) { return false; }

            print("_____________________________________________________________________");
            print("api-tester.component.js: testing the " + type + " api with id", api.id);
            print("api " + type + " response:", response);

            // create an empty response array if previous
            // responses from this api does not exist
            if(!Array.isArray(_contentResponses[api.id])) {
                _contentResponses[api.id] = [ ];
            }

            // push the response into the array
            _contentResponses[api.id].push(response);

            // check if the response template is valid
            if(!_isResponseTemplateValid(response)) {
                prompt("---------------------------------------------------");
                prompt("api test failed:", "response template is not valid.");
                prompt("---------------------------------------------------");
                // set error as true, set the api test end time
                _setApiError(api, true); _setApiTime(api, time);
                ScopeService.digest($scope); // update the scope
                print("api:", api);
                return false;
            } else {
                print("api test passed:", "response template is valid.");
            }

            // check if the response content is valid
            if(!_isResponseContentValid(response)) {
                prompt("--------------------------------------------------");
                prompt("api test failed:", "response content is not valid.");
                prompt("--------------------------------------------------");
                // set error as true, set the api test end time
                _setApiError(api, true); _setApiTime(api, time);
                ScopeService.digest($scope); // update the scope
                print("api:", api);
                return false;
            } else {
                print("api test passed:", "response content is valid.");
            }

            // increase the response count
            count.response++;

            // if the response count has reached the
            // maximum allowed count for this request
            if(count.response >= count.request) {
                // the timeout is for
                // smoother animation
                setTimeout(function() {
                    _setApiLoading(api, false);  // set loading as false
                    ScopeService.digest($scope); // update component scope
                }, CONFIG.timeout.animation + CONFIG.timeout.scope);

                // check if the content response for the last responses are the same (stored in array)
                if(!_isResponseContentSame(_contentResponses[api.id].shift(), _contentResponses[api.id].shift())) {
                    prompt("-------------------------------------------------");
                    prompt("api test failed:", "response content is not same.");
                    prompt("-------------------------------------------------");
                    // set error as true, set the api test end time
                    _setApiError(api, true); _setApiTime(api, time);
                    ScopeService.digest($scope); // update the scope
                    print("api:", api);
                    return false;
                } else {
                    print("api test passed:", "response content is same.");
                }

                // set succes as true, set the api test end time
                _setApiSuccess(api, true); _setApiTime(api, time);
                ScopeService.digest($scope); // update the scope
                print("api:", api);
                return true;
            }
        }

        // @name _handleContentError
        // @desc function to handle the given content type error
        // @param {String} type - the type of the error, i.e. new or old
        // @param {Object} api - the api that the content error belongs to
        // @param {Object} error - the content error that needs to be handled
        // @param {Count} count - the current count for the error from the given api
        // @param {Object} time - the object containing the api error start time
        function _handleContentError(type, api, error, count, time) {
            // only proceed if the api
            // does not contain errors
            if(api.isError) { return false; }

            print("_____________________________________________________________________");
            print("api-tester.component.js: testing the " + type + " api with id", api.id);
            print("api " + type + " error:", error);

            _setApiLoading(api, false);  // set loading as false
            ScopeService.digest($scope); // update component scope

            // set succes as true, set the api test end time
            _setApiError(api, true); _setApiTime(api, time);
            ScopeService.digest($scope); // update the scope
            print("api:", api);
            return false;
        }



        // @name _enqueuePromise
        // @desc function to add the api function containing the returned promise to the queue
        // @param {Function} promiseFunc - api function with the returned promise to be enqueued
        // @return {Promise(Object)} - the promise object containing the result and queue length
        function _enqueuePromise(promiseFunc) {
            return new Promise(function(resolve, reject) {
                // only proceed if the given function is valid
                if(typeof promiseFunc !== "function") {
                    // resolve promise with
                    // false and queue length
                    return resolve({
                        result: false,
                        length: _promiseQueue.length
                    });
                }

                // add the function to the promise queue
                _promiseQueue.push(promiseFunc);

                // check if the queue is running
                if(!_isPromiseQueueRunning) {
                    // execute the next function in the promise queue if not
                    _executePromiseQueue().then(function(executeResponse) {
                        print("execute response:", executeResponse);
                    }); // end of _executePromiseQueue()
                }

                // resolve promise with
                // true and queue length
                return resolve({
                    result: true,
                    length: _promiseQueue.length
                });
            });
        }

        // @name _enqueuePromise
        // @desc function to remove the api functions containing the returned promise from the queue
        // @param {Number} promiseCount - the no.of api functions with the returned promise to be dequeued
        // @return {Promise(Object)} - the promise object containing the result, queue length and removed items
        function _dequeuePromise(promiseCount) {
            return new Promise(function(resolve, reject) {
                // only proceed if the count is valid
                if(typeof promiseCount !== "number") {
                    return resolve({
                        // resolve promise with
                        // false and queue length
                        removed: [ ], result: false,
                        length: _promiseQueue.length
                    });
                }

                // only proceed if there are
                // items in the promise queue
                if(!_promiseQueue.length) {
                    // resolve promise with
                    // false and queue length
                    return resolve({
                        removed: [ ], result: false,
                        length: _promiseQueue.length
                    });
                }

                var removed = [ ];
                // remove given no.of items from queue
                for(var i = 0; i < promiseCount; i++) {
                    try { removed.push(_promiseQueue.shift()); }
                    catch(error) { prompt(error); }
                }

                // resolve promise with
                // true and queue length
                // (and the removed items)
                return resolve({
                    removed: removed, result: true,
                    length: _promiseQueue.length
                });
            });
        }

        // @name _executePromiseQueue
        // @desc function to execute the api functions containing the returned promise in the promise queue
        // @return {Promise(Object)} - the promise object containing the result, queue length and running flag
        function _executePromiseQueue() {
            return new Promise(function(resolve, reject) {
                // only proceed if there are
                // items in the promise queue
                if(!_promiseQueue.length) {
                    _isPromiseQueueRunning = false;

                    return resolve({
                        result: false,
                        length: _promiseQueue.length,
                        isRunning: _isPromiseQueueRunning
                    });
                }

                _isPromiseQueueRunning = true; // set the running boolean flag
                var queuedPromiseFunc = _promiseQueue[0] // get queued function

                queuedPromiseFunc().then(
                    function(response) {
                        // only proceed if there are
                        // items in the promise queue
                        if(_promiseQueue.length) {
                            // dequeue the current xecuted function from the queue
                            _dequeuePromise(1).then(function(dequeueResponse) { /*
                                print("dequeue response:", dequeueResponse); */
                            }); // end of _dequeuePromise(1)

                            // and recurse execution on the next function in queue
                            _executePromiseQueue().then(function(executeResponse) { /*
                                print("execute response:", executeResponse); */
                                return resolve(executeResponse);
                            }); // end of _executePromiseQueue()
                        } else {
                            // reset the running boolean flag
                            _isPromiseQueueRunning = false;

                            // resolve promise with
                            // true and queue length
                            // (and the running flag)
                            return resolve({
                                result: true,
                                length: _promiseQueue.length,
                                isRunning: _isPromiseQueueRunning
                            });
                        }
                    },

                    function(error) {
                        // only proceed if there are
                        // items in the promise queue
                        if(_promiseQueue.length) {
                            // dequeue the current xecuted function from the queue
                            _dequeuePromise(1).then(function(dequeueResponse) { /*
                                print("dequeue response:", dequeueResponse); */
                            }); // end of _dequeuePromise(1)

                            // and recurse execution on the next function in queue
                            _executePromiseQueue().then(function(executeResponse) { /*
                                print("execute response:", executeResponse); */
                                return resolve(executeResponse);
                            }); // end of _executePromiseQueue()
                        } else {
                            // reset the running boolean flag
                            _isPromiseQueueRunning = false;

                            // resolve promise with
                            // true and queue length
                            // (and the running flag)
                            return resolve({
                                result: true,
                                length: _promiseQueue.length,
                                isRunning: _isPromiseQueueRunning
                            });
                        }
                    }
                );
            });
        }

        // ---------------------------------------------
        //   Public methods
        // ---------------------------------------------
        // @name getApiStatus
        // @desc function to get the status of the given api
        // @param {Object} api - the api to get the status for
        // @return {String} status - the status of the given api
        function getApiStatus(api) { try {
            // check if any of the api status flags have been
            // set and return the status based on the set flag
                 if(api.isLoading) { return "loading"; }
            else if(api.isSuccess) { return "success"; }
            else if(api.isError)   { return "error";   }

            // the default status when no flag is set
            else { return "queued"; }}

            // the default status when there are errors
            catch(error) { console.log(error); return "unknown"; }
        }

        // ---------------------------------------------
        //   Constructor block
        // ---------------------------------------------
        ctrl.$onInit   = _onInit;     // function for on init
        ctrl.$postLink = _onPostLink; // function for on post link

        // deregister all registered listeners, clear set timers
        // and set intervals when the current scope is destroyed
        $scope.$on("$destroy", function() {
            // reset all references to objects
            _el = _elPage = _elHtml = null;

            // reset all references to arrays
            // and reset all set boolean flags
            _promiseQueue = [ ];
            _contentResponses = { };
            _isPromiseQueueRunning = false;
        });

        // ---------------------------------------------
        //   Instance block
        // ---------------------------------------------
        ctrl.getApiStatus = getApiStatus; // function to get the status of the given api
    }

    /**
        * @name ApiTesterTemplate
        * @desc Class for the api tester template.
        * @param {Constant} CONFIG - The app config constant
        * @return {Object} - The instance of the template class
    **/
    function ApiTesterTemplate(CONFIG) {
        "ngInject"; // tag this function for dependancy injection
        return CONFIG.path.templates + "api-tester.template.html";
    }

    /**
        * @name apiTester
        * @desc Function for the api tester component.
        * @return {Object} - The instance of the component function
    **/
    var apiTester = function() {
        return {
            controller: ApiTesterController,
            templateUrl: ApiTesterTemplate,
            bindings: { data: "<" }
        };
    }();

    // ---------------------------------------------
    //   Module export block
    // ---------------------------------------------
    // get the app module
    angular.module("volkswagen.app")
        .component("apiTester", apiTester); // set component
})();

