import routing from '../..';
const config = routing.config;
const DefaultRouter = config.Router;
const DefaultRouteHandler = config.RouteHandler;
const DefaultResponseContext = config.ResponseContext;
const DefaultRequestContext = config.RequestContext;
const hndl = cb => {
  return (r, s, n) => {
    let res = cb && cb(r);
    if (res === false) {
      return;
    }
    n();
  };
};
const handler1 = (req, res, next) => next && next();
const handler2 = (req, res, next) => next && next();

let route = '';

describe('Router', function() {
  let instance;
  beforeEach(function() {
    instance = new DefaultRouter();
    instance.get(route, handler1);
    config.isStarted = false;
    global.history.states = [{ url: global.baseUrl.toString() }];
  });

  afterEach(function() {
    config.Router = DefaultRouter;
    config.RouteHandler = DefaultRouteHandler;
    config.RequestContext = DefaultRequestContext;
    config.ResponseContext = DefaultResponseContext;
    document.location.href = 'http://localhost';
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
      let spy = this.sinon.spy(instance, 'navigate');
      instance.start({ trigger: false });
      expect(spy).to.not.been.called;
    });
    it('should trigger on start if trigger is true', function() {
      let spy = this.sinon.spy(instance, 'navigate');
      instance.start({ trigger: true });
      expect(spy).to.be.calledOnce;
    });
    it('should trigger on start if trigger is not set', function() {
      let spy = this.sinon.spy(instance, 'navigate');
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
      let spy = this.sinon.spy(instance, 'setErrorHandlers');
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
      let spy = this.sinon.spy(instance, 'setErrorHandlers');
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
      let spy = this.sinon.spy(instance, 'add');
      instance.use('test-test', handler1);
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql(['test-test', [handler1], true]);
    });
    it('if called with incorrect arguments should not do anything', function() {
      let spy = this.sinon.spy(instance, 'add');
      let result = instance.use();
      expect(spy).to.not.been.called;
      expect(instance._globalMiddlewares.length).to.be.equal(0);
      expect(result).to.be.equal(instance);
    });
  });
  describe('get', function() {
    it('should proxy call to `add` with given arguments', function() {
      let spy = this.sinon.spy(instance, 'add');
      instance.get(route, handler1, handler2);
      expect(spy).to.be.calledOnce.and.calledWith(route, [handler1, handler2]);
    });
    it('should proxy call to `add` with given arguments', function() {
      let spy = this.sinon.spy(instance, 'add');
      instance.get();
      expect(spy).to.be.calledOnce.and.calledWith(undefined, []);
    });
  });
  describe('add', function() {
    it('should throw error if url absolute and with another origin', function() {
      expect(
        instance.add.bind(instance, 'http://somehost.com/some/route', [
          handler1
        ])
      ).to.throw();

      expect(
        instance.add.bind(instance, 'http://somehost.com/some/route')
      ).to.throw();
    });
    it('should not throw error if url absolute with same origin', function() {
      expect(
        instance.add.bind(instance, 'http://localhost/some/route', [handler1])
      ).to.not.throw();

      expect(
        instance.add.bind(instance, 'http://localhost/some/route')
      ).to.not.throw();
    });

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
      let spy = this.sinon.spy(DefaultRouteHandler.prototype, 'addMiddlewares');
      instance.add(route, [handler2, handler1], true);
      expect(spy).to.be.calledOnce.and.calledWith([handler2, handler1], true);
    });
    it('should treat urls with leading slash equal to urls without leading slash', function() {
      let path = 'foo/bar/baz';
      let handler1 = instance.add(path);
      let handler2 = instance.add('/' + path);
      expect(handler1).to.be.equal(handler2);
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
    it('should return removed routeHandler', function() {
      let handler1 = instance.add('path/to/remove', [() => {}]);
      let handler2 = instance.remove('path/to/remove');
      expect(handler1)
        .to.be.equal(handler2)
        .and.be.instanceOf(DefaultRouteHandler);
    });
    it('should return undefined if no routeHandler founded', function() {
      let handler = instance.remove('some-path');
      expect(handler).to.be.undefined;
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
      let spy = this.sinon.spy(DefaultRouteHandler.prototype, 'testRequest');
      instance.testRouteHandler('', handler);
      expect(spy).to.be.calledOnce;
    });
  });
  describe('error handling', function() {
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
        instance = new DefaultRouter({
          errorHandlers: {
            default: () => 'default',
            error1: () => 'error1',
            error2: () => 'error2'
          }
        });
        spyDefault = this.sinon.spy(instance._errorHandlers, 'default');
        spyError1 = this.sinon.spy(instance._errorHandlers, 'error1');
        spyError2 = this.sinon.spy(instance._errorHandlers, 'error2');
      });
      it('should merge handlers', function() {
        let error1 = this.sinon.spy();
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
        let defaultSpy = this.sinon.spy();
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
      it('should be able accept only errorHandlers hash and use merge approach in this case', function() {
        let defaultSpy = this.sinon.spy();
        let nextSpy = this.sinon.spy();
        instance.setErrorHandlers(
          {
            default: defaultSpy
          },
          {
            error2: nextSpy
          }
        );
        instance.handleError('error1');
        instance.handleError('error2');
        instance.handleError('default');
        expect(defaultSpy).to.be.calledOnce;
        expect(spyError1).to.be.calledOnce;
        expect(spyError2).to.not.be.called;
        expect(nextSpy).to.be.calledOnce;
      });
      it('should be able accept only errorHandlers array of hash and use merge approach in this case', function() {
        let defaultSpy = this.sinon.spy();
        let nextSpy = this.sinon.spy();
        instance.setErrorHandlers([
          {
            default: defaultSpy
          },
          {
            error2: nextSpy
          }
        ]);
        instance.handleError('error1');
        instance.handleError('error2');
        instance.handleError('default');
        expect(defaultSpy).to.be.calledOnce;
        expect(spyError1).to.be.calledOnce;
        expect(spyError2).to.not.be.called;
        expect(nextSpy).to.be.calledOnce;
      });
    });
    describe('handleError', function() {
      let OopsError;
      let errorHandle;
      beforeEach(function() {
        OopsError = new Error('oops');
        instance.get('/throw', () => {
          throw OopsError;
        });
        instance.get('custom', (r, res) => {
          res.setError('custom');
        });
        instance.get('javascript', (r, res) => {
          res.setError(OopsError);
        });

        instance.start();
      });

      describe('when called', function() {
        //let spy;
        beforeEach(function() {
          errorHandle = this.sinon.spy(instance, 'handleError');
        });

        it('should be called with `notfound` if there is no route handler', function() {
          instance.navigate('foo/bar');
          expect(errorHandle).to.be.calledOnce.and.calledWith('notfound');
        });
        it('should be called with given custom error', async function() {
          await instance.navigate('custom');
          expect(errorHandle).to.be.calledOnce.and.calledWith('custom');
        });
        it('should be called with js error', async function() {
          await instance.navigate('javascript');
          expect(errorHandle).to.be.calledOnce.and.calledWith(OopsError);
        });
        it('should be called with js error when throw', async function() {
          await instance.navigate('throw');
          expect(errorHandle).to.be.calledOnce.and.calledWith(OopsError);
        });
        it('should be called with given custom error', async function() {
          await instance.navigate('custom');
          expect(errorHandle).to.be.calledOnce.and.calledWith('custom');
        });
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
    it("should call routeHandler's processRequest with passed globalMiddlewares if routeHandler exist", function() {
      let spy = this.sinon.spy(DefaultRouteHandler.prototype, 'processRequest');
      instance.get('foo/bar', () => {});
      let glblmw = () => {};
      instance.use(glblmw);
      instance.navigate('foo/bar');
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args[2].globalMiddlewares).to.be.eql([glblmw]);
    });
    it('should delegate to correct routeHandler with strictly defined routes', function() {
      let res = '';
      let mw1 = hndl(() => (res = 'foo'));
      let mw2 = hndl(() => (res = 'foo/bar'));
      instance.get('foo', mw1);
      instance.get('foo/bar', mw2);

      instance.navigate('foo/bar');
      expect(res).to.be.equal('foo/bar');

      instance.navigate('foo');
      expect(res).to.be.equal('foo');

      instance.remove('foo');
      instance.remove('foo/bar');
      instance.get('foo', mw1);
      instance.get('foo/bar', mw2);

      instance.navigate('foo');
      expect(res).to.be.equal('foo');

      instance.navigate('foo/bar');
      expect(res).to.be.equal('foo/bar');
    });
    it('should delegate to correct routeHandler', function() {
      let res = '';
      let mw1 = hndl(r => (res = `${r.args.action}:${r.args.id}`));
      let mw2 = hndl(() => (res = `some`));

      instance.get('foo/:action/some', mw2);
      instance.get('foo/:action/:id', mw1);
      instance.get('foo/:action', mw1);

      instance.navigate('foo/bar');
      expect(res).to.be.equal('bar:undefined');
      res = 0;

      instance.navigate('foo');
      expect(res).to.be.equal(0);

      instance.navigate('foo/bar/some');
      expect(res).to.be.equal('some');

      instance.navigate('foo/bar/123');
      expect(res).to.be.equal('bar:123');
      res = 0;

      instance.navigate('foo/bar/123/123');
      expect(res).to.be.equal(0);

      instance.get('bar/:action-foo(-:id)', mw1);
      instance.navigate('bar/bar-foo');
      expect(res).to.be.equal('bar:undefined');
      instance.navigate('bar/bar-foo-123');
      expect(res).to.be.equal('bar:123');

      instance.get('bar/:action-:id/(baraban)', mw1);
      instance.navigate('bar/bar-foo/');
      expect(res).to.be.equal('bar:foo');

      instance.navigate('bar/barbar-foofofo/baraban');
      expect(res).to.be.equal('barbar:foofofo');

      instance.navigate('bar/piw-piw/caravan');
      expect(res).to.be.equal('barbar:foofofo');
    });

    describe('trailingSlash', function() {
      afterEach(function() {
        config.trailingSlashSensitive = false;
      });
      it('should correctly handle # in the url if trailingSlashSensitive is false', async function() {
        let mw1 = sinon.spy();
        let mw2 = sinon.spy();

        instance.get('', mw1);
        instance.get('foo/bar', mw2);

        await instance.navigate('http://localhost#/test');

        await instance.navigate('foo/bar#/test');

        await instance.navigate('http://localhost/#/test');

        await instance.navigate('/foo/bar/#/test');
        expect(mw1.callCount).to.be.equal(2);
        expect(mw2.callCount).to.be.equal(2);
      });
    });
  });
  describe('hash based navigate', function() {
    beforeEach(function() {
      instance.start({ trigger: false, useHashes: true });
    });

    it('should delegate to correct routeHandler', function() {
      let res = '';
      let mw1 = hndl(r => (res = `${r.args.action}:${r.args.id}`));
      let mw2 = hndl(() => (res = `some`));

      instance.get('foo/:action/some', mw2);
      instance.get('foo/:action/:id', mw1);
      instance.get('foo/:action', mw1);

      instance.navigate('foo/bar');
      expect(res).to.be.equal('bar:undefined');
      res = 0;

      instance.navigate('foo');
      expect(res).to.be.equal(0);

      instance.navigate('foo/bar/some');
      expect(res).to.be.equal('some');

      instance.navigate('foo/bar/123');
      expect(res).to.be.equal('bar:123');
      res = 0;

      instance.navigate('foo/bar/123/123');
      expect(res).to.be.equal(0);
    });

    it('should delegate to correct routeHandler with strictly defined routes', function() {
      let res = '';
      let mw1 = hndl(() => (res = 'foo'));
      let mw2 = hndl(() => (res = 'foo/bar'));
      instance.get('foo', mw1);
      instance.get('foo/bar', mw2);

      instance.navigate('foo/bar');
      expect(res).to.be.equal('foo/bar');

      instance.navigate('foo');
      expect(res).to.be.equal('foo');

      instance.remove('foo');
      instance.remove('foo/bar');
      instance.get('foo', mw1);
      instance.get('foo/bar', mw2);

      instance.navigate('foo');
      expect(res).to.be.equal('foo');

      instance.navigate('foo/bar');
      expect(res).to.be.equal('foo/bar');
    });

    it('should change hash instead path', function() {
      let path = 'foo/bar/zoo';
      instance.get(path, () => {});
      instance.navigate(path);
      expect(document.location.hash).to.be.equal('#' + path);
    });
  });
  describe('popstate', function() {
    let mw1;
    let mw2;
    let mw3;
    let mw4;
    let nav;
    beforeEach(function() {
      mw1 = sinon.spy();
      mw2 = sinon.spy();
      mw3 = sinon.spy();
      mw4 = sinon.spy();
      nav = sinon.spy(instance, 'navigate');
      instance.get('route1', mw1);
      instance.get('route2', mw2);
      instance.get('route3', mw3);
      instance.get('route4', mw4);
      instance.start({ trigger: false });
    });
    it('should call navigate on popstate', async function() {
      await instance.navigate('route1');
      await instance.navigate('route2');
      await instance.navigate('route3');
      await instance.navigate('route4');
      await history.popState();

      expect(nav.callCount).to.be.equal(5);
      expect(mw3).to.be.calledTwice;
    });
    it('should be able handle wrong popstate', async function() {
      await instance.navigate('route1');
      expect(history.popState.bind(history)).to.not.throw();
      await instance.navigate('route1');
      await instance.navigate('route1');
      expect(
        history.popState.bind(history, { wrongArgs: true })
      ).to.not.throw();

      expect(window.onpopstate).to.not.throw();
    });
  });
});
