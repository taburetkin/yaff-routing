import config from '../../config';
import { url, buildSegments, compare } from '../../utils';
Object.assign(config, routing.config);

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
    config.useHashes = false;
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
    config.useHashes = true;
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

describe('buildSegments', function() {
  const paths = {
    '(/)': [''],
    'foo/bar/': ['foo', 'bar'],
    'foo/bar(/)': ['foo', 'bar'],
    '/foo/bar(/)': ['foo', 'bar'],
    '/foo/bar/': ['foo', 'bar'],
    'foo/bar': ['foo', 'bar'],
    'foo/:bar': ['foo', ':bar'],
    'foo/(:bar)': ['foo', '(:bar)'],
    'foo/(:bar)/(:baz)': ['foo', '(:bar)', '(:baz)'],
    '/foo(/:bar)(/:baz)': ['foo', '(:bar)', '(:baz)'],
    'foo(/:bar)/ufo(/:baz)': ['foo', '(:bar)', 'ufo', '(:baz)'],
    'foo(/:bar)': ['foo', '(:bar)'],
    'foo(/:bar-:man)': ['foo', '(:bar-:man)']
  };
  it('should convert path to modified array with respect to optional segments', function() {
    Object.keys(paths).forEach(key => {
      expect(buildSegments(key), 'at ' + key).to.be.eql(paths[key]);
    });
  });
});

describe('comparing utils', function() {
  const basedata = [
    {
      name: 'Oddri',
      age: 98,
      sex: 'female'
    },
    {
      name: 'John',
      age: 15,
      sex: 'male'
    },
    {
      name: 'Hugo',
      age: 37,
      sex: 'male'
    },
    {
      name: 'Tifany',
      age: 17,
      sex: 'female'
    },
    {
      name: 'Grant',
      age: 70,
      sex: 'male'
    },
    {
      name: 'Sara',
      age: 41,
      sex: 'female'
    }
  ];
  let people;
  const first = () => people[0];
  let last = () => people[people.length - 1];
  beforeEach(function() {
    people = basedata.slice(0);
  });
  describe('when using function as third argument', function() {
    it('should order by age in asc', function() {
      people.sort((a, b) => compare(a, b, x => x.age));
      expect(first().age).to.be.equal(15);
      expect(last().age).to.be.equal(98);
    });
    it('should order by age in desc', function() {
      people.sort((a, b) => compare(b, a, x => x.age));
      expect(first().age).to.be.equal(98);
      expect(last().age).to.be.equal(15);
    });
  });
  describe('when ussing array of functions as third arguyment', function() {
    it('should order females first, then by age ascending', function() {
      people.sort((a, b) => compare(a, b, [x => x.sex, x => x.age]));
      //console.log(people.map(m => `[${m.sex}:${m.age}]`));
      expect(first().age).to.be.equal(17);
      expect(first().sex).to.be.equal('female');
      expect(last().age).to.be.equal(70);
      expect(last().sex).to.be.equal('male');
    });
    it('should order males first, then by age descending', function() {
      people.sort((a, b) => compare(b, a, [x => x.sex, x => x.age]));
      //console.log(people.map(m => `[${m.sex}:${m.age}]`));
      expect(first().age).to.be.equal(70);
      expect(first().sex).to.be.equal('male');
      expect(last().age).to.be.equal(17);
      expect(last().sex).to.be.equal('female');
    });
    it('should not order if third argument is wrong', function() {
      people.sort((a, b) => compare(b, a, 123));
      expect(first().age).to.be.equal(98);
      expect(last().age).to.be.equal(41);
    });
  });
});
