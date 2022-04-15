import config from './config';
import Router from './Router';
import RouteHandler from './RouteHandler';
import RequestContext from './RequestContext';
import ResponseContext from './ResponseContext';
import RoutesManager from './RoutesManager';

import routing from './routing';

config.Router = Router;
config.RouteHandler = RouteHandler;
config.RequestContext = RequestContext;
config.ResponseContext = ResponseContext;
config.RoutesManager = RoutesManager;

export {
  routing,
  config,
  Router,
  RouteHandler,
  RequestContext,
  ResponseContext,
  RoutesManager
};
