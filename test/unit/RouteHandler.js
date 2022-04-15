import { delay } from '../tests-helpers';

const config = global.config;

describe('RouteHandler', function () {
  describe('middlewares', function () {
    let instance;
    let handler;
    let mw1;
    let mw2;
    let gmw1;
    beforeEach(function () {
      mw1 = sinon.spy((r, s, n) => n());
      mw2 = sinon.spy((r, s, n) => n());
      gmw1 = sinon.spy((r, s, n) => n());
      routing.get('', mw1, mw2);
      routing.use(gmw1);
      instance = routing.instance;
      handler = instance.routes.items[0];
    });
    afterEach(function () {
      routing.remove('');
      routing.remove(gmw1);
    });

    describe('addMiddlewares', function () {
      it('should throw if routeHandler is Router based', function () {
        let handler = new config.RouteHandler('test', new config.Router());
        expect(handler.addMiddlewares.bind(handler, [() => { }])).to.throw();
      });
      it('should add middlewares to the end', function () {
        let spy1 = sinon.spy();
        let spy2 = sinon.spy();
        handler.addMiddlewares([spy1, spy2]);
        expect(handler.middlewares.length).to.be.equal(4);
        expect(handler.middlewares[2]).to.be.equal(spy1);
        expect(handler.middlewares[3]).to.be.equal(spy2);
      });
    });
    describe('addMiddleware', function () {
      it('should add middleware to the end', function () {
        let spy1 = sinon.spy();
        let spy2 = sinon.spy();
        handler.addMiddleware(spy1);
        handler.addMiddleware(spy2);
        expect(handler.middlewares.length).to.be.equal(4);
        expect(handler.middlewares[2]).to.be.equal(spy1);
        expect(handler.middlewares[3]).to.be.equal(spy2);
      });
      it('should throw if middleware is not a function', function () {
        expect(handler.addMiddleware.bind(handler)).to.throw();
      });
      it('should throw if routeHandler is Router based', function () {
        let handler = new config.RouteHandler('test', new config.Router());
        expect(handler.addMiddleware.bind(handler, () => { })).to.throw();
      });
    });
    describe('removeMiddleware', function () {
      it('should not remove if middleware is not exist', function () {
        handler.removeMiddleware(() => { });
        expect(handler.middlewares.length).to.be.equal(2);
        expect(handler.middlewares[0]).to.be.equal(mw1);
        expect(handler.middlewares[1]).to.be.equal(mw2);
      });
      it('should remove founded middleware', function () {
        handler.removeMiddleware(mw1);
        expect(handler.middlewares.length).to.be.equal(1);
        expect(handler.middlewares[0]).to.be.equal(mw2);
      });
      it('should throw if routeHandler is Router based', function () {
        let handler = new config.RouteHandler('test', new config.Router());
        expect(handler.removeMiddleware.bind(handler, () => { })).to.throw();
      });
    });
    describe('removeMiddlewares', function () {
      it('should remove all middlewares if called without arguments', function () {
        handler.removeMiddlewares();
        expect(handler.middlewares.length).to.be.equal(0);
      });
      it('should throw if called with wrong argument', function () {
        expect(handler.removeMiddlewares.bind(handler, 'foo')).to.throw();
      });
      it('should remove all founded middlewares', function () {
        handler.removeMiddlewares([mw1, mw2]);
        expect(handler.middlewares.length).to.be.equal(0);
      });
      it('should throw if routeHandler is Router based', function () {
        let handler = new config.RouteHandler('test', new config.Router());
        expect(handler.removeMiddlewares.bind(handler, [() => { }])).to.throw();
      });
    });
    describe('hasMiddleware', function () {
      it('should return false for not exist middleware', function () {
        expect(handler.hasMiddleware()).to.be.false;
        expect(handler.hasMiddleware(() => { })).to.be.false;
      });
      it('should return true for exist middleware', function () {
        expect(handler.hasMiddleware(mw1)).to.be.true;
        expect(handler.hasMiddleware(mw2)).to.be.true;
      });
    });
  });
  describe('router', function () {
    //let handler;
    beforeEach(function () { });
    afterEach(function () {
      routing.stop();
      sinon.restore();
    });
    it('should call setRouter when initialized with router', function () {
      let router = new config.Router();
      let spy = sinon.spy(config.RouteHandler.prototype, 'setRouter');
      new config.RouteHandler('foo/bar', router);
      expect(spy).to.be.calledOnce.and.calledWith(router);
    });
    it('should not call setRouter when initialized without router', function () {
      let spy = sinon.spy(config.RouteHandler.prototype, 'setRouter');
      new config.RouteHandler('foo/bar');
      expect(spy).to.not.been.called;
    });
    describe('setRouter', function () {
      let router;
      let anotherRouter;
      let handler;
      beforeEach(function () {
        handler = new config.RouteHandler();
        router = new config.Router();
        anotherRouter = new config.Router();
      });
      it('should set router if there is no routers', function () {
        handler.setRouter(router);
        expect(handler.isRouter()).to.be.true;
      });
      it('should set router and remove middlewares if there is no routers', function () {
        handler.addMiddlewares([() => { }], [() => { }]);
        handler.setRouter(router);
        expect(handler.isRouter()).to.be.true;
        expect(handler.middlewares.length).to.be.equal(0);
      });
      it('should be able replace router by another router', function () {
        handler.setRouter(router);
        handler.setRouter(anotherRouter);
        expect(handler.isRouter()).to.be.true;
        expect(handler.router).to.be.equal(anotherRouter);
      });
      it('should be able to remove router at all', function () {
        handler.setRouter(router);
        handler.setRouter(null);
        expect(handler.isRouter()).to.be.false;
        expect(handler.router).to.be.null;
      });
    });
  });
  describe('processRequest', function () {
    let reqItem;
    beforeEach(function () {
      routing.get(':controller/:action(/:id)(/)', req => {
        reqItem = req;
      });
      routing.start();
    });
    afterEach(function () {
      routing.stop();
      delete routing.instance;
    });

    describe('requestContext route arguments', function () {
      it('args should contain all arguments when optional parameter filled', function () {
        routing.navigate('foo/bar/baz');
        expect(reqItem.args).to.be.eql({
          controller: 'foo',
          action: 'bar',
          id: 'baz'
        });
      });

      it('args should contain all route arguments', function () {
        routing.navigate('foo/bar');
        expect(reqItem.args).to.be.eql({
          controller: 'foo',
          action: 'bar',
          id: undefined
        });
      });

      it('should collect arguments with similar name into array', function () {
        routing.get('testargs/:id/:id/:id', req => {
          reqItem = req;
        });
        routing.navigate('testargs/foo/bar/baz');
        expect(reqItem.args).to.be.eql({
          id: ['foo', 'bar', 'baz']
        });
      });
    });

    it('should invoke handlers in a correct order', async function () {
      let h = [];

      const push = (name) => {
        return (r, s, n) => {
          h.push(name);
          n();
        }
      }

      routing.get(
        'test',
        push('one'),
        push('two')
      );

      routing.use(push('global'));

      await routing.navigate('test');

      expect(h).to.be.eql(['global', 'one', 'two']);

    });

    it('should invoke handlers in a correct order if handlers are async', async function () {
      let hh = [];
      let add = what => {
        hh.push(what);
      };
      routing.get(
        'test2',
        async (r, s, n) => {
          await delay(50);
          add('one');
          return n();
        },
        (r, s, n) => {
          add('two');
          return n();
        },
        async (r, s, n) => {
          await delay(50);
          add('three');
          return n();
        }
      );
      routing.use((r, s, n) => (hh.push('global'), n()));
      await routing.navigate('test2');

      expect(hh).to.be.eql(['global', 'one', 'two', 'three']);
    });

    it('should be able to process if there is no options provided', function () {
      let handler = routing.instance.add('test/foo', [() => { }]);
      expect(handler).to.be.instanceOf(config.RouteHandler);
      let req = routing.instance.createRequestContext('test/foo');
      let res = routing.instance.createResponseContext(req);
      expect(handler.processRequest.bind(handler, req, res)).to.not.throw();
    });
  });
  describe('extractRouteArguments', function () {
    let inst;
    const getReq = arg => inst.createRequestContext(arg || 'notfound/foo/bar');
    beforeEach(function () {
      inst = new config.Router();
    });
    it('should not throw if there is no arguments to extract', function () {
      let handler = new config.RouteHandler('found/foo/bar');
      let req = getReq('notfound/foo/bar');
      expect(handler.extractRouteArguments.bind(handler, req)).to.not.throw();
    });
  });
});
