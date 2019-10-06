import routing from "../..";
const config = routing.config;
const RequestContext = config.RequestContext;
describe("RequestContext", function() {
  const hashValue = "andthehash";
  const rawUrl =
    ":controller/:action/:id/?param1=foo&param2=bar&param1=baz#" + hashValue;
  let context;
  beforeEach(function() {
    context = new RequestContext(rawUrl);
  });
  describe("when instantiated", function() {
    it("url property should be instanceof URL", function() {
      expect(context.url).to.be.instanceOf(URL);
    });
    it("path property should be equal given argument with leading slash", function() {
      expect(context.path).to.be.equal("/" + rawUrl);
    });
  });
});
