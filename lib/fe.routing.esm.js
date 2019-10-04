var config = {
	// default routing options
	routingOptions: void 0,
	// when false will use hashes #path
	pushState: true,
};

function getUrl(url) {
  if (url == null) {
    return new URL(document.location.toString());
  } else if (url instanceof URL) {
    return url;
  } else if (/^https*:\/\//.test(url)) {
    return new URL(url);
  }

  if (!url.toString().startsWith("/")) {
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

class Routing {
  constructor(options = {}) {
    this.options = { ...options };
    this._routesByPath = {};
    this._routes = [];
    this._globalHandlers = [];
    this._setErrorHandlers(this.errorHandlers, options.errorHandlers);
  }
  _setErrorHandlers(...handlers) {
    this._errorHandlers = Object.assign(
      {
        notfound: () => console.warn("not found"),
        notallowed: () => console.warn("not found"),
        exception: err => {
          throw err;
        }
      },
      ...handlers
    );
  }
  start(options) {
    if (typeof options != "object") {
      options = {};
    }
    this._ensureStarted(true);
    config.isStarted = true;
    if (options.errorHandlers) {
      this._setErrorHandlers(options.errorHandlers);
    }
    config.pushState = options.pushState !== false;
    if (options.trigger !== false) {
      this.navigate(options);
    }
  }
  stop() {
    config.isStarted = false;
  }

  isStarted() {
    return config.isStarted === true;
  }

  _ensureStarted(value = false) {
    //console.log(message, value, this.isStarted());
    let message = value ? "already" : "not yet";
    if (this.isStarted() === value) {
      throw new Error(`Routing ${message} started`);
    }
    return this;
  }

  _getUrl(url) {
    return getUrl(url);
  }

  //#region routes management section
  use(path, handler) {
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
  }

  get(path, ...middlewares) {
    this._add(path, middlewares);
    return this;
  }
  _add(path, middlewares, unshift) {
    let routeHandler = this._ensureRouteHanlder(path);
    routeHandler.addHandlers(middlewares, unshift);
  }
  _ensureRouteHanlder(pathUrlPattern) {
    let routeHandler = this._getRouteHandler(pathUrlPattern);
    if (!routeHandler) {
      routeHandler = this._addRouteHanlder(pathUrlPattern);
    }
    return routeHandler;
  }
  _getRouteHandler(pathUrlPattern) {
    return this._routesByPath[pathUrlPattern];
  }
  _addRouteHanlder(pathUrlPattern) {
    let routeHandler = new config.RouteHandler(pathUrlPattern);
    this._routesByPath[pathUrlPattern] = routeHandler;
    this._routes.push(routeHandler);
    return routeHandler;
  }
  removeRoute(pathUrlPattern) {
    let routeHandler = this._routesByPath[pathUrlPattern];
    if (!routeHandler) return;
    let index = this._routes.indexOf(routeHandler);
    delete this._routesByPath[pathUrlPattern];
    this._routes.splice(index, 1);
    return routeHandler;
  }
  removeRouteHandler(pathUrlPattern, handler) {
    let routeHandler = this._getRouteHandler(pathUrlPattern);
    return (routeHandler && routeHandler.removeHandler(handler)) || false;
  }
  remove() {
    throw new Error("not implemented");
  }
  //#endregion

  //#region process request section
  request(url) {
    if (!this.isStarted()) {
      return;
    }
    let req = this.createRequestContext(url);
    let res = this.createResponseContext(req);
    return this._processRequest(req, res);
  }
  createRequestContext(url) {
    let context = new config.RequestContext(this._getUrl(url));
    return context;
  }
  _getReq(arg) {
    if (arg instanceof config.RequestContext) {
      return arg;
    }
    return this.createResponseContext(arg);
  }
  createResponseContext(req) {
    return new config.ResponseContext(req);
  }
  async _processRequest(req, res) {
    let routeHandler = this.findRouteHandler(req);
    if (routeHandler) {
      await routeHandler.processRequest(req, res, {
        globalHandlers: [...this._globalHandlers]
      });
      if (res.error) {
        this.handleError(res.error, req, res);
      }
    } else {
      this.handleError("not:found", req, res);
    }
  }
  findRouteHandler(req) {
    req = this._getReq(req);
    for (let routeHandler of this._routes) {
      if (this.testRouteHandler(req, routeHandler)) {
        return routeHandler;
      }
    }
  }
  testRouteHandler(req, routeHandler) {
    req = this._getReq(req);
    return routeHandler.testRequest(req);
  }

  handleError(error, req, res) {
    let errorKey = error;
    if (error instanceof Error) {
      errorKey = "exception";
    }
    let handler = this._errorHandlers[errorKey];
    if (typeof handler === "function") {
      handler.call(this, error, req, res);
    }
  }
  //#endregion

  //#region navigate section
  navigate(url, options = {}) {
    this._ensureStarted();
    if (typeof url === "object") {
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
  }
  isCurrentUrl(url) {
    url = this._getUrl(url);
    return this._currentUrl == url.toString().toLowerCase();
  }
  setCurrentUrl(url) {
    url = this._getUrl(url);
    this._currentUrl = url.toString().toLowerCase();
  }
  browserPushState(url) {
    url = this._getUrl(url);
    let state = this.getCurrentState();
    history.pushState(state, document.title, url.toString());
  }
  getCurrentState() {
    return {};
  }
  //#endregion
}

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

class RequestContext {
  constructor(url) {
    this.url = this._getUrl(url);
    this.path = this._buildPath();
    this.args = {};
    this.search = this._buildSearch();
  }
  _getUrl(url) {
    return getUrl(url);
  }
  _buildPath() {
    return buildPath(this.url, config.pushState);
  }
  _buildSearch() {
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

class ResponseContext {
  constructor(req) {
    this.request = req;
    this._processing = true;
    this.locals = {};
  }

  isOk() {
    return !this.error;
  }
  end() {
    this._processing = false;
    return this;
  }
  isEnded() {
    return this._processig == false;
  }
  setError(error) {
    this.error = error;
    return this;
  }
  notFound() {
    this.setError("notfound");
    return this;
  }
  notAllowed() {
    this.setError("notallowed");
    return this;
  }
}

config.Routing = Routing;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;

var index = {
  _ensureRouting() {
    if (!this.instance) {
      this.instance = this.createRouting();
    }
    return this.instance;
  },
  createRouting() {
    return new config.Routing(config.routingOptions);
  },
  get(...args) {
    return this._ensureRouting().get(...args);
  },
  use(...args) {
    return this._ensureRouting().use(...args);
  },
  isStarted() {
    if (this.instance) {
      return this.instance.isStarted();
    }
    return false;
  },
  start(...args) {
    return this._ensureRouting().start(...args);
  },
  stop(...args) {
    return this.isStarted() && this.instance.stop(...args);
  },
  remove(...args) {
    if (!this.instance) {
      return;
    }
    return this.instance.remove(...args);
  },
  navigate(...args) {
    return this._ensureRouting().navigate(...args);
  },
  config
};

export default index;
