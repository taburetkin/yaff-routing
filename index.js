import config from './config' ;
import Routing from './Routing';
import RouteHandler from './RouteHandler';
import RequestContext from './RequestContext';
import ResponseContext from './ResponseContext';

config.Routing = Routing;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;

export default {
	_ensureRouting() {
		if (!this.routing) {
			this.routing = new config.Routing(config.routingOptions);
		}
		return this.routing;
	},
	get() {
		return this._ensureRouting().get(...arguments);
	},
	use() {
		return this._ensureRouting().use(...arguments);
	},
	isStarted() {
		return this.routing && this.routing.isStarted();
	},
	start(options) {
		return this
			._ensureRouting()
			.start(options);
	},
	stop() {
		return this.isStarted() && this.routing.stop();
	},
	remove() {
		return this
			._ensureRouting()
			.remove(...arguments);
	},
	config
};
