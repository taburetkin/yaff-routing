import config from './config';
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
   * @param {routingOptions} [options]
   */
  createRouter(options) {
    return new config.Router(options || config.routingOptions);
  },

  /**
   * Registers routeHandler.
   * Alias for `routing.instance.get`.
   * @example
   * routing.get('some/page', (req, res) => { ... })
   * @see {@link Router.get}
   * @returns {Router}
   */
  get(...args) {
    return this._ensureRouter().get(...args);
  },

  /**
   * Adds global middleware, router or route middleware.
   * Alias for `routing.instance.use`.
   * @example
   * // adding global middleware to the end of array
   * routing.use((req, res, next) => { next(); });
   *
   * // adding nested router
   * routing.use('acc', accountRouter);
   *
   * // adding route middleware to the begining of route's middlewares array
   * routing.use('some/page', (req, res, next) => { next(); });
   * @see {@link Router.use}
   * @returns {Router}
   */
  use(...args) {
    if (arguments.length == 1 && arguments[0] instanceof config.Router) {
      if (this.isStarted()) {
        throw new Error(
          'Main router already initialized and started. You have to stop it first'
        );
      } else {
        this.instance = arguments[0];
        return this.instance;
      }
    }
    return this._ensureRouter().use(...args);
  },

  // /**
  //  * Returns true if routing started
  //  * @returns {boolean}
  //  */
  // isStarted() {
  //   if (this.instance) {
  //     return this.instance.isStarted();
  //   }
  //   return false;
  // },

  /**
   * Starts routing
   * @param {startOptions} [options]
   * @returns {Router}
   */
  start(options) {
    this._ensureRouter();

    if (typeof options != 'object') {
      options = {};
    }

    if (this.isStarted()) {
      throw new Error('Routing already started');
    }
    config.isStarted = true;

    if (options.errorHandlers) {
      //applying errorHandlers if any
      this.instance.setErrorHandlers(
        options.replaceErrorHandlers,
        options.errorHandlers
      );
    }

    if (options.useHashes != null) {
      //update routing useHashes flag
      config.useHashes = options.useHashes === true;
    }

    let navigateOptions = Object.assign({}, options, { pushState: false });
    if (options.trigger !== false) {
      //triggering middlewares only if trigger is not disallowed.
      this.navigate(navigateOptions);
    }
    this._setOnPopstate(navigateOptions);
  },

  /**
   * Stops routing
   * @see {@link Router.stop}
   * @returns {Router}
   */
  stop() {
    if (!this.isStarted()) {
      return;
    }

    config.isStarted = false;
    this.instance.setCurrentUrl(null);
    this._removeOnPopstate();
  },

  /**
   * Removes middleware or routeHandler.
   * Alias for `routing.instance.remove`.
   * @see {@link Router.remove}
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
  config,

  /**
   * Returns routing state. True if started
   * @return {boolean}
   */
  isStarted() {
    return config.isStarted === true;
  },

  /**
   * Sets onpopstate handler to reflect on history go forward/back.
   * @private
   * @memberof Router
   */
  _setOnPopstate() {
    this._onPopstate = event => {
      if (event == null || typeof event != 'object') {
        event = {};
      }
      let state = event.state != null ? event.state : {};
      let options = state.navigateOptions || { trigger: true };
      options.pushState = false;
      options.state = state;
      return this.navigate(options);
    };
    window.addEventListener('popstate', this._onPopstate);
  },

  /**
   * removes onpopstate handler
   * @private
   * @memberof Router
   */
  _removeOnPopstate() {
    if (typeof this._onPopstate == 'function') {
      window.removeEventListener('popstate', this._onPopstate);
      delete this._onPopstate;
    }
  }
};
