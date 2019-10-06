import routing from '../..';
const config = routing.config;
const DefaultRouting = config.Routing;
const DefaultRouteHandler = config.RouteHandler;
const DefaultResponseContext = config.ResponseContext;
const DefaultRequestContext = config.RequestContext;
const handler1 = (req, res, next) => next && next();
const handler2 = (req, res, next) => next && next();

let route = '';

describe('Routing', function() {
  let instance;
  beforeEach(function() {
    instance = new DefaultRouting({
      errorHandlers: {
        default: () => 'default',
        error1: () => 'error1',
        error2: () => 'error2'
      }
    });
    instance.get(route, handler1);
    config.isStarted = false;
  });

  afterEach(function() {
    config.Routing = DefaultRouting;
    config.RouteHandler = DefaultRouteHandler;
    config.RequestContext = DefaultRequestContext;
    config.ResponseContext = DefaultResponseContext;
  });

  describe('start and stop', function() {
    it('when started and stoped config.isStarted should became true or false respectively', function() {
      expect(config.isStarted).to.be.false;
      instance.start();
      expect(config.isStarted).to.be.true;
      instance.stop();
      expect(config.isStarted).to.be.false;
    });
    it('should not throw if stoped before started', function() {
      expect(instance.stop.bind(instance)).to.not.throw();
      expect(instance.stop.bind(instance)).to.not.throw();
    });
    it('when started should throw on second start if it was not stopped', function() {
      instance.start();
      expect(instance.start.bind(instance)).to.throw();
    });
    it('should not throw if started after stop', function() {
      instance.start();
      instance.stop();
      expect(instance.start.bind(instance)).to.not.throw();
    });
    it('should not trigger on start if trigger is false', function() {
      let spy = sinon.spy(instance, 'navigate');
      instance.start({ trigger: false });
      expect(spy).to.not.been.called;
    });
    it('should trigger on start if trigger is true', function() {
      let spy = sinon.spy(instance, 'navigate');
      instance.start({ trigger: true });
      expect(spy).to.be.calledOnce;
    });
    it('should trigger on start if trigger is not set', function() {
      let spy = sinon.spy(instance, 'navigate');
      instance.start({});
      expect(spy).to.be.calledOnce;
    });
    it('should take useHashes option on start', function() {
      config.useHashes = false;
      instance.start({ useHashes: true });
      expect(config.useHashes).to.be.true;
      instance.stop();
      instance.start({ useHashes: false });
      expect(config.useHashes).to.be.false;
    });
    it('should call setErrorHandlers if errorHandlers passed', function() {
      let spy = sinon.spy(instance, 'setErrorHandlers');
      let handlers = {
        test: handler1
      };
      instance.start({
        errorHandlers: handlers
      });
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([undefined, handlers]);
    });
    it('should call setErrorHandlers with correct replaceErrorHandlers options if errorHandlers passed and ', function() {
      let spy = sinon.spy(instance, 'setErrorHandlers');
      let handlers = {
        test: handler1
      };
      instance.start({
        replaceErrorHandlers: false,
        errorHandlers: handlers
      });
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([false, handlers]);

      instance.stop();
      instance.start({
        replaceErrorHandlers: true,
        errorHandlers: handlers
      });
      expect(spy.getCall(1).args).to.be.eql([true, handlers]);
    });
  });

  describe('isStarted', function() {
    it('should return false if not started and true if started', function() {
      expect(instance.isStarted()).to.be.false;
      instance.start();
      expect(instance.isStarted()).to.be.true;
      instance.stop();
      expect(instance.isStarted()).to.be.false;
    });
  });

  describe('use', function() {
    it('should add globalhandler if called with function argument', function() {
      expect(instance._globalMiddlewares.length).to.be.equal(0);
      instance.use(handler1);
      expect(instance._globalMiddlewares.length).to.be.equal(1);
      expect(instance._globalMiddlewares[0]).to.be.equal(handler1);
      instance.use(handler2);
      expect(instance._globalMiddlewares.length).to.be.equal(2);
      expect(instance._globalMiddlewares[0]).to.be.equal(handler1);
      expect(instance._globalMiddlewares[1]).to.be.equal(handler2);
    });
    it('should call `add` if called with two arguments string, func', function() {
      let spy = sinon.spy(instance, 'add');
      instance.use('test-test', handler1);
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql(['test-test', [handler1], true]);
    });
    it('if called with incorrect arguments should not do anything', function() {
      let spy = sinon.spy(instance, 'add');
      let result = instance.use();
      expect(spy).to.not.been.called;
      expect(instance._globalMiddlewares.length).to.be.equal(0);
      expect(result).to.be.equal(instance);
    });
  });
  describe('get', function() {
    it('should proxy call to `add` with given arguments', function() {
      let spy = sinon.spy(instance, 'add');
      instance.get(route, handler1, handler2);
      expect(spy).to.be.calledOnce.and.calledWith(route, [handler1, handler2]);
    });
    it('should proxy call to `add` with given arguments', function() {
      let spy = sinon.spy(instance, 'add');
      instance.get();
      expect(spy).to.be.calledOnce.and.calledWith(undefined, []);
    });
  });
  describe('add', function() {
    it('should return undefined if path unset', function() {
      let res = instance.add(undefined, []);
      expect(res).to.be.undefined;
    });
    it('should return routeHandler if arguments correct', function() {
      let res = instance.add('', [handler1]);
      expect(res).to.be.instanceOf(config.RouteHandler);
    });
    it('should return routeHandler if provided custom RouteHandler Class', function() {
      class MyHandler extends config.RouteHandler {}
      config.RouteHandler = MyHandler;
      let res = instance.add('myown', [handler2]);
      expect(res).to.be.instanceOf(MyHandler);
    });
    it('should add routeHandler into routes manager', function() {
      instance.add(route, [handler2]);
      expect(instance.routes.has(route)).to.be.true;
    });
    it("should proxy call to routeHandler's addHandler", function() {
      let spy = sinon.spy(DefaultRouteHandler.prototype, 'addMiddlewares');
      instance.add(route, [handler2, handler1], true);
      expect(spy).to.be.calledOnce.and.calledWith([handler2, handler1], true);
    });
  });
  describe('remove', function() {
    it('should remove global handler', function() {
      instance.use(handler2);
      instance.use(handler1);
      instance.remove(handler2);
      expect(instance._globalMiddlewares.length).to.be.equal(1);
      expect(instance._globalMiddlewares[0]).to.be.equal(handler1);
    });
    it('should remove routeHandler', function() {
      instance.get('test', handler1);
      instance.get('test2', handler2);
      instance.remove('test2');
      expect(instance.routes.has('test2')).to.be.false;
    });
    it("should remove routeHandler's middleware", function() {
      instance.get('test', handler1, handler2);
      instance.remove('test', handler1);
      expect(instance.routes.has('test')).to.be.true;
      let handler = instance.routes.get('test');
      expect(handler.middlewares.length).to.be.equal(1);
      expect(handler.hasMiddleware(handler2)).to.be.true;
    });
  });
  describe('createRequestContext', function() {
    it('should return instance of config.RequestContext when using own RequestContext', function() {
      class MyRouteContext extends config.RequestContext {}
      config.RequestContext = MyRouteContext;
      let context = instance.createRequestContext('');
      expect(context).to.be.instanceOf(MyRouteContext);
    });
    it('should return instance of config.RequestContext', function() {
      let context = instance.createRequestContext('');
      expect(context).to.be.instanceOf(config.RequestContext);
    });
  });
  describe('createResponseContext', function() {
    it('should return instance of config.ResponseContext when using own ResponseContext', function() {
      class MyContext extends config.ResponseContext {}
      config.ResponseContext = MyContext;
      let context = instance.createResponseContext('');
      expect(context).to.be.instanceOf(MyContext);
    });
    it('should return instance of config.ResponseContext', function() {
      let context = instance.createResponseContext('');
      expect(context).to.be.instanceOf(config.ResponseContext);
    });
  });
  describe('findRouteHandler', function() {
    beforeEach(function() {
      instance.get('route1/subroute1', handler1);
      instance.get('route1', handler1);
      instance.get('route2/subroute2', handler2);
      instance.get('route2', handler2);
    });
    it('should return routeHandler', function() {
      let handler = instance.findRouteHandler('route2');
      expect(handler).to.be.instanceOf(config.RouteHandler);
      expect(handler.hasMiddleware(handler2)).to.be.true;
      expect(handler.path).to.be.equal('/route2');

      handler = instance.findRouteHandler('route2/subroute2');
      expect(handler).to.be.instanceOf(config.RouteHandler);
      expect(handler.hasMiddleware(handler2)).to.be.true;
      expect(handler.path).to.be.equal('/route2/subroute2');
    });
  });
  describe('testRouteHandler', function() {
    beforeEach(function() {
      instance.get('route1/subroute1', handler1);
      instance.get('route1', handler1);
      instance.get('route2/subroute2', handler2);
      instance.get('route2', handler2);
    });
    it('should return correct handler', function() {
      let handler = instance.findRouteHandler('route2');
      let spy = sinon.spy(DefaultRouteHandler.prototype, 'testRequest');
      instance.testRouteHandler('', handler);
      expect(spy).to.be.calledOnce;
    });
  });
  describe('error handling', function() {
    beforeEach(function() {});
    describe('getErrorHandlerName', function() {
      it('should return `exception` if error is instanceof Error', function() {
        let res = instance.getErrorHandlerName(new Error());
        expect(res).to.be.equal('exception');
      });
      it('should return given string value if error is a string', function() {
        let res = instance.getErrorHandlerName('my-error');
        expect(res).to.be.equal('my-error');
      });
      it('should return `default` if error not an error or string', function() {
        let res = instance.getErrorHandlerName();
        expect(res).to.be.equal('default');
        res = instance.getErrorHandlerName({});
        expect(res).to.be.equal('default');
        res = instance.getErrorHandlerName([]);
        expect(res).to.be.equal('default');
        res = instance.getErrorHandlerName(123);
        expect(res).to.be.equal('default');
      });
    });
    describe('setErrorHandlers', function() {
      let spyError1;
      let spyError2;
      let spyDefault;
      beforeEach(function() {
        spyDefault = sinon.spy(instance._errorHandlers, 'default');
        spyError1 = sinon.spy(instance._errorHandlers, 'error1');
        spyError2 = sinon.spy(instance._errorHandlers, 'error2');
      });
      it('should merge handlers', function() {
        let error1 = sinon.spy();
        instance.setErrorHandlers(false, {
          error1
        });
        instance.handleError('error1');
        instance.handleError('error2');
        expect(error1).to.be.calledOnce;
        expect(spyError1).to.be.not.called;
        expect(spyError2).to.be.calledOnce;
      });
      it('should replace handlers', function() {
        let defaultSpy = sinon.spy();
        instance.setErrorHandlers(true, {
          default: defaultSpy
        });
        instance.handleError('error1');
        instance.handleError('error2');
        expect(spyError1).to.be.not.called;
        expect(spyError2).to.be.not.called;
        expect(spyDefault).to.be.not.called;
        expect(defaultSpy).to.be.calledTwice;
      });
    });
  });

  describe('navigate', function() {
    beforeEach(function() {
      instance.start({ trigger: false });
    });
    it('should throw if not started', function() {
      instance.stop();
      expect(instance.navigate.bind(instance)).to.throw();
    });
    it('should call handleError with `notfound` if there is no route handler', function() {
      let spy = sinon.spy(instance, 'handleError');
      instance.navigate('foo/bar');
      expect(spy).to.be.calledOnce.and.calledWith('notfound');
    });
    it("should call routeHandler's processRequest if routeHandler exist", function() {
      let spy = sinon.spy(DefaultRouteHandler.prototype, 'processRequest');
      instance.get('foo/bar', () => {});
      let glblmw = () => {};
      instance.use(glblmw);
      instance.navigate('foo/bar');
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args[2].globalMiddlewares).to.be.eql([glblmw]);
    });
  });
});
