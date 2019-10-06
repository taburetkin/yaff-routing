import routing from '../..';
const config = routing.config;
const DefaultRouting = config.Routing;
const DefaultRouteHandler = config.RouteHandler;
const handler1 = (req, res, next) => next && next();
const handler2 = (req, res, next) => next && next();
const proto = DefaultRouting.prototype;
let route = '';

describe('Routing', function() {
  let instance;
  beforeEach(function() {
    instance = new DefaultRouting();
    instance.get(route, handler1);
    config.isStarted = false;
  });

  afterEach(function() {
    config.Routing = DefaultRouting;
    config.RouteHandler = DefaultRouteHandler;
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
      let spy = sinon.spy(DefaultRouteHandler.prototype, 'addHandlers');
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
  });
});
