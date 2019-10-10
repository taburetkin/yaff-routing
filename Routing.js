import config from './config';
import { getUrl } from './utils';
import RoutesManager from './RoutesManager';

/**
 * @typedef {Object} startOptions
 * @prop {boolean=} [trigger=true] - If true, will try to invoke handlers for current location
 * @prop {Object.<string, function>=} errorHandlers - Error handlers to set into Routing instance
 * @prop {boolean=} [replaceErrorHandlers=false] - Indicates how errorHandlers should be applied. default behavior is merge
 * @prop {boolean=} [useHashes=false] - Enables old school hash based routing
 */

/**
 * @typedef {Object} routingOptions
 * @prop {Object.<string, function>=} errorHandlers - Error handlers to set into Routing instance
 */

/**
 * Manipulates existing routeHandlers, global middlewares and processes the requests
 * @prop {RoutesManager} routes - Holds all registered routeHandlers
 */
class Routing {
  /**
   * Creates an instance of Routing.
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
   * @returns {Routing} Routing instance
   * @memberof Routing
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
   * @memberof Routing
   */
  _setOnPopstate() {
    this._onPopstate = event => {
      let options = event.state.navigateOptions || { trigger: true };
      options.pushState = false;
      return this.navigate(options);
    };
    window.addEventListener('popstate', this._onPopstate);
  }

  /**
   * removes onpopstate handler
   * @private
   * @memberof Routing
   */
  _removeOnPopstate() {
    if (typeof this._onPopstate == 'function') {
      window.removeEventListener('popstate', this._onPopstate);
      delete this._onPopstate;
    }
  }
  /**
   * Stops routing
   * @returns {Routing}
   * @memberof Routing
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
   * @returns {Routing} routing instance
   * @memberof Routing
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
   * @returns {Routing}
   * @memberof Routing
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
   * @memberof Routing
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
   * @memberof Routing
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
   * @memberof Routing
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
   * @memberof Routing
   */
  createRequestContext(url, options) {
    return new config.RequestContext(this._getUrl(url), options);
  }

  /**
   * Creates ResponseContext instance
   * @param {RequestContext} req
   * @returns ResponseContext instance
   * @memberof Routing
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
   * @memberof Routing
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
   * @memberof Routing
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
   * @memberof Routing
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
   * @memberof Routing
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
   * @memberof Routing
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
   * @param {boolean} shouldReplace Indicates should errorHandlers be replaced or merged
   * @param  {...Object.<string, function>} handlers Objects literals to merge or replace with
   * @private
   */
  setErrorHandlers(shouldReplace, ...handlers) {
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
   * @memberof Routing
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
   * @memberof Routing
   */
  isCurrentUrl(url) {
    url = this._getUrl(url);
    return this._currentUrl == url.toString().toLowerCase();
  }

  /**
   * Stores given url as current.
   * Method internally used by `navigate`
   * @param {(string|URL)} url
   * @memberof Routing
   */
  setCurrentUrl(url) {
    url = this._getUrl(url);
    this._currentUrl = url.toString().toLowerCase();
  }

  /**
   * Pushes state to browser's history
   * Method internally used by `navigate`
   * @param {(string|URL)} url
   * @memberof Routing
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
   * @memberof Routing
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
   * @returns {Routing}
   * @memberof Routing
   */
  _ensureStarted(value = false) {
    let message = value ? 'already' : 'not yet';
    if (this.isStarted() === value) {
      throw new Error(`Routing ${message} started`);
    }
    return this;
  }

  /**
   * wraps string url into URL
   * @param {string} url
   * @returns {URL}
   * @memberof Routing
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
   * @memberof Routing
   */
  _getReq(arg) {
    if (arg instanceof config.RequestContext) {
      return arg;
    }
    return this.createRequestContext(arg);
  }
  //#endregion
}

export default Routing;
