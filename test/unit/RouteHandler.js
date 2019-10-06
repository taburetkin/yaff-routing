import routing from '../..';
const config = routing.config;

describe('RouteHandler', function() {
  let instance;
  let handler;
  let mw1;
  let mw2;
  let gmw1;
  let counter = 0;
  beforeEach(function() {
    counter = 0;
    mw1 = sinon.spy((r, re, n) => {
      counter++;
      n();
    });
    mw2 = sinon.spy((r, re, n) => {
      counter++;
      n();
    });
    gmw1 = sinon.spy((r, re, n) => {
      counter++;
      n();
    });
    instance = new config.Routing();
    instance.get('', mw1, mw2);
    instance.use(gmw1);
    handler = instance.routes.items[0];
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
  describe('processRequest', function() {
    // let req;
    // let res;
    beforeEach(function() {
      // req = instance.createRequestContext('');
      // res = instance.createResponseContext(req);
    });
    describe('when called in sync', function() {
      it('should invoke handlers in a correct order', async function() {
        instance.start({ trigger: false });
        instance.navigate('');
        expect(counter).to.be.equal(3);
      });
    });
  });
});
