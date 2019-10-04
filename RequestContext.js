import { getUrl, buildPath } from './utils';
import config from './config';

class RequestContext {
	constructor(url) {
		this.url = this._getUrl(url);
		this.path = this._buildPath();
		this.args = {};
		this.search = this._buildSearch();

	}
	_getUrl(url) {
		return getUrl(url);
	}
	_buildPath() {
		return buildPath(this.url, config.pushState);
	}
	_buildSearch() {
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
