import routing from "../..";
const config = routing.config;
const DefaultRouting = config.Routing;
const handler1 = (req, res, next) => next && next();
describe("general routing", function() {
  describe("instantiating Routing", function() {
    beforeEach(function() {
      routing.stop();
      routing.routing = null;
    });
    describe("when using default Routing", function() {
      const Routing = DefaultRouting;
      it("should instantiate Routing on get", function() {
        routing.get("", handler1);
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on use", function() {
        routing.use(handler1);
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on start", function() {
        routing.start();
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on remove", function() {
        routing.start();
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on navigate", function() {
        routing.start();
        expect(routing.routing).to.be.instanceof(Routing);
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
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on use", function() {
        routing.use(handler1);
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on start", function() {
        routing.start();
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on remove", function() {
        routing.start();
        expect(routing.routing).to.be.instanceof(Routing);
      });
      it("should instantiate Routing on navigate", function() {
        routing.start();
        expect(routing.routing).to.be.instanceof(Routing);
      });
    });
  });
});
