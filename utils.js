import config from './config';

/**
 * Converts given argument to URL instance
 *
 * @export
 * @param {string} url - local path
 * @param {boolean} useHashes - if true will build URL instance based on hash routing
 * @returns {URL} URL instance
 */
export function getUrl(url, useHashes) {
  if (url == null) {
    return new URL(document.location.toString());
  } else if (url instanceof URL) {
    return url;
  } else if (typeof url == 'string' && /^https*:\/\//.test(url)) {
    // should throw if origin mismatched
    url = new URL(url);
    if (url.origin != document.location.origin) {
      throw new Error('wrong url origin');
    }
    return url;
  }

  if (useHashes) {
    url = document.location.pathname + document.location.search + '#' + url;
  }

  return new URL(url, document.location.origin);
}

/**
 * normalizes given string to an application path
 *
 * @export
 * @param {string} url - url to normalize
 * @param {boolean} useHashes - If tru will normalize url for hash nased routing
 * @returns {string} normalized application path string
 */
export function buildPath(url, useHashes) {
  url = getUrl(url, useHashes);
  if (useHashes) {
    let hash = url.hash.substring(1);
    let hashUrl = getUrl(hash, false);
    let path = hashUrl.pathname;
    return path;
  } else {
    return url.pathname + url.search + url.hash;
  }
}

/**
 * Helper to create application urls, with parameters replacement
 * @example
 * `<a href="${url('foo/bar/:id', { id: 123 })}"></a>`
 * if config.useHashes is `true` then will produce "/#/foo/bar/123" url
 * if not then will produce "/foo/bar/123" url
 * @export
 * @param {string[]} chunks
 * @returns {string}
 */
export function normalizeUrl(urlText = '', args) {

  let useHashes = config.useHashes;

  urlText = replaceUrlParams(urlText, args);

  if (urlText.length) {
    // converts `#asd/qwe` to `asd/qwe`
    if (urlText[0] === '#' && useHashes) {
      urlText = urlText.substring(1);
    }

    // converts `asd/qwe` to `/asd/qwe`
    if (urlText[0] !== '/') {
      urlText = '/' + urlText;
    }

  } else {
    urlText = '/';
  }

  // converts `/asd/qwe` to `/#/asd/qwe` if useHashes is true
  let res = useHashes ? '/#' + urlText : urlText;
  return res;

}


function _matcher(args, ifNoMatch, match, group) {
  if (group in args) {
    let val = args[group];
    if (match.indexOf('/') > -1) {
      val = '/' + val;
    }
    return val;
  } else {
    return ifNoMatch != null ? ifNoMatch : match;
  }
};

/**
 * Will replace parameters with values from given object: '/qwe/zxc/:id', { id: 123 } -> /qwe/zxc/123 
 * @param {string} url - url
 * @param {object} args - object with url parameters value
 * @returns replaced string
 */
export function replaceUrlParams(url, args) {
  if (!url || !(args && typeof args === 'object')) { return url; }

  url = url.replace(/\(\/\)/g, '');
  let pat1 = /\(\/*:(\w[\w\d_-]*)\)/g;
  let pat2 = /:(\w[\w\d_-]*)/g;
  let matcher = _matcher.bind(null, args, '');

  url = url.replace(pat1, matcher);

  matcher = _matcher.bind(null, args, null);
  url = url.replace(pat2, matcher);
  return url.replace(/(?<!:)\/+/g, '/');
}


export function addValue(entity, key, value) {
  if (Array.isArray(entity[key])) {
    entity[key].push(value);
  } else if (key in entity) {
    entity[key] = [entity[key], value];
  } else {
    entity[key] = value;
  }
}

export function buildSegments(url) {
  url = getUrl(url);
  let paths = url.pathname.substring(1);
  paths = paths.replace(/\(\/\)$/, '').replace(/\(\//g, '/(');
  let result = paths.split('/');
  if (result.length > 1 && !result[result.length - 1]) {
    result.pop();
  }
  return result;
}

function cmp(a, b, fn) {
  let av = fn(a);
  let bv = fn(b);
  return av < bv ? -1 : av > bv ? 1 : 0;
}

export function compare(a, b, arg) {
  let result = 0;
  if (typeof arg == 'function') {
    return cmp(a, b, arg);
  } else if (Array.isArray(arg)) {
    arg.every(fn => {
      result = compare(a, b, fn);
      return result === 0;
    });
  }
  return result;
}

export function comparator(...cmps) {
  let result = 0;
  if (
    cmps.every(([a, b, arg]) => {
      result = compare(a, b, arg);
      return result === 0;
    })
  ) {
    return 0;
  } else {
    return result;
  }
}


export function invoke(method, context, ...args) {

  if (typeof method !== 'function') {
    return method;
  }

  if (args.length === 1) {
    return method.call(context, args[0]);
  } else {
    return method.apply(context, args);
  }

}