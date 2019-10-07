import config from './config';
import Routing from './Routing';
import RouteHandler from './RouteHandler';
import RequestContext from './RequestContext';
import ResponseContext from './ResponseContext';

config.Routing = Routing;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;

export default {
  /**
   * Returns current routing instance. If it does not exist instance will be created.
   * @private
   * @returns {Routing} routing instance
   */
  _ensureRouting() {
    if (!this.instance) {
      this.instance = this.createRouting();
    }
    return this.instance;
  },

  /**
   * Creates instance of Routing.
   *
   * @returns {Routing} Routing instance
   */
  createRouting() {
    return new config.Routing(config.routingOptions);
  },

  /** @see {@link Routing.get} */
  get(...args) {
    return this._ensureRouting().get(...args);
  },

  /** @see {@link Routing.use} */
  use(...args) {
    return this._ensureRouting().use(...args);
  },

  /**
   * Returns true if routing started
   * @returns {boolean}
   */
  isStarted() {
    if (this.instance) {
      return this.instance.isStarted();
    }
    return false;
  },

  /**
   * Starts roouting
   * @see {@link Routing.use}
   */
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
