const config = routing.config;

describe('RouteHandler', function() {
  describe('middlewares', function() {
    let instance;
    let handler;
    let mw1;
    let mw2;
    let gmw1;
    beforeEach(function() {
      mw1 = sinon.spy((r, s, n) => n());
      mw2 = sinon.spy((r, s, n) => n());
      gmw1 = sinon.spy((r, s, n) => n());
      routing.get('', mw1, mw2);
      routing.use(gmw1);
      instance = routing.instance;
      handler = instance.routes.items[0];
    });
    afterEach(function() {
      routing.remove('');
      routing.remove(gmw1);
    });

    describe('addMiddlewares', function() {
      it('should add middlewares to the end', function() {
        let spy1 = sinon.spy();
        let spy2 = sinon.spy();
        handler.addMiddlewares([spy1, spy2]);
        expect(handler.middlewares.length).to.be.equal(4);
        expect(handler.middlewares[2]).to.be.equal(spy1);
        expect(handler.middlewares[3]).to.be.equal(spy2);
      });
    });
    describe('addMiddleware', function() {
      it('should add middleware to the end', function() {
        let spy1 = sinon.spy();
        let spy2 = sinon.spy();
        handler.addMiddleware(spy1);
        handler.addMiddleware(spy2);
        expect(handler.middlewares.length).to.be.equal(4);
        expect(handler.middlewares[2]).to.be.equal(spy1);
        expect(handler.middlewares[3]).to.be.equal(spy2);
      });
      it('should throw if middleware is not a function', function() {
        expect(handler.addMiddleware.bind(handler)).to.throw();
      });
    });
    describe('removeMiddleware', function() {
      it('should not remove if middleware is not exist', function() {
        handler.removeMiddleware(() => {});
        expect(handler.middlewares.length).to.be.equal(2);
        expect(handler.middlewares[0]).to.be.equal(mw1);
        expect(handler.middlewares[1]).to.be.equal(mw2);
      });
      it('should remove founded middleware', function() {
        handler.removeMiddleware(mw1);
        expect(handler.middlewares.length).to.be.equal(1);
        expect(handler.middlewares[0]).to.be.equal(mw2);
      });
    });
    describe('removeMiddlewares', function() {
      it('should remove all middlewares if called without arguments', function() {
        handler.removeMiddlewares();
        expect(handler.middlewares.length).to.be.equal(0);
      });
      it('should throw if called with wrong argument', function() {
        expect(handler.removeMiddlewares.bind(handler, 'foo')).to.throw();
      });
      it('should remove all founded middlewares', function() {
        handler.removeMiddlewares([mw1, mw2]);
        expect(handler.middlewares.length).to.be.equal(0);
      });
    });
    describe('hasMiddleware', function() {
      it('should return false for not exist middleware', function() {
        expect(handler.hasMiddleware()).to.be.false;
        expect(handler.hasMiddleware(() => {})).to.be.false;
      });
      it('should return true for exist middleware', function() {
        expect(handler.hasMiddleware(mw1)).to.be.true;
        expect(handler.hasMiddleware(mw2)).to.be.true;
      });
    });
  });
  describe('processRequest', function() {
    let reqItem;
    before(function() {
      routing.get(':controller/:action(/:id)(/)', req => {
        reqItem = req;
      });
      routing.start();
    });
    after(function() {
      routing.stop();
      delete routing.instance;
    });

    it('args should contain all arguments when optional parameter filled', function() {
      routing.navigate('foo/bar/baz');
      expect(reqItem.args).to.be.eql({
        controller: 'foo',
        action: 'bar',
        id: 'baz'
      });
    });

    it('args should contain all route arguments', function() {
      routing.navigate('foo/bar');
      expect(reqItem.args).to.be.eql({
        controller: 'foo',
        action: 'bar',
        id: undefined
      });
    });

    it('should invoke handlers in a correct order', async function() {
      let h = [];
      routing.get(
        'test',
        (r, s, n) => (h.push('one'), n()),
        (r, s, n) => (h.push('two'), n())
      );
      routing.use((r, s, n) => (h.push('global'), n()));
      routing.navigate('test');
      expect(h).to.be.eql(['global', 'one', 'two']);
    });
    it('should be able to process if there is no options provided', function() {
      let handler = routing.instance.add('test/foo', [() => {}]);
      expect(handler).to.be.instanceOf(config.RouteHandler);
      let req = routing.instance.createRequestContext('test/foo');
      let res = routing.instance.createResponseContext(req);
      expect(handler.processRequest.bind(handler, req, res)).to.not.throw();
    });
  });
  describe('extractRouteArguments', function() {
    let inst;
    const getReq = arg => inst.createRequestContext(arg || 'notfound/foo/bar');
    beforeEach(function() {
      inst = new config.Routing();
    });
    it('should not throw if there is no arguments to extract', function() {
      let handler = new config.RouteHandler('found/foo/bar');
      let req = getReq('notfound/foo/bar');
      expect(handler.extractRouteArguments.bind(handler, req)).to.not.throw();
    });
  });
});
