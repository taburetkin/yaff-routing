/**
 * Routing configuration.
 * You can provide your own versions of internal classes and setup some behavior.
 * @namespace {Configuration} configuration
 */
const config = {
  /**
   * options for initializing the Routing instance
   * @type {routingOptions}
   */
  routingOptions: {},

  /** use hashes instead of urls */
  useHashes: false,

  /** @type {Routing} - Routing definition will be used internally by routing. Replace it with your extended version if you need  */
  Routing: void 0,

  /** @type {RouteHandler} - RouteHandler definition will be used internally by routing. Replace it with your extended version if you need  */
  RouteHandler: void 0,

  /** @type {RequestContext} - RequestContext definition will be used internally by routing. Replace it with your extended version if you need  */
  RequestContext: void 0,

  /** @type {ResponseContext} - RequestContext definition will be used internally by routing. Replace it with your extended version if you need  */
  ResponseContext: void 0,

  /**
   * indicates if routing started
   * @private
   */
  isStarted: false
};

/**
 * Converts given argument to URL instance
 *
 * @export
 * @param {string} url - local path
 * @param {boolean} useHashes - if true will build URL instance based on hash routing
 * @returns {URL} URL instance
 */
function getUrl(url, useHashes) {
  if (url == null) {
    return new URL(document.location.toString());
  } else if (url instanceof URL) {
    return url;
  } else if (typeof url == 'string' && /^https*:\/\//.test(url)) {
    // should throw if origin mismatched
    url = new URL(url);
    if (url.origin != document.location.origin) {
      throw new Error('wrong url origin');
    }
    return url;
  }

  if (useHashes) {
    url = document.location.pathname + document.location.search + '#' + url;
  }

  return new URL(url, document.location.origin);
}

/**
 * normalizes given string to an application path
 *
 * @export
 * @param {string} url - url to normalize
 * @param {boolean} useHashes - If tru will normalize url for hash nased routing
 * @returns {string} normalized application path string
 */
function buildPath(url, useHashes) {
  url = getUrl(url, useHashes);
  if (useHashes) {
    let hash = url.hash.substring(1);
    let hashUrl = getUrl(hash, false);
    let path = hashUrl.pathname;
    return path;
  } else {
    return url.pathname + url.search + url.hash;
  }
}

class RoutesManager {
  constructor() {
    this.items = [];
    this.byPath = {};
  }

  /**
   * Indicates how many handlers there are
   *
   * @readonly
   * @memberof RoutesManager
   */
  get length() {
    return this.items.length;
  }

  /**
   * Returns handler by path
   *
   * @param {*} path
   * @returns {RouteHandler}
   * @memberof RoutesManager
   */
  get(path) {
    if (path instanceof config.RouteHandler) {
      path = path.path;
    }
    if (path == null) return;
    path = buildPath(path, config.useHashes);
    return this.byPath[path];
  }

  /**
   * Adds handler
   *
   * @param {RouteHandler} routeHandler
   * @memberof RoutesManager
   */
  add(routeHandler) {
    if (!(routeHandler instanceof config.RouteHandler)) {
      throw new Error('Given argument is not instance of RouteHandler class');
    }
    this.items.push(routeHandler);
    this.byPath[routeHandler.path] = routeHandler;
  }

  /**
   * Removes handler if there is one
   * @param {*} routeHandler
   * @returns
   * @memberof RoutesManager
   */
  remove(routeHandler) {
    if (routeHandler == null) return;
    if (routeHandler instanceof config.RouteHandler) {
      let index = this.items.indexOf(routeHandler);
      if (index == -1) return;
      this.items.splice(index, 1);
      delete this.byPath[routeHandler.path];
      return routeHandler;
    }
    return this.remove(this.get(routeHandler));
  }

  /**
   * Returns true if there is such handler
   *
   * @param {*} path
   * @returns {true}
   * @memberof RoutesManager
   */
  has(path) {
    return this.get(path) instanceof config.RouteHandler;
  }
}

/**
 * @typedef {Object} startOptions
 * @prop {boolean=} [trigger=true] - If true, will try to invoke handlers for current location
 * @prop {Object.<string, function>=} errorHandlers - Error handlers to set into Router instance
 * @prop {boolean=} [replaceErrorHandlers=false] - Indicates how errorHandlers should be applied. default behavior is merge
 * @prop {boolean=} [useHashes=false] - Enables old school hash based routing
 */

/**
 * @typedef {Object} routingOptions
 * @prop {Object.<string, function>=} errorHandlers - Error handlers to set into Router instance
 */

/**
 * Manipulates existing routeHandlers, global middlewares and processes the requests
 * @prop {RoutesManager} routes - Holds all registered routeHandlers
 */
class Router {
  /**
   * Creates an instance of Router.
   * @param {routingOptions} [options={}]
   */
  constructor(options = {}) {
    this.options = { ...options };
    this.routes = new RoutesManager();
    this._globalMiddlewares = [];
    this.setErrorHandlers(this.errorHandlers, options.errorHandlers);
  }

  /**
   * Starts routing with given options
   * @param {startOptions} options
   * @returns {Router} Router instance
   * @memberof Router
   */
  start(options) {
    if (typeof options != 'object') {
      options = {};
    }

    this._ensureStarted(true);
    config.isStarted = true;

    if (options.errorHandlers) {
      //applying errorHandlers if any
      this.setErrorHandlers(
        options.replaceErrorHandlers,
        options.errorHandlers
      );
    }

    if (options.useHashes != null) {
      //update routing useHashes flag
      config.useHashes = options.useHashes === true;
    }

    let navigateOptions = Object.assign({}, options, { pushState: false });
    if (options.trigger !== false) {
      //triggering middlewares only if trigger is not disallowed.
      this.navigate(navigateOptions);
    }
    this._setOnPopstate(navigateOptions);
    return this;
  }

  /**
   * Sets onpopstate handler to reflect on history go forward/back.
   * @private
   * @memberof Router
   */
  _setOnPopstate() {
    this._onPopstate = event => {
      if (event == null || typeof event != 'object') {
        event = {};
      }
      let state = event.state != null ? event.state : {};
      let options = state.navigateOptions || { trigger: true };
      options.pushState = false;
      options.state = state;
      return this.navigate(options);
    };
    window.addEventListener('popstate', this._onPopstate);
  }

  /**
   * removes onpopstate handler
   * @private
   * @memberof Router
   */
  _removeOnPopstate() {
    if (typeof this._onPopstate == 'function') {
      window.removeEventListener('popstate', this._onPopstate);
      delete this._onPopstate;
    }
  }
  /**
   * Stops routing
   * @returns {Router}
   * @memberof Router
   */
  stop() {
    config.isStarted = false;
    this._removeOnPopstate();
    return this;
  }

  /**
   * Returns routing state. True if started
   * @return {boolean}
   */
  isStarted() {
    return config.isStarted === true;
  }

  /**
   * Unshift middleware for a given route.
   * If path is a function then adds given middleware to global middlewares
   * @param {(string|function)} path
   * @param {function=} middleware
   * @returns {Router} routing instance
   * @memberof Router
   */
  use(path, middleware) {
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
   * @returns {Router}
   * @memberof Router
   */
  get(path, ...middlewares) {
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
   * @memberof Router
   */
  add(path, middlewares, unshift) {
    if (path == null) {
      return;
    }
    let routeHandler = this._ensureRouteHanlder(path);
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
   * @memberof Router
   */
  remove(path, middleware) {
    if (typeof path === 'function') {
      middleware = path;
      path = null;
    }
    let routeHandler = this.routes.get(path);

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

  /**
   * Ensures there is a routeHandler for given url
   * Otherwise create a new one and stores it in the `routes`
   * @private
   * @param {*} path
   * @returns {RouteHandler}
   * @memberof Router
   */
  _ensureRouteHanlder(path) {
    let routeHandler = this.routes.get(path);
    if (!routeHandler) {
      routeHandler = new config.RouteHandler(path);
      this.routes.add(routeHandler);
    }
    return routeHandler;
  }

  _removeGlobalMiddleware(middleware) {
    let index = this._globalMiddlewares.indexOf(middleware);
    index !== -1 && this._globalMiddlewares.splice(index, 1);
  }
  _addGlobalMiddleware(middleware) {
    this._globalMiddlewares.push(middleware);
  }

  //#endregion

  //#region process request section

  /**
   * Creates RequestContext instance
   * @param {(string|URL)} url
   * @param {*} options - request options
   * @returns RequestContext instance
   * @memberof Router
   */
  createRequestContext(url, options) {
    return new config.RequestContext(this._getUrl(url), options);
  }

  /**
   * Creates ResponseContext instance
   * @param {RequestContext} req
   * @returns ResponseContext instance
   * @memberof Router
   */
  createResponseContext(req) {
    return new config.ResponseContext(req);
  }

  /**
   * Processes the request.
   * Initializes RequestContext and ResponseContext instances and
   * if there is an appropriate routeHandler delegates processing to routeHandler.
   * Otherwise tries to invoke `notfound` errorHandler
   * @private
   * @param {(string|URL)} url
   * @param {*} options
   * @memberof Router
   */
  async _processRequest(url, options) {
    // creating requestContext and responseContext
    let req = this.createRequestContext(url, options);
    let res = this.createResponseContext(req);

    let routeHandler = this.findRouteHandler(req);
    if (routeHandler) {
      try {
        await routeHandler.processRequest(req, res, {
          globalMiddlewares: [...this._globalMiddlewares]
        });
      } catch (exc) {
        res.setError(exc);
      }

      if (res.error) {
        this.handleError(res.error, req, res);
      }
    } else {
      this.handleError('notfound', req, res);
    }
  }

  /**
   * Finds routehandler by requestContext.
   * Can also be used to find routehandler by path
   * @param {(string|RequestContext)} req
   * @returns RouteHandler instance
   * @memberof Router
   */
  findRouteHandler(req) {
    req = this._getReq(req);
    for (let routeHandler of this.routes.items) {
      if (this.testRouteHandler(req, routeHandler)) {
        return routeHandler;
      }
    }
  }

  /**
   * Tests RouteHandler instance against requestContext or path string
   * @param {(string|RequestContext)} req path or requestContext
   * @param {RouteHandler} routeHandler
   * @returns {boolean} true if request path match routeHandler path
   * @memberof Router
   */
  testRouteHandler(req, routeHandler) {
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
   * @memberof Router
   */
  handleError(error, req, res) {
    let errorKey = this.getErrorHandlerName(error);
    let defaultHandler = this._errorHandlers.default;
    let handler = this._errorHandlers[errorKey];
    if (typeof handler === 'function') {
      handler.call(this, error, req, res);
    } else if (errorKey !== 'default' && typeof defaultHandler == 'function') {
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
   * @memberof Router
   */
  getErrorHandlerName(error) {
    if (error instanceof Error) {
      return 'exception';
    } else if (typeof error === 'string') {
      return error;
    }
    return 'default';
  }

  /**
   * Sets errorHandlers hash. By default merge exist errorHandlers with given
   * @example
   * //will removes all existing handlers and sets myNewDefaultErrorHandler as default
   * routing.setErrorHandlers(true, { default: myNewDefaultErrorHandler });
   * //will replace default handler with myNewDefaultErrorHandler
   * routing.setErrorHandlers(false, { default: myNewDefaultErrorHandler });
   * //will replace default handler with myNewDefaultErrorHandler, like in previous example
   * routing.setErrorHandlers({ default: myNewDefaultErrorHandler });
   *
   * @param {boolean} shouldReplace Indicates should errorHandlers be replaced or merged, can be omited and in that case default value will be used
   * @param  {...Object.<string, function>} handlers Objects literals to merge or replace with
   * @private
   */
  setErrorHandlers(shouldReplace, ...handlers) {
    if (typeof shouldReplace == 'object') {
      let _handlers = handlers;
      handlers = Array.isArray(shouldReplace) ? shouldReplace : [shouldReplace];
      handlers.push(..._handlers);
      shouldReplace = null;
    }
    if (!shouldReplace) {
      handlers.unshift(this._errorHandlers);
    }
    this._errorHandlers = Object.assign({}, ...handlers);
  }

  //#endregion

  //#region navigate section

  /**
   * Tries to find registered routeHandler by path and execute its middlewares.
   * If there is no such routeHandler then `notfound` errorHandler will be invoked.
   * @param {*} url
   * @param {*} [options={}]
   * @returns {Promise}
   * @memberof Router
   */
  navigate(url, options = {}) {
    this._ensureStarted();
    if (typeof url === 'object') {
      options = url;
      url = null;
    }

    let iscurrent = this.isCurrentUrl(url);

    // options.trigger:
    //    true - request will be processed even url is a current url
    //    false - request will not be processed
    //    undefined - request will be process only if url is not current url
    let shouldTrigger =
      (options.trigger !== false && !iscurrent) || options.trigger === true;
    let result =
      (shouldTrigger && this._processRequest(url, options)) ||
      Promise.resolve(false);

    this.setCurrentUrl(url);
    //pushing state only if this is not forbidden and processed url is not current
    if (options.pushState !== false && !iscurrent) {
      this.browserPushState(url, options);
    }
    return result;
  }

  /**
   * Checks if a given url is current or a new one
   * @param {(string|URL)} url
   * @returns {boolean}
   * @memberof Router
   */
  isCurrentUrl(url) {
    url = this._getUrl(url);
    return this._currentUrl == url.toString().toLowerCase();
  }

  /**
   * Stores given url as current.
   * Method internally used by `navigate`
   * @param {(string|URL)} url
   * @memberof Router
   */
  setCurrentUrl(url) {
    url = this._getUrl(url);
    this._currentUrl = url.toString().toLowerCase();
  }

  /**
   * Pushes state to browser's history
   * Method internally used by `navigate`
   * @param {(string|URL)} url
   * @memberof Router
   */
  browserPushState(url, options) {
    url = this._getUrl(url);
    let state = this.getCurrentState(options);
    history.pushState(state, document.title, url.toString());
  }

  /**
   * Returns current state object, by default return empty object.
   * feel free to override.
   * method internaly used by `browserPushState`
   * @returns {object}
   * @memberof Router
   */
  getCurrentState(opts) {
    let navigateOptions = { ...opts };
    navigateOptions.trigger = opts.trigger !== false;
    return { navigateOptions };
  }
  //#endregion

  //#region helpers

  /**
   * Ensures if routing started or not.
   * Throws if routing isStarted equals to given value.
   * @private
   * @param {boolean} [value=false]
   * @returns {Router}
   * @memberof Router
   */
  _ensureStarted(value = false) {
    let message = value ? 'already' : 'not yet';
    if (this.isStarted() === value) {
      throw new Error(`Router ${message} started`);
    }
    return this;
  }

  /**
   * wraps string url into URL
   * @param {string} url
   * @returns {URL}
   * @memberof Router
   * @private
   */
  _getUrl(url) {
    return getUrl(url, config.useHashes);
  }

  /**
   * Ensures arg is a RequestContext.
   * Converts path string to the RequestContext instance.
   * @private
   * @param {(string|RequestContext)} arg
   * @returns {RequestContext} requestContext instance
   * @memberof Router
   */
  _getReq(arg) {
    if (arg instanceof config.RequestContext) {
      return arg;
    }
    return this.createRequestContext(arg);
  }
  //#endregion
}

/**
 * Represents handler for a given string route.
 * When request occurs and request path matches handlres's route pattern
 * then all registered middlewares beeing invoked.
 * @prop {URL} url the URL instance of route
 * @prop {string} path string path of route
 * @prop {RegExp} pattern route's RegExp pattern
 * @prop {Object.<string, RegExp>} regexPatterns default RegExp patterns for maintaining routes and routes parameters
 * @prop {function[]} middlewares registerd route's middlewares
 */
class RouteHandler {
  /**
   *Creates an instance of RouteHandler.
   * @param {(string|URL)} url
   */
  constructor(url) {
    this.url = this._getUrl(url);
    this.path = this._buildPath();
    this.pattern = this._buildPattern();
    this.middlewares = [];
  }

  /**
   * Adds middlewares to middlewares array's
   *
   * @param {function[]} middlewares
   * @memberof RouteHandler
   */
  addMiddlewares(middlewares = []) {
    for (let middleware of middlewares) {
      this.addMiddleware(middleware);
    }
  }

  /**
   * Adds middleware to middlewares array.
   * Throws if given argument is not a function.
   * @param {function} middleware
   * @memberof RouteHandler
   */
  addMiddleware(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('middleware must be a function');
    }
    this.middlewares.push(middleware);
  }

  /**
   * Removes given middleware from middlewares array
   * @param {function} middleware
   * @returns {(function|void)} Returns nothing if given middleware was not found in an array
   * @memberof RouteHandler
   */
  removeMiddleware(middleware) {
    let index = this.middlewares.indexOf(middleware);
    if (index < 0) return;
    this.middlewares.splice(index, 1);
    return middleware;
  }

  /**
   * Removes all middlewares if called without arguments or if passed middlewares is null or undefined.
   * Otherwise will remove passed middlewares from middlewares array
   *
   * @param {(function[]|void)} middlewares
   * @returns {void}
   * @memberof RouteHandler
   */
  removeMiddlewares(middlewares) {
    if (middlewares == null) {
      this.middlewares.length = 0;
      return;
    }
    if (!Array.isArray(middlewares)) {
      throw new Error('argument is not an array');
    }
    for (let middleware of middlewares) {
      this.removeMiddleware(middleware);
    }
  }

  /**
   * Returns true if given middleware is present in middlewares array
   *
   * @param {function} middleware
   * @returns {boolean}
   * @memberof RouteHandler
   */
  hasMiddleware(middleware) {
    return this.middlewares.indexOf(middleware) > -1;
  }

  /**
   * Invokes all middlewares for request in order.
   * Has side effect on requestContext args property - extends it with route parameters
   * @param {RequestContext} req
   * @param {ResponseContext} res
   * @param {object} [options={}]
   * @returns {*}
   * @private
   * @memberof RouteHandler
   */
  async processRequest(req, res, options = {}) {
    // extract route arguments
    let args = this.extractRouteArguments(req);
    // apllying route arguments to the request
    req.setRouteArguments(args);

    let { globalMiddlewares = [] } = options;

    let middlewares = [...globalMiddlewares, ...this.middlewares];

    // creating middleware's chain.
    let firstMiddleware = this._createNextHandler(req, res, middlewares);

    return await firstMiddleware();
  }

  /**
   * Extracts route arguments into key-value object.
   * `path/:foo/:bar` vs `path/oof/rab` = `{ foo: 'oof', bar: 'rab'}`.
   * repeated names will be overriden so, DONT do this: `path/:foo/:foo`
   * @param {RequestContext} req
   * @returns {Object.<string,*>}
   * @memberof RouteHandler
   */
  extractRouteArguments(req) {
    let params = (this.pattern.exec(req.path) || []).slice(1);
    params.pop();
    let matches = this.path.match(/:\w+/g) || [];
    let args = matches.reduce((memo, paramName, index) => {
      paramName = paramName.substring(1);
      index < params.length && (memo[paramName] = params[index]);
      return memo;
    }, {});
    return args;
  }

  /**
   * Test's given requestContext's string path against handler's route pattern.
   * Returns true on match.
   * @param {RequestContext} req
   * @returns {boolean}
   * @memberof RouteHandler
   */
  testRequest(req) {
    //console.log(req.path, this.pattern, this.pattern.test(req.path));
    return this.pattern.test(req.path);
  }

  //#region private helpers
  _createNextHandler(req, res, handlers) {
    let handler = handlers.shift();
    if (!handler) return () => {};
    let next = this._createNextHandler(req, res, handlers);
    return async () => await handler(req, res, next);
  }
  _getUrl(url) {
    return getUrl(url, config.useHashes);
  }
  _buildPath() {
    return buildPath(this.url, config.useHashes);
  }
  _buildPattern() {
    let o = this.regexPatterns;
    let route = this.path
      .replace(o.escapeRegExp, '\\$&')
      .replace(o.optionalParam, '(?:$1)?')
      .replace(o.namedParam, (match, optional) => {
        return optional ? match : '([^/?]+)';
      })
      .replace(o.splatParam, '([^?]*?)');

    let trailingSlash = '\\/*';
    let patternString = `^${route}(?:${trailingSlash}[?#]([\\s\\S]*))?$`;
    return new RegExp(patternString);
  }
  //#endregion
}

Object.assign(RouteHandler.prototype, {
  regexPatterns: {
    optionalParam: /\((.*?)\)/g,
    namedParam: /(\(\?)?:\w+/g,
    splatParam: /\*\w+/g,
    escapeRegExp: /[-{}[\]+?.,\\^$|#\s]/g ///[\-{}\[\]+?.,\\\^$|#\s]/g,
  }
});

/**
 * Represents request state.
 * @prop {Object.<string, string>} args - holds route arguments
 * @prop {string} path - route path
 * @prop {URL} url - route URL instance
 * @prop {Object.<string, (string|string[])>} query - search query parameters
 * @prop {object} options - initialization options
 */
class RequestContext {
  /**
   *Creates an instance of RequestContext.
   * @param {(string|URL)} url
   * @param {*} options
   */
  constructor(url, options) {
    this.options = options;
    this.url = this._getUrl(url);
    this.path = this._buildPath();
    this.args = {};

    // converts url's `search` to { key : values } object
    this.query = this._buildQuery();

    if (options && options.state) {
      this.state = options.state;
    }
  }

  /**
   * Merges route arguments with given object
   * @param {Object.<string,*>} args
   * @memberof RequestContext
   */
  setRouteArguments(args) {
    Object.assign(this.args, args);
  }

  _getUrl(url) {
    return getUrl(url, config.useHashes);
  }
  _buildPath() {
    return buildPath(this.url, config.useHashes);
  }

  /**
   * builds simplified version of URLSearchParameters
   * @private
   * @returns {Object.<string, (string|string[])>}
   * @memberof RequestContext
   */
  _buildQuery() {
    let query = {};
    for (let key of this.url.searchParams.keys()) {
      query[key] = this.url.searchParams.getAll(key);
      if (query[key].length === 1) {
        query[key] = query[key][0];
      }
    }
    return query;
  }
}

/**
 * Represents response state.
 * @prop {*} error - if not falsy will be passed to errorHandler
 * @prop {RequestContext} request - processing request's requestContext instance.
 * @prop {*} locals - the legal way to pass data between middlewares
 */
class ResponseContext {
  /**
   * Creates an instance of ResponseContext.
   * @param {RequestContext} req
   */
  constructor(req) {
    this.error = null;
    this.request = req;
    this.locals = {};
  }

  /**
   * Returns true if there is no error, otherwise false
   *
   * @returns {boolean}
   * @memberof ResponseContext
   */
  isOk() {
    return !this.error;
  }

  /**
   * Sets response error
   *
   * @param {*} error
   * @returns {ResponseContext}
   * @memberof ResponseContext
   */
  setError(error) {
    this.error = error;
    return this;
  }

  /**
   * Sets 'notfound' error, shorthand for setError('notfound')
   *
   * @returns {ResponseContext}
   * @memberof ResponseContext
   */
  notFound() {
    this.setError('notfound');
    return this;
  }

  /**
   * Sets 'notallowed' error, shorthand for setError('notallowed')
   *
   * @returns {ResponseContext}
   * @memberof ResponseContext
   */
  notAllowed() {
    this.setError('notallowed');
    return this;
  }
}

config.Router = Router;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;

/**
 * This is main module.
 * By Default its only the thing you should use working with fe-routing-js
 * @module routing
 */
var index = {
  /**
   * Returns current routing instance. If it does not exist instance will be created.
   * @private
   * @returns {Router} routing instance
   */
  _ensureRouter() {
    if (!this.instance) {
      this.instance = this.createRouter();
    }
    return this.instance;
  },

  /**
   * Creates instance of Router with config.routingOptions.
   * @returns {Router} Router instance
   */
  createRouter() {
    return new config.Router(config.routingOptions);
  },

  /**
   * Proxy method to Router instance's `get`
   * @see {@link Router.get}
   * @returns {Router}
   */
  get(...args) {
    return this._ensureRouter().get(...args);
  },

  /**
   * Proxy method to Router instance's `use`
   * @see {@link Router.use}
   * @returns {Router}
   */
  use(...args) {
    return this._ensureRouter().use(...args);
  },

  /**
   * Returns true if routing started
   * @returns {boolean}
   */
  isStarted() {
    if (this.instance) {
      return this.instance.isStarted();
    }
    return false;
  },

  /**
   * Starts routing
   * @see {@link Router.start}
   * @returns {Router}
   */
  start(...args) {
    return this._ensureRouter().start(...args);
  },

  /**
   * Stops routing
   * @see {@link Router.stop}
   * @returns {Router}
   */
  stop(...args) {
    return this.isStarted() && this.instance.stop(...args);
  },

  /**
   * Removes middleware or middleware's handler.
   * Proxy method for Router instance's `remove`.
   * @see {@link Router.stop}
   * @returns {(RouteHandler|void)}
   */
  remove(...args) {
    if (!this.instance) {
      return;
    }
    return this.instance.remove(...args);
  },

  /**
   * Initiates the request.
   * Proxy method for Router instance's `navigate`.
   * @see {@link Router.navigate}
   */
  navigate(...args) {
    if (!this.instance) {
      return;
    }
    return this.instance.navigate(...args);
  },

  /**
   * routing Configuration
   * @see {@link configuration}
   */
  config
};

export default index;