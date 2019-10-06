import { buildPath } from './utils';
import config from './config';
class RoutesManager {
  constructor() {
    this.items = [];
    this.byPath = {};
  }
  get length() {
    return this.items.length;
  }
  get(path) {
    if (path == null) return;
    path = buildPath(path, config.useHashes);
    return this.byPath[path];
  }
  add(routeHandler) {
    this.items.push(routeHandler);
    this.byPath[routeHandler.path] = routeHandler;
  }
  remove(routeHandler) {
    if (routeHandler == null) return;
    if (typeof routeHandler === 'string') {
      return this.remove(this.get(routeHandler));
    }
    if (routeHandler instanceof config.RouteHandler) {
      let index = this.items.indexOf(routeHandler);
      if (index == -1) return;
      this.items.splice(index, 1);
      delete this.byPath[routeHandler.path];
      return routeHandler;
    }
  }
  has(path) {
    return this.get(path.toString()) instanceof config.RouteHandler;
  }
}
export default RoutesManager;
