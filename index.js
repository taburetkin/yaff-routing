import config from "./config";
import Routing from "./Routing";
import RouteHandler from "./RouteHandler";
import RequestContext from "./RequestContext";
import ResponseContext from "./ResponseContext";

config.Routing = Routing;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;

export default {
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
