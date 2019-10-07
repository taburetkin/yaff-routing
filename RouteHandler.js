import { getUrl, buildPath } from './utils';
import config from './config';

class RouteHandler {
  constructor(url) {
    this.url = this._getUrl(url);
    this.path = this._buildPath();
    this.pattern = this._buildPattern();
    this.middlewares = [];
  }
  _getUrl(url) {
    return getUrl(url, config.useHashes);
  }
  _buildPath() {
    return buildPath(this.url, config.useHashes);
  }
  _buildPattern() {
    let o = this.regexOptions;
    let route = this.path
      .replace(o.escapeRegExp, '\\$&')
      .replace(o.optionalParam, '(?:$1)?')
      .replace(o.namedParam, function(match, optional) {
        return optional ? match : '([^/?]+)';
      })
      .replace(o.splatParam, '([^?]*?)');
    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
  }

  addMiddlewares(middlewares) {
    for (let middleware of middlewares) {
      this.addMiddleware(middleware);
    }
  }
  addMiddleware(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('middleware must be a function');
    }
    this.middlewares.push(middleware);
  }
  removeMiddleware(middleware) {
    let index = this.middlewares.indexOf(middleware);
    if (index < 0) return;
    this.middlewares.splice(index, 1);
    return middleware;
  }
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

  hasMiddleware(middleware) {
    return this.middlewares.indexOf(middleware) > -1;
  }

  async processRequest(req, res, options = {}) {
    this.prepareRequestContext(req);

    let { globalMiddlewares = [] } = options;

    let handlers = [...globalMiddlewares, ...this.middlewares];

    let handler = this._createNextHandler(req, res, handlers);

    return await handler();
  }
  _createNextHandler(req, res, handlers) {
    let handler = handlers.shift();
    if (!handler) return () => {};
    let next = this._createNextHandler(req, res, handlers);
    return async () => {
      if (res.isEnded()) {
        return res.error;
      }
      return await handler(req, res, next);
    };
  }
  prepareRequestContext(req) {
    let params = this.pattern.exec(req.path).slice(1);
    let params2 = this.pattern.exec(this.path).slice(1);
    let args = params2.reduce((memo, param, index) => {
      if (param == null) return memo;
      memo[param.substring(1)] = params[index];
      return memo;
    }, {});
    Object.assign(req.args, args);
  }
  testRequest(req) {
    return this.pattern.test(req.path);
  }
}

Object.assign(RouteHandler.prototype, {
  regexOptions: {
    optionalParam: /\((.*?)\)/g,
    namedParam: /(\(\?)?:\w+/g,
    splatParam: /\*\w+/g,
    escapeRegExp: /[-{}[\]+?.,\\^$|#\s]/g ///[\-{}\[\]+?.,\\\^$|#\s]/g,
  }
});

export default RouteHandler;
