import routing from '../..';
import { buildSegments } from '../../utils';
import PathContext from '../../PathContext';
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
    routing.stop();
    instance = new DefaultRouter();
    routing.use(instance);
    instance.get(route, handler1);
  });

  afterEach(function() {
    config.Router = DefaultRouter;
    config.RouteHandler = DefaultRouteHandler;
    config.RequestContext = DefaultRequestContext;
    config.ResponseContext = DefaultResponseContext;
    document.location.href = 'http://localhost';
  });

  describe('isRoutingStarted', function() {
    it('should return false if routing not started and true if started', function() {
      expect(instance.isRoutingStarted()).to.be.false;
      routing.start();
      expect(instance.isRoutingStarted()).to.be.true;
      routing.stop();
      expect(instance.isRoutingStarted()).to.be.false;
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
    it('should return routeHandler if arguments correct and it supposed to be regular handler', function() {
      let res = instance.add('', [handler1]);
      expect(res).to.be.instanceOf(config.RouteHandler);
    });
    it("should throw if arguments correct and it's already initialized as regular routeHandler and `add` called with Router argument", function() {
      expect(instance.add.bind(instance, '', new config.Router())).to.throw();
    });
    it('should return routeHandler if arguments correct and it supposed to be Router handler', function() {
      let res = instance.add('somenewroute', new config.Router());
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

        routing.start();
      });

      describe('when called', function() {
        //let spy;
        beforeEach(function() {
          errorHandle = sinon.spy(instance, 'handleError');
        });
        afterEach(function() {
          sinon.restore();
        });
        it('should be called with `notfound` if there is no route handler', async function() {
          //expect(routing.instance).to.be.equal(instance);
          await routing.navigate('foo/bar');
          expect(errorHandle).to.be.calledOnce.and.calledWith('notfound');
        });
        it('should be called with given custom error', async function() {
          await routing.navigate('custom');
          expect(errorHandle).to.be.calledOnce.and.calledWith('custom');
        });
        it('should be called with js error', async function() {
          await routing.navigate('javascript');
          expect(errorHandle).to.be.calledOnce.and.calledWith(OopsError);
        });
        it('should be called with js error when throw', async function() {
          await routing.navigate('throw');
          expect(errorHandle).to.be.calledOnce.and.calledWith(OopsError);
        });
        it('should be called with given custom error', async function() {
          await routing.navigate('custom');
          expect(errorHandle).to.be.calledOnce.and.calledWith('custom');
        });
      });
    });
  });

  describe('navigate', function() {
    let instance;
    beforeEach(function() {
      instance = routing.instance = new config.Router();
      routing.start({ trigger: false });
    });
    afterEach(function() {
      routing.stop();
    });
    it('should throw if not started', function() {
      routing.stop();
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
    describe('navigation with routers v2', function() {
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
      beforeEach(function() {
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

        acc = new config.Router();
        acc.get('', makeInc('acc'));
        acc.get('login', makeInc('acc/login'));
        acc.get('register', makeInc('acc/register'));
        acc.use(gmw2);

        art = new config.Router();
        art.get('', makeInc('art'));
        art.get(':id', makeInc('art/:id'));
        art.use(gmw3);

        art.use('shmacc', acc);

        let subtest = new config.Router();
        subtest.get(
          ':subdivision(/:id)',
          makeInc(':division/:subdivion', req => argumentsSpy(req.args))
        );
        let test = new config.Router();
        test.use(':division', subtest);

        routing.use(gmw1);
        routing.use('acc', acc);
        routing.use('art', art);
        routing.use('test', test);
      });
      it("should correctly process nested router's request", async function() {
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
      it('should execute nested router routeHandler and args should be ok', async function() {
        await routing.navigate('test/pupkin/arts/aboutCats');

        expect(counters[':division/:subdivion']).to.be.equal(1);
        expect(argumentsSpy).to.be.calledOnce.and.calledWith({
          division: 'pupkin',
          subdivision: 'arts',
          id: 'aboutCats'
        });
      });
    });
    describe('navigation v2', function() {
      let counters;
      let inc;
      const keyedInc = key => {
        routing.get(key, () => {
          inc(key);
        });
      };
      beforeEach(function() {
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

      it('static routes should have priority over parametrized', async function() {
        keyedInc('foo/:bar');
        keyedInc('foo/bar');

        await routing.navigate('foo/bar');

        expect(counters['foo/bar']).to.be.equal(1);
        expect(counters['foo/:bar']).to.be.undefined;

        await routing.navigate('foo/zoo');

        expect(counters['foo/bar']).to.be.equal(1);
        expect(counters['foo/:bar']).to.be.equal(1);
      });
      it('should choose correct handler', async function() {
        keyedInc('');
        keyedInc(':foo/:zoo');
        keyedInc(':foo(/bar)/:zoo');

        await routing.navigate('abra/kadabra');
        expect(counters[':foo/:zoo']).to.be.equal(1);

        await routing.navigate('abra/bar/kadabra');
        expect(counters[':foo(/bar)/:zoo']).to.be.equal(1);
      });
      it('should delegate to correct routeHandler', async function() {
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
      // it.only('trying to catch optional coverage', async function() {
      //   keyedInc('bar/:action-:id(/baraban)');
      //   await routing.navigate('bar/barbar-foofofo/baraban');
      //   console.log(counters);
      //   await routing.navigate('bar/barbar-foofofo');
      //   console.log(counters);
      //   let rh = routing.instance.routes.items[0];
      //   let path = '/optional/capro(/id)';
      //   let o = rh.regexPatterns;
      //   let route = path
      //     .replace(o.escapeRegExp, '\\$&')
      //     .replace(o.optionalParam, '(?:$1)?')
      //     .replace(o.namedParam, (match, optional) => {
      //       console.log('YAY', optional, match);
      //       return optional ? match : '([^/?]+)';
      //     })
      //     .replace(o.splatParam, '([^?]*?)');
      //   console.log(route);
      //   /*
      //   keyedInc('optional/capro(/:id)');
      //   //path = '/optional/capro(/:id)';

      //   */
      // });
    });
  });
  describe('hash based navigate', function() {
    let counters;
    let inc;
    const keyedInc = key => {
      routing.get(key, () => {
        inc(key);
      });
    };
    beforeEach(function() {
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
    afterEach(function() {
      config.useHashes = false;
    });
    it('static routes should have priority over parametrized', async function() {
      keyedInc('foo/:bar');
      keyedInc('foo/bar');

      await routing.navigate('foo/bar');

      expect(counters['foo/bar']).to.be.equal(1);
      expect(counters['foo/:bar']).to.be.undefined;

      await routing.navigate('foo/zoo');

      expect(counters['foo/bar']).to.be.equal(1);
      expect(counters['foo/:bar']).to.be.equal(1);
    });
    it('should choose correct handler', async function() {
      keyedInc('');
      keyedInc(':foo/:zoo');
      keyedInc(':foo(/bar)/:zoo');

      await routing.navigate('abra/kadabra');
      expect(counters[':foo/:zoo']).to.be.equal(1);

      await routing.navigate('abra/bar/kadabra');
      expect(counters[':foo(/bar)/:zoo']).to.be.equal(1);
    });
    it('should delegate to correct routeHandler', async function() {
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
