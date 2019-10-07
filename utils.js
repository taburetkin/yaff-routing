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
    return new URL(url);
  }

  url = leadingSlash(url);

  if (useHashes) {
    url = document.location.pathname + document.location.search + '#' + url;
  }

  return new URL(url, document.location.origin);
}

/** converts given argument to string and append leading slash to it */
function leadingSlash(url) {
  url = url.toString();
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  return url;
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
    return hash;
  } else {
    return url.pathname + url.search + url.hash;
  }
}
