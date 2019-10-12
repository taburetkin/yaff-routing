import { url } from '../../utils';
import routing from '../..';
describe('url', function() {
  const paths = {
    '': '',
    '/foo/bar': '/foo/bar',
    'foo/bar': '/foo/bar',
    '#foo/bar': '/#foo/bar',
    '/#foo/bar': '/#foo/bar',
    '#/foo/bar': '/#/foo/bar'
  };
  afterEach(function() {
    routing.config.useHashes = false;
  });
  it('when useHashes is true should pass all doubled path without prefix', function() {
    let prefix = '';
    Object.keys(paths).forEach(passedUrl => {
      let outputUrl = paths[passedUrl] + paths[passedUrl];
      if (outputUrl === '') {
        outputUrl = '/';
      }
      let result = url(passedUrl, passedUrl);
      expect(result).to.be.equal(prefix + outputUrl);
    });
  });
  it('when useHashes is true should pass all doubled path with `/#` prefix', function() {
    let prefix = '/#';
    routing.config.useHashes = true;
    Object.keys(paths).forEach(passedUrl => {
      let outputUrl = paths[passedUrl] + paths[passedUrl];
      if (outputUrl === '') {
        outputUrl = '/';
      }
      let result = url(passedUrl, passedUrl);
      expect(result).to.be.equal(prefix + outputUrl);
    });
  });
  it('should treat null or empty string as root page path', function() {
    expect(url('')).to.be.equal(url());
  });
});
