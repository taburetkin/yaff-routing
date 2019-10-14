import { getUrl, buildPath, addValue } from './utils';
import config from './config';
import PathContext from './PathContext';
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
    let { globalMiddlewares, segments, _circular } = parentContext;

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
        path: new PathContext([...segments, ...this._path.segments])
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

      addValue(memo, paramName, params[index]);

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
  _createNextHandler(req, res, handlers) {
    let handler = handlers.shift();
    if (!handler) return () => {};
    let next = this._createNextHandler(req, res, handlers);
    return async () => await handler(req, res, next);
  }
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

export default RouteHandler;
