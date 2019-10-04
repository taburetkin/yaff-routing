import config from "./config";
import { getUrl } from "./utils";
//import newid from 'es6-utils/newid';

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
  start(options = {}) {
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

  isStarted() {
    return config.isStarted === true;
  }

  _ensureStarted(value = false) {
    let message = value ? "not yet" : "already";
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
    if (typeof url == "object") {
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

export default Routing;
