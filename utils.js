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
 * Helper to create application urls
 * @example
 * `<a href="${url('foo/bar')}"></a>`
 * if config.useHashes is `true` then will produce "/#/foo/bar" url
 * if not then will produce "/foo/bar" url
 * @export
 * @param {string[]} chunks
 * @returns {string}
 */
export function url(...chunks) {
  if (!chunks || chunks.length == 0) {
    chunks = [''];
  }

  chunks = chunks.map(chunk => {
    if (chunk == '' || chunk == null) {
      return '';
    }
    if (chunk[0] !== '/') {
      chunk = '/' + chunk;
    }
    return chunk;
  });

  if (chunks[0][0] !== '/') {
    chunks[0] = '/' + chunks[0];
  }

  if (config.useHashes) {
    chunks[0] = '/#' + chunks[0];
  }

  return chunks.join('');
}
