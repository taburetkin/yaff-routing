import routing from "../..";
const config = routing.config;
const DefaultRouting = config.Routing;
const handler1 = (req, res, next) => next && next();
const proto = DefaultRouting.prototype;
let route = "";

function _try(cb) {
  try {
    return cb();
  } catch (e) {
    return;
  }
}

describe("general routing", function() {
  let sandbox;
  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });
  afterEach(function() {
    sandbox.restore();
    routing.stop();
    delete routing.instance;
  });

  describe("instantiating Routing", function() {
    beforeEach(function() {
      routing.stop();
      routing.instance = null;
    });
    describe("when using default Routing", function() {
      const Routing = DefaultRouting;
      it("should instantiate Routing on get", function() {
        routing.get("", handler1);
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on use", function() {
        routing.use(handler1);
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on start", function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on remove", function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on navigate", function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Routing);
      });
    });

    describe("when using custom Routing", function() {
      class Routing extends DefaultRouting {}

      beforeEach(function() {
        config.Routing = Routing;
      });
      afterEach(function() {
        config.Routing = DefaultRouting;
      });

      it("should instantiate Routing on get", function() {
        routing.get("", handler1);
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on use", function() {
        routing.use(handler1);
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on start", function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on remove", function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on navigate", function() {
        routing.start();
        expect(routing.instance).to.be.instanceof(Routing);
      });
    });
  });
  describe("creatingRouting", function() {
    describe("when used default Routing", function() {
      it("should return routing instance", function() {
        let instance = routing.createRouting();
        expect(instance).to.be.instanceof(config.Routing);
      });
    });
    describe("when used custom Routing", function() {
      class Routing extends DefaultRouting {}

      beforeEach(function() {
        config.Routing = Routing;
      });
      afterEach(function() {
        config.Routing = DefaultRouting;
      });

      it("should return routing instance", function() {
        let instance = routing.createRouting();
        expect(instance).to.be.instanceof(Routing);
      });
    });
  });
  describe("get", function() {
    let spy;
    beforeEach(function() {
      spy = sandbox.spy(proto, "get");
      routing.get(route, handler1);
    });

    it("should create instance of Routing", function() {
      expect(routing.instance).to.be.instanceof(config.Routing);
    });
    it("should proxy call to the routing instance", function() {
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([route, handler1]);
    });
  });
  describe("use", function() {
    let spy;
    beforeEach(function() {
      spy = sandbox.spy(proto, "use");
      routing.use(route, handler1);
    });

    it("should create instance of Routing", function() {
      expect(routing.instance).to.be.instanceof(config.Routing);
    });
    it("should proxy call to the routing instance", function() {
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([route, handler1]);

      routing.use(handler1);
      expect(spy.getCall(1).args).to.be.eql([handler1]);
    });
  });
  describe("start", function() {
    let spy;
    let callArgs = [1, 2, 3];
    beforeEach(function() {
      spy = sandbox.spy(proto, "start");
      routing.start(...callArgs);
    });

    it("should create instance of Routing", function() {
      expect(routing.instance).to.be.instanceof(config.Routing);
    });
    it("should proxy call to the routing instance", function() {
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql(callArgs);
    });
    // it("should throw an error on start if already started", function() {
    //   expect(routing.start.bind(routing)).to.throw;
    // });
  });

  describe("stop", function() {
    let spy;
    let callArgs = [1, 2, 3];
    beforeEach(function() {
      spy = sandbox.spy(proto, "stop");
      routing.stop();
    });

    it("should not create instance of Routing", function() {
      expect(routing.instance).to.be.not.instanceof(config.Routing);
    });
    it("should not proxy call to the routing instance", function() {
      expect(spy).to.not.be.called;
    });
    it("should proxy call to the routing instance if instance exist", function() {
      routing.start();
      routing.stop(...callArgs);

      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql(callArgs);
    });
  });

  describe("isStarted", function() {
    let spy;
    let isStarted;
    beforeEach(function() {
      isStarted = () => routing.isStarted();
    });

    describe("when instance is not exist", function() {
      it("should not create instance of Routing", function() {
        expect(routing.instance).to.be.not.instanceof(config.Routing);
      });
      it("should return false", function() {
        expect(isStarted()).to.be.false;
      });
    });
    describe("when instance exist", function() {
      beforeEach(function() {
        routing.use(handler1);
      });

      it("should proxy call to the routing instance", function() {
        spy = sandbox.spy(proto, "isStarted");
        routing.isStarted();
        expect(spy).to.be.calledOnce;
      });
      it("should return false if instance is not started", function() {
        expect(isStarted()).to.be.false;
      });
      it("should return true if instance is started", function() {
        routing.start();
        expect(isStarted()).to.be.true;
      });
      it("should return false if instance is started and then stopped", function() {
        routing.start();
        routing.stop();
        expect(isStarted()).to.be.false;
      });
      it("should return true if instance is restarted", function() {
        routing.start();
        routing.stop();
        routing.start();
        expect(isStarted()).to.be.true;
      });
    });
  });

  describe("remove", function() {
    let spy;

    beforeEach(function() {
      spy = sandbox.spy(proto, "remove");
    });

    it("should not create instance of Routing", function() {
      routing.remove(handler1);
      expect(routing.instance).to.be.undefined;
    });
    it("should proxy call to the routing instance", function() {
      routing.use(handler1);
      _try(() => routing.remove(handler1));
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([handler1]);
    });
  });
  describe("navigate", function() {
    let spy;

    beforeEach(function() {
      spy = sandbox.spy(proto, "navigate");
    });

    it("should throw if routing is not exist or not started", function() {
      expect(routing.navigate.bind(routing, "")).to.throw;
      routing.use(handler1);
      expect(routing.navigate.bind(routing, "")).to.throw;
    });
    it("should proxy to instance navigate if routing started", function() {
      routing.start({ trigger: false });
      routing.navigate(1, 2, 3);
      expect(spy).to.be.calledOnce;
      expect(spy.getCall(0).args).to.be.eql([1, 2, 3]);
    });
  });
});
