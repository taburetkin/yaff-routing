import routing from '../..';
const config = routing.config;
const ResponseContext = config.ResponseContext;
const RequestContext = config.RequestContext;
describe('RequestContext', function() {
  const hashValue = 'andthehash';
  const rawUrl =
    ':controller/:action/:id/?param1=foo&param2=bar&param1=baz#' + hashValue;
  let response;
  let request;
  beforeEach(function() {
    request = new RequestContext(rawUrl);
    response = new ResponseContext(request);
  });
  describe('when instantiated', function() {
    it('request property should be equal given request context', function() {
      expect(response.request)
        .to.be.equal(request)
        .and.be.instanceOf(RequestContext);
    });
  });
});
