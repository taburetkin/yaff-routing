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
  describe('when setting error', function() {
    it('isOk should return false if there is an error and true if there is not', function() {
      response.setError(null);
      expect(response.isOk()).to.be.true;
      response.setError(1);
      expect(response.isOk()).to.be.false;
      response.setError('');
      expect(response.isOk()).to.be.true;
      response.setError({});
      expect(response.isOk()).to.be.false;
    });
  });
  describe('shorthands', function() {
    it('should set `notfound` error when using response.notFound()', function() {
      response.notFound();
      expect(response.error).to.be.equal('notfound');
    });
    it('should set `notallowed` error when using response.notAllowed()', function() {
      response.notAllowed();
      expect(response.error).to.be.equal('notallowed');
    });
  });
});
