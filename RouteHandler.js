import { getUrl, buildPath } from './utils';
import config from './config';

/**
 * Represents handler for a given string route.
 * When request occurs and request path match handlres's route pattern
 * then all registered middlewares beeing invoked.
 * @prop {URL} url the URL instance of route
 * @prop {string} path string path of route
 * @prop {RegExp} pattern route's RegExp pattern
 * @prop {Object.<string, RegExp>} regexPatterns default RegExp patterns for maintaining routes and routes parameters
 * @prop {function[]} middlewares registerd route's middlewares
 * @class RouteHandler
 */
class RouteHandler {
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
  addMiddlewares(middlewares) {
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
    let params = this.pattern.exec(req.path).slice(1);
    let params2 = this.pattern.exec(this.path).slice(1);
    let args = params2.reduce((memo, param, index) => {
      if (param == null) return memo;
      memo[param.substring(1)] = params[index];
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
      .replace(o.namedParam, function(match, optional) {
        return optional ? match : '([^/?]+)';
      })
      .replace(o.splatParam, '([^?]*?)');
    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
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

export default RouteHandler;
