import config from './config';
import Routing from './Routing';
import RouteHandler from './RouteHandler';
import RequestContext from './RequestContext';
import ResponseContext from './ResponseContext';

config.Routing = Routing;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;
/**
 * This is the Main namespace. by Default its only the thing you should use working with fe-routing-js
 * @namespace
 *
 */
const routing = {
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
   * Creates instance of Routing with config.routingOptions.
   * @returns {Routing} Routing instance
   */
  createRouting() {
    return new config.Routing(config.routingOptions);
  },

  /**
   * Proxy method to Routing instance's `get`
   * @see {@link Routing.get}
   * @returns {Routing}
   */
  get(...args) {
    return this._ensureRouting().get(...args);
  },

  /**
   * Proxy method to Routing instance's `use`
   * @see {@link Routing.use}
   * @returns {Routing}
   */
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
   * Starts routing
   * @see {@link Routing.start}
   * @returns {Routing}
   */
  start(...args) {
    return this._ensureRouting().start(...args);
  },

  /**
   * Stops routing
   * @see {@link Routing.stop}
   * @returns {Routing}
   */
  stop(...args) {
    return this.isStarted() && this.instance.stop(...args);
  },

  /**
   * Removes middleware or middleware's handler.
   * Proxy method for Routing instance's `remove`.
   * @see {@link Routing.stop}
   * @returns {(RouteHandler|void)}
   */
  remove(...args) {
    if (!this.instance) {
      return;
    }
    return this.instance.remove(...args);
  },

  /**
   * Initiates the request.
   * Proxy method for Routing instance's `navigate`.
   * @see {@link Routing.navigate}
   */
  navigate(...args) {
    return this._ensureRouting().navigate(...args);
  },

  /**
   * routing Configuration
   * @see {@link config}
   */
  config
};

export default routing;
