import Manager from '../../RoutesManager';
import config from '../../config';
Object.assign(config, routing.config);
const RouteHandler = routing.config.RouteHandler;

const size = mng => {
  let t = { len: mng.items.length, keys: Object.keys(mng.byPath).length };
  return t;
};

describe('RoutesManager', function() {
  let h1;
  let h2;
  let h3;
  let mng;
  beforeEach(function() {
    mng = new Manager();
    h1 = new RouteHandler('foo');
    h2 = new RouteHandler('bar');
    h3 = new RouteHandler('404');
  });
  describe('add', function() {
    it('should push item and add it to byPath storage', function() {
      expect(size(mng).len).to.be.equal(0);
      expect(size(mng).keys).to.be.equal(0);
      mng.add(h1);
      expect(size(mng).len).to.be.equal(1);
      expect(size(mng).keys).to.be.equal(1);
      expect(h1.path in mng.byPath).to.be.true;
      mng.add(h2);
      expect(size(mng).len).to.be.equal(2);
      expect(size(mng).keys).to.be.equal(2);
      expect(h2.path in mng.byPath).to.be.true;
      expect(mng.items[0]).to.be.equal(h1);
    });
    it('should throw if given argument is not routeHandler', function() {
      expect(mng.add.bind(mng)).to.throw();
      expect(mng.add.bind(mng, null)).to.throw();
      expect(mng.add.bind(mng, void 0)).to.throw();
      expect(mng.add.bind(mng, 123)).to.throw();
      expect(mng.add.bind(mng, {})).to.throw();
      expect(mng.add.bind(mng, h1)).to.not.throw();
    });
  });
  describe('get', function() {
    beforeEach(function() {
      mng.add(h1);
      mng.add(h2);
      mng.add(h3);
    });
    it('should return undefined if there is no such handler', function() {
      expect(mng.get()).to.be.undefined;
      expect(mng.get(null)).to.be.undefined;
      expect(mng.get(void 0)).to.be.undefined;
      expect(mng.get(100)).to.be.undefined;
    });
    it('should find handler by numeric path', function() {
      expect(mng.get(404)).to.be.equal(h3);
    });
  });

  describe('has', function() {
    it('should return false if there is no such handler', function() {
      expect(mng.has(h1)).to.be.false;
      expect(mng.has('asdasdasdasd')).to.be.false;
    });
    it('should return true if there is such handler', function() {
      mng.add(h3);
      expect(mng.has(h3)).to.be.true;
      expect(mng.has('404')).to.be.true;
      expect(mng.has(404)).to.be.true;
    });
  });

  describe('remove', function() {
    beforeEach(function() {
      mng.add(h1);
      mng.add(h2);
      mng.add(h3);
    });
    it('should not remove if given argument is incorrect or there is no such handler', function() {
      let bef = size(mng);
      mng.remove();
      expect(size(mng).len).to.be.equal(bef.len);
      mng.remove(null);
      expect(size(mng).len).to.be.equal(bef.len);
      mng.remove(void 0);
      expect(size(mng).len).to.be.equal(bef.len);
      mng.remove('qweqweqwe');
      expect(size(mng).len).to.be.equal(bef.len);
      mng.remove(new RouteHandler('zzzzz'));
      expect(size(mng).len).to.be.equal(bef.len);
    });
    it('should remove if there is such handler', function() {
      mng.remove(404);
      expect(mng.has(h3)).to.be.false;
      expect(size(mng).len).to.be.equal(2);

      mng.remove(h2);
      expect(mng.has(h2)).to.be.false;
      expect(size(mng).len).to.be.equal(1);

      mng.remove('foo');
      expect(mng.has(h1)).to.be.false;
      expect(size(mng).len).to.be.equal(0);
      expect(size(mng).keys).to.be.equal(0);
    });
  });

  describe('length', function() {
    it('should return correct length', function() {
      expect(mng.length).to.be.equal(0);
      mng.add(h1);
      expect(mng.length).to.be.equal(1);
      mng.add(h2);
      expect(mng.length).to.be.equal(2);
      mng.remove(h1);
      expect(mng.length).to.be.equal(1);
    });
  });
});
