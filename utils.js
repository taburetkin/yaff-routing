export function getUrl(url, useHashes) {
  if (url == null) {
    return new URL(document.location.toString());
  } else if (url instanceof URL) {
    return url;
  } else if (/^https*:\/\//.test(url)) {
    return new URL(url);
  }

  url = leadingSlash(url);

  if (useHashes) {
    url = document.location.pathname + document.location.search + '#' + url;
  }

  return new URL(url, document.location.origin);
}

function leadingSlash(url) {
  url = url.toString();
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  return url;
}

export function buildPath(url, useHashes) {
  url = getUrl(url, useHashes);
  if (useHashes) {
    let hash = url.hash.substring(1);
    return hash;
  } else {
    return url.pathname + url.search + url.hash;
  }
}
