import config from './config';
import { getUrl, comparator, invoke } from './utils';
import RoutesManager from './RoutesManager';

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
      path;
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

export default Router;
