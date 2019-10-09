/**
 * Routing configuration.
 * You can provide your own versions of internal classes and setup some behavior.
 * @namespace
 */
const config = {
  /** options for initializing the Routing instance */
  routingOptions: {},

  /** use hashes instead of urls */
  useHashes: false,

  /** @type {Routing} - Routing definition will be used internally by routing. Replace it with your extended version if you need  */
  Routing: void 0,

  /** @type {RouteHandler} - RouteHandler definition will be used internally by routing. Replace it with your extended version if you need  */
  RouteHandler: void 0,

  /** @type {RequestContext} - RequestContext definition will be used internally by routing. Replace it with your extended version if you need  */
  RequestContext: void 0,

  /** @type {ResponseContext} - RequestContext definition will be used internally by routing. Replace it with your extended version if you need  */
  ResponseContext: void 0,

  /**
   * indicates if routing started
   * @private
   */
  isStarted: false
};

export default config;
