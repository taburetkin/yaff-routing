import { getUrl, buildPath } from './utils';
import config from './config';

/**
 * RequestContext represents current request state.
 * Used for manipulating the request
 * @class RequestContext
 * @prop {Object.<string, string>} args - holds route arguments
 * @prop {string} path - route path
 * @prop {URL} url - route URL instance
 * @prop {Object.<string, (string|string[])>} query - search query parameters
 * @prop {object} options - initialization options
 */
class RequestContext {
  constructor(url, options) {
    this.options = options;
    this.url = this._getUrl(url);
    this.path = this._buildPath();
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
