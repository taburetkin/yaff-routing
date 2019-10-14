import { buildSegments, getUrl, buildPath } from './utils';
import config from './config';

/**
 * Represents path segment. for internal use only.
 * @private
 * @class PathSegment
 */
class PathSegment {
  constructor(value) {
    this.value = this._normalizeValue(value);
    this.optional = /^\(.+\)$/g.test(value);
    this.required = !this.optional;
    this.parametrized = /:/g.test(value);
    this.static = !this.parametrized;
    this.any = /\*\w+/g.test(value);
  }

  /**
   * Returns true if this is a root segment.
   * `"" | "/" | "(/)"` segments are treated as root segment
   * @returns {boolean}
   * @memberof PathSegment
   */
  isRoot() {
    return /^(\/|\(\/\))?$/.test(this.value);
  }

  /**
   * Adds `/` to the begining of segment with respect to optional segment signature.
   * @private
   * @param {(string|PathSegment) value
   */
  _normalizeValue(value) {
    value = value instanceof PathSegment ? value.value : value;
    if (/^\(*\//.test(value)) {
      return value;
    }
    if (value[0] === '(') {
      value = '(/' + value.substring(1);
    } else {
      value = '/' + value;
    }
    return value;
  }

  /**
   * Returns RegExp string of this segment
   * @returns {string}
   * @memberof PathSegment
   */
  getPatternValue() {
    if (this.any) {
      return '([^]+)?';
    }

    let value = this.value.replace(/:\w+/g, '\\w+');
    value = value.replace(/\(([^)]+)\)/g, '($1)?');

    return value;
  }

  toString() {
    return this.value;
  }
}

/**
 * Path helper. for internal use
 * @private
 * @class PathContext
 */
class PathContext {
  constructor(url) {
    if (typeof url == 'string') {
      let path = buildPath(url, config.useHashes);
      url = getUrl(path, false);
    }
    let segments = this._buildSegments(url);
    Object.assign(this, this._buildSegmentsInfo(segments));
    this.path = this.segments.join('');
    if (this.path == '') {
      this.path == '/';
    }
  }

  toString() {
    let path = this.segments.join('');
    if (path == '') {
      path = '/';
    }
    return path;
  }

  /**
   * Generates RegExp pattern from segments
   * @returns {RegExp}
   * @memberof PathContext
   */
  generatePattern() {
    let patternString =
      '^' + this.segments.map(segment => segment.getPatternValue()).join('');
    patternString += '\\/?([#?][^]+)?$';
    let pattern = new RegExp(patternString);
    return pattern;
  }

  /**
   * Returns true if a given path meet this segments
   *
   * @param {string} path
   * @returns {boolen}
   * @memberof PathContext
   */
  testPath(path) {
    let pattern = this.generatePattern();
    let result = pattern.test(path);
    return result;
  }

  /**
   * Returns true if whole path is looks like root: `"/", ""`
   * @returns
   * @memberof PathContext
   */
  isRoot() {
    return (
      this.segments.length == 0 ||
      (this.segments.length == 1 && this.segments[0].isRoot())
    );
  }

  _buildSegments(raw) {
    if (raw instanceof URL) {
      raw = buildSegments(raw);
    }
    return raw.map(m => new PathSegment(m)).filter(f => !f.isRoot());
  }

  /**
   * Basicaly this is for determining the order of Paths to get a correct order.
   * At this point there is only `total` and `requiredStatic` in use.
   * @private
   * @param {*} segments
   * @returns
   * @memberof PathContext
   */
  _buildSegmentsInfo(segments) {
    let info = {
      segments,
      total: 0,

      // `foo` - static segment
      static: 0,
      // `:id` parametrized one, opposite for static
      parametrized: 0,

      // `foo`, any segment without ( )
      required: 0,
      // `foo`
      requiredStatic: 0,
      // `:id`
      requiredParametrized: 0,

      //opposite fore required
      // `(...)`
      optional: 0,
      // `(bar)`
      optionalStatic: 0,
      // `(:id)`
      optionalParametrized: 0
    };
    for (let seg of info.segments) {
      info.total++;
      if (seg.parametrized) {
        info.parametrized++;
      } else {
        info.static++;
      }
      if (seg.optional) {
        info.optional++;
        if (seg.parametrized) {
          info.optionalParametrized++;
        } else {
          info.optionalStatic++;
        }
      } else {
        info.required++;
        if (seg.parametrized) {
          info.requiredParametrized++;
        } else {
          info.requiredStatic++;
        }
      }
    }
    return info;
  }
}

export default PathContext;
