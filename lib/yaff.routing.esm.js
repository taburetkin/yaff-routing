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

  /** @type {Router} - Router class will be used internally by routing. Replace it with your extended version if you need  */
  Router: void 0,

  /** @type {RouteHandler} - RouteHandler class will be used internally by routing. Replace it with your extended version if you need  */
  RouteHandler: void 0,

  /** @type {RequestContext} - RequestContext class will be used internally by routing. Replace it with your extended version if you need  */
  RequestContext: void 0,

  /** @type {ResponseContext} - RequestContext class will be used internally by routing. Replace it with your extended version if you need  */
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
// export function url(...chunks) {
//   console.log('-before:', chunks);
//   if (!chunks || chunks.length == 0) {
//     chunks = [''];
//   }

//   chunks = chunks.map(chunk => {
//     if (chunk == '' || chunk == null) {
//       return '';
//     }
//     if (chunk[0] !== '/') {
//       chunk = '/' + chunk;
//     }
//     return chunk;
//   });

//   if (chunks[0][0] !== '/') {
//     chunks[0] = '/' + chunks[0];
//   }

//   if (config.useHashes) {
//     chunks[0] = '/#' + chunks[0];
//   }

//   console.log('-after:', chunks);
//   let res = chunks.join('');
//   console.log(':url:', res)
//   return res;
// }

function addValue(entity, key, value) {
  if (Array.isArray(entity[key])) {
    entity[key].push(value);
  } else if (key in entity) {
    entity[key] = [entity[key], value];
  } else {
    entity[key] = value;
  }
}

function buildSegments(url) {
  url = getUrl(url);
  let paths = url.pathname.substring(1);
  paths = paths.replace(/\(\/\)$/, '').replace(/\(\//g, '/(');
  let result = paths.split('/');
  if (result.length > 1 && !result[result.length - 1]) {
    result.pop();
  }
  return result;
}

function cmp(a, b, fn) {
  let av = fn(a);
  let bv = fn(b);
  return av < bv ? -1 : av > bv ? 1 : 0;
}

function compare(a, b, arg) {
  let result = 0;
  if (typeof arg == 'function') {
    return cmp(a, b, arg);
  } else if (Array.isArray(arg)) {
    arg.every(fn => {
      result = compare(a, b, fn);
      return result === 0;
    });
  }
  return result;
}

function comparator(...cmps) {
  let result = 0;
  if (
    cmps.every(([a, b, arg]) => {
      result = compare(a, b, arg);
      return result === 0;
    })
  ) {
    return 0;
  } else {
    return result;
  }
}


function invoke(method, context, ...args) {

  if (typeof method !== 'function') {
    return method;
  }

  if (args.length === 0 || args.length > 1) {
    return method.apply(context, args);
  } else {
    return method.call(context, args[0]);
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

    let Manager = config.RoutesManager || RoutesManager;
    this.routes = new Manager();

    this._globalMiddlewares = [];
    this._nestedInHandlers = [];
    this.setErrorHandlers(this.errorHandlers, options.errorHandlers);
    if (options.onRequestStart !== void 0) {
      this.onRequestStart = options.onRequestStart;
    }
    if (options.onRequestEnd !== void 0) {
      this.onRequestEnd = options.onRequestEnd;
    }
  }

  /**
   * Returns routing state. True if started
   * @return {boolean}
   */
  isRoutingStarted() {
    return config.isStarted === true;
  }

  /**
   * Returns `true` if router is registered as subrouter
   * @returns {boolean}
   * @memberof Router
   */
  isNested() {
    return this._nestedInHandlers.length > 0;
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
    if (
      typeof middleware !== 'function' &&
      !(middleware instanceof config.Router)
    ) {
      return this;
    }

    if (path) {
      let arg = middleware instanceof config.Router ? middleware : [middleware];
      this.add(path, arg, true);
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

    let router = middlewares instanceof config.Router ? middlewares : null;

    let routeHandler = this._ensureRouteHanlder(path, router);
    if (!routeHandler.isRouter()) {
      if (router) {
        throw new Error(
          'This routeHandler already initialized as regular and does not support adding a Router'
        );
      }
      routeHandler.addMiddlewares(middlewares, unshift);
    } else if (router) {
      routeHandler.setRouter(router);
    }
    return routeHandler;
  }

  /**
   * Returns registered routeHandler
   *
   * @param {string} path
   * @param {boolean} traverse if True will look up in nested routers too. default is true
   * @returns {(RouteHandler|Void)}
   * @memberof Router
   */
  getRouteHandler(path, traverse = true) {
    let result = this.routes.get(path);
    if ((!result && traverse !== false) || (result && traverse === true)) {
      let context = this.findRouteHandlerContext(path);
      result = context && context.handler;
    }
    return result;
  }
  /**
   * Removes registered routeHandler if path param is a string and middleware param is undefined.
   * Removes registered routehandler's middleware if path param is a string and middleware param is a function
   * Removes global middleware if path param is a function
   * @param {(string|function)} path
   * @param {function} [middleware]
   * @param {boolean} [traverse=true] Indicates should look up beeing applied to the nested routers, default is true
   * @returns {(function|void)} removed middleware
   * @memberof Router
   */
  remove(path, middleware, traverse) {
    if (typeof path === 'function') {
      middleware = path;
      path = null;
    }
    if (typeof middleware == 'boolean') {
      traverse = middleware;
      middleware = null;
    }
    /** removing global middleware */
    if (path == null && typeof middleware == 'function') {
      this._removeGlobalMiddleware(middleware);
      return;
    }

    let router = this;
    let routeHandler = this.getRouteHandler(path, false);
    let shouldTraverseAnyway =
      (traverse === true && !middleware) || (traverse !== false && middleware);
    if (
      (!routeHandler && traverse !== false) ||
      (routeHandler && shouldTraverseAnyway)
    ) {
      let context = this.findRouteHandlerContext(path);
      if (context) {
        router = context.router;
        routeHandler = context.handler;
      }
    }

    if (routeHandler) {
      if (!middleware) {
        /** removing routeHandler */
        router._removeRouteHandler(routeHandler);
      } else {
        /** removing routeHandler's middleware */
        if (routeHandler.isRouter()) {
          routeHandler.router.remove(middleware);
        } else {
          routeHandler.removeMiddleware(middleware);
        }
      }
      return routeHandler;
    }
  }

  _removeRouteHandler(handler) {
    this.routes.remove(handler);
  }

  /**
   * Ensures there is a routeHandler for given url
   * Otherwise create a new one and stores it in the `routes`
   * @private
   * @param {*} path
   * @returns {RouteHandler}
   * @memberof Router
   */
  _ensureRouteHanlder(path, router) {
    let routeHandler = this.routes.get(path);
    if (!routeHandler) {
      routeHandler = new config.RouteHandler(
        path,
        router instanceof config.Router ? router : null
      );
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

  /**
   * Returns true if provided middleware is in globalMiddleares array
   *
   * @param {function} middleware
   * @returns {boolean}
   * @memberof Router
   */
  hasMiddleware(middleware) {
    return this._globalMiddlewares.indexOf(middleware) > -1;
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

    //this.trigger('request:start', req, res, options);
    invoke(this.onRequestStart, this, req, res, options);

    let context = this.findRouteHandlerContext(req);

    if (!context) {
      this.handleError('notfound', req, res);
      return;
    }

    let { handler, path, globalMiddlewares } = context;
    let processOptions = Object.assign({ path, globalMiddlewares }, options);
    let result;
    try {
      result = await handler.processRequest(req, res, processOptions);
    } catch (ex) {
      res.setError(ex);
    }

    this.handleError(res.error, req, res);

    // if (res.error) {
    //   this.handleError(res.error, req, res);
    // } else {
    //   invoke(this.onRequestEnd, this, void 0, req, res, options);
    // }
    return result;
  }

  /**
   * Builds routeContexts array for further processing.
   * Used internaly in processing request
   * @private
   * @param {*} [routeContext={}]
   * @returns {routeContex[]}
   * @memberof Router
   */
  getRouteContexts(routeContext = {}) {
    let {
      globalMiddlewares = [],
      segments = [],
      _circular = [] // for preventing curcular router nesting.
    } = routeContext;

    if (_circular.indexOf(this) > 1) {
      throw new Error('Circular router nesting detected');
    } else {
      _circular.push(this);
    }

    return this.routes.items.reduce((allcontexts, handler) => {
      let result = handler.getRouteContexts({
        globalMiddlewares: [...globalMiddlewares, ...this._globalMiddlewares],
        segments,
        _circular,
        router: this
      });
      allcontexts.push(...result);
      return allcontexts;
    }, []);
  }

  /**
   * Finds routeContext for a request by given requestContext or path.
   * @private
   * @param {(string|RequestContext)} req
   * @returns {(void | routeContext)}
   * @memberof Router
   */
  findRouteHandlerContext(req, routeContext = {}) {
    req = this._getReq(req);

    let allcontexts = this.getRouteContexts(routeContext);

    // sorting to match in a correct order
    let possibleContexts = allcontexts.sort((a, b) =>
      comparator([b, a, x => x.path.requiredStatic], [a, b, x => x.path.total])
    );
    for (let context of possibleContexts) {
      //console.log('-router-', context)
      if (this.testRouteHandlerContext(req, context)) {
        return context;
      }
    }

    return;
  }

  /**
   * Tests routeContext against requestContext or path string
   * @private
   * @param {(string|RequestContext)} req path or requestContext
   * @param {RouteHandler} routeHandler
   * @returns {boolean} true if request path match routeHandler path
   * @memberof Router
   */
  testRouteHandlerContext(req, context) {
    let res = context.path.testPath(req.path);
    return res;
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

    invoke(this.onRequestEnd, this, error, req, res);
    if (!error) return;

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
    this._ensureNotNested();
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

    //console.log(' -router- ', shouldTrigger, this);

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
    return config._currentUrl == url.toString().toLowerCase();
  }

  /**
   * Stores given url as current.
   * Method internally used by `navigate`
   * @param {(string|URL)} url
   * @memberof Router
   */
  setCurrentUrl(url) {
    if (url == null) {
      config._currentUrl = null;
    } else {
      url = this._getUrl(url);
      config._currentUrl = url.toString().toLowerCase();
    }
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
    //console.log(' -pushstate- ', state);
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
    if (this.isRoutingStarted() === value) {
      throw new Error(`Router ${message} started`);
    }
    return this;
  }

  _ensureNotNested(message) {
    if (this.isNested()) {
      throw new Error('Nested router ' + (message || ''));
    }
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
  /**
   * unregisters junction between routeHandler and router
   * @private
   * @param {RouteHandler} routeHandler
   */
  _releaseHandler(routeHandler) {
    let index = this._nestedInHandlers.indexOf(routeHandler);
    if (index > -1) {
      this._nestedInHandlers.splice(index, 1);
    }
  }
  /**
   * registers junction between routeHandler and router
   * @private
   * @param {RouteHandler} routeHandler
   */
  _holdHandler(routeHandler) {
    this._nestedInHandlers.push(routeHandler);
  }

  //#endregion
}

/**
 * Represents path segment. for internal use only.
 * @private
 * @class PathSegment
 */
class PathSegment {
  constructor(value) {
    this.value = this._normalizeValue(value);
    this.optional = /^\(.+\)$/g.test(value);
    this.required = !this.optional;
    this.parametrized = /:/g.test(value);
    this.static = !this.parametrized;
    this.any = /\*\w+/g.test(value);
  }

  /**
   * Returns true if this is a root segment.
   * `"" | "/" | "(/)"` segments are treated as root segment
   * @returns {boolean}
   * @memberof PathSegment
   */
  isRoot() {
    return /^(\/|\(\/\))?$/.test(this.value);
  }

  /**
   * Adds `/` to the begining of segment with respect to optional segment signature.
   * @private
   * @param {(string|PathSegment) value
   */
  _normalizeValue(value) {
    value = value instanceof PathSegment ? value.value : value;
    if (/^\(*\//.test(value)) {
      return value;
    }
    if (value[0] === '(') {
      value = '(/' + value.substring(1);
    } else {
      value = '/' + value;
    }
    return value;
  }

  /**
   * Returns RegExp string of this segment
   * @returns {string}
   * @memberof PathSegment
   */
  getPatternValue() {
    if (this.any) {
      return '([^]+)?';
    }

    let value = this.value.replace(/:[\w\d_]+/g, '[\\w\\d-]+');
    value = value.replace(/\(([^)]+)\)/g, '($1)?');

    return value;
  }

  toString() {
    return this.value;
  }
}

/**
 * Path helper. for internal use
 * @private
 * @class PathContext
 */
class PathContext {
  constructor(url) {
    if (typeof url == 'string') {
      let path = buildPath(url, config.useHashes);
      url = getUrl(path, false);
    }
    let segments = this._buildSegments(url);
    Object.assign(this, this._buildSegmentsInfo(segments));
    this.path = this.segments.join('');
    if (this.path === '') {
      this.path == '/';
    }
  }

  toString() {
    let path = this.segments.join('');
    if (path === '') {
      path = '/';
    }
    return path;
  }

  /**
   * Generates RegExp pattern from segments
   * @returns {RegExp}
   * @memberof PathContext
   */
  generatePattern() {
    let patternString =
      '^' + this.segments.map(segment => segment.getPatternValue()).join('');
    patternString += '\\/?([#?][^]+)?$';
    let pattern = new RegExp(patternString);
    return pattern;
  }

  /**
   * Returns true if a given path meet this segments
   *
   * @param {string} path
   * @returns {boolen}
   * @memberof PathContext
   */
  testPath(path) {
    let pattern = this.generatePattern();
    let result = pattern.test(path);
    return result;
  }

  /**
   * Returns true if whole path is looks like root: `"/", ""`
   * @returns
   * @memberof PathContext
   */
  isRoot() {
    return (
      this.segments.length == 0 ||
      (this.segments.length == 1 && this.segments[0].isRoot())
    );
  }

  _buildSegments(raw) {
    if (raw instanceof URL) {
      raw = buildSegments(raw);
    }
    return raw.map(m => new PathSegment(m)).filter(f => !f.isRoot());
  }

  /**
   * Basicaly this is for determining the order of Paths to get a correct order.
   * At this point there is only `total` and `requiredStatic` in use.
   * @private
   * @param {*} segments
   * @returns
   * @memberof PathContext
   */
  _buildSegmentsInfo(segments) {
    let info = {
      segments,
      total: 0,

      // `foo` - static segment
      static: 0,
      // `:id` parametrized one, opposite for static
      parametrized: 0,

      // `foo`, any segment without ( )
      required: 0,
      // `foo`
      requiredStatic: 0,
      // `:id`
      requiredParametrized: 0,

      //opposite fore required
      // `(...)`
      optional: 0,
      // `(bar)`
      optionalStatic: 0,
      // `(:id)`
      optionalParametrized: 0
    };
    for (let seg of info.segments) {
      info.total++;
      if (seg.parametrized) {
        info.parametrized++;
      } else {
        info.static++;
      }
      if (seg.optional) {
        info.optional++;
        if (seg.parametrized) {
          info.optionalParametrized++;
        } else {
          info.optionalStatic++;
        }
      } else {
        info.required++;
        if (seg.parametrized) {
          info.requiredParametrized++;
        } else {
          info.requiredStatic++;
        }
      }
    }
    return info;
  }
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
   * @param {Router} [router]
   */
  constructor(url, router) {
    url = this._getUrl(url);
    this.path = this._buildPath(url);
    this._path = new PathContext(this.path);

    this.middlewares = [];
    if (router instanceof config.Router) {
      this.setRouter(router);
    }
  }

  /**
   * Returns true if this handler is Router based
   *
   * @returns {boolean}
   * @memberof RouteHandler
   */
  isRouter() {
    return this.router instanceof config.Router;
  }

  setRouter(router) {
    if (router === this.router) {
      return;
    }
    this._removeRouter();
    this._setRouter(router);
  }
  _removeRouter() {
    if (this.router == null) {
      return;
    }
    this.router._releaseHandler(this);
    this.router = null;
  }
  _setRouter(router) {
    if (router == null) {
      return;
    }
    router._holdHandler(this);
    this.router = router;
    this.middlewares.length = 0;
  }
  /**
   * Adds middlewares to middlewares array's
   *
   * @param {function[]} middlewares
   * @memberof RouteHandler
   */
  addMiddlewares(middlewares = []) {
    if (this.isRouter()) {
      throw new Error("you can't modify middlewares on Router based handler");
    }
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
    if (this.isRouter()) {
      throw new Error("you can't modify middlewares on Router based handler");
    }
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
    if (this.isRouter()) {
      throw new Error("you can't modify middlewares on Router based handler");
    }
    let index = this.middlewares.indexOf(middleware);
    if (index < 0) return;
    this.middlewares.splice(index, 1);
    return middleware;
  }

  getRouteContexts(parentContext) {
    let { globalMiddlewares, segments, _circular, router } = parentContext;

    if (this.isRouter()) {
      return this.router.getRouteContexts({
        globalMiddlewares,
        segments: [...segments, ...this._path.segments],
        _circular
      });
    } else {
      let context = {
        globalMiddlewares,
        segments,
        handler: this,
        path: new PathContext([...segments, ...this._path.segments]),
        router
      };
      //console.log('> cntx', context.path.segments.map(m => m.value));
      return [context];
    }
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
    if (this.isRouter()) {
      throw new Error("you can't modify middlewares on Router based handler");
    }

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

    let args = this.extractRouteArguments(req, options.path);
    // apllying route arguments to the request
    req.setRouteArguments(args);

    let { globalMiddlewares = [] } = options;

    let middlewares = [...globalMiddlewares, ...this.middlewares];

    // creating middleware's chain.
    // let firstMiddleware = this._createNextHandler(req, res, middlewares);

    let goNext = false;
    let next = () => goNext = true;
    let result;
    for (let mw of middlewares) {
      goNext = false;
      result = await mw(req, res, next);
      if (!goNext) break;
    }

    return Promise.resolve(result);

  }

  // _createRequestPipe(req, res, middlewares) {

  // }

  /**
   * Extracts route arguments into key-value object.
   * `path/:foo/:bar` vs `path/oof/rab` = `{ foo: 'oof', bar: 'rab'}`.
   * repeated names will be overriden so, DONT do this: `path/:foo/:foo`
   * @param {RequestContext} req
   * @returns {Object.<string,*>}
   * @memberof RouteHandler
   */
  extractRouteArguments(req, _path) {
    let thispath = _path ? _path.path : this.path;
    let pattern = this._buildPattern(thispath);
    let params = (pattern.exec(req.path) || []).slice(1);
    //console.log('>>', params, pattern);
    params.pop();

    let matches = thispath.match(/[:|*]\w+/g) || [];
    let args = matches.reduce((memo, paramName, index) => {
      paramName = paramName.substring(1);

      if (index > params.length) return memo;
      //console.log('-args-', paramName, index, params[index], params);
      addValue(memo, paramName, params[index]);
      //console.log(' ', Object.assign({}, memo));
      return memo;
    }, {});
    return args;
  }

  // /**
  //  * Test's given requestContext's string path against handler's route pattern.
  //  * Returns true on match.
  //  * @param {RequestContext} req
  //  * @returns {boolean}
  //  * @memberof RouteHandler
  //  */
  // testRequest(req, root) {
  //   if (this.isRouter()) {
  //     console.log(this._path.generatePattern());
  //   } else {
  //     if (this._path.isRoot()) {
  //       return req._path.isRoot();
  //     } else {
  //       return this._path.isMatch(req.path, root);
  //     }
  //   }
  // }

  //#region private helpers
  // DEPRECATED:
  // _createNextHandler(req, res, handlers) {
  //   let handler = handlers.shift();
  //   if (!handler) return () => { };
  //   let next = this._createNextHandler(req, res, handlers);
  //   return async () => await handler(req, res, next);
  // }

  _getUrl(url) {
    return getUrl(url, config.useHashes);
  }
  _buildPath(url) {
    return buildPath(url, config.useHashes);
  }
  _buildPattern(path) {
    let o = this.regexPatterns;
    let route = path
      .replace(o.escapeRegExp, '\\$&')
      .replace(o.optionalParam, '(?:$1)?')
      .replace(o.namedParam, () => {
        return '([^/#?]+)';
        /*
          the backbone version is:
          return optional ? match : '([^/#?]+)';
          not sure, but it seems that this is for optional static segment after trailing slash
          foo/bar/(baz)
          in my case there is no such thing, so, i simplified it.
          also, add `#` to the returned pattern.
        */
      })
      .replace(o.splatParam, '([^?]*?)');

    let trailingSlash = '\\/*';
    let patternString = `^\\/?${route}(?:${trailingSlash}[?#]([\\s\\S]*))?$`;
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
    this._path = new PathContext(this.path);
    this.segments = this.buildSegments(this.path);
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
  buildSegments(paths) {
    let arr = paths.split(/[?|#]/);
    let result = arr[0].split('/').filter(Boolean);
    return result;
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

/**
 * This is main module.
 * By Default its only the thing you should use working with fe-routing-js
 * @module routing
 */
var routing = {
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
   * @param {routingOptions} [options]
   */
  createRouter(options) {
    return new config.Router(options || config.routingOptions);
  },

  /**
   * Registers routeHandler.
   * Alias for `routing.instance.get`.
   * @example
   * routing.get('some/page', (req, res) => { ... })
   * @see {@link Router.get}
   * @returns {Router}
   */
  get(...args) {
    return this._ensureRouter().get(...args);
  },

  /**
   * Adds global middleware, router or route middleware.
   * Alias for `routing.instance.use`.
   * @example
   * // adding global middleware to the end of array
   * routing.use((req, res, next) => { next(); });
   *
   * // adding nested router
   * routing.use('acc', accountRouter);
   *
   * // adding route middleware to the begining of route's middlewares array
   * routing.use('some/page', (req, res, next) => { next(); });
   * @see {@link Router.use}
   * @returns {Router}
   */
  use(...args) {
    if (arguments.length == 1 && arguments[0] instanceof config.Router) {
      if (this.isStarted()) {
        throw new Error(
          'Main router already initialized and started. You have to stop it first'
        );
      } else {
        this.instance = arguments[0];
        return this.instance;
      }
    }
    return this._ensureRouter().use(...args);
  },

  // /**
  //  * Returns true if routing started
  //  * @returns {boolean}
  //  */
  // isStarted() {
  //   if (this.instance) {
  //     return this.instance.isStarted();
  //   }
  //   return false;
  // },

  /**
   * Starts routing
   * @param {startOptions} [options]
   * @returns {Router}
   */
  start(options) {

    if (!options) {
      options = {};
    }

    this._ensureRouter();

    if (this.isStarted()) {
      throw new Error('Routing already started');
    }


    if (options.errorHandlers) {
      //applying errorHandlers if any
      this.instance.setErrorHandlers(
        options.replaceErrorHandlers,
        options.errorHandlers
      );
    }

    if (options.onRequestStart !== void 0) {
      this.instance.onRequestStart = options.onRequestStart;
    }

    if (options.onRequestEnd !== void 0) {
      this.instance.onRequestEnd = options.onRequestEnd;
    }

    if (options.useHashes != null) {
      //update routing useHashes flag
      config.useHashes = options.useHashes === true;
    }


    config.isStarted = true;

    let navigateOptions = Object.assign({}, options, { pushState: false });
    if (options.trigger !== false) {
      //triggering middlewares only if trigger is not disallowed.
      this.navigate(navigateOptions);
    }
    this._setOnPopstate(navigateOptions);
  },

  /**
   * Stops routing
   * @see {@link Router.stop}
   * @returns {Router}
   */
  stop() {
    if (!this.isStarted()) {
      return;
    }

    config.isStarted = false;
    this.instance.setCurrentUrl(null);
    this._removeOnPopstate();
  },

  /**
   * Removes middleware or routeHandler.
   * Alias for `routing.instance.remove`.
   * @see {@link Router.remove}
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
  config,

  /**
   * Returns routing state. True if started
   * @return {boolean}
   */
  isStarted() {
    return config.isStarted === true;
  },

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
  },

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
};

config.Router = Router;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;
config.RoutesManager = RoutesManager;

export { RequestContext, ResponseContext, RouteHandler, Router, RoutesManager, config, routing };
