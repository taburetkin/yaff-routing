import config from './config';
import Router from './Router';
import RouteHandler from './RouteHandler';
import RequestContext from './RequestContext';
import ResponseContext from './ResponseContext';

config.Router = Router;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;

/**
 * This is main module.
 * By Default its only the thing you should use working with fe-routing-js
 * @module routing
 */
export default {
  /**
   * Returns current routing instance. If it does not exist instance will be created.
   * @private
   * @returns {Router} routing instance
   */
  _ensureRouter() {
    if (!this.instance) {
      this.instance = this.createRouter();
    }
    return this.instance;
  },

  /**
   * Creates instance of Router with config.routingOptions.
   * @returns {Router} Router instance
   */
  createRouter() {
    return new config.Router(config.routingOptions);
  },

  /**
   * Proxy method to Router instance's `get`
   * @see {@link Router.get}
   * @returns {Router}
   */
  get(...args) {
    return this._ensureRouter().get(...args);
  },

  /**
   * Proxy method to Router instance's `use`
   * @see {@link Router.use}
   * @returns {Router}
   */
  use(...args) {
    return this._ensureRouter().use(...args);
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
   * @see {@link Router.start}
   * @returns {Router}
   */
  start(...args) {
    return this._ensureRouter().start(...args);
  },

  /**
   * Stops routing
   * @see {@link Router.stop}
   * @returns {Router}
   */
  stop(...args) {
    return this.isStarted() && this.instance.stop(...args);
  },

  /**
   * Removes middleware or middleware's handler.
   * Proxy method for Router instance's `remove`.
   * @see {@link Router.stop}
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
   * Proxy method for Router instance's `navigate`.
   * @see {@link Router.navigate}
   */
  navigate(...args) {
    if (!this.instance) {
      return;
    }
    return this.instance.navigate(...args);
  },

  /**
   * routing Configuration
   * @see {@link configuration}
   */
  config
};
