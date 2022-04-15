/**
 * Routing configuration.
 * You can provide your own versions of internal classes and setup some behavior.
 * @namespace {Configuration} configuration
 */
const config = {
  /**
   * options for initializing the Routing instance
   * @type {routingOptions}
   */
  routingOptions: {},

  /** use hashes instead of urls */
  useHashes: false,

  /** @type {Router} - Router class will be used internally by routing. Replace it with your extended version if you need  */
  Router: void 0,

  /** @type {RouteHandler} - RouteHandler class will be used internally by routing. Replace it with your extended version if you need  */
  RouteHandler: void 0,

  /** @type {RequestContext} - RequestContext class will be used internally by routing. Replace it with your extended version if you need  */
  RequestContext: void 0,

  /** @type {ResponseContext} - RequestContext class will be used internally by routing. Replace it with your extended version if you need  */
  ResponseContext: void 0,

  /**
   * indicates if routing started
   * @private
   */
  isStarted: false
};

export default config;
