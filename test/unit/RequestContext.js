import routing from '../..';
const config = routing.config;
const RequestContext = config.RequestContext;
describe('RequestContext', function() {
  const hashValue = 'andthehash';
  const rawUrl =
    ':controller/:action/:id/?param1=foo&param2=bar&param1=baz#' + hashValue;
  let context;
  const options = { foo: 'bar' };
  beforeEach(function() {
    context = new RequestContext(rawUrl, options);
  });
  describe('when instantiated', function() {
    it('url property should be instanceof URL', function() {
      expect(context.url).to.be.instanceOf(URL);
    });
    it('path property should be equal given argument with leading slash', function() {
      expect(context.path).to.be.equal('/' + rawUrl);
    });
    it('query should contains all parameters', function() {
      expect(Object.keys(context.query)).to.be.eql(['param1', 'param2']);
      expect(context.query.param1).to.be.eql(['foo', 'baz']);
      expect(context.query.param2).to.be.equal('bar');
    });
    it('should build foo/bar/zoo segments from path', function() {
      let paths = [
        'foo/bar/zoo',
        '/foo/bar/zoo',
        '/foo/bar/zoo/',
        'foo/bar/zoo/',
        'foo/bar/zoo/#path',
        'foo/bar/zoo/?qwe=zxc#path',
        new URL('foo/bar/zoo/?qwe=zxc#path', document.location.origin),
        new URL('/foo/bar/zoo/', document.location.origin)
      ];
      paths.forEach(path => {
        let req = new config.RequestContext(path);
        expect(req.segments, 'failed at ' + path).to.be.eql([
          'foo',
          'bar',
          'zoo'
        ]);
      });
    });
  });
});
