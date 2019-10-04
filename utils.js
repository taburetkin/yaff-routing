export function getUrl(url) {
	if (url == null) {
		return new URL(document.location.toString());
	} else if (url instanceof URL) {
		return url;
	} else if (/^https*:\/\//.test(url)) {
		return new URL(url);
	}

	if (!url.startsWith('/')) {
		url = '/' + url;
	}

	return new URL(url, document.location.origin);
}

export function buildPath(url, pushState) {
	url = getUrl(url);
	if (pushState) {
		return url.pathname + url.search + url.hash;
	} else {
		return url.hash.substring(1);
	}
}
