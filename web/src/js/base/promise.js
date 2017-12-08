"use strict";

// -------------------------------------
//   Dependencies
// -------------------------------------
/**
    * @plugins
**/

// -------------------------------------
//   Base - Promise
// -------------------------------------
/**
    * @name promise
    * @desc A base module to enable waiting for asynchronous
            code to exceute. Simulates the behaviour of
            ES6 Promises.
**/
(function() {
    console.log("base/promise.js loaded.");

    // store setTimeout reference so promise-base will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    var setTimeoutFunc = setTimeout;

    // @name noop
    function noop() { }

    // use base for setImmediate for performance gains
    var asap = (typeof setImmediate === "function" && setImmediate) ||
        function (fn) {
            setTimeoutFunc(fn, 1);
        };

    // @name onUnhandledRejection
    var onUnhandledRejection = function onUnhandledRejection(err) {
        if (typeof console !== "undefined" && console) {
            console.warn("Possible Unhandled Promise Rejection:", err); // eslint-disable-line no-console
        }
    };

    // @name bind
    // @desc base for Function.prototype.bind
    function bind(fn, thisArg) {
        return function () {
          fn.apply(thisArg, arguments);
        };
    }

    // @name Promise
    function Promise(fn) {
        if (typeof this !== "object") throw new TypeError("Promises must be constructed via new");
        if (typeof fn !== "function") throw new TypeError("not a function");
        this._state = 0;
        this._handled = false;
        this._value = undefined;
        this._deferreds = [];

        doResolve(fn, this);
    }

    // @name handle
    function handle(self, deferred) {
        while (self._state === 3) {
            self = self._value;
        }
        if (self._state === 0) {
            self._deferreds.push(deferred);
            return;
        }
        self._handled = true;
        asap(function () {
            var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
                (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                return;
            }
            var ret;
            try {
                ret = cb(self._value);
            } catch (e) {
                reject(deferred.promise, e);
                return;
            }
            resolve(deferred.promise, ret);
        });
    }

    // @name resolve
    function resolve(self, newValue) {
        try {
            // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === self) throw new TypeError("A promise cannot be resolved with itself.");
            if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
                var then = newValue.then;
                if (newValue instanceof Promise) {
                    self._state = 3;
                    self._value = newValue;
                    finale(self);
                    return;
                } else if (typeof then === "function") {
                    doResolve(bind(then, newValue), self);
                    return;
                }
            }
            self._state = 1;
            self._value = newValue;
            finale(self);
        } catch (e) {
            reject(self, e);
        }
    }

    // @name reject
    function reject(self, newValue) {
        self._state = 2;
        self._value = newValue;
        finale(self);
    }

    // @name finale
    function finale(self) {
        if (self._state === 2 && self._deferreds.length === 0) {
            asap(function() {
                if (!self._handled) {
                        onUnhandledRejection(self._value);
                }
            }, 1);
        }

        for (var i = 0, len = self._deferreds.length; i < len; i++) {
            handle(self, self._deferreds[i]);
        }
        self._deferreds = null;
    }

    // @name Handler
    function Handler(onFulfilled, onRejected, promise) {
        this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
        this.onRejected = typeof onRejected === "function" ? onRejected : null;
        this.promise = promise;
    }

    // @name doResolve
    // @desc Take a potentially misbehaving resolver function and
    //       make sure onFulfilled and onRejected are only called
    //       once. Makes no guarantees about asynchrony.
    function doResolve(fn, self) {
        var done = false;
        try {
            fn(function (value) {
                if (done) return;
                done = true;
                resolve(self, value);
            }, function (reason) {
                if (done) return;
                done = true;
                reject(self, reason);
          });
        } catch (ex) {
            if (done) return;
            done = true;
            reject(self, ex);
        }
    }

    // @name catch
    Promise.prototype["catch"] = function (onRejected) {
        return this.then(null, onRejected);
    };

    // @name then
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var prom = new Promise(noop);
        handle(this, new Handler(onFulfilled, onRejected, prom));
        return prom;
    };

    // @name all
    Promise.all = function (arr) {
        var args = Array.prototype.slice.call(arr);

        return new Promise(function (resolve, reject) {
            if (args.length === 0) return resolve([]);
            var remaining = args.length;

            function res(i, val) {
                try {
                    if (val && (typeof val === "object" || typeof val === "function")) {
                        var then = val.then;
                        if (typeof then === "function") {
                            then.call(val, function (val) {
                                res(i, val);
                            }, reject);
                            return;
                        }
                    }
                    args[i] = val;
                    if (--remaining === 0) {
                        resolve(args);
                    }
                } catch (ex) {
                    reject(ex);
                }
            }

            for (var i = 0; i < args.length; i++) {
                res(i, args[i]);
            }
        });
    };

    // @name resolve
    Promise.resolve = function (value) {
        if (value && typeof value === "object" && value.constructor === Promise) {
            return value;
        }

        return new Promise(function (resolve) {
            resolve(value);
        });
    };

    // @name reject
    Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    };

    // @name race
    Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
            for (var i = 0, len = values.length; i < len; i++) {
                values[i].then(resolve, reject);
            }
        });
    };

    // @name _setImmediateFn
    // @desc set the immediate function to execute callbacks
    // @param {function} fn - function to execute
    Promise._setImmediateFn = function _setImmediateFn(fn) {
        asap = fn;
    };

    // @name _setUnhandledRejectionFn
    // @desc set the unhandled rejection function
    // @param {function} fn - function to execute
    Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
        onUnhandledRejection = fn;
    };

    // ---------------------------------------------
    //   Attach base to the global namespace
    // ---------------------------------------------
    if (typeof window.Promise !== "function") {
        window.Promise = Promise;
    }


})();
