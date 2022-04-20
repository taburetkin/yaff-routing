// import { buildSegments } from '../../utils';

//import RouteHandler from "../../RouteHandler";
//import routing from "../../routing";

// import PathContext from '../../PathContext';
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

describe('Router', function () {
  let instance;
  beforeEach(function () {
    routing.stop();
    instance = new DefaultRouter();
    routing.use(instance);
    instance.get(route, handler1);
  });

  afterEach(function () {
    config.Router = DefaultRouter;
    config.RouteHandler = DefaultRouteHandler;
    config.RequestContext = DefaultRequestContext;
    config.ResponseContext = DefaultResponseContext;
    document.location.href = 'http://localhost';
  });

  describe('constructing instance', () => {
    describe('options', function () {
      let router;
      let startHook;
      let endHook;

      beforeEach(function () {
        startHook = this.sinon.spy();
        endHook = this.sinon.spy();
        router = new DefaultRouter({
          errorHandlers: { default: () => { } },
          onRequestStart: startHook,
          onRequestEnd: endHook,
        });
        routing.start({ trigger: false });
      });

      it('should set onRequestStart hook', () => {
        expect(router.onRequestStart).to.be.equal(startHook);
      });
      it('should set onRequestEnd hook', () => {
        expect(router.onRequestEnd).to.be.equal(endHook);
      });
      it('should invoke both hooks', () => {
        router._processRequest('/asd/qwe');
        expect(startHook).to.be.calledOnce;
        expect(endHook).to.be.calledOnce;
      });
    });
    it('should not throw even if there is no RouteManager in config', () => {
      let RoutesManager = config.RoutesManager;
      delete config.RoutesManager;

      let error;
      try {
        new DefaultRouter();
      } catch (e) {
        error = e;
      }

      config.RoutesManager = RoutesManager;

      expect(error).to.be.undefined;
    });
  });


  describe('isRoutingStarted', function () {
    it('should return false if routing not started and true if started', function () {
      expect(instance.isRoutingStarted()).to.be.false;
      routing.start({ trigger: false });
      expect(instance.isRoutingStarted()).to.be.true;
      routing.stop();
      expect(instance.isRoutingStarted()).to.be.false;
    });
  });

  describe('hasNestedRouter', () => {
    it('should return false if falsy argument provided', () => {
      expect(instance.hasNestedRouter.bind(instance, null)).to.not.throw();
    });
  });



  describe('getRouteContexts circular nesting', () => {
    it('getRouteContexts should be able detect circular router nesting', () => {
      let router = new DefaultRouter();
      let handler = new DefaultRouteHandler('somepath', router);
      router.routes.add(handler);
      expect(router.getRouteContexts.bind(router)).to.throw();
    });
  });

  describe('should not allow use navigate on nested router', () => {
    it('should not allow use navigate on nested router', () => {
      let router = new DefaultRouter();
      let nested = new DefaultRouter();
      router.add('something', nested);
      expect(nested.navigate.bind(nested)).to.throw();
    });
  });

  describe('use', function () {
    it('should add globalhandler if called with function argument', function () {
      expect(instance._globalMiddlewares.length).to.be.equal(0);
      instance.use(handler1);
      expect(instance._globalMiddlewares.length).to.be.equal(1);
      expect(instance._globalMiddlewares[0]).to.be.equal(handler1);
      instance.use(handler2);
      expect(instance._globalMiddlewares.length).to.be.equal(2);
      expect(instance._globalMiddlewares[0]).to.be.equal(handler1);
      expect(instance._globalMiddlewares[1]).to.be.equal(handler2);
    });
    it('should call `add` if called with two arguments string, func', function () {
      let spy = this.sinon.spy(instance, 'add');
      instance.use('test-test', handler1);
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql(['test-test', [handler1], true]);
    });
    it('if called with incorrect arguments should not do anything', function () {
      let spy = this.sinon.spy(instance, 'add');
      let result = instance.use();
      expect(spy).to.not.been.called;
      expect(instance._globalMiddlewares.length).to.be.equal(0);
      expect(result).to.be.equal(instance);
    });
  });
  describe('get', function () {
    it('should proxy call to `add` with given arguments', function () {
      let spy = this.sinon.spy(instance, 'add');
      instance.get(route, handler1, handler2);
      expect(spy).to.be.calledOnce.and.calledWith(route, [handler1, handler2]);
    });
    it('should proxy call to `add` with given arguments', function () {
      let spy = this.sinon.spy(instance, 'add');
      instance.get();
      expect(spy).to.be.calledOnce.and.calledWith(undefined, []);
    });

  });
  describe('add', function () {
    it('should not allow circular router nesting', () => {

      let art = new DefaultRouter();
      art.get('article1', () => { });

      let contacts = new DefaultRouter();
      contacts.get('contact1', () => { });

      art.use('contacts', contacts);
      expect(contacts.use.bind(contacts, 'articles', art)).to.throw();
      expect(contacts.use.bind(contacts, 'articles', contacts)).to.throw();
    });
    it('should allow add same router with different path', () => {
      let root = new DefaultRouter();
      let nested = new DefaultRouter();
      root.add('test1', nested);
      //root.add('test2/deepInside', nested);
      expect(root.add.bind(root, 'test2/deepInside', nested)).to.not.throw();
    });
    it('should throw error if url absolute and with another origin', function () {
      expect(
        instance.add.bind(instance, 'http://somehost.com/some/route', [
          handler1
        ])
      ).to.throw();

      expect(
        instance.add.bind(instance, 'http://somehost.com/some/route')
      ).to.throw();
    });
    it('should not throw error if url absolute with same origin', function () {
      expect(
        instance.add.bind(instance, 'http://localhost/some/route', [handler1])
      ).to.not.throw();

      expect(
        instance.add.bind(instance, 'http://localhost/some/route')
      ).to.not.throw();
    });

    it('should return undefined if path unset', function () {
      let res = instance.add(undefined, []);
      expect(res).to.be.undefined;
    });
    it('should return routeHandler if arguments correct and it supposed to be regular handler', function () {
      let res = instance.add('', [handler1]);
      expect(res).to.be.instanceOf(config.RouteHandler);
    });
    it("should throw if arguments correct and it's already initialized as regular routeHandler and `add` called with Router argument", function () {
      expect(instance.add.bind(instance, '', new config.Router())).to.throw();
    });
    it('should return routeHandler if arguments correct and it supposed to be Router handler', function () {
      let res = instance.add('somenewroute', new config.Router());
      expect(res).to.be.instanceOf(config.RouteHandler);
    });
    it('should return routeHandler if provided custom RouteHandler Class', function () {
      class MyHandler extends config.RouteHandler { }
      config.RouteHandler = MyHandler;
      let res = instance.add('myown', [handler2]);
      expect(res).to.be.instanceOf(MyHandler);
    });
    it('should add routeHandler into routes manager', function () {
      instance.add(route, [handler2]);
      expect(instance.routes.has(route)).to.be.true;
    });
    it("should proxy call to routeHandler's addHandler", function () {
      let spy = this.sinon.spy(DefaultRouteHandler.prototype, 'addMiddlewares');
      instance.add(route, [handler2, handler1], true);
      expect(spy).to.be.calledOnce.and.calledWith([handler2, handler1], true);
    });
    it('should treat urls with leading slash equal to urls without leading slash', function () {
      let path = 'foo/bar/baz';
      let handler1 = instance.add(path);
      let handler2 = instance.add('/' + path);
      expect(handler1).to.be.equal(handler2);
    });
  });
  describe('getRouteHanlder', function () {
    let router;
    let mw;
    beforeEach(function () {
      mw = () => { };
      router = new config.Router();
      routing.use(router);
    });
    it('should return handler if handler exists', function () {
      router.get('foo/bar/exist', mw);
      let handler = router.getRouteHandler('foo/bar/exist');
      expect(handler).to.be.instanceOf(config.RouteHandler);
      expect(handler.hasMiddleware(mw)).to.be.true;
    });
    it('should return undefined if there is no handler with thap path', function () {
      let handler = router.getRouteHandler('foo/bar/exist');
      expect(handler).to.be.undefined;
    });
    describe('when nested routers exist', function () {
      let barInFoo;
      let barInAntiFoo;
      let mw2;
      beforeEach(function () {
        mw = () => { };
        mw2 = () => { };
        let foo = new config.Router();
        let antifoo = new config.Router();
        barInFoo = new config.Router();
        barInAntiFoo = new config.Router();

        foo.use('bar', barInFoo);
        antifoo.use('bar', barInAntiFoo);

        router = new config.Router();

        routing.use(router);
        routing.use('foo', foo);
        routing.use(':antifoo', antifoo);
      });
      it('should lookup for correct nested routeHandler and return it', function () {
        barInFoo.get('test', mw);
        barInAntiFoo.get('test', mw2);
        let handler = router.getRouteHandler('foo/bar/test');
        expect(handler).to.be.instanceOf(config.RouteHandler);
        expect(handler.hasMiddleware(mw)).to.be.true;

        handler = router.getRouteHandler('something/bar/test');
        expect(handler).to.be.instanceOf(config.RouteHandler);
        expect(handler.hasMiddleware(mw2)).to.be.true;
      });
      it('should not lookup for nested routeHandler if called with traverse `false`', function () {
        barInFoo.get('test', mw);
        let handler = router.getRouteHandler('foo/bar/test', false);
        expect(handler).to.be.undefined;
      });
    });
  });
  describe('remove', function () {
    it('should remove global handler', function () {
      instance.use(handler2);
      instance.use(handler1);
      instance.remove(handler2);
      expect(instance._globalMiddlewares.length).to.be.equal(1);
      expect(instance._globalMiddlewares[0]).to.be.equal(handler1);
    });
    it('should remove routeHandler', function () {
      instance.get('test', handler1);
      instance.get('test2', handler2);
      instance.remove('test2');
      expect(instance.routes.has('test2')).to.be.false;
    });
    it("should remove routeHandler's middleware", function () {
      instance.get('test', handler1, handler2);
      instance.remove('test', handler1);
      expect(instance.routes.has('test')).to.be.true;
      let handler = instance.routes.get('test');
      expect(handler.middlewares.length).to.be.equal(1);
      expect(handler.hasMiddleware(handler2)).to.be.true;
    });
    it('should return removed routeHandler', function () {
      let handler1 = instance.add('path/to/remove', [() => { }]);
      let handler2 = instance.remove('path/to/remove');
      expect(handler1)
        .to.be.equal(handler2)
        .and.be.instanceOf(DefaultRouteHandler);
    });
    it('should return undefined if no routeHandler founded', function () {
      let handler = instance.remove('some-path');
      expect(handler).to.be.undefined;
    });
    describe('when using with nested routers', function () {
      let foo;
      let mw1;
      let mw2;
      beforeEach(function () {
        mw1 = () => { };
        mw2 = () => { };
        foo = new config.Router();
        foo.get('test', mw1);
        instance.use('foo', foo);
      });
      it("should remove nested routeHandler's middleware", function () {
        let handler = routing.remove('foo/test', mw1);
        expect(handler).to.be.instanceOf(config.RouteHandler);
        handler = instance.getRouteHandler('foo/test');
        expect(handler.hasMiddleware(mw1)).to.be.false;
      });
      it("should not remove nested routeHandler's middleware if traverse is false", function () {
        let handler = routing.remove('foo/test', mw1, false);
        expect(handler).to.be.undefined;
        handler = instance.getRouteHandler('foo/test');
        expect(handler.hasMiddleware(mw1)).to.be.true;
      });
      it('should remove nested routeHandler by path', function () {
        let handler = routing.remove('foo/test');
        expect(handler).to.be.instanceOf(config.RouteHandler);
        expect(handler.hasMiddleware(mw1)).to.be.true;
        expect(instance.getRouteHandler('foo/test')).to.be.undefined;
      });
      it('should not remove nested routeHandler by path if traverse is false', function () {
        let handler = routing.remove('foo/test', null, false);
        expect(handler).to.be.undefined;
        expect(instance.getRouteHandler('foo/test')).to.be.instanceOf(
          config.RouteHandler
        );
      });

      it('should not remove router routeHandler if traverse is explicitly true', function () {
        foo.get('', mw2);
        routing.remove('foo', true);
        let handler = instance.getRouteHandler('foo', false);
        expect(handler).to.be.instanceOf(config.RouteHandler);
      });

      it('should remove router routeHandler if traverse is explicitly false', function () {
        foo.get('', mw2);
        routing.remove('foo', false);
        let handler = instance.getRouteHandler('foo', false);
        expect(handler).to.be.undefined;
      });

      it('should remove router routeHandler if traverse is not set', function () {
        foo.get('', mw2);
        routing.remove('foo');
        let handler = instance.getRouteHandler('foo', false);
        expect(handler).to.be.undefined;
      });

      it('should remove nested router routeHandler root middleware if traverse explicitly true', function () {
        foo.get('', mw2);
        let handler = routing.remove('foo', mw2, true);
        let root = instance.getRouteHandler('foo', false);
        expect(handler).to.be.instanceOf(config.RouteHandler);
        expect(root).to.be.instanceOf(config.RouteHandler);
        expect(handler).to.not.be.equal(root);
        expect(handler.path).to.be.equal('/');
        expect(handler.hasMiddleware(mw2)).to.be.false;
      });
      it('should remove nested router routeHandler root middleware if traverse is not set', function () {
        foo.get('', mw2);
        let handler = routing.remove('foo', mw2);
        let root = instance.getRouteHandler('foo', false);
        expect(handler).to.be.instanceOf(config.RouteHandler);
        expect(root).to.be.instanceOf(config.RouteHandler);
        expect(handler).to.not.be.equal(root);
        expect(handler.path).to.be.equal('/');
        expect(handler.hasMiddleware(mw2)).to.be.false;
      });
      it('should not remove nested router routeHandler root middleware if traverse is set to false', function () {
        foo.get('', mw2);
        let handler = routing.remove('foo', mw2, false);
        let root = instance.getRouteHandler('foo', false);
        expect(handler, 'handler instance').to.be.instanceOf(
          config.RouteHandler
        );
        expect(root, 'root instance').to.be.instanceOf(config.RouteHandler);
        expect(handler, 'handler is root').to.be.equal(root);
        handler = instance.getRouteHandler('foo', true);
        expect(handler, 'handler is not root').to.be.not.equal(root);
        expect(handler.hasMiddleware(mw2), 'handler middleware').to.be.true;
      });
      it('should remove nested router global middleware  if traverse is set to false', function () {
        foo.get('', mw2);
        foo.use(mw2);
        instance.use(mw2);

        expect(foo.hasMiddleware(mw2)).to.be.true;

        routing.remove('foo', mw2, false);
        let handler = instance.getRouteHandler('foo', true);
        expect(handler.isRouter()).to.be.false;
        expect(handler.path).to.be.equal('/');
        expect(handler.hasMiddleware(mw2)).to.be.true;
        expect(instance.hasMiddleware(mw2)).to.be.true;

        expect(foo.hasMiddleware(mw2)).to.be.false;
      });
    });
  });
  describe('createRequestContext', function () {
    it('should return instance of config.RequestContext when using own RequestContext', function () {
      class MyRouteContext extends config.RequestContext { }
      config.RequestContext = MyRouteContext;
      let context = instance.createRequestContext('');
      expect(context).to.be.instanceOf(MyRouteContext);
    });
    it('should return instance of config.RequestContext', function () {
      let context = instance.createRequestContext('');
      expect(context).to.be.instanceOf(config.RequestContext);
    });
  });
  describe('createResponseContext', function () {
    it('should return instance of config.ResponseContext when using own ResponseContext', function () {
      class MyContext extends config.ResponseContext { }
      config.ResponseContext = MyContext;
      let context = instance.createResponseContext('');
      expect(context).to.be.instanceOf(MyContext);
    });
    it('should return instance of config.ResponseContext', function () {
      let context = instance.createResponseContext('');
      expect(context).to.be.instanceOf(config.ResponseContext);
    });
  });

  describe('error handling', function () {
    describe('getErrorHandlerName', function () {
      it('should return `exception` if error is instanceof Error', function () {
        let res = instance.getErrorHandlerName(new Error());
        expect(res).to.be.equal('exception');
      });
      it('should return given string value if error is a string', function () {
        let res = instance.getErrorHandlerName('my-error');
        expect(res).to.be.equal('my-error');
      });
      it('should return `default` if error not an error or string', function () {
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
    describe('setErrorHandlers', function () {
      let spyError1;
      let spyError2;
      let spyDefault;
      let silentHandle;
      beforeEach(function () {
        instance = new DefaultRouter({
          errorHandlers: {
            default: () => 'default',
            error1: () => 'error1',
            error2: () => 'error2'
          }
        });
        silentHandle = (name) => {
          try {
            instance.handleError(name);
          } catch (e) { }
        }
        spyDefault = this.sinon.spy(instance._errorHandlers, 'default');
        spyError1 = this.sinon.spy(instance._errorHandlers, 'error1');
        spyError2 = this.sinon.spy(instance._errorHandlers, 'error2');
      });
      it('/*well be deprecated*/ should merge handlers', function () {
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
      it('/*well be deprecated*/ should replace handlers', function () {
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
      it('/*well be deprecated*/ should be able accept only errorHandlers hash and use merge approach in this case', function () {
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
      it('/*well be deprecated*/ should be able accept only errorHandlers array of hash and use merge approach in this case', function () {
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



      it('should not touch error handlers if no arguments or wrong arguments are passed', () => {
        instance.setErrorHandlers();
        instance.setErrorHandlers(false);
        instance.setErrorHandlers(undefined);

        silentHandle('default');
        silentHandle('error1');
        silentHandle('error2');

        expect(spyDefault).to.be.calledOnce;
        expect(spyError1).to.be.calledOnce;
        expect(spyError2).to.be.calledOnce;
      });

      it('should clean error handlers if null passed', () => {
        instance.setErrorHandlers(null);

        silentHandle('default');
        silentHandle('error1');
        silentHandle('error2');


        expect(spyDefault).to.be.not.called;
        expect(spyError1).to.be.not.called;
        expect(spyError2).to.be.not.called;
      });

      it('should remove provided handlers and leave others in a place', () => {
        instance.setErrorHandlers({ default: null, error2: undefined });
        silentHandle('default');
        silentHandle('error1');
        silentHandle('error2');
        expect(spyDefault).to.be.not.called;
        expect(spyError1).to.be.calledOnce;
        expect(spyError2).to.be.not.called;

      });

      it('should completely replace handlers', function () {
        let error1 = this.sinon.spy();
        instance.setErrorHandlers({ error1 }, true);
        silentHandle('default');
        silentHandle('error1');
        silentHandle('error2');
        expect(spyDefault).to.be.not.called;
        expect(spyError1).to.be.not.called;
        expect(spyError2).to.be.not.called;
        expect(error1).to.be.calledOnce;
      });

    });
    describe('handleError', function () {
      let OopsError;
      let errorHandle;
      beforeEach(function () {
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

        routing.start({ trigger: false });

      });

      describe('when called', function () {
        //let spy;
        beforeEach(function () {
          errorHandle = sinon.spy(instance, 'handleError');
          routing.instance.setErrorHandlers(true, {
            default: () => { },
          })
        });
        afterEach(function () {
          sinon.restore();
        });
        it('should be called with `notfound` if there is no route handler', async function () {
          //expect(routing.instance).to.be.equal(instance);
          await routing.navigate('foo/bar');
          expect(errorHandle).to.be.calledOnce.and.calledWith('notfound');
        });
        it('should be called with given custom error', async function () {
          await routing.navigate('custom');
          expect(errorHandle).to.be.calledOnce.and.calledWith('custom');
        });
        it('should be called with js error', async function () {
          await routing.navigate('javascript');
          expect(errorHandle).to.be.calledOnce.and.calledWith(OopsError);
        });
        it('should be called with js error when throw', async function () {
          await routing.navigate('throw');
          expect(errorHandle).to.be.calledOnce.and.calledWith(OopsError);
        });
        it('should be called with given custom error', async function () {
          await routing.navigate('custom');
          expect(errorHandle).to.be.calledOnce.and.calledWith('custom');
        });
      });
    });

    it('should throw if there is no ErrorHandler and some error occur during request', async () => {
      let error = new Error('Ooops');
      routing.instance.setErrorHandlers(null);

      routing.get('test-exception', () => {
        throw error
      });

      routing.start({ trigger: false });

      let catched;
      try {
        await routing.navigate('test-exception');
      } catch (e) {
        catched = e;
      }

      expect(catched).to.be.equal(error);

    });

  });

  describe('navigate', function () {
    let instance;
    beforeEach(function () {
      instance = new config.Router();
      routing.use(instance);
      routing.start({ trigger: false });
    });
    afterEach(function () {
      routing.stop();
    });
    it('should throw if not started', function () {
      routing.stop();
      expect(instance.navigate.bind(instance)).to.throw();
    });
    it("should call routeHandler's processRequest with passed globalMiddlewares if routeHandler exist", function () {
      let spy = this.sinon.spy(DefaultRouteHandler.prototype, 'processRequest');
      instance.get('foo/bar', () => { });
      let glblmw = () => { };
      instance.use(glblmw);
      instance.navigate('foo/bar');
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args[2].globalMiddlewares).to.be.eql([glblmw]);
    });
    it('should delegate to correct routeHandler with strictly defined routes', function () {
      let res = 'x';
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

    describe('trailingSlash', function () {
      afterEach(function () {
        config.trailingSlashSensitive = false;
      });
      it('should correctly handle # in the url if trailingSlashSensitive is false', async function () {
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
    describe('navigation with routers v2', function () {
      let counters;
      let inc;
      let gmw1;
      let gmw2;
      let gmw3;
      let acc;
      let art;
      let argumentsSpy;

      const makeInc = (key, cb) => {
        return (...args) => {
          inc(key);
          if (cb) {
            cb(...args);
          }
        };
      };

      beforeEach(function () {
        argumentsSpy = sinon.spy();
        counters = {};
        inc = sinon.spy(key => {
          counters[key] = counters[key] ? ++counters[key] : 1;
        });

        routing.stop();
        routing.instance = new config.Router();

        routing.start({
          trigger: false,
          errorHandlers: {
            notfound: () => {
              inc('notfound');
            }
          }
        });

        gmw1 = sinon.spy((r, e, n) => n());
        gmw2 = sinon.spy((r, e, n) => n());
        gmw3 = sinon.spy((r, e, n) => n());

        // /, /login, /register
        acc = new config.Router();
        acc.get('', makeInc('acc'));
        acc.get('login', makeInc('acc/login'));
        acc.get('register', makeInc('acc/register'));
        acc.use(gmw2);

        // /, /:id
        // /shmacc, shmacc/login, /shmacc/register
        art = new config.Router();
        art.get('', makeInc('art'));
        art.get(':id', makeInc('art/:id'));
        art.use(gmw3);
        art.use('shmacc', acc);

        // /:subdivision(/:id)
        let subtest = new config.Router();
        subtest.get(':subdivision(/:id)',
          makeInc(':division/:subdivion', req => argumentsSpy(req.args))
        );

        //subtest.add('something', art);

        //acc.add('wrong', subtest);

        // /:division/:subdivision(/:id)
        let test = new config.Router();
        test.use(':division', subtest);

        routing.use(gmw1);

        // /acc, /acc/login, /acc/register
        routing.use('acc', acc);

        // /art, /art/:id
        // /art/shmacc, /art/shmacc/login, /art/shmacc/register
        routing.use('art', art);

        // /test/:division/:subdivision(/:id)
        routing.use('test', test);

      });
      it("should correctly process nested router's request", async function () {
        await routing.navigate('acc/login');

        expect(counters['acc/login']).to.be.equal(1);
        expect(gmw1, 'gmw1').to.be.calledOnce;
        expect(gmw2, 'gmw2').to.be.calledOnce;

        await routing.navigate('art');
        expect(counters['art']).to.be.equal(1);
        expect(gmw1.callCount, 'gmw1').to.be.equal(2);
        expect(gmw3, 'gmw3').to.be.calledOnce;

        await routing.navigate('art/shmacc');
        expect(counters['acc']).to.be.equal(1);
        expect(gmw1.callCount, 'gmw1').to.be.equal(3);
        expect(gmw2.callCount, 'gmw2').to.be.equal(2);
        expect(gmw3.callCount, 'gmw3').to.be.equal(2);

      });
      it('should execute nested router routeHandler and args should be ok', async function () {
        await routing.navigate('test/pupkin/arts/aboutCats');

        expect(counters[':division/:subdivion']).to.be.equal(1);
        expect(argumentsSpy).to.be.calledOnce.and.calledWith({
          division: 'pupkin',
          subdivision: 'arts',
          id: 'aboutCats'
        });
      });
    });
    describe('navigation v2', function () {
      let counters;
      let inc;
      const keyedInc = key => {
        routing.get(key, () => {
          inc(key);
        });
      };
      beforeEach(function () {
        counters = {};
        inc = sinon.spy(key => {
          counters[key] = counters[key] ? ++counters[key] : 1;
        });
        routing.stop();
        routing.instance = new config.Router();
        routing.start({
          trigger: false,
          errorHandlers: {
            notfound: () => {
              inc('notfound');
            }
          }
        });
      });

      it('static routes should have priority over parametrized', async function () {
        let routes = routing.instance.routes.items;

        keyedInc('foo/:bar');
        keyedInc('foo/bar');

        expect(routes[routes.length - 1].path).to.be.equal('/foo/bar');
        await routing.navigate('foo/bar');

        expect(counters['foo/bar']).to.be.equal(1);
        expect(counters['foo/:bar']).to.be.undefined;

        await routing.navigate('foo/zoo');

        expect(counters['foo/bar']).to.be.equal(1);
        expect(counters['foo/:bar']).to.be.equal(1);

        routing.remove('foo/:bar');
        keyedInc('foo/:bar');

        expect(routes[routes.length - 1].path).to.be.equal('/foo/:bar');

        await routing.navigate('foo/bar');

        expect(counters['foo/bar']).to.be.equal(2);
        expect(counters['foo/:bar']).to.be.equal(1);
      });
      it('should choose correct handler', async function () {
        keyedInc('');
        keyedInc(':foo/:zoo');
        keyedInc(':foo(/bar)/:zoo');

        await routing.navigate('abra/kadabra');
        expect(counters[':foo/:zoo']).to.be.equal(1);

        await routing.navigate('abra/bar/kadabra');
        expect(counters[':foo(/bar)/:zoo']).to.be.equal(1);
      });
      it('should delegate to correct routeHandler', async function () {
        keyedInc('foo/:action/:id');
        keyedInc('foo/:action/some');
        keyedInc('foo/:action');
        keyedInc('bar/:action-foo(-:id)');
        keyedInc('bar/:action-:id/(baraban)');

        await routing.navigate('foo/bar');
        expect(counters['foo/:action']).to.be.equal(1);
        expect(inc.callCount).to.be.equal(1);

        await routing.navigate('foo');
        expect(counters['notfound'], 'foo').to.be.equal(1);
        expect(inc.callCount).to.be.equal(2);

        await routing.navigate('foo/bar/some');
        expect(counters['foo/:action/some'], 'foo/bar/some').to.be.equal(1);
        expect(inc.callCount).to.be.equal(3);

        await routing.navigate('foo/bar/123');
        expect(counters['foo/:action/:id'], 'foo/bar/123').to.be.equal(1);
        expect(inc.callCount).to.be.equal(4);

        await routing.navigate('foo/bar/123/123');
        expect(counters['notfound'], 'foo/bar/123/123').to.be.equal(2);
        expect(inc.callCount).to.be.equal(5);

        await routing.navigate('bar/bar-foo');
        expect(counters['bar/:action-foo(-:id)'], 'bar/bar-foo').to.be.equal(1);
        expect(inc.callCount).to.be.equal(6);

        await routing.navigate('bar/bar-foo-123');
        expect(
          counters['bar/:action-foo(-:id)'],
          'bar/bar-foo-123'
        ).to.be.equal(2);
        expect(inc.callCount).to.be.equal(7);

        await routing.navigate('bar/bar-foo/');
        expect(counters['bar/:action-foo(-:id)'], 'bar/bar-foo/').to.be.equal(
          3
        );
        expect(inc.callCount).to.be.equal(8);

        await routing.navigate('bar/barbar-foofofo/baraban');
        expect(
          counters['bar/:action-:id/(baraban)'],
          'bar/barbar-foofofo/baraban'
        ).to.be.equal(1);
        expect(inc.callCount).to.be.equal(9);

        await routing.navigate('bar/piw-piw/caravan');
        expect(counters['notfound'], 'bar/piw-piw/caravan').to.be.equal(3);
        expect(inc.callCount).to.be.equal(10);

        await routing.navigate('bar/bar-foo-gooose/');
        expect(counters['bar/:action-foo(-:id)'], '').to.be.equal(4);
        expect(inc.callCount).to.be.equal(11);

        await routing.navigate('bar/bar-foo-mooose/');
        expect(
          counters['bar/:action-foo(-:id)'],
          'bar/bar-foo-mooose/'
        ).to.be.equal(5);
        expect(inc.callCount).to.be.equal(12);
      });
    });
  });

  describe('hash based navigate', function () {
    let counters;
    let inc;
    const keyedInc = key => {
      routing.get(key, () => {
        inc(key);
      });
    };
    beforeEach(function () {
      config.useHashes = true;
      counters = {};
      inc = sinon.spy(key => {
        counters[key] = counters[key] ? ++counters[key] : 1;
      });
      routing.stop();
      routing.instance = new config.Router();
      routing.start({
        trigger: false,
        errorHandlers: {
          notfound: () => {
            inc('notfound');
          }
        }
      });
    });
    afterEach(function () {
      config.useHashes = false;
    });
    it('static routes should have priority over parametrized', async function () {
      keyedInc('foo/:bar');
      keyedInc('foo/bar');

      await routing.navigate('foo/bar');

      expect(counters['foo/bar']).to.be.equal(1);
      expect(counters['foo/:bar']).to.be.undefined;

      await routing.navigate('foo/zoo');

      expect(counters['foo/bar']).to.be.equal(1);
      expect(counters['foo/:bar']).to.be.equal(1);
    });
    it('should choose correct handler', async function () {
      keyedInc('');
      keyedInc(':foo/:zoo');
      keyedInc(':foo(/bar)/:zoo');

      await routing.navigate('abra/kadabra');
      expect(counters[':foo/:zoo']).to.be.equal(1);

      await routing.navigate('abra/bar/kadabra');
      expect(counters[':foo(/bar)/:zoo']).to.be.equal(1);
    });
    it('should delegate to correct routeHandler', async function () {
      keyedInc('foo/:action/:id');
      keyedInc('foo/:action/some');
      keyedInc('foo/:action');
      keyedInc('bar/:action-foo(-:id)');
      keyedInc('bar/:action-:id/(baraban)');

      await routing.navigate('foo/bar');
      expect(counters['foo/:action']).to.be.equal(1);
      expect(inc.callCount).to.be.equal(1);

      await routing.navigate('foo');
      expect(counters['notfound']).to.be.equal(1);
      expect(inc.callCount).to.be.equal(2);

      await routing.navigate('foo/bar/some');
      expect(counters['foo/:action/some']).to.be.equal(1);
      expect(inc.callCount).to.be.equal(3);

      await routing.navigate('foo/bar/123');
      expect(counters['foo/:action/:id']).to.be.equal(1);
      expect(inc.callCount).to.be.equal(4);

      await routing.navigate('foo/bar/123/123');
      expect(counters['notfound']).to.be.equal(2);
      expect(inc.callCount).to.be.equal(5);

      await routing.navigate('bar/bar-foo');
      expect(counters['bar/:action-foo(-:id)']).to.be.equal(1);
      expect(inc.callCount).to.be.equal(6);

      await routing.navigate('bar/bar-foo-123');
      expect(counters['bar/:action-foo(-:id)']).to.be.equal(2);
      expect(inc.callCount).to.be.equal(7);

      await routing.navigate('bar/bar-foo/');
      expect(counters['bar/:action-foo(-:id)']).to.be.equal(3);
      expect(inc.callCount).to.be.equal(8);

      await routing.navigate('bar/barbar-foofofo/baraban');
      expect(counters['bar/:action-:id/(baraban)']).to.be.equal(1);
      expect(inc.callCount).to.be.equal(9);

      await routing.navigate('bar/piw-piw/caravan');
      expect(counters['notfound']).to.be.equal(3);
      expect(inc.callCount).to.be.equal(10);

      await routing.navigate('bar/bar-foo-gooose/');
      expect(counters['bar/:action-foo(-:id)']).to.be.equal(4);
      expect(inc.callCount).to.be.equal(11);

      await routing.navigate('bar/bar-foo-mooose/');
      expect(counters['bar/:action-foo(-:id)']).to.be.equal(5);
      expect(inc.callCount).to.be.equal(12);
    });
  });
});
