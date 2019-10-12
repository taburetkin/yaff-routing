import { buildPath } from './utils';
import config from './config';

class RoutesManager {
  constructor() {
    this.items = [];
    this.byPath = {};
  }

  /**
   * Indicates how many handlers there are
   *
   * @readonly
   * @memberof RoutesManager
   */
  get length() {
    return this.items.length;
  }

  /**
   * Returns handler by path
   *
   * @param {*} path
   * @returns {RouteHandler}
   * @memberof RoutesManager
   */
  get(path) {
    if (path instanceof config.RouteHandler) {
      path = path.path;
    }
    if (path == null) return;
    path = buildPath(path, config.useHashes);
    return this.byPath[path];
  }

  /**
   * Adds handler
   *
   * @param {RouteHandler} routeHandler
   * @memberof RoutesManager
   */
  add(routeHandler) {
    if (!(routeHandler instanceof config.RouteHandler)) {
      throw new Error('Given argument is not instance of RouteHandler class');
    }
    this.items.push(routeHandler);
    this.byPath[routeHandler.path] = routeHandler;
  }

  /**
   * Removes handler if there is one
   * @param {*} routeHandler
   * @returns
   * @memberof RoutesManager
   */
  remove(routeHandler) {
    if (routeHandler == null) return;
    if (routeHandler instanceof config.RouteHandler) {
      let index = this.items.indexOf(routeHandler);
      if (index == -1) return;
      this.items.splice(index, 1);
      delete this.byPath[routeHandler.path];
      return routeHandler;
    }
    return this.remove(this.get(routeHandler));
  }

  /**
   * Returns true if there is such handler
   *
   * @param {*} path
   * @returns {true}
   * @memberof RoutesManager
   */
  has(path) {
    return this.get(path) instanceof config.RouteHandler;
  }
}
export default RoutesManager;
