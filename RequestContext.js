import { getUrl, buildPath } from './utils';
import config from './config';
import PathContext from './PathContext';
/**
 * Represents request state.
 * @prop {Object.<string, string>} args - holds route arguments
 * @prop {string} path - route path
 * @prop {URL} url - route URL instance
 * @prop {Object.<string, (string|string[])>} query - search query parameters
 * @prop {object} options - initialization options
 */
class RequestContext {
  /**
   *Creates an instance of RequestContext.
   * @param {(string|URL)} url
   * @param {*} options
   */
  constructor(url, options) {
    this.options = options;
    this.url = this._getUrl(url);
    this.path = this._buildPath();
    this._path = new PathContext(this.path);
    this.segments = this.buildSegments(this.path);
    this.args = {};

    // converts url's `search` to { key : values } object
    this.query = this._buildQuery();

    if (options && options.state) {
      this.state = options.state;
    }
  }

  /**
   * Merges route arguments with given object
   * @param {Object.<string,*>} args
   * @memberof RequestContext
   */
  setRouteArguments(args) {
    Object.assign(this.args, args);
  }

  _getUrl(url) {
    return getUrl(url, config.useHashes);
  }
  _buildPath() {
    return buildPath(this.url, config.useHashes);
  }
  buildSegments(paths) {
    let arr = paths.split(/[?|#]/);
    let result = arr[0].split('/').filter(Boolean);
    return result;
  }
  /**
   * builds simplified version of URLSearchParameters
   * @private
   * @returns {Object.<string, (string|string[])>}
   * @memberof RequestContext
   */
  _buildQuery() {
    let query = {};
    for (let key of this.url.searchParams.keys()) {
      query[key] = this.url.searchParams.getAll(key);
      if (query[key].length === 1) {
        query[key] = query[key][0];
      }
    }
    return query;
  }
}

export default RequestContext;
