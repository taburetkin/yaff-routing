import { getUrl, buildPath } from "./utils";
import config from "./config";

class RouteHandler {
  constructor(url) {
    this.url = this._getUrl(url);
    this.path = this._buildPath();
    this.pattern = this._buildPattern();
    this.handlers = [];
  }
  _getUrl(url) {
    return getUrl(url);
  }
  _buildPath() {
    return buildPath(this.url, config.pushState);
  }
  _buildPattern() {
    let o = this.regexOptions;
    let route = this.path
      .replace(o.escapeRegExp, "\\$&")
      .replace(o.optionalParam, "(?:$1)?")
      .replace(o.namedParam, function(match, optional) {
        return optional ? match : "([^/?]+)";
      })
      .replace(o.splatParam, "([^?]*?)");
    return new RegExp("^" + route + "(?:\\?([\\s\\S]*))?$");
  }

  addHandlers(handlers) {
    for (let handler of handlers) {
      this.addHandler(handler);
    }
  }
  addHandler(handler) {
    if (typeof handler !== "function") {
      throw new Error("handler must be a function");
    }
    this.handlers.push(handler);
  }
  removeHandler(handler) {
    let index = this.handlers.indexOf(handler);
    if (index < 0) return;
    this.handlers.splice(index, 1);
    return handler;
  }
  removeHandlers(handlers) {
    if (!handlers) {
      this.handlers.length = 0;
      return;
    }
    for (let handler of handlers) {
      this.removeHandler(handler);
    }
  }
  async processRequest(req, res, options = {}) {
    this.prepareRequestContext(req);
    let handlers = [...(options.globalHandlers || []), ...this.handlers];
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
