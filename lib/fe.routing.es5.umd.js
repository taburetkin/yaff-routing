(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@babel/runtime/helpers/typeof'), require('@babel/runtime/regenerator'), require('@babel/runtime/helpers/toConsumableArray'), require('@babel/runtime/helpers/asyncToGenerator'), require('@babel/runtime/helpers/defineProperty'), require('@babel/runtime/helpers/classCallCheck'), require('@babel/runtime/helpers/createClass')) :
	typeof define === 'function' && define.amd ? define(['@babel/runtime/helpers/typeof', '@babel/runtime/regenerator', '@babel/runtime/helpers/toConsumableArray', '@babel/runtime/helpers/asyncToGenerator', '@babel/runtime/helpers/defineProperty', '@babel/runtime/helpers/classCallCheck', '@babel/runtime/helpers/createClass'], factory) :
	(global = global || self, global.routing = factory(global._typeof, global._regeneratorRuntime, global._toConsumableArray, global._asyncToGenerator, global._defineProperty, global._classCallCheck, global._createClass));
}(this, function (_typeof, _regeneratorRuntime, _toConsumableArray, _asyncToGenerator, _defineProperty, _classCallCheck, _createClass) { 'use strict';

	_typeof = _typeof && _typeof.hasOwnProperty('default') ? _typeof['default'] : _typeof;
	_regeneratorRuntime = _regeneratorRuntime && _regeneratorRuntime.hasOwnProperty('default') ? _regeneratorRuntime['default'] : _regeneratorRuntime;
	_toConsumableArray = _toConsumableArray && _toConsumableArray.hasOwnProperty('default') ? _toConsumableArray['default'] : _toConsumableArray;
	_asyncToGenerator = _asyncToGenerator && _asyncToGenerator.hasOwnProperty('default') ? _asyncToGenerator['default'] : _asyncToGenerator;
	_defineProperty = _defineProperty && _defineProperty.hasOwnProperty('default') ? _defineProperty['default'] : _defineProperty;
	_classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
	_createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;

	var config = {
	  // default routing options
	  routingOptions: void 0,
	  // when false will use hashes #path
	  pushState: true };

	function getUrl(url) {
	  if (url == null) {
	    return new URL(document.location.toString());
	  } else if (url instanceof URL) {
	    return url;
	  } else if (/^https*:\/\//.test(url)) {
	    return new URL(url);
	  }

	  if (!url.startsWith("/")) {
	    url = "/" + url;
	  }

	  return new URL(url, document.location.origin);
	}

	function buildPath(url, pushState) {
	  url = getUrl(url);
	  if (pushState) {
	    return url.pathname + url.search + url.hash;
	  } else {
	    return url.hash.substring(1);
	  }
	}

	function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(source, true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(source).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}//import newid from 'es6-utils/newid';
	var
	Routing = /*#__PURE__*/function () {
	  function Routing() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, Routing);
	    this.options = _objectSpread({}, options);
	    this._routesByPath = {};
	    this._routes = [];
	    this._globalHandlers = [];
	    this._setErrorHandlers(this.errorHandlers, options.errorHandlers);
	  }_createClass(Routing, [{ key: "_setErrorHandlers", value: function _setErrorHandlers()
	    {for (var _len = arguments.length, handlers = new Array(_len), _key = 0; _key < _len; _key++) {handlers[_key] = arguments[_key];}
	      this._errorHandlers = Object.assign.apply(Object, [
	      {
	        notfound: function notfound() {return console.warn("not found");},
	        notallowed: function notallowed() {return console.warn("not found");},
	        exception: function exception(err) {
	          throw err;
	        } }].concat(

	      handlers));

	    } }, { key: "start", value: function start()
	    {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      this._ensureStarted(true);
	      config.isStarted = true;
	      if (options.errorHandlers) {
	        this._setErrorHandlers(options.errorHandlers);
	      }
	      config.pushState = options.pushState !== false;
	      if (options.trigger !== false) {
	        this.navigate(options);
	      }
	    } }, { key: "isStarted", value: function isStarted()

	    {
	      return config.isStarted === true;
	    } }, { key: "_ensureStarted", value: function _ensureStarted()

	    {var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	      var message = value ? "not yet" : "already";
	      if (this.isStarted() === value) {
	        throw new Error("Routing ".concat(message, " started"));
	      }
	      return this;
	    } }, { key: "_getUrl", value: function _getUrl(

	    url) {
	      return getUrl(url);
	    }

	    //#region routes management section
	  }, { key: "use", value: function use(path, handler) {
	      if (typeof path === "function") {
	        handler = path;
	        path = null;
	      }
	      if (typeof handler != "function") {
	        return this;
	      }

	      if (path) {
	        this._add(path, [handler], true);
	      } else {
	        this._globalHandlers.push(handler);
	      }
	      return this;
	    } }, { key: "get", value: function get(

	    path) {for (var _len2 = arguments.length, middlewares = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {middlewares[_key2 - 1] = arguments[_key2];}
	      this._add(path, middlewares);
	      return this;
	    } }, { key: "_add", value: function _add(
	    path, middlewares, unshift) {
	      var routeHandler = this._ensureRouteHanlder(path);
	      routeHandler.addHandlers(middlewares, unshift);
	    } }, { key: "_ensureRouteHanlder", value: function _ensureRouteHanlder(
	    pathUrlPattern) {
	      var routeHandler = this._getRouteHandler(pathUrlPattern);
	      if (!routeHandler) {
	        routeHandler = this._addRouteHanlder(pathUrlPattern);
	      }
	      return routeHandler;
	    } }, { key: "_getRouteHandler", value: function _getRouteHandler(
	    pathUrlPattern) {
	      return this._routesByPath[pathUrlPattern];
	    } }, { key: "_addRouteHanlder", value: function _addRouteHanlder(
	    pathUrlPattern) {
	      var routeHandler = new config.RouteHandler(pathUrlPattern);
	      this._routesByPath[pathUrlPattern] = routeHandler;
	      this._routes.push(routeHandler);
	      return routeHandler;
	    } }, { key: "removeRoute", value: function removeRoute(
	    pathUrlPattern) {
	      var routeHandler = this._routesByPath[pathUrlPattern];
	      if (!routeHandler) return;
	      var index = this._routes.indexOf(routeHandler);
	      delete this._routesByPath[pathUrlPattern];
	      this._routes.splice(index, 1);
	      return routeHandler;
	    } }, { key: "removeRouteHandler", value: function removeRouteHandler(
	    pathUrlPattern, handler) {
	      var routeHandler = this._getRouteHandler(pathUrlPattern);
	      return routeHandler && routeHandler.removeHandler(handler) || false;
	    } }, { key: "remove", value: function remove()
	    {
	      throw new Error("not implemented");
	    }
	    //#endregion

	    //#region process request section
	  }, { key: "request", value: function request(url) {
	      if (!this.isStarted()) {
	        return;
	      }
	      var req = this.createRequestContext(url);
	      var res = this.createResponseContext(req);
	      return this._processRequest(req, res);
	    } }, { key: "createRequestContext", value: function createRequestContext(
	    url) {
	      var context = new config.RequestContext(this._getUrl(url));
	      return context;
	    } }, { key: "_getReq", value: function _getReq(
	    arg) {
	      if (arg instanceof config.RequestContext) {
	        return arg;
	      }
	      return this.createResponseContext(arg);
	    } }, { key: "createResponseContext", value: function createResponseContext(
	    req) {
	      return new config.ResponseContext(req);
	    } }, { key: "_processRequest", value: function () {var _processRequest2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(
	      req, res) {var routeHandler;return _regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
	                routeHandler = this.findRouteHandler(req);if (!
	                routeHandler) {_context.next = 7;break;}_context.next = 4;return (
	                  routeHandler.processRequest(req, res, {
	                    globalHandlers: _toConsumableArray(this._globalHandlers) }));case 4:

	                if (res.error) {
	                  this.handleError(res.error, req, res);
	                }_context.next = 8;break;case 7:

	                this.handleError("not:found", req, res);case 8:case "end":return _context.stop();}}}, _callee, this);}));function _processRequest(_x, _x2) {return _processRequest2.apply(this, arguments);}return _processRequest;}() }, { key: "findRouteHandler", value: function findRouteHandler(


	    req) {
	      req = this._getReq(req);var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
	        for (var _iterator = this._routes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var routeHandler = _step.value;
	          if (this.testRouteHandler(req, routeHandler)) {
	            return routeHandler;
	          }
	        }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator["return"] != null) {_iterator["return"]();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
	    } }, { key: "testRouteHandler", value: function testRouteHandler(
	    req, routeHandler) {
	      req = this._getReq(req);
	      return routeHandler.testRequest(req);
	    } }, { key: "handleError", value: function handleError(

	    error, req, res) {
	      var errorKey = error;
	      if (error instanceof Error) {
	        errorKey = "exception";
	      }
	      var handler = this._errorHandlers[errorKey];
	      if (typeof handler === "function") {
	        handler.call(this, error, req, res);
	      }
	    }
	    //#endregion

	    //#region navigate section
	  }, { key: "navigate", value: function navigate(url) {var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      this._ensureStarted();
	      if (_typeof(url) == "object") {
	        options = url;
	        url = null;
	      }
	      this.setCurrentUrl(url);
	      if (options.trigger !== false) {
	        this.request(url, options);
	      }
	      if (!this.isCurrentUrl(url)) {
	        this.browserPushState(url, options);
	      }
	    } }, { key: "isCurrentUrl", value: function isCurrentUrl(
	    url) {
	      url = this._getUrl(url);
	      return this._currentUrl == url.toString().toLowerCase();
	    } }, { key: "setCurrentUrl", value: function setCurrentUrl(
	    url) {
	      url = this._getUrl(url);
	      this._currentUrl = url.toString().toLowerCase();
	    } }, { key: "browserPushState", value: function browserPushState(
	    url) {
	      url = this._getUrl(url);
	      var state = this.getCurrentState();
	      history.pushState(state, document.title, url.toString());
	    } }, { key: "getCurrentState", value: function getCurrentState()
	    {
	      return {};
	    }
	    //#endregion
	  }]);return Routing;}();

	var

	RouteHandler = /*#__PURE__*/function () {
	  function RouteHandler(url) {_classCallCheck(this, RouteHandler);
	    this.url = this._getUrl(url);
	    this.path = this._buildPath();
	    this.pattern = this._buildPattern();
	    this.handlers = [];
	  }_createClass(RouteHandler, [{ key: "_getUrl", value: function _getUrl(
	    url) {
	      return getUrl(url);
	    } }, { key: "_buildPath", value: function _buildPath()
	    {
	      return buildPath(this.url, config.pushState);
	    } }, { key: "_buildPattern", value: function _buildPattern()
	    {
	      var o = this.regexOptions;
	      var route = this.path.
	      replace(o.escapeRegExp, "\\$&").
	      replace(o.optionalParam, "(?:$1)?").
	      replace(o.namedParam, function (match, optional) {
	        return optional ? match : "([^/?]+)";
	      }).
	      replace(o.splatParam, "([^?]*?)");
	      return new RegExp("^" + route + "(?:\\?([\\s\\S]*))?$");
	    } }, { key: "addHandlers", value: function addHandlers(

	    handlers) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
	        for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var handler = _step.value;
	          this.addHandler(handler);
	        }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator["return"] != null) {_iterator["return"]();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
	    } }, { key: "addHandler", value: function addHandler(
	    handler) {
	      if (typeof handler !== "function") {
	        throw new Error("handler must be a function");
	      }
	      this.handlers.push(handler);
	    } }, { key: "removeHandler", value: function removeHandler(
	    handler) {
	      var index = this.handlers.indexOf(handler);
	      if (index < 0) return;
	      this.handlers.splice(index, 1);
	      return handler;
	    } }, { key: "removeHandlers", value: function removeHandlers(
	    handlers) {
	      if (!handlers) {
	        this.handlers.length = 0;
	        return;
	      }var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
	        for (var _iterator2 = handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var handler = _step2.value;
	          this.removeHandler(handler);
	        }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {_iterator2["return"]();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
	    } }, { key: "processRequest", value: function () {var _processRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(
	      req, res) {var options,handlers,handler,_args = arguments;return _regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
	                this.prepareRequestContext(req);
	                handlers = [].concat(_toConsumableArray(options.globalHandlers || []), _toConsumableArray(this.handlers));
	                handler = this._createNextHandler(req, res, handlers);_context.next = 6;return (
	                  handler());case 6:return _context.abrupt("return", _context.sent);case 7:case "end":return _context.stop();}}}, _callee, this);}));function processRequest(_x, _x2) {return _processRequest.apply(this, arguments);}return processRequest;}() }, { key: "_createNextHandler", value: function _createNextHandler(

	    req, res, handlers) {
	      var handler = handlers.shift();
	      if (!handler) return function () {};
	      var next = this._createNextHandler(req, res, handlers);
	      return (/*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {return _regeneratorRuntime.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:if (!
	                  res.isEnded()) {_context2.next = 2;break;}return _context2.abrupt("return",
	                  res.error);case 2:_context2.next = 4;return (

	                    handler(req, res, next));case 4:return _context2.abrupt("return", _context2.sent);case 5:case "end":return _context2.stop();}}}, _callee2);})));

	    } }, { key: "prepareRequestContext", value: function prepareRequestContext(
	    req) {
	      var params = this.pattern.exec(req.path).slice(1);
	      var params2 = this.pattern.exec(this.path).slice(1);
	      var args = params2.reduce(function (memo, param, index) {
	        if (param == null) return memo;
	        memo[param.substring(1)] = params[index];
	        return memo;
	      }, {});
	      Object.assign(req.args, args);
	    } }, { key: "testRequest", value: function testRequest(
	    req) {
	      return this.pattern.test(req.path);
	    } }]);return RouteHandler;}();


	Object.assign(RouteHandler.prototype, {
	  regexOptions: {
	    optionalParam: /\((.*?)\)/g,
	    namedParam: /(\(\?)?:\w+/g,
	    splatParam: /\*\w+/g,
	    escapeRegExp: /[-{}[\]+?.,\\^$|#\s]/g ///[\-{}\[\]+?.,\\\^$|#\s]/g,
	  } });

	var

	RequestContext = /*#__PURE__*/function () {
	  function RequestContext(url) {_classCallCheck(this, RequestContext);
	    this.url = this._getUrl(url);
	    this.path = this._buildPath();
	    this.args = {};
	    this.search = this._buildSearch();
	  }_createClass(RequestContext, [{ key: "_getUrl", value: function _getUrl(
	    url) {
	      return getUrl(url);
	    } }, { key: "_buildPath", value: function _buildPath()
	    {
	      return buildPath(this.url, config.pushState);
	    } }, { key: "_buildSearch", value: function _buildSearch()
	    {
	      var query = {};var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
	        for (var _iterator = this.url.searchParams.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var key = _step.value;
	          query[key] = this.url.searchParams.getAll(key);
	          if (query[key].length === 1) {
	            query[key] = query[key][0];
	          }
	        }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator["return"] != null) {_iterator["return"]();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
	      return query;
	    } }]);return RequestContext;}();

	var ResponseContext = /*#__PURE__*/function () {
	  function ResponseContext(req) {_classCallCheck(this, ResponseContext);
	    this.request = req;
	    this._processing = true;
	    this.locals = {};
	  }_createClass(ResponseContext, [{ key: "isOk", value: function isOk()

	    {
	      return !this.error;
	    } }, { key: "end", value: function end()
	    {
	      this._processing = false;
	      return this;
	    } }, { key: "isEnded", value: function isEnded()
	    {
	      return this._processig == false;
	    } }, { key: "setError", value: function setError(
	    error) {
	      this.error = error;
	      return this;
	    } }, { key: "notFound", value: function notFound()
	    {
	      this.setError("notfound");
	      return this;
	    } }, { key: "notAllowed", value: function notAllowed()
	    {
	      this.setError("notallowed");
	      return this;
	    } }]);return ResponseContext;}();

	config.Routing = Routing;
	config.RouteHandler = RouteHandler;
	config.RequestContext = RequestContext;
	config.ResponseContext = ResponseContext;

	var index = {
	  _ensureRouting: function _ensureRouting() {
	    if (!this.routing) {
	      this.routing = new config.Routing(config.routingOptions);
	    }
	    return this.routing;
	  },
	  get: function get() {var _this$_ensureRouting;
	    return (_this$_ensureRouting = this._ensureRouting()).get.apply(_this$_ensureRouting, arguments);
	  },
	  use: function use() {var _this$_ensureRouting2;
	    return (_this$_ensureRouting2 = this._ensureRouting()).use.apply(_this$_ensureRouting2, arguments);
	  },
	  isStarted: function isStarted() {
	    return this.routing && this.routing.isStarted();
	  },
	  start: function start(options) {
	    return this.
	    _ensureRouting().
	    start(options);
	  },
	  stop: function stop() {
	    return this.isStarted() && this.routing.stop();
	  },
	  remove: function remove() {var _this$_ensureRouting3;
	    return (_this$_ensureRouting3 = this.
	    _ensureRouting()).
	    remove.apply(_this$_ensureRouting3, arguments);
	  },
	  navigate: function navigate() {var _this$_ensureRouting4;
	    return (_this$_ensureRouting4 = this.
	    _ensureRouting()).
	    navigate.apply(_this$_ensureRouting4, arguments);
	  },
	  config: config };

	return index;

}));
