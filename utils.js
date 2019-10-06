export function getUrl(url) {
  if (url == null) {
    return new URL(document.location.toString());
  } else if (url instanceof URL) {
    return url;
  } else if (/^https*:\/\//.test(url)) {
    return new URL(url);
  }

  if (!url.toString().startsWith("/")) {
    url = "/" + url;
  }

  return new URL(url, document.location.origin);
}

export function buildPath(url, useHashes) {
  url = getUrl(url);
  if (useHashes) {
    return url.hash.substring(1);
  } else {
    return url.pathname + url.search + url.hash;
  }
}
