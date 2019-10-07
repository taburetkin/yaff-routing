(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('core-js/modules/es6.regexp.to-string'), require('core-js/modules/es6.object.to-string'), require('core-js/modules/es7.symbol.async-iterator'), require('core-js/modules/es6.symbol'), require('core-js/modules/web.dom.iterable'), require('regenerator-runtime/runtime'), require('core-js/modules/es6.object.assign'), require('core-js/modules/es6.string.starts-with'), require('core-js/modules/es6.regexp.search'), require('core-js/modules/es6.regexp.constructor'), require('core-js/modules/es6.regexp.replace'), require('core-js/modules/es6.array.iterator')) :
  typeof define === 'function' && define.amd ? define(['core-js/modules/es6.regexp.to-string', 'core-js/modules/es6.object.to-string', 'core-js/modules/es7.symbol.async-iterator', 'core-js/modules/es6.symbol', 'core-js/modules/web.dom.iterable', 'regenerator-runtime/runtime', 'core-js/modules/es6.object.assign', 'core-js/modules/es6.string.starts-with', 'core-js/modules/es6.regexp.search', 'core-js/modules/es6.regexp.constructor', 'core-js/modules/es6.regexp.replace', 'core-js/modules/es6.array.iterator'], factory) :
  (global = global || self, global.routing = factory());
}(this, function () { 'use strict';

  var config = {
    /** options for initializing the Routing instance */
    routingOptions: {},

    /** use hashes instead of urls */
    useHashes: false,

    /**
     * indicates if routing started
     * @private
     */
    isStarted: false
  };

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function getUrl(url, useHashes) {
    if (url == null) {
      return new URL(document.location.toString());
    } else if (url instanceof URL) {
      return url;
    } else if (/^https*:\/\//.test(url)) {
      return new URL(url);
    }

    url = leadingSlash(url);

    if (useHashes) {
      url = document.location.pathname + document.location.search + '#' + url;
    }

    return new URL(url, document.location.origin);
  }

  function leadingSlash(url) {
    url = url.toString();

    if (!url.startsWith('/')) {
      url = '/' + url;
    }

    return url;
  }

  function buildPath(url, useHashes) {
    url = getUrl(url, useHashes);

    if (useHashes) {
      var hash = url.hash.substring(1);
      return hash;
    } else {
      return url.pathname + url.search + url.hash;
    }
  }

  var RoutesManager =
  /*#__PURE__*/
  function () {
    function RoutesManager() {
      _classCallCheck(this, RoutesManager);

      this.items = [];
      this.byPath = {};
    }

    _createClass(RoutesManager, [{
      key: "get",
      value: function get(path) {
        if (path == null) return;
        path = buildPath(path, config.useHashes);
        return this.byPath[path];
      }
    }, {
      key: "add",
      value: function add(routeHandler) {
        this.items.push(routeHandler);
        this.byPath[routeHandler.path] = routeHandler;
      }
    }, {
      key: "remove",
      value: function remove(routeHandler) {
        if (routeHandler == null) return;

        if (typeof routeHandler === 'string') {
          return this.remove(this.get(routeHandler));
        }

        if (routeHandler instanceof config.RouteHandler) {
          var index = this.items.indexOf(routeHandler);
          if (index == -1) return;
          this.items.splice(index, 1);
          delete this.byPath[routeHandler.path];
          return routeHandler;
        }
      }
    }, {
      key: "has",
      value: function has(path) {
        return this.get(path.toString()) instanceof config.RouteHandler;
      }
    }, {
      key: "length",
      get: function get() {
        return this.items.length;
      }
    }]);

    return RoutesManager;
  }();

  var stateCounter = 0;
  /**
   * @typedef {Object} startOptions
   * @prop {boolean=} [trigger=true] - If true, will try to invoke handlers for current location
   * @prop {Object.<string, function>=} errorHandlers - Error handlers to set into Routing instance
   * @prop {boolean=} [replaceErrorHandlers=false] - Indicates how errorHandlers should be applied. default behavior is merge
   * @prop {boolean=} [useHashes=false] - Enables old school hash based routing
   */

  /**
   * @class Routing
   */

  var Routing =
  /*#__PURE__*/
  function () {
    function Routing() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Routing);

      this.options = _objectSpread2({}, options);
      this._routesByPath = {};
      this.routes = new RoutesManager();
      this._globalMiddlewares = [];
      this.setErrorHandlers(this.errorHandlers, options.errorHandlers);
    }
    /**
     * Starts routing with given options
     * @param {startOptions} options
     * @returns {Routing}
     * @memberof Routing
     */


    _createClass(Routing, [{
      key: "start",
      value: function start(options) {
        if (_typeof(options) != 'object') {
          options = {};
        }

        this._ensureStarted(true);

        config.isStarted = true;

        if (options.errorHandlers) {
          this.setErrorHandlers(options.replaceErrorHandlers, options.errorHandlers);
        }

        if (options.useHashes != null) {
          config.useHashes = options.useHashes === true;
        }

        var navigateOptions = Object.assign({}, options, {
          pushState: false
        });

        if (options.trigger !== false) {
          this.navigate(navigateOptions);
        }

        this._setOnPopstate(navigateOptions);

        return this;
      }
    }, {
      key: "_setOnPopstate",
      value: function _setOnPopstate(opts) {
        var _this = this;

        window.onpopstate = function (event) {
          var navOpts = _objectSpread2({}, opts);

          navOpts.state = event.state;

          _this.navigate(navOpts);
        };
      }
      /**
       * Stops routing
       * @returns {Routing}
       * @memberof Routing
       */

    }, {
      key: "stop",
      value: function stop() {
        config.isStarted = false;
        window.onpopstate = null;
        return this;
      }
      /**
       * Returns routing state
       * @return {boolean}
       */

    }, {
      key: "isStarted",
      value: function isStarted() {
        return config.isStarted === true;
      }
      /**
       * Unshift middleware for a given route.
       * If path is a function then adds given middleware to global middlewares
       * @param {(string|function)} path
       * @param {function=} middleware
       * @returns {Routing} routing instance
       * @memberof Routing
       */

    }, {
      key: "use",
      value: function use(path, middleware) {
        if (typeof path === 'function') {
          middleware = path;
          path = null;
        }

        if (typeof middleware !== 'function') {
          return this;
        }

        if (path) {
          this.add(path, [middleware], true);
        } else {
          this._addGlobalMiddleware(middleware);
        }

        return this;
      }
      /**
       * Adds given handlers to the routehandler
       * Alias for `add`
       * @param {string} path
       * @param {...function} middlewares
       * @returns {Routing}
       * @memberof Routing
       */

    }, {
      key: "get",
      value: function get(path) {
        for (var _len = arguments.length, middlewares = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          middlewares[_key - 1] = arguments[_key];
        }

        this.add(path, middlewares);
        return this;
      }
      /**
       * Adds middlewares to a routeHandler by given path
       * If routeHandler does not exists it will be created
       * @param {string} path
       * @param {function[]} middlewares array of handlers
       * @param {boolean} unshift indicates should middlewares be added in the begining
       * @returns {RouteHandler}
       * @memberof Routing
       */

    }, {
      key: "add",
      value: function add(path, middlewares, unshift) {
        if (path == null) {
          return;
        }

        var routeHandler = this._ensureRouteHanlder(path);

        routeHandler.addMiddlewares(middlewares, unshift);
        return routeHandler;
      }
      /**
       * Removes registered routeHandler if path param is a string and middleware param is undefined.
       * Removes registered routehandler's middleware if path param is a string and middleware param is a function
       * Removes global middleware if path param is a function
       * @param {(string|function)} path
       * @param {function} middleware
       * @returns {(function|void)} removed middleware
       * @memberof Routing
       */

    }, {
      key: "remove",
      value: function remove(path, middleware) {
        if (typeof path === 'function') {
          middleware = path;
          path = null;
        }

        var routeHandler = this.routes.get(path);
        /** removing global middleware */

        if (!routeHandler && middleware) {
          this._removeGlobalMiddleware(middleware);

          return;
        }

        if (routeHandler) {
          if (!middleware) {
            /** removing routeHandler */
            this.routes.remove(routeHandler);
          } else {
            /** removing routeHandler's middleware */
            routeHandler.removeMiddleware(middleware);
          }

          return routeHandler;
        }
      }
    }, {
      key: "_ensureRouteHanlder",
      value: function _ensureRouteHanlder(path) {
        var routeHandler = this.routes.get(path);

        if (!routeHandler) {
          routeHandler = new config.RouteHandler(path);
          this.routes.add(routeHandler);
        }

        return routeHandler;
      }
    }, {
      key: "_removeGlobalMiddleware",
      value: function _removeGlobalMiddleware(middleware) {
        var index = this._globalMiddlewares.indexOf(middleware);

        index !== -1 && this._globalMiddlewares.splice(index, 1);
      }
    }, {
      key: "_addGlobalMiddleware",
      value: function _addGlobalMiddleware(middleware) {
        this._globalMiddlewares.push(middleware);
      } //#endregion
      //#region process request section

      /**
       * Creates RequestContext instance
       * @param {(string|URL)} url
       * @param {*} options - request options
       * @returns RequestContext instance
       * @memberof Routing
       */

    }, {
      key: "createRequestContext",
      value: function createRequestContext(url, options) {
        return new config.RequestContext(this._getUrl(url), options);
      }
      /**
       * Creates ResponseContext instance
       * @param {RequestContext} req
       * @returns ResponseContext instance
       * @memberof Routing
       */

    }, {
      key: "createResponseContext",
      value: function createResponseContext(req) {
        return new config.ResponseContext(req);
      }
    }, {
      key: "_processRequest",
      value: function () {
        var _processRequest2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(url, options) {
          var req, res, routeHandler;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // creating requestContext and responseContext
                  req = this.createRequestContext(url, options);
                  res = this.createResponseContext(req);
                  routeHandler = this.findRouteHandler(req);

                  if (!routeHandler) {
                    _context.next = 9;
                    break;
                  }

                  _context.next = 6;
                  return routeHandler.processRequest(req, res, {
                    globalMiddlewares: _toConsumableArray(this._globalMiddlewares)
                  });

                case 6:
                  if (res.error) {
                    this.handleError(res.error, req, res);
                  }

                  _context.next = 10;
                  break;

                case 9:
                  this.handleError('notfound', req, res);

                case 10:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function _processRequest(_x, _x2) {
          return _processRequest2.apply(this, arguments);
        }

        return _processRequest;
      }()
      /**
       * Finds routehandler by requestcontext.
       * Can also be used to find routehandler by path
       * @param {(string, RequestContext)} req
       * @returns RouteHandler instance
       * @memberof Routing
       */

    }, {
      key: "findRouteHandler",
      value: function findRouteHandler(req) {
        req = this._getReq(req);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.routes.items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var routeHandler = _step.value;

            if (this.testRouteHandler(req, routeHandler)) {
              return routeHandler;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      /**
       * Tests RouteHandler instance against requestContext or path string
       * @param {(string|RequestContext)} req path or requestContext
       * @param {RouteHandler} routeHandler
       * @returns {boolean} true if request path match routeHandler path
       * @memberof Routing
       */

    }, {
      key: "testRouteHandler",
      value: function testRouteHandler(req, routeHandler) {
        req = this._getReq(req);
        return routeHandler.testRequest(req);
      }
      /**
       * Handles request errors.
       * Converts error to a handler name and tries to execute it.
       * By default there is no any handlers, so you have to define it by yourself.
       * @param {(string|Error)} error
       * @param {RequestContext} req
       * @param {ResponseContext} res
       * @memberof Routing
       */

    }, {
      key: "handleError",
      value: function handleError(error, req, res) {
        var errorKey = this.getErrorHandlerName(error);
        var defaultHandler = this._errorHandlers.default;
        var handler = this._errorHandlers[errorKey];

        if (typeof handler === 'function') {
          handler.call(this, error, req, res);
          return;
        }

        if (errorKey !== 'default' && defaultHandler) {
          defaultHandler.call(this, error, req, res);
        }
      }
      /**
       * Converts response error to errorHandler name.
       * If error instance of Error then `exception` name will be used.
       * If error is a string then error value will be used as handler name.
       * Otherwise `default`.
       * @param {*} error
       * @returns {string} errorHandler name
       * @memberof Routing
       */

    }, {
      key: "getErrorHandlerName",
      value: function getErrorHandlerName(error) {
        if (error instanceof Error) {
          return 'exception';
        } else if (typeof error === 'string') {
          return error;
        }

        return 'default';
      }
      /**
       * Initializes errorHandlers hash.
       * @param {boolean} shouldReplace Indicates should errorHandlers be replaced or merged
       * @param  {...Object.<string, function>} handlers Objects literals to merge or replace with
       * @private
       */

    }, {
      key: "setErrorHandlers",
      value: function setErrorHandlers(shouldReplace) {
        for (var _len2 = arguments.length, handlers = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          handlers[_key2 - 1] = arguments[_key2];
        }

        if (!shouldReplace) {
          handlers.unshift(this._errorHandlers);
        }

        this._errorHandlers = Object.assign.apply(Object, [{}].concat(handlers));
      } //#endregion
      //#region navigate section

      /**
       * Tries to find registered routeHandler by path and execute its middlewares.
       * If there is no such routeHandler then `notfound` errorHandler will be invoked.
       * @param {*} url
       * @param {*} [options={}]
       * @returns {boolean} Returns `false` if navigate is used against current url.
       * @memberof Routing
       */

    }, {
      key: "navigate",
      value: function navigate(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this._ensureStarted();

        if (_typeof(url) === 'object') {
          options = url;
          url = null;
        }

        if (this.isCurrentUrl(url)) {
          return false;
        }

        if (options.trigger !== false) {
          this._processRequest(url, options);
        }

        this.setCurrentUrl(url);

        if (options.pushState !== false) {
          this.browserPushState(url, options);
        }

        return true;
      }
      /**
       * Checks if a given url is current or a new one
       * @param {(string|URL)} url
       * @returns {boolean}
       * @memberof Routing
       */

    }, {
      key: "isCurrentUrl",
      value: function isCurrentUrl(url) {
        url = this._getUrl(url);
        return this._currentUrl == url.toString().toLowerCase();
      }
      /**
       * Stores given url as current.
       * Method internally used by `navigate`
       * @param {(string|URL)} url
       * @memberof Routing
       */

    }, {
      key: "setCurrentUrl",
      value: function setCurrentUrl(url) {
        url = this._getUrl(url);
        this._currentUrl = url.toString().toLowerCase();
      }
      /**
       * Pushes state to browser's history
       * Method internally used by `navigate`
       * @param {(string|URL)} url
       * @memberof Routing
       */

    }, {
      key: "browserPushState",
      value: function browserPushState(url) {
        url = this._getUrl(url);
        var state = this.getCurrentState();
        history.pushState(state, document.title, url.toString());
      }
      /**
       * Returns current state object, by default return empty object.
       * feel free to override.
       * method internaly used by `browserPushState`
       * @returns
       * @memberof Routing
       */

    }, {
      key: "getCurrentState",
      value: function getCurrentState() {
        return {
          counter: ++stateCounter
        };
      } //#endregion
      //#region helpers

      /**
       * Ensures if routing started or not.
       * Throws if routing isStarted equals to given value.
       * @param {boolean} [value=false]
       * @returns
       * @memberof Routing
       * @private
       */

    }, {
      key: "_ensureStarted",
      value: function _ensureStarted() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var message = value ? 'already' : 'not yet';

        if (this.isStarted() === value) {
          throw new Error("Routing ".concat(message, " started"));
        }

        return this;
      }
      /**
       * wraps string url into URL
       * @param {string} url
       * @returns URL
       * @memberof Routing
       * @private
       */

    }, {
      key: "_getUrl",
      value: function _getUrl(url) {
        return getUrl(url, config.useHashes);
      }
      /**
       * Ensures arg is a RequestContext
       * converts path string to the RequestContext instance
       * @param {(string|RequestContext)} arg
       * @returns RequestContext instance
       * @memberof Routing
       */

    }, {
      key: "_getReq",
      value: function _getReq(arg) {
        if (arg instanceof config.RequestContext) {
          return arg;
        }

        return this.createRequestContext(arg);
      } //#endregion

    }]);

    return Routing;
  }();

  var RouteHandler =
  /*#__PURE__*/
  function () {
    function RouteHandler(url) {
      _classCallCheck(this, RouteHandler);

      this.url = this._getUrl(url);
      this.path = this._buildPath();
      this.pattern = this._buildPattern();
      this.middlewares = [];
    }

    _createClass(RouteHandler, [{
      key: "_getUrl",
      value: function _getUrl(url) {
        return getUrl(url, config.useHashes);
      }
    }, {
      key: "_buildPath",
      value: function _buildPath() {
        return buildPath(this.url, config.useHashes);
      }
    }, {
      key: "_buildPattern",
      value: function _buildPattern() {
        var o = this.regexOptions;
        var route = this.path.replace(o.escapeRegExp, '\\$&').replace(o.optionalParam, '(?:$1)?').replace(o.namedParam, function (match, optional) {
          return optional ? match : '([^/?]+)';
        }).replace(o.splatParam, '([^?]*?)');
        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
      }
    }, {
      key: "addMiddlewares",
      value: function addMiddlewares(middlewares) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = middlewares[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var middleware = _step.value;
            this.addMiddleware(middleware);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: "addMiddleware",
      value: function addMiddleware(middleware) {
        if (typeof middleware !== 'function') {
          throw new Error('middleware must be a function');
        }

        this.middlewares.push(middleware);
      }
    }, {
      key: "removeMiddleware",
      value: function removeMiddleware(middleware) {
        var index = this.middlewares.indexOf(middleware);
        if (index < 0) return;
        this.middlewares.splice(index, 1);
        return middleware;
      }
    }, {
      key: "removeMiddlewares",
      value: function removeMiddlewares(middlewares) {
        if (middlewares == null) {
          this.middlewares.length = 0;
          return;
        }

        if (!Array.isArray(middlewares)) {
          throw new Error('argument is not an array');
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = middlewares[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var middleware = _step2.value;
            this.removeMiddleware(middleware);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }, {
      key: "hasMiddleware",
      value: function hasMiddleware(middleware) {
        return this.middlewares.indexOf(middleware) > -1;
      }
    }, {
      key: "processRequest",
      value: function () {
        var _processRequest = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(req, res) {
          var options,
              _options$globalMiddle,
              globalMiddlewares,
              handlers,
              handler,
              _args = arguments;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
                  this.prepareRequestContext(req);
                  _options$globalMiddle = options.globalMiddlewares, globalMiddlewares = _options$globalMiddle === void 0 ? [] : _options$globalMiddle;
                  handlers = [].concat(_toConsumableArray(globalMiddlewares), _toConsumableArray(this.middlewares));
                  handler = this._createNextHandler(req, res, handlers);
                  _context.next = 7;
                  return handler();

                case 7:
                  return _context.abrupt("return", _context.sent);

                case 8:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function processRequest(_x, _x2) {
          return _processRequest.apply(this, arguments);
        }

        return processRequest;
      }()
    }, {
      key: "_createNextHandler",
      value: function _createNextHandler(req, res, handlers) {
        var handler = handlers.shift();
        if (!handler) return function () {};

        var next = this._createNextHandler(req, res, handlers);

        return (
          /*#__PURE__*/
          _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!res.isEnded()) {
                      _context2.next = 2;
                      break;
                    }

                    return _context2.abrupt("return", res.error);

                  case 2:
                    _context2.next = 4;
                    return handler(req, res, next);

                  case 4:
                    return _context2.abrupt("return", _context2.sent);

                  case 5:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }))
        );
      }
    }, {
      key: "prepareRequestContext",
      value: function prepareRequestContext(req) {
        var params = this.pattern.exec(req.path).slice(1);
        var params2 = this.pattern.exec(this.path).slice(1);
        var args = params2.reduce(function (memo, param, index) {
          if (param == null) return memo;
          memo[param.substring(1)] = params[index];
          return memo;
        }, {});
        Object.assign(req.args, args);
      }
    }, {
      key: "testRequest",
      value: function testRequest(req) {
        return this.pattern.test(req.path);
      }
    }]);

    return RouteHandler;
  }();

  Object.assign(RouteHandler.prototype, {
    regexOptions: {
      optionalParam: /\((.*?)\)/g,
      namedParam: /(\(\?)?:\w+/g,
      splatParam: /\*\w+/g,
      escapeRegExp: /[-{}[\]+?.,\\^$|#\s]/g ///[\-{}\[\]+?.,\\\^$|#\s]/g,

    }
  });

  var RequestContext =
  /*#__PURE__*/
  function () {
    function RequestContext(url, options) {
      _classCallCheck(this, RequestContext);

      this.options = options;
      this.url = this._getUrl(url);
      this.path = this._buildPath();
      this.args = {};
      this.search = this._buildSearch();

      if (options && options.state) {
        this.state = options.state;
      }
    }

    _createClass(RequestContext, [{
      key: "_getUrl",
      value: function _getUrl(url) {
        return getUrl(url, config.useHashes);
      }
    }, {
      key: "_buildPath",
      value: function _buildPath() {
        return buildPath(this.url, config.useHashes);
      }
    }, {
      key: "_buildSearch",
      value: function _buildSearch() {
        var query = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.url.searchParams.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;
            query[key] = this.url.searchParams.getAll(key);

            if (query[key].length === 1) {
              query[key] = query[key][0];
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return query;
      }
    }]);

    return RequestContext;
  }();

  var ResponseContext =
  /*#__PURE__*/
  function () {
    function ResponseContext(req) {
      _classCallCheck(this, ResponseContext);

      this.request = req;
      this._processing = true;
      this.locals = {};
    }

    _createClass(ResponseContext, [{
      key: "isOk",
      value: function isOk() {
        return !this.error;
      }
    }, {
      key: "end",
      value: function end() {
        this._processing = false;
        return this;
      }
    }, {
      key: "isEnded",
      value: function isEnded() {
        return this._processig == false;
      }
    }, {
      key: "setError",
      value: function setError(error) {
        this.error = error;
        return this;
      }
    }, {
      key: "notFound",
      value: function notFound() {
        this.setError("notfound");
        return this;
      }
    }, {
      key: "notAllowed",
      value: function notAllowed() {
        this.setError("notallowed");
        return this;
      }
    }]);

    return ResponseContext;
  }();

  config.Routing = Routing;
  config.RouteHandler = RouteHandler;
  config.RequestContext = RequestContext;
  config.ResponseContext = ResponseContext;
  var index = {
    _ensureRouting: function _ensureRouting() {
      if (!this.instance) {
        this.instance = this.createRouting();
      }

      return this.instance;
    },
    createRouting: function createRouting() {
      return new config.Routing(config.routingOptions);
    },
    get: function get() {
      var _this$_ensureRouting;

      return (_this$_ensureRouting = this._ensureRouting()).get.apply(_this$_ensureRouting, arguments);
    },
    use: function use() {
      var _this$_ensureRouting2;

      return (_this$_ensureRouting2 = this._ensureRouting()).use.apply(_this$_ensureRouting2, arguments);
    },
    isStarted: function isStarted() {
      if (this.instance) {
        return this.instance.isStarted();
      }

      return false;
    },
    start: function start() {
      var _this$_ensureRouting3;

      return (_this$_ensureRouting3 = this._ensureRouting()).start.apply(_this$_ensureRouting3, arguments);
    },
    stop: function stop() {
      var _this$instance;

      return this.isStarted() && (_this$instance = this.instance).stop.apply(_this$instance, arguments);
    },
    remove: function remove() {
      var _this$instance2;

      if (!this.instance) {
        return;
      }

      return (_this$instance2 = this.instance).remove.apply(_this$instance2, arguments);
    },
    navigate: function navigate() {
      var _this$_ensureRouting4;

      return (_this$_ensureRouting4 = this._ensureRouting()).navigate.apply(_this$_ensureRouting4, arguments);
    },
    config: config
  };

  return index;

}));
