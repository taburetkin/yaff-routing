const config = routing.config;
const DefaultRouter = config.Router;
const handler1 = (req, res, next) => next && next();
const proto = DefaultRouter.prototype;
let route = '';

function _try(cb) {
  try {
    return cb();
  } catch (e) {
    return;
  }
}

describe('general routing', function() {
  let sandbox;
  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });
  afterEach(function() {
    sandbox.restore();
    routing.stop();
    delete routing.instance;
  });

  describe('instantiating Router', function() {
    beforeEach(function() {
      routing.stop();
      routing.instance = null;
    });
    describe('when using default Router', function() {
      const Router = DefaultRouter;
      it('should instantiate Router on get', function() {
        routing.get('', handler1);
        expect(routing.instance).to.be.instanceof(Router);
      });
      it('should instantiate Router on use', function() {
        routing.use(handler1);
        expect(routing.instance).to.be.instanceof(Router);
      });
      it('should instantiate Router on start', function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Router);
      });
      it('should not instantiate Router on remove', function() {
        routing.remove(() => {});
        expect(routing.instance == null).to.be.true;
      });
      it('should not instantiate Router on navigate', function() {
        routing.navigate('test');
        expect(routing.instance == null).to.be.true;
      });
    });

    describe('when using custom Router', function() {
      class Router extends DefaultRouter {}

      beforeEach(function() {
        config.Router = Router;
      });
      afterEach(function() {
        config.Router = DefaultRouter;
      });

      it('should instantiate Router on get', function() {
        routing.get('', handler1);
        expect(routing.instance).to.be.instanceof(Router);
      });
      it('should instantiate Router on use', function() {
        routing.use(handler1);
        expect(routing.instance).to.be.instanceof(Router);
      });
      it('should instantiate Router on start', function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Router);
      });
      it('should instantiate Router on remove', function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Router);
      });
      it('should instantiate Router on navigate', function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Router);
      });
    });
  });
  describe('createRouter', function() {
    describe('when used default Router', function() {
      it('should return routing instance', function() {
        let instance = routing.createRouter();
        expect(instance).to.be.instanceof(config.Router);
      });
    });
    describe('when used custom Router', function() {
      class Router extends DefaultRouter {}

      beforeEach(function() {
        config.Router = Router;
      });
      afterEach(function() {
        config.Router = DefaultRouter;
      });

      it('should return routing instance', function() {
        let instance = routing.createRouter();
        expect(instance).to.be.instanceof(Router);
      });
    });
  });
  describe('get', function() {
    let spy;
    beforeEach(function() {
      spy = sandbox.spy(proto, 'get');
      routing.get(route, handler1);
    });

    it('should create instance of Router', function() {
      expect(routing.instance).to.be.instanceof(config.Router);
    });
    it('should proxy call to the routing instance', function() {
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([route, handler1]);
    });
  });
  describe('use', function() {
    let spy;
    beforeEach(function() {
      spy = sandbox.spy(proto, 'use');
      routing.use(route, handler1);
    });

    it('should create instance of Router', function() {
      expect(routing.instance).to.be.instanceof(config.Router);
    });
    it('should proxy call to the routing instance', function() {
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([route, handler1]);

      routing.use(handler1);
      expect(spy.getCall(1).args).to.be.eql([handler1]);
    });
    describe('when called with Router instance', function() {
      let initialized;
      beforeEach(function() {
        initialized = new DefaultRouter();
      });
      it('should throw if there is already initialized and started Router', function() {
        routing.start();
        expect(routing.use.bind(routing, initialized)).to.throw();
      });
      it('should set up provided router instance as main router if there is no initialized router yet', function() {
        routing.use(initialized);
        expect(routing.instance).to.be.equal(initialized);
      });
      it('should set up provided router instance as main router if initialized router is not started yet', function() {
        routing.use(() => {});
        routing.use(initialized);
        expect(routing.instance).to.be.equal(initialized);
      });
      it('should set up provided router instance as main router if initialized router is stoped', function() {
        routing.use(() => {});
        routing.start();
        routing.stop();
        routing.use(initialized);
        expect(routing.instance).to.be.equal(initialized);
      });
    });
  });

  describe('start and stop', function() {
    beforeEach(function() {
      //routing.instance = new config.Router();
    });
    afterEach(function() {
      routing.stop();
    });

    it('should create instance of Router', function() {
      routing.start();
      expect(routing.instance).to.be.instanceof(config.Router);
    });
    it('should not create instance of Router', function() {
      routing.stop();
      expect(routing.instance).to.be.not.instanceof(config.Router);
    });
    it('should not throw if there is no onPopstate handler', function() {
      routing.start();
      routing._onPopstate = null;
      expect(routing.stop.bind(routing)).to.not.throw();
    });
    it('should not throw if stoped before started', function() {
      expect(routing.stop.bind(routing)).to.not.throw();
      expect(routing.stop.bind(routing)).to.not.throw();
    });
    it('when started should throw on second start if it was not stopped', function() {
      routing.start();
      expect(routing.start.bind(routing)).to.throw();
    });
    it('should not throw if started after stop', function() {
      routing.start();
      routing.stop();
      expect(routing.start.bind(routing)).to.not.throw();
    });
    it('should not trigger on start if trigger is false', function() {
      let spy = this.sinon.spy(routing, 'navigate');
      routing.start({ trigger: false });
      expect(spy).to.not.been.called;
    });
    it('should trigger on start if trigger is true', function() {
      let spy = this.sinon.spy(routing, 'navigate');
      routing.start({ trigger: true });
      expect(spy).to.be.calledOnce;
    });
    it('should trigger on start if trigger is not set', function() {
      let spy = this.sinon.spy(routing, 'navigate');
      routing.start({});
      expect(spy).to.be.calledOnce;
    });
    it('should take useHashes option on start', function() {
      config.useHashes = false;
      routing.start({ useHashes: true });
      expect(config.useHashes).to.be.true;
      routing.stop();
      routing.start({ useHashes: false });
      expect(config.useHashes).to.be.false;
    });
    it('should call setErrorHandlers if errorHandlers passed', function() {
      routing.instance = new config.Router();
      let spy = this.sinon.spy(routing.instance, 'setErrorHandlers');
      let handlers = {
        test: handler1
      };
      routing.start({
        errorHandlers: handlers
      });
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([undefined, handlers]);
    });
    it('should call setErrorHandlers with correct replaceErrorHandlers options if errorHandlers passed and ', function() {
      routing.instance = new config.Router();
      let spy = this.sinon.spy(routing.instance, 'setErrorHandlers');
      let handlers = {
        test: handler1
      };
      routing.start({
        replaceErrorHandlers: false,
        errorHandlers: handlers
      });
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([false, handlers]);

      routing.stop();
      routing.start({
        replaceErrorHandlers: true,
        errorHandlers: handlers
      });
      expect(spy.getCall(1).args).to.be.eql([true, handlers]);
    });
  });

  describe('isStarted', function() {
    let isStarted;
    beforeEach(function() {
      isStarted = () => routing.isStarted();
    });

    describe('when instance is not exist', function() {
      it('should not create instance of Router', function() {
        expect(routing.instance).to.be.not.instanceof(config.Router);
      });
      it('should return false', function() {
        expect(isStarted()).to.be.false;
      });
    });
    describe('when instance exist', function() {
      beforeEach(function() {
        routing.use(handler1);
      });

      // it('should proxy call to the routing instance', function() {
      //   spy = sandbox.spy(proto, 'isStarted');
      //   routing.isStarted();
      //   expect(spy).to.be.calledOnce;
      // });

      it('should return false if instance is not started', function() {
        expect(isStarted()).to.be.false;
      });
      it('should return true if instance is started', function() {
        routing.start();
        expect(isStarted()).to.be.true;
      });
      it('should return false if instance is started and then stopped', function() {
        routing.start();
        routing.stop();
        expect(isStarted()).to.be.false;
      });
      it('should return true if instance is restarted', function() {
        routing.start();
        routing.stop();
        routing.start();
        expect(isStarted()).to.be.true;
      });
    });
  });

  describe('remove', function() {
    let spy;

    beforeEach(function() {
      spy = sandbox.spy(proto, 'remove');
    });

    it('should not create instance of Router', function() {
      routing.remove(handler1);
      expect(routing.instance).to.be.undefined;
    });
    it('should proxy call to the routing instance', function() {
      routing.use(handler1);
      _try(() => routing.remove(handler1));
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([handler1]);
    });
  });
  describe('navigate', function() {
    let spy;

    beforeEach(function() {
      spy = sandbox.spy(proto, 'navigate');
    });

    it('should throw if routing is not exist or not started', function() {
      expect(routing.navigate.bind(routing, '')).to.throw;
      routing.use(handler1);
      expect(routing.navigate.bind(routing, '')).to.throw;
    });
    it('should proxy to instance navigate if routing started', function() {
      routing.start({ trigger: false });
      routing.navigate(1, 2, 3);
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([1, 2, 3]);
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
      nav = sinon.spy(routing, 'navigate');
      routing.get('route1', mw1);
      routing.get('route2', mw2);
      routing.get('route3', mw3);
      routing.get('route4', mw4);
      routing.start({ trigger: false });
    });
    afterEach(function() {
      sinon.restore();
    });
    it('should call navigate on popstate', async function() {
      await routing.navigate('route1');
      await routing.navigate('route2');
      await routing.navigate('route3');
      await routing.navigate('route4');
      await history.popState();

      expect(nav.callCount).to.be.equal(5);
      expect(mw3).to.be.calledTwice;
    });
    it('should be able handle wrong popstate', async function() {
      await routing.navigate('route1');
      expect(history.popState.bind(history)).to.not.throw();
      await routing.navigate('route1');
      await routing.navigate('route1');
      expect(
        history.popState.bind(history, { wrongArgs: true })
      ).to.not.throw();

      expect(window.onpopstate).to.not.throw();
    });
  });
});
